"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageLink } from "@/components/ui/message-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { useAppContext } from "@/lib/app-context"
import { Video, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AppointmentsPage() {
  const router = useRouter()
  const { appointments, professionals, cancelAppointment, updateAppointment } = useAppContext()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")

  // Filter appointments
  const upcomingAppointments = appointments.filter((appointment) => appointment.status === "scheduled")
  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "completed" || appointment.status === "cancelled",
  )

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

  return (
    <PatientLayout>
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

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-gray-500">Manage your scheduled consultations</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>Book a consultation with a healthcare professional.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <h3 className="font-medium">Select a Doctor</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {professionals.map((doctor) => (
                        <div
                          key={doctor.id}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                            {doctor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-xs text-gray-500">{doctor.specialty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit">Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => {
                const doctor = professionals.find((p) => p.id === appointment.doctorId)
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
                        {appointment.type === "in-person" && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{doctor?.hospital || "Medical Center"}</span>
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
              })
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">No upcoming appointments</h3>
                <p className="text-gray-500 mt-1">Schedule a consultation with a doctor</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">Schedule Appointment</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">{/* Same content as above */}</DialogContent>
                </Dialog>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => {
                const doctor = professionals.find((p) => p.id === appointment.doctorId)
                return (
                  <Card key={appointment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{doctor?.name || appointment.doctorName}</CardTitle>
                          <CardDescription>{doctor?.specialty || "Specialist"}</CardDescription>
                        </div>
                        <div className="flex items-center">
                          {appointment.status === "completed" ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Completed</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <XCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Cancelled</span>
                            </div>
                          )}
                        </div>
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
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium">Doctor's Notes</h4>
                          <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="mt-4">
                        <Button variant="outline" className="w-full">
                          Book Follow-up
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">No past appointments</h3>
                <p className="text-gray-500 mt-1">Your appointment history will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  )
}
