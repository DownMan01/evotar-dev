"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Key } from "lucide-react"
import { useBlockchain } from "@/hooks/use-blockchain"
import { MnemonicModal } from "@/components/mnemonic-modal"
import { getUserMnemonic } from "@/actions/wallet-actions"

export function BlockchainConnect() {
  const { isConnected, isLoading, error, walletAddress, initBlockchain, disconnectBlockchain, isBlockchainEnabled } =
    useBlockchain()

  // State for mnemonic modal
  const [mnemonicModalOpen, setMnemonicModalOpen] = useState(false)
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [isLoadingMnemonic, setIsLoadingMnemonic] = useState(false)
  const [mnemonicError, setMnemonicError] = useState<string | null>(null)

  // Initialize blockchain connection on component mount
  useEffect(() => {
    if (isBlockchainEnabled && !isConnected && !isLoading) {
      initBlockchain()
    }
  }, [isBlockchainEnabled, isConnected, isLoading, initBlockchain])

  // Function to handle showing the mnemonic
  const handleShowMnemonic = useCallback(async () => {
    setMnemonicModalOpen(true)
    setIsLoadingMnemonic(true)
    setMnemonicError(null)

    try {
      const result = await getUserMnemonic()

      if (result.success && result.mnemonic) {
        setMnemonic(result.mnemonic)
      } else {
        setMnemonicError(result.error || "Failed to retrieve your recovery phrase")
      }
    } catch (error) {
      console.error("Error fetching mnemonic:", error)
      setMnemonicError("An unexpected error occurred")
    } finally {
      setIsLoadingMnemonic(false)
    }
  }, [])

  // If blockchain is disabled, don't render anything
  if (!isBlockchainEnabled) {
    return null
  }

  return (
    <>
      <MnemonicModal
        isOpen={mnemonicModalOpen}
        onClose={() => setMnemonicModalOpen(false)}
        mnemonic={mnemonic}
        isLoading={isLoadingMnemonic}
        error={mnemonicError}
      />

      <Card>
        <CardHeader>
          <CardTitle>Blockchain Connection</CardTitle>
          <CardDescription>Secure voting with blockchain technology</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Connecting to blockchain...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : isConnected ? (
            <div className="space-y-4">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Connected</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your wallet is connected to the blockchain
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Wallet Address</p>
                <p className="text-xs font-mono break-all">{walletAddress}</p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="mb-4">Connect to the blockchain to participate in secure voting</p>
              <Button onClick={initBlockchain}>Connect Wallet</Button>
            </div>
          )}
        </CardContent>
        {isConnected && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleShowMnemonic}>
              <Key className="h-4 w-4 mr-2" />
              Show Recovery Phrase
            </Button>
            <Button variant="outline" onClick={disconnectBlockchain}>
              Disconnect
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  )
}
