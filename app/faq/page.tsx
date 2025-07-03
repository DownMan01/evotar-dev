import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold text-[#0077ff] mb-6">Frequently Asked Questions</h1>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does blockchain voting work?</AccordionTrigger>
              <AccordionContent>
                Blockchain voting works by recording each vote as a transaction on a decentralized ledger. Once
                recorded, votes cannot be altered or deleted, ensuring the integrity of the election. Each voter
                receives a unique cryptographic key to cast their vote, maintaining both security and anonymity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Is my vote anonymous?</AccordionTrigger>
              <AccordionContent>
                Yes, your vote is anonymous. While the blockchain records that you have voted (to prevent
                double-voting), it does not link your identity to your specific vote choice. The system uses
                cryptographic techniques to ensure vote privacy while maintaining verifiability.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How secure is the Evotar platform?</AccordionTrigger>
              <AccordionContent>
                Evotar employs multiple layers of security, including end-to-end encryption, multi-factor
                authentication, and decentralized verification. The blockchain architecture makes it virtually
                impossible to tamper with votes once they are cast. Our system undergoes regular security audits by
                independent third parties.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Can I verify that my vote was counted correctly?</AccordionTrigger>
              <AccordionContent>
                Yes, each voter receives a unique receipt with a verification code after voting. You can use this code
                to verify that your vote was recorded correctly on the blockchain without revealing who you voted for.
                This provides transparency while maintaining ballot secrecy.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>What if I don't have internet access?</AccordionTrigger>
              <AccordionContent>
                For elections using Evotar, voting stations with internet access are typically provided for those
                without personal internet access. In some implementations, offline voting options may be available with
                votes being recorded to the blockchain once connectivity is established.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How do I request an account?</AccordionTrigger>
              <AccordionContent>
                Account creation is typically managed by the election administrator. For student elections, you would
                need to contact your institution's election office with your student ID and verification information.
                They will create your account and provide login credentials.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
