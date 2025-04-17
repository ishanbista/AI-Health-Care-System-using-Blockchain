"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { FileText, Upload, Download, Search, Plus, Calendar, User, FileType } from "lucide-react"

export default function MedicalRecordsPage() {
  const { medicalRecords, professionals, uploadMedicalRecord } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [recordType, setRecordType] = useState("")
  const [recordTitle, setRecordTitle] = useState("")
  const [recordDescription, setRecordDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredRecords = medicalRecords.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await uploadMedicalRecord({
        type: recordType,
        title: recordTitle,
        description: recordDescription,
        attachments: selectedFile ? [selectedFile.name] : undefined,
      })

      // Reset form
      setRecordType("")
      setRecordTitle("")
      setRecordDescription("")
      setSelectedFile(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error uploading medical record:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-gray-500">View and manage your medical history</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add Medical Record</DialogTitle>
                    <DialogDescription>Upload a new medical record to your health profile.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="record-type">Record Type</Label>
                      <Select value={recordType} onValueChange={setRecordType} required>
                        <SelectTrigger id="record-type">
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Consultation">Consultation</SelectItem>
                          <SelectItem value="Test Results">Test Results</SelectItem>
                          <SelectItem value="Prescription">Prescription</SelectItem>
                          <SelectItem value="Imaging">Imaging</SelectItem>
                          <SelectItem value="Vaccination">Vaccination</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="record-title">Title</Label>
                      <Input
                        id="record-title"
                        value={recordTitle}
                        onChange={(e) => setRecordTitle(e.target.value)}
                        placeholder="Enter record title"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="record-description">Description</Label>
                      <Textarea
                        id="record-description"
                        value={recordDescription}
                        onChange={(e) => setRecordDescription(e.target.value)}
                        placeholder="Enter record description"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="record-file">Attachment (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                        <input
                          type="file"
                          id="record-file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <label htmlFor="record-file" className="cursor-pointer">
                          <Upload className="h-6 w-6 mx-auto text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                        </label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Uploading..." : "Upload Record"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search records..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{record.title}</CardTitle>
                      <CardDescription>{record.type}</CardDescription>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FileType className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{record.description}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>Dr. {professionals.find((p) => p.id === record.doctorId)?.name || "Unknown"}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No records found</h3>
              <p className="text-gray-500 mt-1">
                {searchTerm ? "No records match your search criteria" : "You haven't uploaded any medical records yet"}
              </p>
              {!searchTerm && (
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Upload Your First Record
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}
