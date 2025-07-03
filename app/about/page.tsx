import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold text-[#0077ff] mb-6">About Evotar</h1>

          <div className="prose prose-blue max-w-none">
            <p className="text-lg mb-4">
              Evotar is a cutting-edge blockchain-based voting platform designed to bring transparency, security, and
              accessibility to the democratic process.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p>
              We believe that voting should be secure, transparent, and accessible to all eligible voters. Our mission
              is to leverage blockchain technology to create a voting system that ensures every vote is counted
              accurately and cannot be tampered with.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Blockchain Technology</h2>
            <p>By utilizing blockchain technology, Evotar provides:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Immutable records that cannot be altered once a vote is cast</li>
              <li>Transparency through public verification of results</li>
              <li>Enhanced security against fraud and manipulation</li>
              <li>Decentralized architecture that prevents single points of failure</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">Our Team</h2>
            <p>
              Evotar was founded by a team of blockchain experts, security professionals, and democracy advocates who
              share a passion for improving voting systems worldwide.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              For more information about Evotar or to request a demonstration for your organization, please contact us
              at{" "}
              <a href="mailto:info@evotar.xyz" className="text-[#0077ff] hover:underline">
                info@evotar.xyz
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
