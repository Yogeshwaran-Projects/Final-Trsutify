use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R");

#[program]
pub mod trustify {
    use super::*;

    /// Create a new escrow - Client deposits SOL into PDA vault
    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        amount: u64,
        description: String,
        escrow_id: u64,
    ) -> Result<()> {
        require!(amount > 0, EscrowError::InvalidAmount);
        require!(description.len() <= 200, EscrowError::DescriptionTooLong);

        // Save keys before mutable borrow
        let escrow_key = ctx.accounts.escrow.key();
        let client_key = ctx.accounts.client.key();

        // Transfer SOL from client to escrow PDA vault first
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.client.to_account_info(),
                    to: ctx.accounts.escrow.to_account_info(),
                },
            ),
            amount,
        )?;
        //check
        // Now initialize the escrow account
        let escrow = &mut ctx.accounts.escrow;
        escrow.client = client_key;
        escrow.freelancer = Pubkey::default();
        escrow.amount = amount;
        escrow.status = EscrowStatus::Open;
        escrow.escrow_id = escrow_id;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.description = description.clone();
        escrow.bump = ctx.bumps.escrow;

        emit!(EscrowCreated {
            escrow: escrow_key,
            client: client_key,
            amount,
            description,
        });

        Ok(())
    }

    /// Freelancer accepts the escrow task
    pub fn accept_escrow(ctx: Context<AcceptEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(
            escrow.status == EscrowStatus::Open,
            EscrowError::InvalidStatus
        );
        require!(
            ctx.accounts.freelancer.key() != escrow.client,
            EscrowError::ClientCannotBeFreelancer
        );

        escrow.freelancer = ctx.accounts.freelancer.key();
        escrow.status = EscrowStatus::InProgress;

        emit!(EscrowAccepted {
            escrow: ctx.accounts.escrow.key(),
            freelancer: ctx.accounts.freelancer.key(),
        });

        Ok(())
    }

    /// Freelancer submits work for review
    pub fn submit_work(ctx: Context<SubmitWork>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(
            escrow.status == EscrowStatus::InProgress,
            EscrowError::InvalidStatus
        );
        require!(
            ctx.accounts.freelancer.key() == escrow.freelancer,
            EscrowError::UnauthorizedFreelancer
        );

        escrow.status = EscrowStatus::Submitted;

        emit!(WorkSubmitted {
            escrow: ctx.accounts.escrow.key(),
            freelancer: ctx.accounts.freelancer.key(),
        });

        Ok(())
    }

    /// Client releases funds to freelancer after work completion
    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(
            escrow.status == EscrowStatus::Submitted || escrow.status == EscrowStatus::InProgress,
            EscrowError::InvalidStatus
        );
        require!(
            ctx.accounts.client.key() == escrow.client,
            EscrowError::UnauthorizedClient
        );
        require!(
            ctx.accounts.freelancer.key() == escrow.freelancer,
            EscrowError::InvalidFreelancer
        );

        let amount = escrow.amount;
        escrow.status = EscrowStatus::Completed;

        // Transfer funds from escrow PDA to freelancer
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.freelancer.to_account_info().try_borrow_mut_lamports()? += amount;

        emit!(FundsReleased {
            escrow: ctx.accounts.escrow.key(),
            freelancer: ctx.accounts.freelancer.key(),
            amount,
        });

        Ok(())
    }

    /// Client cancels escrow (only if not yet accepted)
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(
            escrow.status == EscrowStatus::Open,
            EscrowError::CannotCancelInProgress
        );
        require!(
            ctx.accounts.client.key() == escrow.client,
            EscrowError::UnauthorizedClient
        );

        let amount = escrow.amount;
        escrow.status = EscrowStatus::Cancelled;

        // Refund SOL from escrow PDA back to client
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.client.to_account_info().try_borrow_mut_lamports()? += amount;

        emit!(EscrowCancelled {
            escrow: ctx.accounts.escrow.key(),
            client: ctx.accounts.client.key(),
            refunded_amount: amount,
        });

        Ok(())
    }

    /// Raise a dispute (either party can raise)
    pub fn raise_dispute(ctx: Context<RaiseDispute>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;

        require!(
            escrow.status == EscrowStatus::InProgress || escrow.status == EscrowStatus::Submitted,
            EscrowError::InvalidStatus
        );

        let caller = ctx.accounts.caller.key();
        require!(
            caller == escrow.client || caller == escrow.freelancer,
            EscrowError::UnauthorizedCaller
        );

        escrow.status = EscrowStatus::Disputed;

        emit!(DisputeRaised {
            escrow: ctx.accounts.escrow.key(),
            raised_by: caller,
        });

        Ok(())
    }
}

// ============================================
// ACCOUNT STRUCTURES
// ============================================

#[derive(Accounts)]
#[instruction(amount: u64, description: String, escrow_id: u64)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = client,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", client.key().as_ref(), &escrow_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub freelancer: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitWork<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub freelancer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub client: Signer<'info>,

    /// CHECK: We verify this matches escrow.freelancer
    #[account(mut)]
    pub freelancer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut)]
    pub caller: Signer<'info>,
}

// ============================================
// DATA STRUCTURES
// ============================================

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
    pub status: EscrowStatus,
    pub escrow_id: u64,
    pub created_at: i64,
    #[max_len(200)]
    pub description: String,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum EscrowStatus {
    Open,        // Escrow created, waiting for freelancer
    InProgress,  // Freelancer accepted, work in progress
    Submitted,   // Work submitted, waiting for client approval
    Completed,   // Funds released to freelancer
    Cancelled,   // Client cancelled (before acceptance)
    Disputed,    // Dispute raised by either party
}

// ============================================
// EVENTS
// ============================================

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub client: Pubkey,
    pub amount: u64,
    pub description: String,
}

#[event]
pub struct EscrowAccepted {
    pub escrow: Pubkey,
    pub freelancer: Pubkey,
}

#[event]
pub struct WorkSubmitted {
    pub escrow: Pubkey,
    pub freelancer: Pubkey,
}

#[event]
pub struct FundsReleased {
    pub escrow: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowCancelled {
    pub escrow: Pubkey,
    pub client: Pubkey,
    pub refunded_amount: u64,
}

#[event]
pub struct DisputeRaised {
    pub escrow: Pubkey,
    pub raised_by: Pubkey,
}

// ============================================
// ERRORS
// ============================================

#[error_code]
pub enum EscrowError {
    #[msg("Invalid escrow amount - must be greater than 0")]
    InvalidAmount,

    #[msg("Description too long - max 200 characters")]
    DescriptionTooLong,

    #[msg("Invalid escrow status for this operation")]
    InvalidStatus,

    #[msg("Client cannot be the freelancer")]
    ClientCannotBeFreelancer,

    #[msg("Unauthorized - only the freelancer can perform this action")]
    UnauthorizedFreelancer,

    #[msg("Unauthorized - only the client can perform this action")]
    UnauthorizedClient,

    #[msg("Invalid freelancer address")]
    InvalidFreelancer,

    #[msg("Cannot cancel escrow that is already in progress")]
    CannotCancelInProgress,

    #[msg("Unauthorized caller for this operation")]
    UnauthorizedCaller,
}
