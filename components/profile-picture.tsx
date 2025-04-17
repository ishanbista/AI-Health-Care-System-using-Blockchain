"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

interface ProfilePictureProps {
  size?: "sm" | "md" | "lg"
  editable?: boolean
  onUpdate?: (imageData: string) => void
}

export function ProfilePicture({ size = "md", editable = false, onUpdate }: ProfilePictureProps) {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target.result as string
          setPreviewImage(imageData)
        }
      }
      
      reader.readAsDataURL(file)
    }
  }

  // Save profile picture
  const handleSave = async () => {
    if (previewImage) {
      try {
        // Update profile with new image
        await updateProfile({ profilePicture: previewImage })
        
        // Call onUpdate callback if provided
        if (onUpdate) {
          onUpdate(previewImage)
        }
        
        // Exit editing mode
        setIsEditing(false)
      } catch (error) {
        console.error("Error updating profile picture:", error)
      }
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setPreviewImage(null)
    setIsEditing(false)
  }

  // Get the image source
  const imageSrc = previewImage || user?.profilePicture || "/placeholder-user.jpg"

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} ${editable ? "group" : ""}`}>
        <AvatarImage src={imageSrc} alt={user?.name || "User"} />
        <AvatarFallback className="bg-primary/20 text-primary">
          {user?.name?.charAt(0) || (user?.role === "patient" ? "P" : "D")}
        </AvatarFallback>
      </Avatar>
      
      {editable && !isEditing && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Camera className="h-4 w-4 text-white" />
        </button>
      )}
      
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Update Profile Picture</h3>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewImage || user?.profilePicture || "/placeholder-user.jpg"} alt={user?.name || "User"} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {user?.name?.charAt(0) || (user?.role === "patient" ? "P" : "D")}
                </AvatarFallback>
              </Avatar>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Image
              </Button>
              
              <div className="flex space-x-2 w-full">
                <Button variant="outline" className="w-1/2" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button className="w-1/2" onClick={handleSave} disabled={!previewImage}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
