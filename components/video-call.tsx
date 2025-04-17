"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare } from "lucide-react"

interface VideoCallProps {
  roomId: string
  userName?: string
  onEndCall?: () => void
  isFullScreen?: boolean
}

export function VideoCall({ roomId, userName = "User", onEndCall, isFullScreen = false }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Generate a Jitsi Meet URL with the room ID
  const jitsiUrl = `https://meet.jit.si/${roomId}?config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(userName)}`
  
  // Handle ending the call
  const handleEndCall = () => {
    if (onEndCall) {
      onEndCall()
    }
  }
  
  // Toggle microphone
  const toggleMic = () => {
    setIsMuted(!isMuted)
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // This is just UI state - actual mute would require Jitsi API integration
      // which we're avoiding for simplicity
    }
  }
  
  // Toggle video
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // This is just UI state - actual video toggle would require Jitsi API integration
      // which we're avoiding for simplicity
    }
  }
  
  return (
    <Card className={`overflow-hidden ${isFullScreen ? "fixed inset-0 z-50" : "w-full h-[600px]"}`}>
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative flex-grow">
          <iframe
            ref={iframeRef}
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full min-h-[500px]"
            style={{ border: 0 }}
            title="Video Call"
          />
          
          {/* Overlay for when video is turned off */}
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{userName.charAt(0)}</span>
                </div>
                <p className="text-xl font-medium">{userName}</p>
                <p className="text-sm opacity-70">Camera is off</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Control bar */}
        <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            onClick={toggleMic}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full bg-red-500 hover:bg-red-600"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-gray-800 text-white hover:bg-gray-700"
          >
            <Users className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-gray-800 text-white hover:bg-gray-700"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
