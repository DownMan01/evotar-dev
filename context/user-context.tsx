"use client"

import type React from "react"

import { createContext, useContext } from "react"

interface UserContextType {
  user: any | null
  setUser: (user: any | null) => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
})

export function UserProvider({ children, value }: { children: React.ReactNode; value: any }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
