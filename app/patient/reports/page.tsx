"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAppContext } from "@/lib/app-context"
import { ethers } from "ethers"
import {
  Upload,
  FileText,
  File,
  FilePlus,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Share2,
  Lock,
  User,
} from "lucide-react"

// Mock medical reports data
const mockReports = [
  {
    id: "report1",
    name: "Blood Test Results",
    date: "2023-05-15",
    type: "Lab Results",
    doctor: "Dr. Sarah Johnson",
    hospital: "City General Hospital",
    fileSize: "2.4 MB",
    fileType: "PDF",
    blockchainHash: "0x7f9e8d7c6b5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d",
    sharedWith: ["Dr. Sarah Johnson"],
  },
  {
    id: "report2",
    name: "Chest X-Ray",
    date: "2023-04-22",
    type: "Radiology",
    doctor: "Dr. Michael Chen",
    hospital: "Medical Imaging Center",
    fileSize: "8.7 MB",
    fileType: "DICOM",
    blockchainHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    sharedWith: [],
  },
  {
    id: "report3",
    name: "Annual Physical Examination",
    date: "2023-03-10",
    type: "Examination",
    doctor: "Dr. Emily Rodriguez",
    hospital: "Community Health Clinic",
    fileSize: "1.2 MB",
    fileType: "PDF",
    blockchainHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    sharedWith: ["Dr. Emily Rodriguez", "Dr. Sarah Johnson"],
  },
]

// Mock doctors for sharing
const mockDoctors = [
  { id: "doc1", name: "Dr. Sarah Johnson", specialty: "Cardiology" },
  { id: "doc2", name: "Dr. Michael Chen", specialty: "Dermatology" },
  { id: "doc3", name: "Dr. Emily Rodriguez", specialty: "Neurology" },
  { id: "doc4", name: "Dr. David Wilson", specialty: "Orthopedics" },
]

