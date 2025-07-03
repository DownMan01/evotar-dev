"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getUserMnemonic } from "@/actions/wallet-actions"

export function useBlockchain() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if blockchain is enabled
  const isBlockchainEnabled = process.env.NEXT_PUBLIC_USE_BLOCKCHAIN === "true"

  // Initialize blockchain connection
  const initBlockchain = useCallback(async () => {
    if (!isBlockchainEnabled) {
      console.log("Blockchain features are disabled")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get user mnemonic from secure storage
      const result = await getUserMnemonic()

      if (result.success && result.mnemonic && result.walletAddress) {
        setWalletAddress(result.walletAddress)
        setIsConnected(true)
        toast({
          title: "Blockchain Connected",
          description: "Your wallet is now connected to the blockchain",
        })
      } else {
        setError(result.error || "Failed to connect to blockchain")
        toast({
          title: "Connection Failed",
          description: result.error || "Could not connect to the blockchain",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Blockchain initialization error:", err)
      setError("Failed to initialize blockchain connection")
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while connecting to the blockchain",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, isBlockchainEnabled])

  // Disconnect from blockchain
  const disconnectBlockchain = useCallback(() => {
    setIsConnected(false)
    setWalletAddress(null)
    toast({
      title: "Disconnected",
      description: "You have been disconnected from the blockchain",
    })
  }, [toast])

  return {
    isConnected,
    isLoading,
    error,
    walletAddress,
    initBlockchain,
    disconnectBlockchain,
    isBlockchainEnabled,
  }
}
