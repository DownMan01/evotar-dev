"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteUser } from "@/actions/user-actions"

interface DeleteUserButtonProps {
  userId: string
  userName: string
  disabled?: boolean
}

export default function DeleteUserButton({ userId, userName, disabled = false }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        setIsDeleting(true)
        const result = await deleteUser(userId)
        if (result.success) {
          alert(result.message)
          // Refresh the page to show updated user list
          window.location.reload()
        } else {
          alert(`Error: ${result.message}`)
        }
      } catch (error) {
        alert("Failed to delete user")
        console.error(error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Button variant="ghost" size="icon" disabled={disabled || isDeleting} onClick={handleDelete}>
      <Trash2 className="h-4 w-4 text-red-500" />
      <span className="sr-only">Delete</span>
    </Button>
  )
}