export default function MedicalReportsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { activeDoctors } = useAppContext()

  const [reports, setReports] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [reportName, setReportName] = useState("")
  const [reportType, setReportType] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [sharingReport, setSharingReport] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [shareError, setShareError] = useState("")

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Handle report upload with blockchain integration
  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !reportName || !reportType) {
      setUploadError("Please fill in all required fields and select a file")
      return
    }

    setIsUploading(true)
    setUploadError("")

    try {
      // Simulate blockchain upload
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate a mock blockchain hash
      const mockHash = "0x" + Array.from({length: 40}, () =>
        Math.floor(Math.random() * 16).toString(16)).join('')

      // Add the new report to the list
      const newReport = {
        id: `report${reports.length + 1}`,
        name: reportName,
        date: new Date().toISOString().split('T')[0],
        type: reportType,
        doctor: "Self Upload",
        hospital: "N/A",
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        fileType: selectedFile.name.split('.').pop()?.toUpperCase() || "Unknown",
        blockchainHash: mockHash,
        sharedWith: [],
      }

      setReports([newReport, ...reports])
      setUploadSuccess(true)

      // Reset form
      setSelectedFile(null)
      setReportName("")
      setReportType("")
      setReportDescription("")

      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)

    } catch (error) {
      console.error("Error uploading report:", error)
      setUploadError("Failed to upload report. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle sharing a report with a doctor
  const handleShareReport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDoctor || !sharingReport) {
      setShareError("Please select a doctor to share with")
      return
    }

    setIsSharing(true)
    setShareError("")

    try {
      // Simulate blockchain transaction for sharing
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Update the report's sharedWith list
      setReports(reports.map(report => {
        if (report.id === sharingReport) {
          const doctorName = mockDoctors.find(d => d.id === selectedDoctor)?.name || ""
          if (!report.sharedWith.includes(doctorName)) {
            return {
              ...report,
              sharedWith: [...report.sharedWith, doctorName]
            }
          }
        }
        return report
      }))

      setShareSuccess(true)

      // Reset form
      setSharingReport(null)
      setSelectedDoctor("")

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShareSuccess(false)
      }, 3000)

    } catch (error) {
      console.error("Error sharing report:", error)
      setShareError("Failed to share report. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  // Handle downloading a report
  const handleDownloadReport = (reportId: string) => {
    // In a real app, this would download the actual file
    alert(`Downloading report ${reportId}`)
  }

  // Handle deleting a report
  const handleDeleteReport = (reportId: string) => {
    // Confirm before deleting
    if (confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      // Filter out the report with the given ID
      const updatedReports = reports.filter(report => report.id !== reportId)
      setReports(updatedReports)

      // Show success message
      alert("Report deleted successfully")
    }
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Medical Reports</h1>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your Blockchain-Secured Medical Reports
            </CardTitle>
            <CardDescription>
              All your medical reports are securely encrypted and stored on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-5">
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 hover:border-primary hover:shadow-sm transition-all rounded-lg p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {report.fileType === "PDF" ? (
                            <FileText className="h-6 w-6 text-primary" />
                          ) : report.fileType === "DICOM" ? (
                            <File className="h-6 w-6 text-primary" />
                          ) : (
                            <FileText className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{report.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-sm text-gray-500">{report.date}</span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{report.type}</span>
                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">{report.fileType}</span>
                            <span className="text-xs text-gray-500">{report.fileSize}</span>
                          </div>
                          {report.sharedWith.length > 0 && (
                            <div className="mt-3">
                              <span className="text-xs font-medium text-gray-600">Shared with: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {report.sharedWith.map((doctor, index) => (
                                  <span key={index} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {doctor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report.id)} className="border-gray-200 hover:border-primary hover:bg-primary/5">
                          <Download className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSharingReport(report.id)}
                          className="border-gray-200 hover:border-primary hover:bg-primary/5"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          className="border-gray-200 hover:border-red-500 hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center text-xs">
                        <div className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                          <Lock className="h-3 w-3 mr-1.5" />
                          <span className="font-medium">Blockchain Verified</span>
                        </div>
                        <div className="ml-3">
                          <span className="text-gray-500">Hash: </span>
                          <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{report.blockchainHash.substring(0, 10)}...{report.blockchainHash.substring(report.blockchainHash.length - 8)}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700">No reports yet</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">Use the form below to upload your medical reports and securely store them on the blockchain</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Report Modal */}
        {sharingReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Share Medical Report</h3>
                  <p className="text-sm text-gray-500">
                    Securely share via blockchain smart contract
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-5 border border-blue-100">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Report:</span> "{reports.find(r => r.id === sharingReport)?.name}"
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Sharing this report will grant secure access through blockchain smart contracts. The doctor will receive a secure access key, but your data remains encrypted and under your control.
                </p>
              </div>

              <form onSubmit={handleShareReport}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="doctor" className="font-medium">Select Healthcare Provider</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} ({doctor.specialty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {shareError && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center border border-red-100">
                      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                      <p className="text-sm font-medium">{shareError}</p>
                    </div>
                  )}

                  {shareSuccess && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-center border border-green-100">
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Report shared successfully!</p>
                        <p className="text-xs mt-1">The blockchain transaction has been completed and the doctor now has secure access to your report.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSharingReport(null)}
                      disabled={isSharing}
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSharing || !selectedDoctor}
                      className="gap-2"
                    >
                      {isSharing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing on Blockchain...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          Securely Share
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <Card id="upload-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Upload Medical Report to Blockchain
            </CardTitle>
            <CardDescription>
              Your medical reports are securely encrypted and stored on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadReport} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName" className="font-medium">Report Name *</Label>
                  <Input
                    id="reportName"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="e.g., Blood Test Results"
                    className="border-gray-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportType" className="font-medium">Report Type *</Label>
                  <Select value={reportType} onValueChange={setReportType} required>
                    <SelectTrigger id="reportType" className="border-gray-300">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lab Results">Lab Results</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Examination">Examination</SelectItem>
                      <SelectItem value="Prescription">Prescription</SelectItem>
                      <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                      <SelectItem value="Vaccination">Vaccination Record</SelectItem>
                      <SelectItem value="Surgery">Surgical Report</SelectItem>
                      <SelectItem value="Mental Health">Mental Health Assessment</SelectItem>
                      <SelectItem value="Allergy">Allergy Test</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDescription" className="font-medium">Description (Optional)</Label>
                <Textarea
                  id="reportDescription"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Add any additional details about this report"
                  className="border-gray-300"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="font-medium">Upload File *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.dicom"
                  />
                  <label htmlFor="file" className="cursor-pointer block w-full h-full">
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <File className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-base font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={(e) => {
                            e.preventDefault()
                            setSelectedFile(null)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-base font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF, JPG, PNG, DOC, DOCX, DICOM (Max 20MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Blockchain Security
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <Lock className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">End-to-End Encryption</p>
                      <p className="text-sm text-blue-600">
                        Your medical reports are encrypted before being stored on the blockchain, ensuring only you and those you authorize can access them.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <FileText className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Immutable Records</p>
                      <p className="text-sm text-blue-600">
                        Once stored on the blockchain, your medical records cannot be altered or tampered with, providing a verifiable history of your health data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Controlled Access</p>
                      <p className="text-sm text-blue-600">
                        You maintain complete control over who can access your medical records through secure smart contracts on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {uploadError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center border border-red-100">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p className="text-sm font-medium">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-green-50 text-green-600 p-4 rounded-md flex items-center border border-green-100">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Report uploaded successfully to the blockchain!</p>
                    <p className="text-xs mt-1">Your medical report has been securely encrypted and stored. You can now share it with healthcare providers as needed.</p>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full py-6 text-base"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Encrypting and Uploading to Blockchain...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Securely Upload to Blockchain
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}
