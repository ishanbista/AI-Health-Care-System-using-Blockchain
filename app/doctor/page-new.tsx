"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAppContext } from "@/lib/app-context"
import { DoctorLayout } from "@/components/layouts/doctor-layout"
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  User,
  ChevronRight,
  Loader2,
  LogOut,
  UserCog,
  Save,
  AlertCircle,
} from "lucide-react"

export default function DoctorDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateProfile, logout } = useAuth()
  const { patientRequests, appointments, activePatients, updatePatientRequest, createAppointment, registerDoctor } = useAppContext()

  // Get the tab from the URL query parameter or default to "dashboard"
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard")
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [responseNote, setResponseNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")
  
  // Update the URL when the tab changes
  useEffect(() => {
    if (tabParam !== activeTab && activeTab !== "dashboard") {
      router.push(`/doctor?tab=${activeTab}`)
    } else if (tabParam && activeTab === "dashboard") {
      router.push("/doctor")
    }
  }, [activeTab, router, tabParam])

  // Profile form state
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [specialty, setSpecialty] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [education, setEducation] = useState("")
  const [experience, setExperience] = useState("")
  const [hospital, setHospital] = useState("")
  const [consultationFee, setConsultationFee] = useState("")
  
  // Load doctor profile data
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setSpecialty(user.specialty || "")
      setLicenseNumber(user.licenseNumber || "")
      setEducation(user.education ? user.education.join(", ") : "")
      setExperience(user.experience ? user.experience.toString() : "")
      setHospital(user.hospital || "")
      setConsultationFee(user.consultationFee ? user.consultationFee.toString() : "")
    }
  }, [user])

  const handleLogout = async () => {
    logout()
    router.push("/")
  }
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setProfileSuccess(false)
    setProfileError("")
    
    try {
      // Validate inputs
      if (!name.trim() || !email.trim() || !specialty.trim() || !licenseNumber.trim()) {
        throw new Error("Please fill in all required fields")
      }
      
      // Prepare profile data
      const profileData: any = {
        name,
        email,
        specialty,
        licenseNumber,
        education: education ? education.split(",").map((item) => item.trim()) : [],
        experience: experience ? Number.parseInt(experience, 10) : undefined,
        hospital,
        consultationFee: consultationFee ? Number.parseInt(consultationFee, 10) : undefined,
      }
      
      // Update profile
      await updateProfile(profileData)
      
      // Register in the app context
      if (user?.id && user?.walletAddress) {
        await registerDoctor({
          specialty,
          experience: experience ? Number.parseInt(experience, 10) : 0,
          hospital,
          consultationFee: consultationFee ? Number.parseInt(consultationFee, 10) : 100,
        })
      }
      
      setProfileSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess(false)
      }, 3000)
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter requests for this doctor
  const myRequests = patientRequests.filter(
    (request) => request.doctorId === user?.id || request.doctorWalletAddress === user?.walletAddress,
  )

  // Filter upcoming appointments for this doctor
  const myAppointments = appointments.filter(
    (appointment) => appointment.doctorId === user?.id && appointment.status === "scheduled",
  )

  const handleAcceptRequest = async (requestId: string) => {
    setSelectedRequest(requestId)
    setIsSubmitting(true)

    try {
      // Update the request status
      await updatePatientRequest(requestId, {
        status: "accepted",
        notes: responseNote || "Your request has been accepted. Please see the appointment details.",
      })

      // Get the request details
      const request = patientRequests.find((req) => req.id === requestId)
      if (request) {
        // Create an appointment
        await createAppointment({
          patientId: request.patientId,
          doctorId: user?.id || "",
          patientName: request.patientName,
          doctorName: user?.name || "Doctor",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
          time: "10:00",
          type: "video",
          status: "scheduled",
          symptoms: request.symptoms,
        })
      }

      // Reset form
      setResponseNote("")
      setSelectedRequest(null)
    } catch (error) {
      console.error("Error accepting request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    setSelectedRequest(requestId)
    setIsSubmitting(true)

    try {
      await updatePatientRequest(requestId, {
        status: "rejected",
        notes: responseNote || "Your request has been rejected. Please try another specialist.",
      })

      // Reset form
      setResponseNote("")
      setSelectedRequest(null)
    } catch (error) {
      console.error("Error rejecting request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="hidden">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="requests">Patient Requests</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-gray-500">Welcome back, Dr. {user?.name || "Doctor"}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {myRequests.filter((req) => req.status === "pending").length}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="flex items-center text-sm"
                  onClick={() => setActiveTab("requests")}
                >
                  View all requests
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {
                    myAppointments.filter((apt) => new Date(apt.date).toDateString() === new Date().toDateString())
                      .length
                  }
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="flex items-center text-sm"
                  onClick={() => setActiveTab("appointments")}
                >
                  View all appointments
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activePatients.length}</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="flex items-center text-sm">
                  View patient list
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Requests</CardTitle>
              <CardDescription>New consultation requests from patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myRequests.filter((req) => req.status === "pending").length > 0 ? (
                  myRequests
                    .filter((req) => req.status === "pending")
                    .slice(0, 3)
                    .map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{request.patientName}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(request.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                            Pending
                          </Badge>
                        </div>
                        <p className="text-sm mt-2 line-clamp-2">{request.symptoms}</p>
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No pending patient requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Your scheduled consultations for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myAppointments.filter((apt) => new Date(apt.date).toDateString() === new Date().toDateString())
                  .length > 0 ? (
                  myAppointments
                    .filter((apt) => new Date(apt.date).toDateString() === new Date().toDateString())
                    .map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{appointment.patientName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{appointment.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`
                            ${
                              appointment.type === "video"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "bg-green-50 text-green-600 border-green-200"
                            }
                          `}
                          >
                            {appointment.type === "video" ? "Video Call" : "In-person"}
                          </Badge>
                          {appointment.type === "video" && (
                            <Button size="sm" className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Requests</CardTitle>
              <CardDescription>Manage consultation requests from patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {myRequests.length > 0 ? (
                  myRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.patientName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{new Date(request.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          {request.status === "pending" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                              Pending
                            </Badge>
                          )}
                          {request.status === "accepted" && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Accepted
                            </Badge>
                          )}
                          {request.status === "rejected" && (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                              Rejected
                            </Badge>
                          )}
                          {request.status === "completed" && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-sm font-medium">Symptoms</h4>
                        <p className="text-sm text-gray-600 mt-1">{request.symptoms}</p>
                      </div>

                      {request.status === "pending" && (
                        <div className="mt-4">
                          <Textarea
                            placeholder="Add notes for the patient (optional)"
                            value={selectedRequest === request.id ? responseNote : ""}
                            onChange={(e) => {
                              if (selectedRequest === request.id) {
                                setResponseNote(e.target.value)
                              }
                            }}
                            onClick={() => setSelectedRequest(request.id)}
                            className="mb-3 text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={isSubmitting && selectedRequest === request.id}
                            >
                              {isSubmitting && selectedRequest === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Reject Request
                            </Button>
                            <Button
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={isSubmitting && selectedRequest === request.id}
                            >
                              {isSubmitting && selectedRequest === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              Accept Request
                            </Button>
                          </div>
                        </div>
                      )}

                      {request.status === "accepted" && (
                        <div className="mt-4">
                          <Button size="sm" className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Start Video Call
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-2 ml-2">
                            <MessageSquare className="h-4 w-4" />
                            Send Message
                          </Button>
                        </div>
                      )}

                      {request.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium">Your Notes</h4>
                          <p className="text-sm text-gray-600 mt-1">{request.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No patient requests yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
              <CardDescription>Manage your scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {myAppointments.length > 0 ? (
                  myAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.patientName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                          ${
                            appointment.type === "video"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-green-50 text-green-600 border-green-200"
                          }
                        `}
                        >
                          {appointment.type === "video" ? "Video Call" : "In-person"}
                        </Badge>
                      </div>

                      {appointment.symptoms && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium">Patient Symptoms</h4>
                          <p className="text-sm text-gray-600 mt-1">{appointment.symptoms}</p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        {appointment.type === "video" && (
                          <Button size="sm" className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Start Video Call
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Message Patient
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>No appointments scheduled</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Doctor Profile
              </CardTitle>
              <CardDescription>Update your professional information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
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
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Medical Specialty *</Label>
                      <Select value={specialty} onValueChange={setSpecialty} required>
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
                        required
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
                </div>

                {profileError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{profileError}</p>
                  </div>
                )}

                {profileSuccess && (
                  <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>Profile updated successfully!</p>
                  </div>
                )}

                <div>
                  <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
