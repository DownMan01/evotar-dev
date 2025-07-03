"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MnemonicModalProps {
  isOpen: boolean
  onClose: () => void
  mnemonic: string | null
  isLoading: boolean
  error: string | null
}

export function MnemonicModal({ isOpen, onClose, mnemonic, isLoading, error }: MnemonicModalProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  // Reset copied state when modal opens/closes
  useEffect(() => {
    setCopied(false)
  }, [isOpen])

  // Handle copying mnemonic to clipboard
  const handleCopy = useCallback(() => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Your recovery phrase has been copied to your clipboard",
      })
    }
  }, [mnemonic, toast])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recovery Phrase</DialogTitle>
          <DialogDescription>
            This is your wallet recovery phrase. Keep it safe and never share it with anyone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading your recovery phrase...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error && error.includes("logged in")
                  ? "Session error. Please refresh the page or log in again."
                  : error}
              </AlertDescription>
            </Alert>
          ) : mnemonic ? (
            <div className="space-y-4">
              <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Write down these words in order and keep them in a safe place. They cannot be recovered if lost.
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-mono break-all">{mnemonic}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No recovery phrase available</p>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {mnemonic && (
            <Button onClick={handleCopy} disabled={copied}>
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Phrase
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
