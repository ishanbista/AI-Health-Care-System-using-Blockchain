"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Send, X, Loader2, MinusCircle, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function HealthChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your health assistant. How can I help you today? You can ask me about symptoms, general wellness tips, or preventive care. Remember, I'm not a doctor and can't provide medical diagnoses. For serious concerns, please consult a healthcare professional.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Format messages for API
      const apiMessages = messages
        .concat(userMessage)
        .map(({ role, content }) => ({ role, content }))

      // Call API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Add assistant message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          },
        ])
      } catch (fetchError) {
        console.error("Error fetching from API:", fetchError)

        // Check if it's a timeout error
        if (fetchError.name === "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I'm sorry, the request timed out. Our health assistant is currently experiencing high demand. Please try again in a moment.",
              timestamp: new Date(),
            },
          ])
        } else {
          // For other fetch errors, still try to get a response from the API
          try {
            const fallbackResponse = await fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: [{ role: "user", content: userMessage.content }]
              }),
            })

            const fallbackData = await fallbackResponse.json()

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: fallbackData.response || "I'm sorry, I encountered an error processing your request. Please try again with a different question.",
                timestamp: new Date(),
              },
            ])
          } catch (fallbackError) {
            // If even the fallback fails, show a generic error message
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "I'm sorry, I encountered an error processing your request. Please try again later.",
                timestamp: new Date(),
              },
            ])
          }
        }
      }
    } catch (error) {
      console.error("Error in send message handler:", error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again later.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 w-80 md:w-96 transition-all duration-300 ease-in-out",
      isMinimized ? "h-14" : "h-[500px] max-h-[80vh]"
    )}>
      <Card className="h-full flex flex-col shadow-lg border-primary/20">
        <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-md font-medium flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            Health Assistant
          </CardTitle>
          <div className="flex items-center gap-1">
            {isMinimized ? (
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(false)} className="h-8 w-8">
                <PlusCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-8 w-8">
                <MinusCircle className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Ask a health question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
