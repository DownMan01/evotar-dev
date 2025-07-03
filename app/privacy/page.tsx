import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0077ff] to-[#0077ff]/90">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-[#0077ff] mb-6">Privacy Policy</h1>

          <div className="prose prose-blue max-w-none">
            <p className="text-lg mb-4">
              At Evotar, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect
              your personal information when you use our blockchain voting platform.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Authentication information (student ID, password hash)</li>
              <li>Basic profile information (name)</li>
              <li>Voting participation records (whether you voted, not who you voted for)</li>
              <li>System usage data and logs</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p>Your information is used for:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Authentication and account management</li>
              <li>Preventing duplicate voting</li>
              <li>System security and integrity</li>
              <li>Generating anonymized statistics</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Vote Privacy</h2>
            <p>
              Your specific voting choices are never linked to your identity. The blockchain records that you have
              participated in an election but uses cryptographic techniques to separate your identity from your specific
              ballot choices.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Data Security</h2>
            <p>We implement strong security measures including:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>End-to-end encryption</li>
              <li>Secure authentication protocols</li>
              <li>Regular security audits</li>
              <li>Limited access controls</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Data Retention</h2>
            <p>
              We retain your account information for as long as necessary to provide the voting service and comply with
              legal obligations. Anonymized voting records are maintained permanently on the blockchain for verification
              purposes.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have questions about our privacy practices, please contact our Privacy Officer at
              <a href="mailto:privacy@evotar.xyz" className="text-[#0077ff] hover:underline ml-1">
                privacy@evotar.xyz
              </a>
              .
            </p>

            <p className="text-sm text-gray-500 mt-8">Last updated: March 30, 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
