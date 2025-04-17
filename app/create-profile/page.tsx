"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAppContext } from "@/lib/app-context"
import { User, UserCog, AlertCircle, Loader2, CheckCircle } from "lucide-react"

export default function CreateProfilePage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, updateProfile } = useAuth()
  const { registerDoctor, registerPatient } = useAppContext()
  const [role, setRole] = useState("patient")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Basic profile fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [age, setAge] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")

  // Patient-specific fields
  const [gender, setGender] = useState("")
  const [allergies, setAllergies] = useState("")
  const [medicalConditions, setMedicalConditions] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")

  // Doctor-specific fields
  const [specialty, setSpecialty] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [education, setEducation] = useState("")
  const [experience, setExperience] = useState("")
  const [hospital, setHospital] = useState("")
  const [consultationFee, setConsultationFee] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/connect-wallet")
    }
  }, [isLoading, isAuthenticated, router])

  // Redirect if profile is already completed
  useEffect(() => {
    if (user?.profileCompleted) {
      router.push(user.role === "patient" ? "/patient" : "/doctor")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate inputs
      if (!name.trim() || !email.trim()) {
        throw new Error("Please fill in all required fields")
      }

      // Prepare profile data
      const profileData: any = {
        name,
        email,
        role,
        age: age ? Number.parseInt(age) : undefined,
        bloodGroup,
      }

      // Add role-specific data
      if (role === "patient") {
        profileData.gender = gender
        profileData.allergies = allergies ? allergies.split(",").map((item) => item.trim()) : []
        profileData.medicalConditions = medicalConditions ? medicalConditions.split(",").map((item) => item.trim()) : []

        if (emergencyContactName && emergencyContactRelationship && emergencyContactPhone) {
          profileData.emergencyContact = {
            name: emergencyContactName,
            relationship: emergencyContactRelationship,
            phone: emergencyContactPhone,
          }
        }
      } else if (role === "doctor") {
        profileData.specialty = specialty
        profileData.licenseNumber = licenseNumber
        profileData.education = education ? education.split(",").map((item) => item.trim()) : []
        profileData.experience = experience ? Number.parseInt(experience, 10) : undefined
        profileData.hospital = hospital
        profileData.consultationFee = consultationFee ? Number.parseInt(consultationFee, 10) : undefined
      }

      // Update profile
      await updateProfile(profileData)

      // Register in the app context
      if (role === "doctor" && user?.id && user?.walletAddress) {
        await registerDoctor({
          specialty,
          experience: experience ? Number.parseInt(experience, 10) : 0,
          hospital,
          consultationFee: consultationFee ? Number.parseInt(consultationFee, 10) : 100,
        })
      } else if (role === "patient" && user?.id && user?.walletAddress) {
        await registerPatient({
          id: user.id,
          name,
          walletAddress: user.walletAddress,
        })
      }

      // Show success message
      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(role === "patient" ? "/patient" : "/doctor")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Profile</CardTitle>
              <CardDescription>Complete your profile to get started with TeleHealth</CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Profile Created Successfully!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Your profile has been created. Redirecting you to your dashboard...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="text-sm text-gray-500">
                        Wallet: {user.walletAddress?.substring(0, 6)}...
                        {user.walletAddress?.substring(user.walletAddress.length - 4)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Enter your age"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <Select value={bloodGroup} onValueChange={setBloodGroup}>
                          <SelectTrigger id="bloodGroup">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Type</h3>
                    <Tabs defaultValue={role} onValueChange={setRole} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="patient" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Patient
                        </TabsTrigger>
                        <TabsTrigger value="doctor" className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Doctor
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="patient" className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger id="gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="allergies">Allergies (comma separated)</Label>
                          <Textarea
                            id="allergies"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                            placeholder="e.g., Penicillin, Peanuts, Latex"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="medicalConditions">Medical Conditions (comma separated)</Label>
                          <Textarea
                            id="medicalConditions"
                            value={medicalConditions}
                            onChange={(e) => setMedicalConditions(e.target.value)}
                            placeholder="e.g., Asthma, Diabetes, Hypertension"
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Emergency Contact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="emergencyContactName">Name</Label>
                              <Input
                                id="emergencyContactName"
                                value={emergencyContactName}
                                onChange={(e) => setEmergencyContactName(e.target.value)}
                                placeholder="Emergency contact name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                              <Input
                                id="emergencyContactRelationship"
                                value={emergencyContactRelationship}
                                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                                placeholder="e.g., Spouse, Parent, Friend"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                            <Input
                              id="emergencyContactPhone"
                              value={emergencyContactPhone}
                              onChange={(e) => setEmergencyContactPhone(e.target.value)}
                              placeholder="Emergency contact phone number"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="doctor" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="specialty">Medical Specialty *</Label>
                            <Select value={specialty} onValueChange={setSpecialty} required={role === "doctor"}>
                              <SelectTrigger id="specialty">
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cardiology">Cardiology</SelectItem>
                                <SelectItem value="Dermatology">Dermatology</SelectItem>
                                <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                                <SelectItem value="Neurology">Neurology</SelectItem>
                                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                                <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                                <SelectItem value="General">General Practice</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License Number *</Label>
                            <Input
                              id="licenseNumber"
                              value={licenseNumber}
                              onChange={(e) => setLicenseNumber(e.target.value)}
                              placeholder="Your medical license number"
                              required={role === "doctor"}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="education">Education (comma separated)</Label>
                          <Textarea
                            id="education"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            placeholder="e.g., Harvard Medical School, Johns Hopkins Residency"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                              id="experience"
                              type="number"
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                              placeholder="e.g., 10"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                            <Input
                              id="consultationFee"
                              type="number"
                              value={consultationFee}
                              onChange={(e) => setConsultationFee(e.target.value)}
                              placeholder="e.g., 150"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hospital">Hospital/Clinic</Label>
                          <Input
                            id="hospital"
                            value={hospital}
                            onChange={(e) => setHospital(e.target.value)}
                            placeholder="Where you currently practice"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      "Create Profile"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
