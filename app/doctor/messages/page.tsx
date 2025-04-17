"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageStatus } from "@/components/ui/message-status"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAppContext } from "@/lib/app-context"
import { useMessaging } from "@/lib/messaging-context"
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  CheckCircle2,
  Circle,
  ArrowLeft,
} from "lucide-react"

// Empty conversations by default
const mockConversations = []

// Empty messages by default
const mockMessages = []

export default function DoctorMessages() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { patientRequests } = useAppContext()
  const { conversations, messages, sendMessage, markAsRead, getOrCreateConversation } = useMessaging()

  // Get patientId from URL if provided
  const patientIdFromUrl = searchParams.get('patientId')

  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)

  // Create a conversation if patientId is provided in URL
  useEffect(() => {
    // Use setTimeout to ensure this runs after hydration
    const timer = setTimeout(() => {
      if (patientIdFromUrl && user) {
        // Find the patient request to get patient details
        const patientRequest = patientRequests.find(req => req.patientId === patientIdFromUrl)

        if (patientRequest) {
          // Create or get conversation
          const conversationId = getOrCreateConversation(
            patientIdFromUrl,
            patientRequest.patientName || 'Patient',
            'patient'
          )

          // Set as active conversation
          setActiveConversation(conversationId)

          // Mark messages as read
          markAsRead(conversationId)
        }
      }
    }, 100) // Small delay to ensure hydration is complete

    return () => clearTimeout(timer)
  }, [patientIdFromUrl, patientRequests, user, getOrCreateConversation, markAsRead])

  // Filter conversations based on search query
  const filteredConversations = (conversations || []).filter((conversation) => {
    if (!conversation || !conversation.participantNames) return false

    // Get the other participant's name (not the current user)
    const otherParticipantName = Object.entries(conversation.participantNames)
      .find(([id]) => id !== user?.id)?.[1] || ''

    // Filter by the other participant's name
    return otherParticipantName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Get the active conversation details
  const currentConversation = (conversations || []).find((conv) => conv && conv.id === activeConversation)

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation || !currentConversation) return

    // Get the patient ID from the current conversation
    const patientId = currentConversation.participantIds?.find(id => id !== user?.id)

    if (!patientId) return

    // Use the messaging context's sendMessage function
    sendMessage(patientId, newMessage)
    setNewMessage("")
  }

  // Mark messages as read when opening a conversation
  const handleOpenConversation = (conversationId: string) => {
    setActiveConversation(conversationId)

    // Use the messaging context's markAsRead function
    markAsRead(conversationId)
  }

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'New'

    try {
      const date = new Date(timestamp)

      // Check if date is valid
      if (isNaN(date.getTime())) return 'New'

      const now = new Date()
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (diffInDays === 0) {
        // Today - show time
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else if (diffInDays === 1) {
        // Yesterday
        return "Yesterday"
      } else if (diffInDays < 7) {
        // Within a week - show day name
        return date.toLocaleDateString([], { weekday: 'short' })
      } else {
        // Older - show date
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return 'New'
    }
  }

  // Handle initiating a video call
  const handleVideoCall = () => {
    if (!activeConversation || !currentConversation) return

    // Get the patient ID from the conversation
    const patientId = currentConversation.participantIds?.find(id => id !== user?.id)

    if (!patientId) return

    // Generate a room ID based on the patient ID and current timestamp
    const roomId = `telehealth-${patientId}-${Date.now()}`
    // Navigate to the video call page with the room ID
    router.push(`/video-call?room=${roomId}`)
  }

  // Handle initiating an audio call
  const handleAudioCall = () => {
    if (!activeConversation || !currentConversation) return

    // Get the patient name from the conversation
    const patientName = currentConversation.participantNames &&
      Object.entries(currentConversation.participantNames)
        .find(([id]) => id !== user?.id)?.[1] || 'Patient'

    // In a real app, this would initiate an audio call
    alert(`Starting audio call with ${patientName}`)
    // Here you would typically integrate with a WebRTC service like Twilio, Agora, etc.
  }

  // Handle back button in mobile view
  const handleBackToList = () => {
    setActiveConversation(null)
  }

  // Check if we're in mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobileView()
    window.addEventListener('resize', checkMobileView)

    return () => {
      window.removeEventListener('resize', checkMobileView)
    }
  }, [])

  return (
    <DoctorLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="flex flex-1 bg-white rounded-lg shadow overflow-hidden">
          {/* Conversation List - Hidden on mobile when a conversation is active */}
          {(!isMobileView || !activeConversation) && (
            <div className="w-full md:w-1/3 border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-16rem)]">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        activeConversation === conversation.id ? "bg-gray-50" : ""
                      }`}
                      onClick={() => handleOpenConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.participantNames &&
                             Object.entries(conversation.participantNames)
                              .find(([id]) => id !== user?.id)?.[1]?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">
                              {conversation.participantNames &&
                               Object.entries(conversation.participantNames)
                                .find(([id]) => id !== user?.id)?.[1] || 'Patient'}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessageTimestamp ? formatTimestamp(conversation.lastMessageTimestamp) : 'New'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                            {conversation.unread && (
                              <Badge variant="default" className="rounded-full h-5 w-5 p-0 flex items-center justify-center">
                                <span className="sr-only">Unread messages</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No conversations found</div>
                )}
              </div>
            </div>
          )}

          {/* Conversation/Chat Area */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {isMobileView && (
                    <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-1">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {currentConversation?.participantNames &&
                       Object.entries(currentConversation.participantNames)
                        .find(([id]) => id !== user?.id)?.[1]?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {currentConversation?.participantNames &&
                       Object.entries(currentConversation.participantNames)
                        .find(([id]) => id !== user?.id)?.[1] || 'Patient'}
                    </h3>
                    <p className="text-xs text-gray-500">Patient</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                    onClick={handleAudioCall}
                    title="Audio Call"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
                    onClick={handleVideoCall}
                    title="Video Call"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation && messages[activeConversation] &&
                 Array.isArray(messages[activeConversation]) &&
                 messages[activeConversation].map((message) => {
                  const isFromDoctor = message.senderId === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromDoctor ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isFromDoctor
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                            isFromDoctor ? "text-primary-foreground/70" : "text-gray-500"
                          }`}
                        >
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {isFromDoctor && (
                            <span>
                              <MessageStatus status={message.status || "pending"} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-[2.5rem] max-h-[10rem]"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    className="self-end"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  )
}
