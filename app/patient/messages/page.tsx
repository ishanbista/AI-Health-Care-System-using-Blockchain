"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { useAppContext } from "@/lib/app-context"
import { useMessaging } from "@/lib/messaging-context"
import { useAuth } from "@/lib/hooks/useAuth"
import { Send, Search, User, Clock, Phone, Video } from "lucide-react"
import { MessageStatus } from "@/components/ui/message-status"

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { professionals } = useAppContext()
  const { conversations, messages, sendMessage, markAsRead, getOrCreateConversation } = useMessaging()
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState("")

  // Get doctorId from URL if provided
  const doctorIdFromUrl = searchParams.get('doctorId')

  // Set selected doctor based on URL parameter
  useEffect(() => {
    // Use setTimeout to ensure this runs after hydration
    const timer = setTimeout(() => {
      if (doctorIdFromUrl) {
        const doctor = professionals.find(doc => doc.id === doctorIdFromUrl)
        if (doctor) {
          setSelectedDoctor(doctor)

          // Create or get conversation
          const conversationId = getOrCreateConversation(
            doctorIdFromUrl,
            doctor.name || 'Doctor',
            'doctor'
          )

          // Mark messages as read
          markAsRead(conversationId)
        }
      }
    }, 100) // Small delay to ensure hydration is complete

    return () => clearTimeout(timer)
  }, [doctorIdFromUrl, professionals, getOrCreateConversation, markAsRead])

  // Empty conversations by default
  const mockConversations = []

  const filteredDoctors = professionals.filter((doctor) =>
    doctor && doctor.name && doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get conversation with selected doctor
  const doctorConversationId = selectedDoctor ? getOrCreateConversation(
    selectedDoctor.id,
    selectedDoctor.name || 'Doctor',
    'doctor'
  ) : null

  // Get messages for the selected doctor
  const currentConversation = doctorConversationId ?
    messages[doctorConversationId] || [] : []

  const handleSendMessage = () => {
    if (!message.trim() || !selectedDoctor) return

    // Use the messaging context's sendMessage function
    sendMessage(selectedDoctor.id, message)
    setMessage("")
  }

  const handleVideoCall = () => {
    if (!selectedDoctor) return

    // Generate a room ID based on the doctor ID and current timestamp
    const roomId = `telehealth-${selectedDoctor.id}-${Date.now()}`
    // Navigate to the video call page with the room ID
    router.push(`/video-call?room=${roomId}`)
  }

  const handleAudioCall = () => {
    if (!selectedDoctor) return

    // In a real app, this would initiate an audio call
    alert(`Starting audio call with Dr. ${selectedDoctor.name}`)
    // Here you would typically integrate with a WebRTC service like Twilio, Agora, etc.
  }

  return (
    <PatientLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="flex-1 flex border rounded-lg overflow-hidden">
          {/* Contacts sidebar */}
          <div className="w-80 border-r bg-white flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Show conversations first */}
              {conversations.length > 0 ? (
                conversations.map((conversation) => {
                  // Get the doctor's ID and name
                  const doctorId = conversation.participantIds.find(id => id !== user?.id)
                  const doctorName = doctorId ? conversation.participantNames[doctorId] : ''
                  const doctor = professionals.find(d => d.id === doctorId)

                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedDoctor?.id === doctorId ? "bg-gray-50" : ""
                      }`}
                      onClick={() => {
                        const doctor = professionals.find(d => d.id === doctorId)
                        if (doctor) setSelectedDoctor(doctor)
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                        {doctorName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{doctorName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage || (doctor?.specialty || 'Doctor')}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                // If no conversations, show doctors
                filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedDoctor?.id === doctor.id ? "bg-gray-50" : ""
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                      {doctor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{doctor.name}</p>
                        <p className="text-xs text-gray-500">New</p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{doctor.specialty}</p>
                    </div>
                  </div>
                ))
              )}

              {filteredDoctors.length === 0 && <div className="p-4 text-center text-gray-500">No doctors found</div>}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedDoctor ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                      {selectedDoctor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{selectedDoctor.name}</p>
                      <p className="text-xs text-gray-500">{selectedDoctor.specialty}</p>
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
                  {doctorConversationId && messages[doctorConversationId] &&
                   Array.isArray(messages[doctorConversationId]) && messages[doctorConversationId].length > 0 ? (
                    messages[doctorConversationId].map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === user?.id
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-xs mt-1 ${
                              msg.senderId === user?.id ? "text-primary-foreground/70" : "text-gray-500"
                            }`}
                          >
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.senderId === user?.id && (
                              <MessageStatus status={msg.status || "pending"} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <User className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">Start a conversation</h3>
                      <p className="text-gray-500 mt-1">Send a message to {selectedDoctor.name}</p>
                    </div>
                  )}
                </div>

                {/* Message input */}
                <div className="p-3 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Clock className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p className="text-gray-500 mt-1">Choose a doctor from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}
