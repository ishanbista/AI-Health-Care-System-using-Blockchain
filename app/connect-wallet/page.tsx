"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/hooks/useAuth"
import { Wallet, AlertCircle, Loader2, CheckCircle } from "lucide-react"

export default function ConnectWalletPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState("")
  const { connectWallet } = useAuth()

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    setError("")

    try {
      // Connect wallet - this will prompt the user to select an account in MetaMask
      await connectWallet()

      // Show success state
      setIsConnected(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/create-profile")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>Connect your blockchain wallet to access the TeleHealth platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700">
                TeleHealth uses blockchain technology to secure your medical data and enable transparent healthcare
                transactions.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {isConnected ? (
              <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p>Wallet connected successfully! Redirecting...</p>
              </div>
            ) : (
              <Button
                className="w-full flex items-center justify-center gap-2 h-12"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Connect MetaMask Wallet
                  </>
                )}
              </Button>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>
                Don't have a wallet?{" "}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Install MetaMask
                </a>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            <p>Your wallet address will be used to securely identify you on the platform</p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
