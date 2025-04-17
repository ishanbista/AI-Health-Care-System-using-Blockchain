"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { Check, CheckCheck, Circle } from "lucide-react"

// Define message types
export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "doctor" | "patient"
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  status: "pending" | "sent" | "delivered" | "read"
}

// Define conversation types
export interface Conversation {
  id: string
  participantIds: string[]
  participantNames: Record<string, string>
  participantRoles: Record<string, "doctor" | "patient">
  lastMessage: string
  lastMessageTimestamp: string
  unreadCount: number
}

interface MessagingContextType {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  sendMessage: (receiverId: string, content: string) => Promise<void>
  markAsRead: (conversationId: string) => void
  getConversationId: (participantId: string) => string | null
  getOrCreateConversation: (participantId: string, participantName: string, participantRole: "doctor" | "patient") => string
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})

  // Load conversations and messages from localStorage on mount
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const storedConversations = localStorage.getItem("telehealth_conversations")
      const storedMessages = localStorage.getItem("telehealth_messages")

      if (storedConversations) {
        try {
          const parsedConversations = JSON.parse(storedConversations)
          // Filter conversations for the current user
          const userConversations = parsedConversations.filter(
            (conv: Conversation) => conv.participantIds.includes(user.id)
          )
          setConversations(userConversations)
        } catch (error) {
          console.error("Error parsing conversations:", error)
        }
      }

      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages)
          setMessages(parsedMessages)
        } catch (error) {
          console.error("Error parsing messages:", error)
        }
      }
    }
  }, [user])

  // Save conversations and messages to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (conversations.length > 0) {
        localStorage.setItem("telehealth_conversations", JSON.stringify(conversations))
      }
      if (Object.keys(messages).length > 0) {
        localStorage.setItem("telehealth_messages", JSON.stringify(messages))
      }
    }
  }, [conversations, messages])

  // Get conversation ID for a participant
  const getConversationId = (participantId: string): string | null => {
    if (!user) return null

    const conversation = conversations.find(
      (conv) => conv.participantIds.includes(user.id) && conv.participantIds.includes(participantId)
    )

    return conversation ? conversation.id : null
  }

  // Get or create a conversation with a participant
  const getOrCreateConversation = (
    participantId: string,
    participantName: string,
    participantRole: "doctor" | "patient"
  ): string => {
    if (!user) throw new Error("User not authenticated")

    // Check if conversation already exists
    const existingConversationId = getConversationId(participantId)
    if (existingConversationId) return existingConversationId

    // Create a new conversation
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      participantIds: [user.id, participantId],
      participantNames: {
        [user.id]: user.name || (user.role === "doctor" ? "Doctor" : "Patient"),
        [participantId]: participantName,
      },
      participantRoles: {
        [user.id]: user.role as "doctor" | "patient",
        [participantId]: participantRole,
      },
      lastMessage: "",
      lastMessageTimestamp: new Date().toISOString(),
      unreadCount: 0,
    }

    setConversations([...conversations, newConversation])
    setMessages({ ...messages, [newConversation.id]: [] })

    return newConversation.id
  }

  // Send a message
  const sendMessage = async (receiverId: string, content: string): Promise<void> => {
    if (!user || !content.trim()) return

    // Find existing conversation or create a new one
    let conversationId = getConversationId(receiverId)

    // If no conversation exists, try to find the receiver's name
    if (!conversationId) {
      // Find the conversation with this participant
      const existingConv = conversations.find(conv => conv.participantIds.includes(receiverId))

      // Get the receiver's name from existing conversation or use a default
      const receiverName = existingConv?.participantNames?.[receiverId] ||
                          (user.role === "doctor" ? "Patient" : "Doctor")

      // Create the conversation
      conversationId = getOrCreateConversation(
        receiverId,
        receiverName,
        user.role === "doctor" ? "patient" : "doctor"
      )
    }

    // Create new message
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name || (user.role === "doctor" ? "Doctor" : "Patient"),
      senderRole: user.role as "doctor" | "patient",
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      status: "pending", // Initial status is pending
    }

    // Update messages
    const conversationMessages = messages[conversationId] || []
    const updatedMessages = {
      ...messages,
      [conversationId]: [...conversationMessages, newMessage],
    }
    setMessages(updatedMessages)

    // Simulate message being sent after a short delay
    setTimeout(() => {
      const sentMessage = { ...newMessage, status: "sent" }
      const updatedConversationMessages = updatedMessages[conversationId].map(msg =>
        msg.id === newMessage.id ? sentMessage : msg
      )

      setMessages({
        ...updatedMessages,
        [conversationId]: updatedConversationMessages
      })

      // Simulate message being delivered after another delay
      setTimeout(() => {
        const deliveredMessage = { ...sentMessage, status: "delivered" }
        const finalConversationMessages = updatedConversationMessages.map(msg =>
          msg.id === newMessage.id ? deliveredMessage : msg
        )

        setMessages({
          ...updatedMessages,
          [conversationId]: finalConversationMessages
        })
      }, 1000) // 1 second delay for delivery
    }, 500) // 0.5 second delay for sending

    // Update conversation
    setConversations(
      conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: content,
            lastMessageTimestamp: newMessage.timestamp,
          }
        }
        return conv
      })
    )
  }

  // Mark messages in a conversation as read
  const markAsRead = (conversationId: string): void => {
    if (!user) return

    // Update messages
    const conversationMessages = messages[conversationId]
    if (!conversationMessages) return

    const updatedMessages = {
      ...messages,
      [conversationId]: conversationMessages.map((msg) => {
        if (msg.receiverId === user.id && !msg.read) {
          return { ...msg, read: true, status: "read" }
        }
        return msg
      }),
    }
    setMessages(updatedMessages)

    // Update conversation unread count
    setConversations(
      conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
          }
        }
        return conv
      })
    )
  }

  const value = {
    conversations,
    messages,
    sendMessage,
    markAsRead,
    getConversationId,
    getOrCreateConversation,
  }

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider")
  }
  return context
}
