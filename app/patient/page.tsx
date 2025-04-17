"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAppContext } from "@/lib/app-context"
import { useState } from "react"
import { toast, Toaster } from "sonner"
import { MessageLink } from "@/components/ui/message-link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HealthChatbot } from "@/components/ui/health-chatbot"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Video,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  Stethoscope,
  MessageSquare,
  FileUp,
  Brain,
  Shield,
  User,
  Loader2,
  CheckCircle,
  MapPin,
  Award,
  Building,
  GraduationCap,
  Mail,
  Phone
} from "lucide-react"

export default function PatientDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const { activeDoctors, appointments, patientRequests, createPatientRequest, cancelAppointment, updateAppointment } = useAppContext()
  const [requestingDoctor, setRequestingDoctor] = useState<string | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [showDoctorDetails, setShowDoctorDetails] = useState(false)

  // Filter upcoming appointments
  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status === "scheduled" && appointment.patientId === user?.id)
    .slice(0, 3)

  const handleStartCall = (appointment: any) => {
    // Generate a room ID based on the appointment ID
    const roomId = `telehealth-${appointment.id}-${Date.now()}`
    // Navigate to the video call page with the room ID
    router.push(`/video-call?room=${roomId}`)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    // Confirm before cancelling
    if (confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) {
      try {
        await cancelAppointment(appointmentId)
        alert("Appointment cancelled successfully")
      } catch (error) {
        console.error("Error cancelling appointment:", error)
        alert("Failed to cancel appointment. Please try again.")
      }
    }
  }

  const handleOpenRescheduleDialog = (appointment: any) => {
    setSelectedAppointment(appointment)
    setNewDate(appointment.date)
    setNewTime(appointment.time)
    setIsRescheduleDialogOpen(true)
  }

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !newDate || !newTime) return

    try {
      await updateAppointment(selectedAppointment.id, {
        date: newDate,
        time: newTime,
      })
      setIsRescheduleDialogOpen(false)
      alert("Appointment rescheduled successfully")
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      alert("Failed to reschedule appointment. Please try again.")
    }
  }

  // Handle direct consultation request
  const handleDirectRequest = async (doctorId: string) => {
    if (!user) return

    setRequestingDoctor(doctorId)

    try {
      // Find the doctor by ID
      const doctor = activeDoctors.find(doc => doc.id === doctorId)

      if (!doctor) {
        throw new Error("Doctor not found")
      }

      // Create a consultation request
      await createPatientRequest({
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        symptoms: "Direct consultation request",
        date: new Date().toISOString(),
        status: "pending",
        notes: "",
      })

      toast.success("Consultation request sent successfully!")

      // Redirect to appointments page after 1 second
      setTimeout(() => {
        router.push("/patient/appointments")
      }, 1000)

    } catch (error) {
      console.error("Error requesting consultation:", error)
      toast.error("Failed to submit consultation request. Please try again.")
    } finally {
      setRequestingDoctor(null)
    }
  }

  // Handle viewing doctor details
  const handleViewDoctorDetails = (doctor: any) => {
    setSelectedDoctor(doctor)
    setShowDoctorDetails(true)
  }

  return (
    <PatientLayout>
      {/* Health Chatbot */}
      <HealthChatbot />

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment with {selectedAppointment?.doctorName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRescheduleAppointment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name || "Patient"}</p>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push("/patient/symptom-analyzer")}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Symptom Analyzer</h3>
              <p className="text-gray-600">
                Describe your symptoms and our AI will match you with the right specialist
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Analyze Symptoms
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push("/patient/reports")}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Medical Reports</h3>
              <p className="text-gray-600">
                Securely store and share your medical reports using blockchain technology
              </p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700">
                Manage Reports
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push("/patient/appointments")}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Appointments</h3>
              <p className="text-gray-600">
                Schedule and manage your consultations with healthcare providers
              </p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                View Appointments
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push("/video-call")}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Video className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Consultation</h3>
              <p className="text-gray-600">
                Start or join a secure video call with your healthcare provider
              </p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700">
                Start Video Call
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const doctor = activeDoctors.find((d) => d.id === appointment.doctorId)
                return (
                  <Card key={appointment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{doctor?.name || appointment.doctorName}</CardTitle>
                          <CardDescription>{doctor?.specialty || "Specialist"}</CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${appointment.type === "video" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-green-50 text-green-600 border-green-200"}
                          `}
                        >
                          {appointment.type === "video" ? "Video Call" : "In-person"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{appointment.time}</span>
                        </div>
                        {appointment.type === "in-person" && doctor?.hospital && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{doctor.hospital}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        {appointment.type === "video" && (
                          <Button className="flex items-center gap-2" onClick={() => handleStartCall(appointment)}>
                            <Video className="h-4 w-4" />
                            Join Video Call
                          </Button>
                        )}
                        <MessageLink
                          href={`/patient/messages?doctorId=${appointment.doctorId}`}
                        />
                        <Button variant="outline" onClick={() => handleOpenRescheduleDialog(appointment)}>Reschedule</Button>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No upcoming appointments</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/patient/symptom-analyzer")}
              >
                Find a Doctor
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center"
            onClick={() => router.push("/patient/appointments")}
          >
            View all appointments
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Available Doctors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Available Doctors</CardTitle>
          <CardDescription>Specialists ready for consultation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDoctors.slice(0, 3).map((doctor) => (
              <Card key={doctor.id} className="border hover:border-primary hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {doctor.name?.charAt(0) || "D"}
                    </div>
                    <div>
                      <h3 className="font-medium">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {doctor.experience} yrs exp
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Nrs. {doctor.consultationFee}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Days: {doctor.availability?.join(", ") || "Not specified"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Hours: {doctor.availableTimes?.join(", ") || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDoctorDetails(doctor)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDirectRequest(doctor.id)}
                      disabled={requestingDoctor === doctor.id}
                    >
                      {requestingDoctor === doctor.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>Request</>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center"
            onClick={() => router.push("/patient/symptom-analyzer")}
          >
            Find more specialists
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      {/* Doctor Details Dialog */}
      <Dialog open={showDoctorDetails} onOpenChange={setShowDoctorDetails}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Doctor Profile
                </DialogTitle>
                <DialogDescription>
                  Detailed information about Dr. {selectedDoctor.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {selectedDoctor.name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDoctor.name}</h3>
                    <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Experience</p>
                      <p className="text-sm text-gray-500">{selectedDoctor.experience} years</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Hospital/Clinic</p>
                      <p className="text-sm text-gray-500">{selectedDoctor.hospital || "Not specified"}</p>
                    </div>
                  </div>

                  {selectedDoctor.education && (
                    <div className="flex items-start gap-2 col-span-2">
                      <GraduationCap className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Education</p>
                        <p className="text-sm text-gray-500">
                          {Array.isArray(selectedDoctor.education)
                            ? selectedDoctor.education.join(", ")
                            : selectedDoctor.education || "Not specified"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 mt-2">
                  <h4 className="text-sm font-medium mb-2">Consultation Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Available Days</p>
                        <p className="text-sm text-gray-500">{selectedDoctor.availability?.join(", ") || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Available Hours</p>
                        <p className="text-sm text-gray-500">{selectedDoctor.availableTimes?.join(", ") || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-gray-500">{selectedDoctor.location || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Video className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Consultation Fee</p>
                        <p className="text-sm text-gray-500 font-semibold">Nrs. {selectedDoctor.consultationFee}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDoctor.bio && (
                  <div className="border-t pt-3 mt-2">
                    <h4 className="text-sm font-medium mb-2">About</h4>
                    <p className="text-sm text-gray-500">{selectedDoctor.bio}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowDoctorDetails(false)
                    handleDirectRequest(selectedDoctor.id)
                  }}
                  className="w-full"
                >
                  Request Consultation
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PatientLayout>
  )
}
