"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { createTask } from "@/lib/solana"
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Wallet,
  Zap,
  Lock,
  Target,
  Plus,
  X,
} from "lucide-react"

export default function PostProjectPage() {
  const router = useRouter()
  const { connected, publicKey, wallet } = useWallet()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectData, setProjectData] = useState({
    // Project Details
    title: "",
    category: "",
    description: "",
    skills: [] as string[],
    timeline: "",
    budgetType: "fixed", // fixed or hourly
    budget: "",

    // Milestones
    milestones: [{ title: "", description: "", payment: "", deadline: "" }],

    // Smart Contract Configuration
    escrowAmount: "",
    disputeResolution: "automatic",
    revisionLimit: "3",
    completionCriteria: "",

    // Additional Settings
    experienceLevel: "",
    location: "remote",
    communicationMethod: "platform",
    ndaRequired: false,
    proposalDeadline: "",

    // Agreement Terms
    termsAccepted: false,
    smartContractAccepted: false,
    paymentTermsAccepted: false,
  })

  const skillOptions = [
    "React",
    "Node.js",
    "Python",
    "Blockchain",
    "Smart Contracts",
    "Web3",
    "UI/UX Design",
    "Mobile Development",
    "DevOps",
    "Data Science",
    "AI/ML",
    "Solidity",
    "Rust",
    "JavaScript",
    "TypeScript",
    "Next.js",
  ]

  const handleInputChange = (field: string, value: any) => {
    setProjectData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSkillToggle = (skill: string) => {
    setProjectData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const addMilestone = () => {
    setProjectData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", description: "", payment: "", deadline: "" }],
    }))
  }

  const removeMilestone = (index: number) => {
    setProjectData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
  }

  const updateMilestone = (index: number, field: string, value: string) => {
    setProjectData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => (i === index ? { ...milestone, [field]: value } : milestone)),
    }))
  }

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your Phantom wallet first!")
      return
    }

    setIsSubmitting(true)
    try {
      // Create task on Solana blockchain
      const taskId = await createTask(Number.parseFloat(projectData.budget), {
        publicKey,
        signTransaction: wallet?.adapter.signTransaction,
        signAllTransactions: wallet?.adapter.signAllTransactions,
        connected,
      })

      console.log("Task created on blockchain:", taskId)

      // Here you would also save to your database
      // await saveProjectToDatabase({ ...projectData, taskId })

      alert("Project posted successfully on blockchain!")
      router.push("/dashboard/client")
    } catch (error) {
      console.error("Error creating project:", error)
      alert("Failed to create project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalBudget = projectData.milestones.reduce(
    (sum, milestone) => sum + (Number.parseFloat(milestone.payment) || 0),
    0,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/client" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Trustify</span>
              </Link>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Post New Project</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:!from-purple-600 hover:!to-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Wallet Connection Alert */}
        {!connected && (
          <Card className="bg-red-500/10 border-red-500/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-300 font-semibold">Wallet Connection Required</p>
                  <p className="text-red-200 text-sm">
                    Please connect your Phantom wallet to post a project on the blockchain.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum ? "bg-purple-500 text-white" : "bg-white/20 text-white/60"
                  }`}
                >
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 4 && <div className={`w-12 h-0.5 ${step > stepNum ? "bg-purple-500" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Project Details */}
        {step === 1 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-white">
                  Project Title
                </Label>
                <Input
                  id="title"
                  value={projectData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="e.g., Build a DeFi Trading Platform"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Category
                </Label>
                <Select onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select project category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-development">Web Development</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="blockchain">Blockchain/Web3</SelectItem>
                    <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="ai-ml">AI/ML</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  value={projectData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-white/10 border-white/20 text-white min-h-32"
                  placeholder="Describe your project requirements, goals, and expectations in detail..."
                />
              </div>

              <div>
                <Label className="text-white">Required Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={projectData.skills.includes(skill) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        projectData.skills.includes(skill)
                          ? "bg-purple-500 hover:bg-purple-600"
                          : "border-white/20 text-white hover:bg-white/10"
                      }`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline" className="text-white">
                    Project Timeline
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("timeline", value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-week">Less than 1 week</SelectItem>
                      <SelectItem value="1-month">1-4 weeks</SelectItem>
                      <SelectItem value="1-3-months">1-3 months</SelectItem>
                      <SelectItem value="3-6-months">3-6 months</SelectItem>
                      <SelectItem value="6-months+">6+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experienceLevel" className="text-white">
                    Experience Level
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("experienceLevel", value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Milestone Setup */}
        {step === 2 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Milestone Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-white/80 text-sm">
                  Break your project into milestones for better tracking and secure payments. Each milestone will be
                  paid upon completion.
                </p>
              </div>

              {projectData.milestones.map((milestone, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">Milestone {index + 1}</CardTitle>
                      {projectData.milestones.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white">Milestone Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, "title", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="e.g., Frontend Development"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Deliverables</Label>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, "description", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Describe what will be delivered for this milestone..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Payment Amount (SOL)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={milestone.payment}
                          onChange={(e) => updateMilestone(index, "payment", e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="0.0"
                        />
                      </div>

                      <div>
                        <Label className="text-white flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Deadline
                        </Label>
                        <Input
                          type="date"
                          value={milestone.deadline}
                          onChange={(e) => updateMilestone(index, "deadline", e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={addMilestone}
                className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Milestone
              </Button>

              {totalBudget > 0 && (
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Total Project Budget:</span>
                    <span className="text-purple-300 text-xl font-bold">{totalBudget.toFixed(2)} SOL</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={totalBudget === 0}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Smart Contract Configuration */}
        {step === 3 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Smart Contract Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-300 font-semibold">Blockchain Security</h4>
                    <p className="text-blue-200 text-sm">
                      Your project will be secured by a smart contract on Solana blockchain with automatic escrow.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-white">Dispute Resolution</Label>
                <Select
                  value={projectData.disputeResolution}
                  onValueChange={(value) => handleInputChange("disputeResolution", value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic (Smart Contract)</SelectItem>
                    <SelectItem value="mediation">Platform Mediation</SelectItem>
                    <SelectItem value="arbitration">Third-party Arbitration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Revision Limit</Label>
                <Select
                  value={projectData.revisionLimit}
                  onValueChange={(value) => handleInputChange("revisionLimit", value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Revision</SelectItem>
                    <SelectItem value="3">3 Revisions</SelectItem>
                    <SelectItem value="5">5 Revisions</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Completion Criteria</Label>
                <Textarea
                  value={projectData.completionCriteria}
                  onChange={(e) => handleInputChange("completionCriteria", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Define clear criteria for project completion and milestone acceptance..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Communication Method</Label>
                  <Select
                    value={projectData.communicationMethod}
                    onValueChange={(value) => handleInputChange("communicationMethod", value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">Platform Messages</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Proposal Deadline</Label>
                  <Input
                    type="date"
                    value={projectData.proposalDeadline}
                    onChange={(e) => handleInputChange("proposalDeadline", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nda"
                  checked={projectData.ndaRequired}
                  onCheckedChange={(checked) => handleInputChange("ndaRequired", checked)}
                  className="border-white/20"
                />
                <Label htmlFor="nda" className="text-white cursor-pointer">
                  Require NDA (Non-Disclosure Agreement)
                </Label>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Agreement & Terms */}
        {step === 4 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Project Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Summary */}
              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <h3 className="text-white font-semibold mb-4">Project Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Title:</span>
                    <p className="text-white">{projectData.title || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Category:</span>
                    <p className="text-white">{projectData.category || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Timeline:</span>
                    <p className="text-white">{projectData.timeline || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Total Budget:</span>
                    <p className="text-green-400 font-semibold">{totalBudget.toFixed(2)} SOL</p>
                  </div>
                </div>
              </div>

              {/* Editable Agreement Terms */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Agreement Terms (Editable)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Final Project Deadline
                    </Label>
                    <Input
                      type="date"
                      value={projectData.timeline}
                      onChange={(e) => handleInputChange("timeline", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Total Payment (SOL)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={totalBudget.toFixed(2)}
                      onChange={(e) => {
                        const newTotal = Number.parseFloat(e.target.value) || 0
                        const currentTotal = totalBudget
                        if (currentTotal > 0) {
                          const ratio = newTotal / currentTotal
                          const updatedMilestones = projectData.milestones.map((milestone) => ({
                            ...milestone,
                            payment: (Number.parseFloat(milestone.payment) * ratio).toFixed(2),
                          }))
                          setProjectData((prev) => ({ ...prev, milestones: updatedMilestones }))
                        }
                      }}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Terms */}
              <div className="bg-gray-500/10 p-4 rounded-lg border border-gray-500/20">
                <h4 className="text-white font-semibold mb-3">Standard Terms (Fixed)</h4>
                <div className="space-y-2 text-sm text-white/80">
                  <p>• Platform fee: 2.5% of total project value</p>
                  <p>• Escrow protection: Funds held until milestone completion</p>
                  <p>• Dispute resolution: {projectData.disputeResolution}</p>
                  <p>• Revision limit: {projectData.revisionLimit} revisions per milestone</p>
                  <p>• Smart contract execution on Solana blockchain</p>
                  <p>• Automatic payment release upon milestone approval</p>
                </div>
              </div>

              {/* Agreement Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={projectData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                    className="border-white/20 mt-1"
                  />
                  <div>
                    <Label htmlFor="terms" className="text-white cursor-pointer">
                      I accept the Terms of Service and Project Agreement
                    </Label>
                    <p className="text-sm text-white/60 mt-1">
                      By checking this box, you agree to the project terms and platform conditions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="smartContract"
                    checked={projectData.smartContractAccepted}
                    onCheckedChange={(checked) => handleInputChange("smartContractAccepted", checked)}
                    className="border-white/20 mt-1"
                  />
                  <div>
                    <Label htmlFor="smartContract" className="text-white cursor-pointer">
                      I understand and consent to smart contract execution
                    </Label>
                    <p className="text-sm text-white/60 mt-1">
                      This project will be governed by a smart contract on Solana blockchain.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="payment"
                    checked={projectData.paymentTermsAccepted}
                    onCheckedChange={(checked) => handleInputChange("paymentTermsAccepted", checked)}
                    className="border-white/20 mt-1"
                  />
                  <div>
                    <Label htmlFor="payment" className="text-white cursor-pointer">
                      I understand the escrow and payment structure
                    </Label>
                    <p className="text-sm text-white/60 mt-1">
                      Funds will be held in escrow and released automatically upon milestone completion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !connected ||
                    !projectData.termsAccepted ||
                    !projectData.smartContractAccepted ||
                    !projectData.paymentTermsAccepted ||
                    isSubmitting
                  }
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating on Blockchain...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Post Project to Blockchain
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
