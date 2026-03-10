import { NextRequest, NextResponse } from "next/server"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""

const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".rs", ".py", ".go", ".sol",
  ".java", ".c", ".cpp", ".h", ".hpp", ".cs", ".rb", ".php",
  ".swift", ".kt", ".scala", ".vue", ".svelte",
])

const CODE_DIRS = ["src/", "lib/", "app/", "programs/", "contracts/", "pkg/", "cmd/"]

// Map common tech names to GitHub language names
const TECH_ALIASES: Record<string, string[]> = {
  react: ["javascript", "typescript", "tsx", "jsx"],
  "next.js": ["javascript", "typescript"],
  nextjs: ["javascript", "typescript"],
  node: ["javascript", "typescript"],
  "node.js": ["javascript", "typescript"],
  solana: ["rust"],
  anchor: ["rust"],
  vue: ["vue", "javascript", "typescript"],
  angular: ["typescript", "javascript"],
  svelte: ["svelte", "javascript", "typescript"],
  django: ["python"],
  flask: ["python"],
  rails: ["ruby"],
  spring: ["java", "kotlin"],
}

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url)
    if (u.hostname !== "github.com") return null
    const parts = u.pathname.split("/").filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1] }
  } catch {
    return null
  }
}

async function githubFetch(path: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Trustify-Verification",
  }
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`
  }
  return fetch(`https://api.github.com${path}`, { headers })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { githubUrl, techstack = [] } = body as {
      githubUrl: string
      techstack: string[]
    }

    if (!githubUrl) {
      return NextResponse.json({ error: "githubUrl is required" }, { status: 400 })
    }

    const parsed = parseGithubUrl(githubUrl)
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 })
    }

    const { owner, repo } = parsed

    // Fetch repo info
    const repoRes = await githubFetch(`/repos/${owner}/${repo}`)
    if (!repoRes.ok) {
      return NextResponse.json({
        verified: false,
        hasCode: false,
        commitCount: 0,
        languages: {},
        techstackMatch: [],
        repoName: `${owner}/${repo}`,
        error: repoRes.status === 404 ? "Repository not found" : "Failed to fetch repository",
      })
    }
    const repoData = await repoRes.json()
    const defaultBranch = repoData.default_branch || "main"

    // Fetch languages and tree in parallel
    const [langRes, treeRes, commitsRes] = await Promise.all([
      githubFetch(`/repos/${owner}/${repo}/languages`),
      githubFetch(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`),
      githubFetch(`/repos/${owner}/${repo}/commits?per_page=1`),
    ])

    // Languages
    const languages: Record<string, number> = langRes.ok ? await langRes.json() : {}
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0)
    const languagePercents: Record<string, number> = {}
    for (const [lang, bytes] of Object.entries(languages)) {
      languagePercents[lang] = totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0
    }

    // Code verification from tree
    let hasCode = false
    if (treeRes.ok) {
      const treeData = await treeRes.json()
      const tree: { path: string; type: string }[] = treeData.tree || []

      for (const item of tree) {
        if (item.type !== "blob") continue
        const ext = "." + item.path.split(".").pop()?.toLowerCase()
        if (!CODE_EXTENSIONS.has(ext)) continue

        // Check if it's in a code directory or at root level (not just config)
        const inCodeDir = CODE_DIRS.some((d) => item.path.startsWith(d))
        const isRootCode = !item.path.includes("/") && CODE_EXTENSIONS.has(ext)

        if (inCodeDir || isRootCode) {
          hasCode = true
          break
        }
      }
    }

    // Commit count from Link header
    let commitCount = 0
    if (commitsRes.ok) {
      const linkHeader = commitsRes.headers.get("link")
      if (linkHeader) {
        const lastMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/)
        commitCount = lastMatch ? parseInt(lastMatch[1], 10) : 1
      } else {
        const commits = await commitsRes.json()
        commitCount = Array.isArray(commits) ? commits.length : 0
      }
    }

    // Techstack matching
    const repoLangs = Object.keys(languages).map((l) => l.toLowerCase())
    const techstackMatch: string[] = []

    for (const tech of techstack) {
      const techLower = tech.toLowerCase()
      // Direct match
      if (repoLangs.includes(techLower)) {
        techstackMatch.push(tech)
        continue
      }
      // Alias match
      const aliases = TECH_ALIASES[techLower]
      if (aliases && aliases.some((a) => repoLangs.includes(a))) {
        techstackMatch.push(tech)
      }
    }

    const verified = hasCode && (techstack.length === 0 || techstackMatch.length > 0)

    return NextResponse.json({
      verified,
      hasCode,
      commitCount,
      languages: languagePercents,
      techstackMatch,
      repoName: `${owner}/${repo}`,
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
