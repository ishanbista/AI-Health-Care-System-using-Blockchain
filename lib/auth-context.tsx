"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum: {
      request: (args: { method: string; params?: any[] }) => Promise<string[]>
      on: (event: string, callback: (accounts: string[]) => void) => void
      removeListener: (event: string, callback: (accounts: string[]) => void) => void
      selectedAddress: string | null
    }
  }
}

type User = {
  id: string
  name?: string
  email?: string
  age?: number
  bloodGroup?: string
  role: "patient" | "doctor"
  walletAddress?: string
  profileCompleted: boolean
  profilePicture?: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  updateProfile: (profileData: any) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true)

      // Clear any existing session to force new connection
      localStorage.removeItem("telehealth_user")
      setUser(null)

      setIsLoading(false)
    }

    checkSession()
  }, [])

  // Mock user database - in a real app, this would be stored in a secure database
  // This is just for demonstration purposes
  const mockUsers: Record<
    string,
    { id: string; name: string; email: string; password: string; role: "patient" | "doctor" }
  > = {
    "patient@example.com": {
      id: "p1",
      name: "John Smith",
      email: "patient@example.com",
      password: "password123",
      role: "patient",
    },
    "doctor@example.com": {
      id: "d1",
      name: "Dr. Sarah Johnson",
      email: "doctor@example.com",
      password: "password123",
      role: "doctor",
    },
    "test@example.com": {
      id: "p2",
      name: "Test User",
      email: "test@example.com",
      password: "test123",
      role: "patient",
    },
    "doctor2@example.com": {
      id: "d2",
      name: "Dr. James Wilson",
      email: "doctor2@example.com",
      password: "doctor123",
      role: "doctor",
    },
  }

  // Fix the login function to properly handle authentication
  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user exists in our mock database
      const mockUser = mockUsers[email]

      if (!mockUser) {
        throw new Error("Invalid email or password")
      }

      if (mockUser.password !== password) {
        throw new Error("Invalid email or password")
      }

      if (mockUser.role !== role) {
        throw new Error(`This account is registered as a ${mockUser.role}, not a ${role}`)
      }

      // Create user object (without password)
      const { password: _, ...userWithoutPassword } = mockUser

      // Save user to state and localStorage
      setUser(userWithoutPassword)
      localStorage.setItem("telehealth_user", JSON.stringify(userWithoutPassword))
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if email is already taken
      if (mockUsers[email]) {
        throw new Error("Email already in use")
      }

      // Create new user
      const newUser = {
        id: `${role[0]}${Date.now()}`, // Generate a simple ID
        name,
        email,
        password,
        role: role as "patient" | "doctor",
      }

      // In a real app, we would save this to a database
      // For demo purposes, we're just adding it to our mock database
      mockUsers[email] = newUser

      // Note: We don't automatically log the user in after registration
      // They need to login with their credentials first
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Modified connectWallet function to force account selection in MetaMask
  const connectWallet = async () => {
    try {
      setIsLoading(true)

      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // First, clear any existing connections by requesting accounts with empty params
      // This forces MetaMask to show the account selection dialog
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      })

      // Now request account access - this will prompt the user to select an account
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in MetaMask.")
      }

      const walletAddress = accounts[0]

      // Check if we have a user with this wallet address in localStorage
      const allUsers = localStorage.getItem("telehealth_users")
      const usersByWallet: Record<string, User> = allUsers ? JSON.parse(allUsers) : {}

      // If we have a user with this wallet address, load their profile
      if (usersByWallet[walletAddress]) {
        const existingUser = usersByWallet[walletAddress]
        setUser(existingUser)
        localStorage.setItem("telehealth_user", JSON.stringify(existingUser))
        return
      }

      // Create a new user with wallet address if no existing profile is found
      const newUser: User = {
        id: `u${Date.now()}`,
        walletAddress: walletAddress,
        role: "patient", // Default role, will be updated during profile creation
        profileCompleted: false,
      }

      setUser(newUser)
      localStorage.setItem("telehealth_user", JSON.stringify(newUser))

      // Also store in our wallet-indexed storage
      usersByWallet[walletAddress] = newUser
      localStorage.setItem("telehealth_users", JSON.stringify(usersByWallet))
    } catch (error) {
      console.error("Wallet connection error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      // Clear user session
      setUser(null)
      localStorage.removeItem("telehealth_user")
    } catch (error) {
      console.error("Wallet disconnection error:", error)
      throw error
    }
  }

  // Modify the updateProfile function to store user data by wallet address
  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error("User not authenticated")

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user profile
      const updatedUser = {
        ...user,
        ...profileData,
        profileCompleted: true,
      }

      // Save updated user
      setUser(updatedUser)
      localStorage.setItem("telehealth_user", JSON.stringify(updatedUser))

      // Also store in our wallet-indexed storage
      if (updatedUser.walletAddress) {
        const allUsers = localStorage.getItem("telehealth_users")
        const usersByWallet: Record<string, User> = allUsers ? JSON.parse(allUsers) : {}
        usersByWallet[updatedUser.walletAddress] = updatedUser
        localStorage.setItem("telehealth_users", JSON.stringify(usersByWallet))
      }
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("telehealth_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        connectWallet,
        disconnectWallet,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
