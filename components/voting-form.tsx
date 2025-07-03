"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Vote } from "lucide-react"
import { useBlockchain } from "@/hooks/use-blockchain"
import { castVoteOnBlockchain, hasUserVoted } from "@/services/blockchain"
import { useToast } from "@/components/ui/use-toast"

interface Candidate {
  id: string
  name: string
  party?: string
  position?: string
  bio?: string
}

interface VotingFormProps {
  electionId: string
  electionTitle: string
  candidates: Candidate[]
}

export function VotingForm({ electionId, electionTitle, candidates }: VotingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { isConnected, walletAddress, isBlockchainEnabled } = useBlockchain()

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [isCheckingVoteStatus, setIsCheckingVoteStatus] = useState(true)

  // Check if user has already voted in this election
  useEffect(() => {
    async function checkVoteStatus() {
      if (isBlockchainEnabled && isConnected && walletAddress) {
        setIsCheckingVoteStatus(true)
        try {
          const voted = await hasUserVoted(walletAddress, electionId)
          setHasVoted(voted)
        } catch (error) {
          console.error("Error checking vote status:", error)
        } finally {
          setIsCheckingVoteStatus(false)
        }
      } else {
        setIsCheckingVoteStatus(false)
      }
    }

    checkVoteStatus()
  }, [isBlockchainEnabled, isConnected, walletAddress, electionId])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!selectedCandidate) {
        setError("Please select a candidate to vote for")
        return
      }

      if (!isConnected || !walletAddress) {
        setError("You must connect your blockchain wallet to vote")
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const result = await castVoteOnBlockchain(walletAddress, electionId, selectedCandidate)

        if (result.success) {
          setSuccess(true)
          toast({
            title: "Vote Cast Successfully",
            description: "Your vote has been recorded on the blockchain",
          })

          // Redirect to results page after a short delay
          setTimeout(() => {
            router.push(`/elections/${electionId}/results`)
          }, 3000)
        } else {
          setError(result.error || "Failed to cast your vote")
        }
      } catch (error) {
        console.error("Error casting vote:", error)
        setError("An unexpected error occurred while processing your vote")
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedCandidate, isConnected, walletAddress, electionId, router, toast],
  )

  if (isCheckingVoteStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Checking vote status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Already Voted</CardTitle>
          <CardDescription>You have already cast your vote in this election</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Vote Recorded</AlertTitle>
            <AlertDescription className="text-blue-700">
              Your vote has been securely recorded on the blockchain. You can view the results when the election
              concludes.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push(`/elections/${electionId}/results`)}>
            View Results
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote Cast Successfully</CardTitle>
          <CardDescription>Your vote has been recorded</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Your vote has been securely recorded on the blockchain. Redirecting to results page...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>Select a candidate for {electionTitle}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isConnected && isBlockchainEnabled && (
            <Alert variant="warning" className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                You need to connect your blockchain wallet to vote. Please connect your wallet in the blockchain
                section.
              </AlertDescription>
            </Alert>
          )}

          <RadioGroup value={selectedCandidate || ""} onValueChange={setSelectedCandidate}>
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value={candidate.id} id={candidate.id} />
                  <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      {candidate.party && <p className="text-sm text-muted-foreground">{candidate.party}</p>}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!selectedCandidate || isSubmitting || !isConnected}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Casting Vote...
              </>
            ) : (
              <>
                <Vote className="h-4 w-4 mr-2" />
                Cast Vote
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
