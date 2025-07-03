"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { generateMnemonic, storeMnemonic, retrieveMnemonic, deriveWalletAddress } from "@/services/blockchain"

// Action to generate and store a new mnemonic for a user
export async function generateUserMnemonic() {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "You must be logged in to perform this action" }
    }

    // Generate a new mnemonic
    const mnemonic = await generateMnemonic()

    // Store the mnemonic
    const success = await storeMnemonic(session.user.id, mnemonic)

    if (!success) {
      return { success: false, error: "Failed to store your recovery phrase" }
    }

    // Return the mnemonic to the user (only time it's shown in full)
    return {
      success: true,
      mnemonic,
      walletAddress: deriveWalletAddress(mnemonic),
    }
  } catch (error) {
    console.error("Error generating mnemonic:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Action to retrieve a user's mnemonic
export async function getUserMnemonic() {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "You must be logged in to perform this action" }
    }

    // Retrieve the mnemonic
    const { mnemonic, walletAddress } = await retrieveMnemonic(session.user.id)

    if (!mnemonic) {
      // If no mnemonic exists, generate a new one
      return await generateUserMnemonic()
    }

    return { success: true, mnemonic, walletAddress }
  } catch (error) {
    console.error("Error retrieving mnemonic:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Action to get just the wallet address without exposing the mnemonic
export async function getUserWalletAddress() {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "You must be logged in to perform this action" }
    }

    // Retrieve the wallet info
    const { walletAddress } = await retrieveMnemonic(session.user.id)

    if (!walletAddress) {
      // If no wallet exists, generate a new one
      const result = await generateUserMnemonic()
      return {
        success: result.success,
        walletAddress: result.walletAddress,
        error: result.error,
      }
    }

    return { success: true, walletAddress }
  } catch (error) {
    console.error("Error retrieving wallet address:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
