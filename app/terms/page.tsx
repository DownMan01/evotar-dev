import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold text-[#0077ff] mb-6">Terms of Service</h1>

          <div className="prose prose-blue max-w-none">
            <p className="text-lg mb-4">
              Welcome to Evotar. By accessing or using our blockchain voting platform, you agree to be bound by these
              Terms of Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Evotar platform, you agree to these Terms of Service and our Privacy Policy. If
              you do not agree to these terms, you may not use our services.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Eligibility</h2>
            <p>
              You must be an eligible voter as defined by the specific election rules to use our platform. For student
              elections, you must be a registered student with a valid student ID.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. Any activity that
              occurs under your account is your responsibility. You agree to notify us immediately of any unauthorized
              use of your account.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Attempt to vote multiple times or impersonate another voter</li>
              <li>Attempt to hack, disrupt, or interfere with the platform's operation</li>
              <li>Use automated means to access or use the platform</li>
              <li>Sell, trade, or transfer your voting rights or account access</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Evotar platform are owned by Evotar and are protected by
              copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Evotar shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising out of or relating to your use of our platform.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Changes to Terms</h2>
            <p>
              We may modify these Terms of Service at any time. We will provide notice of significant changes. Your
              continued use of the platform after such modifications constitutes your acceptance of the updated terms.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction
              in which Evotar operates, without regard to its conflict of law provisions.
            </p>

            <p className="text-sm text-gray-500 mt-8">Last updated: March 30, 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
