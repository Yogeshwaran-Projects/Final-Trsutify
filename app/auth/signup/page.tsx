"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Shield, Building2, Code, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<"client" | "freelancer" | null>(null)
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",

    // Client specific
    companyName: "",
    companySize: "",
    projectTypes: [] as string[],
    budgetRange: "",

    // Freelancer specific
    skills: [] as string[],
    experience: "",
    hourlyRate: "",
    availability: "",
    portfolio: "",
    bio: "",

    // Payment & Verification
    walletAddress: "",
    bankDetails: "",

    // Agreements
    termsAccepted: false,
    smartContractTerms: false,
    paymentTerms: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const handleProjectTypeToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter((t) => t !== type)
        : [...prev.projectTypes, type],
    }))
  }

  const handleSubmit = () => {
    // Simulate registration process
    if (userType === "client") {
      router.push("/dashboard/client")
    } else {
      router.push("/dashboard/freelancer")
    }
  }

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
  ]

  const projectTypeOptions = [
    "Web Development",
    "Mobile Apps",
    "Blockchain/Web3",
    "UI/UX Design",
    "Data Science",
    "AI/ML",
    "DevOps",
    "E-commerce",
    "SaaS Products",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Trustify</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Join Trustify</h1>
          <p className="text-white/80">Create your account and start your blockchain-powered freelancing journey</p>
        </div>

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

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-center">Choose Your Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Option */}
                <div
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === "client"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  onClick={() => setUserType("client")}
                >
                  <div className="text-center">
                    <Building2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">I'm a Client</h3>
                    <p className="text-white/80 text-sm mb-4">I want to hire talented freelancers for my projects</p>
                    <ul className="text-left text-sm text-white/70 space-y-1">
                      <li>• Post projects and requirements</li>
                      <li>• Review freelancer proposals</li>
                      <li>• Manage project milestones</li>
                      <li>• Secure escrow payments</li>
                    </ul>
                  </div>
                </div>

                {/* Freelancer Option */}
                <div
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === "freelancer"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  onClick={() => setUserType("freelancer")}
                >
                  <div className="text-center">
                    <Code className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">I'm a Freelancer</h3>
                    <p className="text-white/80 text-sm mb-4">I want to find projects and showcase my skills</p>
                    <ul className="text-left text-sm text-white/70 space-y-1">
                      <li>• Browse available projects</li>
                      <li>• Submit competitive proposals</li>
                      <li>• Build reputation on blockchain</li>
                      <li>• Receive secure payments</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!userType}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-white">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

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
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Professional Details */}
        {step === 3 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                {userType === "client" ? "Company Details" : "Professional Profile"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {userType === "client" ? (
                <>
                  <div>
                    <Label htmlFor="companyName" className="text-white">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companySize" className="text-white">
                      Company Size
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("companySize", value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="200+">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Project Types of Interest</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {projectTypeOptions.map((type) => (
                        <Badge
                          key={type}
                          variant={formData.projectTypes.includes(type) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            formData.projectTypes.includes(type)
                              ? "bg-purple-500 hover:bg-purple-600"
                              : "border-white/20 text-white hover:bg-white/10"
                          }`}
                          onClick={() => handleProjectTypeToggle(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budgetRange" className="text-white">
                      Typical Budget Range
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("budgetRange", value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<1k">Less than $1,000</SelectItem>
                        <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                        <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                        <SelectItem value="25k+">$25,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-white">Skills & Expertise</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillOptions.map((skill) => (
                        <Badge
                          key={skill}
                          variant={formData.skills.includes(skill) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            formData.skills.includes(skill)
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
                      <Label htmlFor="experience" className="text-white">
                        Experience Level
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("experience", value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                          <SelectItem value="expert">Expert (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate" className="text-white">
                        Hourly Rate ($)
                      </Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="portfolio" className="text-white">
                      Portfolio URL
                    </Label>
                    <Input
                      id="portfolio"
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange("portfolio", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-white">
                      Professional Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Tell us about your experience and what makes you unique..."
                    />
                  </div>
                </>
              )}

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
              <CardTitle className="text-white">Agreement & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                    className="border-white/20"
                  />
                  <div>
                    <Label htmlFor="terms" className="text-white cursor-pointer">
                      I accept the Terms of Service and Privacy Policy
                    </Label>
                    <p className="text-sm text-white/60 mt-1">
                      By checking this box, you agree to our platform terms and conditions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="smartContract"
                    checked={formData.smartContractTerms}
                    onCheckedChange={(checked) => handleInputChange("smartContractTerms", checked)}
                    className="border-white/20"
                  />
                  <div>
                    <Label htmlFor="smartContract" className="text-white cursor-pointer">
                      I understand and consent to blockchain smart contract interactions
                    </Label>
                    <p className="text-sm text-white/60 mt-1">
                      All agreements will be executed through blockchain smart contracts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="payment"
                    checked={formData.paymentTerms}
                    onCheckedChange={(checked) => handleInputChange("paymentTerms", checked)}
                    className="border-white/20"
                  />
                  <div>
                    <Label htmlFor="payment" className="text-white cursor-pointer">
                      I understand the escrow and fee structure
                    </Label>
                    <p className="text-sm text-white/60 mt-1">
                      Platform fees: 2.5% for clients, 2.5% for freelancers on successful projects.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="text-white font-semibold mb-2">🔐 Security & Verification</h4>
                <p className="text-white/80 text-sm">
                  Your account will be created with basic verification. For enhanced features and higher project limits,
                  complete identity verification in your dashboard after registration.
                </p>
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
                  disabled={!formData.termsAccepted || !formData.smartContractTerms || !formData.paymentTerms}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Create Account
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-white/60">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
