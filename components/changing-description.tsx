"use client"

import { useState, useEffect } from "react"
import { inter } from "@/lib/fonts"

interface ChangingDescriptionProps {
  descriptions: string[]
}

export function ChangingDescription({ descriptions }: ChangingDescriptionProps) {
  const [displayText, setDisplayText] = useState("")
  const [index, setIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(80)

  useEffect(() => {
    let timer

    // Handle typing effect
    if (!isDeleting && displayText === descriptions[index]) {
      // Full text is displayed, wait before deleting
      timer = setTimeout(() => {
        setIsDeleting(true)
        setTypingSpeed(40) // Delete faster than typing
      }, 2000)
    } else if (isDeleting && displayText === "") {
      // Text is fully deleted, move to next description
      setIsDeleting(false)
      setTypingSpeed(80) // Reset typing speed
      setIndex((prevIndex) => (prevIndex + 1) % descriptions.length)
    } else {
      // Handle typing or deleting
      timer = setTimeout(() => {
        setDisplayText((prev) => {
          if (isDeleting) {
            // Remove last character
            return prev.substring(0, prev.length - 1)
          } else {
            // Add next character
            return descriptions[index].substring(0, prev.length + 1)
          }
        })
      }, typingSpeed)
    }

    return () => clearTimeout(timer)
  }, [displayText, descriptions, index, isDeleting, typingSpeed])

  return (
    <p
      className={`text-lg md:text-xl leading-relaxed text-center md:text-left text-white/90 min-h-[80px] font-normal ${inter.className}`}
    >
      {displayText}
      <span className="inline-block w-1 h-6 ml-1 bg-white/80 animate-blink"></span>
    </p>
  )
}
