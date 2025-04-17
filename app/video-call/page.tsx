"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VideoCall } from "@/components/video-call"
import { useAuth } from "@/lib/hooks/useAuth"
import { ArrowLeft, Copy, CheckCircle } from "lucide-react"

export default function VideoCallPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [roomId, setRoomId] = useState("")
  const [isCallActive, setIsCallActive] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  // Get room ID from URL if available
  useEffect(() => {
    const roomParam = searchParams.get("room")
    if (roomParam) {
      setRoomId(roomParam)
      setIsCallActive(true)
    } else {
      // Generate a random room ID if not provided
      const generatedId = `telehealth-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`
      setRoomId(generatedId)
    }
  }, [searchParams])
  
  // Handle starting a call
  const startCall = () => {
    setIsCallActive(true)
  }
  
  // Handle ending a call
  const endCall = () => {
    setIsCallActive(false)
    router.push(user?.role === "patient" ? "/patient" : "/doctor")
  }
  
  // Copy room link to clipboard
  const copyRoomLink = () => {
    const link = `${window.location.origin}/video-call?room=${roomId}`
    navigator.clipboard.writeText(link)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => router.push(user?.role === "patient" ? "/patient" : "/doctor")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        {isCallActive ? (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Video Consultation</h1>
            <VideoCall 
              roomId={roomId} 
              userName={user?.name || (user?.role === "patient" ? "Patient" : "Doctor")}
              onEndCall={endCall}
            />
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Share this link with others to join the call:</p>
              <div className="flex gap-2">
                <Input 
                  value={`${window.location.origin}/video-call?room=${roomId}`}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyRoomLink}
                  className="flex-shrink-0"
                >
                  {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Start Video Call</CardTitle>
                <CardDescription>
                  Start a secure video consultation with your {user?.role === "patient" ? "doctor" : "patient"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-id">Room ID</Label>
                    <Input 
                      id="room-id" 
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter room ID"
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={startCall}
                  >
                    Start Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
