"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/useAuth"

type News = {
  id: string
  title: string
  content: string
  image: string
  date: string
}

type Professional = {
  id: string
  name: string
  specialty: string
  experience: number
  hospital: string
  consultationFee: number
  availability: string[]
  availableTimes?: string[]
  rating: number
  image: string
  walletAddress?: string
}

type Appointment = {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  date: string
  time: string
  type: "video" | "in-person"
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  symptoms?: string
  diagnosis?: string
  prescription?: string
  followUp?: string
}

type HealthMetrics = {
  heartRate: { value: number; unit: string; trend: string; history: { date: string; value: number }[] }
  bloodPressure: { value: string; unit: string; trend: string; history: { date: string; value: string }[] }
  weight: { value: number; unit: string; trend: string; history: { date: string; value: number }[] }
  steps: { value: number; unit: string; trend: string; history: { date: string; value: number }[] }
}

type PatientRequest = {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  patientWalletAddress: string
  doctorWalletAddress: string
  date: string
  symptoms: string
  status: "pending" | "accepted" | "rejected" | "completed"
  attachments?: string[]
  notes?: string
}

type MedicalRecord = {
  id: string
  patientId: string
  doctorId: string
  date: string
  type: string
  title: string
  description: string
  attachments?: string[]
}

type Message = {
  id: string
  senderId: string
  receiverId: string
  senderWalletAddress: string
  receiverWalletAddress: string
  content: string
  timestamp: string
  read: boolean
}

type Message = {
  id: string
  senderId: string
  receiverId: string
  senderWalletAddress: string
  receiverWalletAddress: string
  content: string
  timestamp: string
  read: boolean
}

type AppContextType = {
  professionals: Professional[]
  appointments: Appointment[]
  healthMetrics: HealthMetrics | null
  patientRequests: PatientRequest[]
  medicalRecords: MedicalRecord[]
  messages: Message[]
  activeDoctors: Professional[]
  activePatients: { id: string; name: string; walletAddress: string }[]

  // Functions
  fetchProfessionals: () => Promise<void>
  fetchAppointments: () => Promise<void>
  fetchHealthMetrics: () => Promise<void>
  fetchPatientRequests: () => Promise<void>
  fetchMedicalRecords: () => Promise<void>
  fetchMessages: () => Promise<void>

  createAppointment: (appointment: Partial<Appointment>) => Promise<void>
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>
  cancelAppointment: (id: string) => Promise<void>

  createPatientRequest: (request: Partial<PatientRequest>) => Promise<void>
  updatePatientRequest: (id: string, data: Partial<PatientRequest>) => Promise<void>

  analyzeSymptoms: (symptoms: string) => Promise<{ doctorId: string; specialty: string; confidence: number }>

  uploadMedicalRecord: (record: Partial<MedicalRecord>) => Promise<void>

  sendMessage: (message: Partial<Message>) => Promise<void>
  markMessageAsRead: (id: string) => Promise<void>

  registerDoctor: (doctorData: Partial<Professional>) => Promise<void>
  registerPatient: (patientData: { id: string; name: string; walletAddress: string }) => Promise<void>

  updateHealthMetrics: (data: {
    weight?: number;
    height?: number;
    bloodPressure?: string;
  }) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Mock health metrics data
const mockHealthMetrics: HealthMetrics = {
  heartRate: {
    value: 72,
    unit: "bpm",
    trend: "stable",
    history: [
      { date: "2023-05-01", value: 70 },
      { date: "2023-05-08", value: 72 },
      { date: "2023-05-15", value: 71 },
      { date: "2023-05-22", value: 73 },
      { date: "2023-05-29", value: 72 },
    ],
  },
  bloodPressure: {
    value: "120/80",
    unit: "mmHg",
    trend: "improving",
    history: [
      { date: "2023-05-01", value: "125/85" },
      { date: "2023-05-08", value: "122/82" },
      { date: "2023-05-15", value: "121/81" },
      { date: "2023-05-22", value: "120/80" },
      { date: "2023-05-29", value: "118/78" },
    ],
  },
  weight: {
    value: 68,
    unit: "kg",
    trend: "stable",
    history: [
      { date: "2023-05-01", value: 68.5 },
      { date: "2023-05-08", value: 68.2 },
      { date: "2023-05-15", value: 68.0 },
      { date: "2023-05-22", value: 67.8 },
      { date: "2023-05-29", value: 68.0 },
    ],
  },
  steps: {
    value: 8500,
    unit: "steps",
    trend: "increasing",
    history: [
      { date: "2023-05-01", value: 7200 },
      { date: "2023-05-08", value: 7800 },
      { date: "2023-05-15", value: 8100 },
      { date: "2023-05-22", value: 8300 },
      { date: "2023-05-29", value: 8500 },
    ],
  },
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeDoctors, setActiveDoctors] = useState<Professional[]>([])
  const [activePatients, setActivePatients] = useState<{ id: string; name: string; walletAddress: string }[]>([])

  // Initialize with stored data
  useEffect(() => {
    if (user) {
      fetchProfessionals()
      fetchAppointments()
      fetchHealthMetrics()
      fetchPatientRequests()
      fetchMedicalRecords()
      fetchMessages()
    }
  }, [user])

  const fetchProfessionals = async () => {
    // Get professionals from localStorage
    const storedProfessionals = localStorage.getItem("telehealth_professionals")
    if (storedProfessionals) {
      setProfessionals(JSON.parse(storedProfessionals))
    }
  }

  const fetchAppointments = async () => {
    // Get appointments from localStorage
    const storedAppointments = localStorage.getItem("telehealth_appointments")
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments))
    }
  }

  const fetchHealthMetrics = async () => {
    // In a real app, this would be an API call
    setHealthMetrics(mockHealthMetrics)
  }

  const fetchPatientRequests = async () => {
    // Get patient requests from localStorage
    const storedRequests = localStorage.getItem("telehealth_patient_requests")
    if (storedRequests) {
      setPatientRequests(JSON.parse(storedRequests))
    }
  }

  const fetchMedicalRecords = async () => {
    // Get medical records from localStorage
    const storedRecords = localStorage.getItem("telehealth_medical_records")
    if (storedRecords) {
      setMedicalRecords(JSON.parse(storedRecords))
    }
  }

  const fetchMessages = async () => {
    // Get messages from localStorage
    const storedMessages = localStorage.getItem("telehealth_messages")
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }
  }

  // Get active doctors and patients
  useEffect(() => {
    // Get all users from localStorage
    const allUsers = localStorage.getItem("telehealth_users")
    if (allUsers) {
      const usersByWallet = JSON.parse(allUsers)

      // Filter doctors and patients
      const doctors: Professional[] = []
      const patients: { id: string; name: string; walletAddress: string }[] = []

      Object.entries(usersByWallet).forEach(([walletAddress, userData]: [string, any]) => {
        if (userData.role === "doctor" && userData.profileCompleted) {
          // Find if this doctor is already in our professionals list
          const existingDoctor = professionals.find((p) => p.walletAddress === walletAddress)

          if (existingDoctor) {
            doctors.push(existingDoctor)
          } else {
            // Create a new doctor entry
            doctors.push({
              id: userData.id,
              name: userData.name || "Doctor",
              specialty: userData.specialty || "General",
              experience: userData.experience || 0,
              hospital: userData.hospital || "Unknown",
              consultationFee: userData.consultationFee || 100,
              availability: userData.availability || ["Monday", "Wednesday", "Friday"],
              availableTimes: userData.availableTimes || ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"],
              rating: 4.5,
              image: "/placeholder.svg?height=200&width=200",
              walletAddress: walletAddress,
            })
          }
        } else if (userData.role === "patient" && userData.profileCompleted) {
          patients.push({
            id: userData.id,
            name: userData.name || "Patient",
            walletAddress: walletAddress,
          })
        }
      })

      setActiveDoctors(doctors)
      setActivePatients(patients)
    }
  }, [professionals])

  const createAppointment = async (appointment: Partial<Appointment>) => {
    if (!user) return

    const newAppointment: Appointment = {
      id: `apt${Date.now()}`,
      patientId: user.id,
      doctorId: appointment.doctorId || "",
      patientName: user.name || "Patient",
      doctorName: professionals.find((p) => p.id === appointment.doctorId)?.name || "Doctor",
      date: appointment.date || new Date().toISOString().split("T")[0],
      time: appointment.time || "12:00",
      type: appointment.type || "video",
      status: "scheduled",
      ...appointment,
    }

    const updatedAppointments = [...appointments, newAppointment]
    setAppointments(updatedAppointments)
    localStorage.setItem("telehealth_appointments", JSON.stringify(updatedAppointments))
  }

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const updatedAppointments = appointments.map((apt) => (apt.id === id ? { ...apt, ...data } : apt))
    setAppointments(updatedAppointments)
    localStorage.setItem("telehealth_appointments", JSON.stringify(updatedAppointments))
  }

  const cancelAppointment = async (id: string) => {
    const updatedAppointments = appointments.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt))
    setAppointments(updatedAppointments)
    localStorage.setItem("telehealth_appointments", JSON.stringify(updatedAppointments))
  }

  const createPatientRequest = async (request: Partial<PatientRequest>) => {
    if (!user) return

    // Find the doctor by ID
    const doctor = activeDoctors.find((d) => d.id === request.doctorId)
    if (!doctor) return

    const newRequest: PatientRequest = {
      id: `req${Date.now()}`,
      patientId: user.id,
      doctorId: request.doctorId || "",
      patientName: user.name || "Patient",
      doctorName: doctor.name,
      patientWalletAddress: user.walletAddress || "",
      doctorWalletAddress: doctor.walletAddress || "",
      date: new Date().toISOString().split("T")[0],
      symptoms: request.symptoms || "",
      status: "pending",
      ...request,
    }

    const updatedRequests = [...patientRequests, newRequest]
    setPatientRequests(updatedRequests)
    localStorage.setItem("telehealth_patient_requests", JSON.stringify(updatedRequests))
  }

  const updatePatientRequest = async (id: string, data: Partial<PatientRequest>) => {
    const updatedRequests = patientRequests.map((req) => (req.id === id ? { ...req, ...data } : req))
    setPatientRequests(updatedRequests)
    localStorage.setItem("telehealth_patient_requests", JSON.stringify(updatedRequests))
  }

  const updateHealthMetrics = async (data: { weight?: number; height?: number; bloodPressure?: string }) => {
    if (!healthMetrics) return

    // Create a copy of the current health metrics
    const updatedHealthMetrics = { ...healthMetrics }

    // Update weight if provided
    if (data.weight !== undefined) {
      // Determine trend based on previous value
      const previousWeight = updatedHealthMetrics.weight.value
      const trend = data.weight > previousWeight ? "increasing" :
                   data.weight < previousWeight ? "decreasing" : "stable"

      // Update current value
      updatedHealthMetrics.weight.value = data.weight
      updatedHealthMetrics.weight.trend = trend

      // Add to history
      const today = new Date().toISOString().split('T')[0]
      updatedHealthMetrics.weight.history.push({
        date: today,
        value: data.weight
      })

      // Keep only the last 5 entries
      if (updatedHealthMetrics.weight.history.length > 5) {
        updatedHealthMetrics.weight.history = updatedHealthMetrics.weight.history.slice(-5)
      }
    }

    // Update blood pressure if provided
    if (data.bloodPressure) {
      // Determine trend based on previous systolic value
      const previousBP = updatedHealthMetrics.bloodPressure.value
      const previousSystolic = parseInt(previousBP.split('/')[0])
      const currentSystolic = parseInt(data.bloodPressure.split('/')[0])

      const trend = currentSystolic < previousSystolic ? "improving" :
                   currentSystolic > previousSystolic ? "worsening" : "stable"

      // Update current value
      updatedHealthMetrics.bloodPressure.value = data.bloodPressure
      updatedHealthMetrics.bloodPressure.trend = trend

      // Add to history
      const today = new Date().toISOString().split('T')[0]
      updatedHealthMetrics.bloodPressure.history.push({
        date: today,
        value: data.bloodPressure
      })

      // Keep only the last 5 entries
      if (updatedHealthMetrics.bloodPressure.history.length > 5) {
        updatedHealthMetrics.bloodPressure.history = updatedHealthMetrics.bloodPressure.history.slice(-5)
      }
    }

    // Update the state
    setHealthMetrics(updatedHealthMetrics)
  }

  const analyzeSymptoms = async (symptoms: string) => {
    // Only recommend active doctors who have logged in
    if (activeDoctors.length === 0) {
      throw new Error("No doctors are currently available in the system")
    }

    // In a real app, this would call an AI service
    // For demo purposes, we'll use a more comprehensive keyword matching system

    // Define medical specialties and their related symptoms/conditions
    const specialtyKeywords = {
      "Neurology": [
        "headache", "migraine", "dizziness", "vertigo", "seizure", "epilepsy", "tremor",
        "numbness", "tingling", "memory loss", "confusion", "stroke", "head pain", "head ache",
        "brain", "nerve pain", "multiple sclerosis", "parkinson", "alzheimer", "concussion"
      ],
      "Cardiology": [
        "chest pain", "chest tightness", "heart", "palpitations", "shortness of breath",
        "high blood pressure", "hypertension", "heart attack", "heart failure", "arrhythmia",
        "irregular heartbeat", "murmur", "angina", "cardiovascular", "cholesterol"
      ],
      "Gastroenterology": [
        "stomach", "abdominal", "nausea", "vomiting", "digestive", "diarrhea", "constipation",
        "heartburn", "acid reflux", "ulcer", "gallbladder", "liver", "hepatitis", "jaundice",
        "irritable bowel", "crohn", "colitis", "appendicitis", "bloating", "gas"
      ],
      "Orthopedics": [
        "joint", "arthritis", "knee", "elbow", "shoulder pain", "back pain", "neck pain",
        "fracture", "broken bone", "sprain", "strain", "osteoporosis", "tendonitis",
        "carpal tunnel", "sciatica", "scoliosis", "hip", "ankle", "bone", "muscle pain"
      ],
      "Dermatology": [
        "skin", "rash", "itching", "dermatitis", "eczema", "psoriasis", "acne", "mole",
        "wart", "hives", "sunburn", "skin cancer", "melanoma", "fungal infection",
        "hair loss", "dandruff", "skin discoloration", "dry skin", "blisters"
      ],
      "Psychiatry": [
        "anxiety", "depression", "stress", "mental health", "panic attack", "phobia",
        "bipolar", "schizophrenia", "insomnia", "sleep disorder", "addiction", "substance abuse",
        "eating disorder", "ADHD", "autism", "OCD", "PTSD", "mood swings", "suicidal thoughts"
      ],
      "Ophthalmology": [
        "eye", "vision", "blurry vision", "blindness", "cataract", "glaucoma", "conjunctivitis",
        "pink eye", "dry eyes", "macular degeneration", "retina", "cornea", "eye pain",
        "double vision", "floaters", "eye infection", "eye strain", "light sensitivity"
      ],
      "ENT": [
        "ear", "nose", "throat", "hearing loss", "tinnitus", "ear infection", "sinusitis",
        "sinus", "nasal congestion", "runny nose", "sore throat", "tonsillitis", "vertigo",
        "snoring", "sleep apnea", "hoarseness", "voice problem", "swallowing difficulty"
      ],
      "Urology": [
        "urinary", "bladder", "kidney", "prostate", "urination", "frequent urination",
        "painful urination", "incontinence", "kidney stone", "urinary tract infection", "UTI",
        "erectile dysfunction", "testicular pain", "blood in urine", "overactive bladder"
      ],
      "Gynecology": [
        "menstrual", "period", "pregnancy", "vaginal", "ovarian", "uterine", "cervical",
        "pap smear", "menopause", "fertility", "contraception", "pelvic pain", "endometriosis",
        "fibroids", "yeast infection", "STD", "STI", "breast pain", "breast lump"
      ],
      "Endocrinology": [
        "diabetes", "thyroid", "hormone", "adrenal", "pituitary", "metabolism", "weight gain",
        "weight loss", "fatigue", "excessive thirst", "excessive hunger", "hyperthyroidism",
        "hypothyroidism", "insulin", "blood sugar", "glucose", "cushing", "addison"
      ],
      "Pulmonology": [
        "lung", "breathing", "respiratory", "asthma", "COPD", "emphysema", "bronchitis",
        "pneumonia", "tuberculosis", "pulmonary fibrosis", "cystic fibrosis", "shortness of breath",
        "wheezing", "cough", "sleep apnea", "lung cancer", "pulmonary embolism"
      ],
      "General": [
        "fever", "flu", "cold", "cough", "fatigue", "weakness", "pain", "infection",
        "vaccination", "check-up", "physical exam", "preventive care", "general health",
        "wellness", "nutrition", "diet", "exercise", "lifestyle", "weight management"
      ]
    }

    // Initialize score for each specialty
    const scores: Record<string, number> = {}
    Object.keys(specialtyKeywords).forEach(specialty => {
      scores[specialty] = 0
    })

    // Convert symptoms to lowercase for case-insensitive matching
    const symptomsLower = symptoms.toLowerCase()

    // Calculate scores for each specialty based on keyword matches
    Object.entries(specialtyKeywords).forEach(([specialty, keywords]) => {
      keywords.forEach(keyword => {
        if (symptomsLower.includes(keyword.toLowerCase())) {
          // Add weight based on the specificity of the keyword
          // Longer keywords are more specific and get higher weight
          const weight = Math.max(1, keyword.length / 5)
          scores[specialty] += weight
        }
      })
    })

    // Find the specialty with the highest score
    let bestSpecialty = "General" // Default to General if no matches
    let highestScore = 0

    Object.entries(scores).forEach(([specialty, score]) => {
      if (score > highestScore) {
        highestScore = score
        bestSpecialty = specialty
      }
    })

    // If no significant matches found, default to General
    if (highestScore < 1) {
      bestSpecialty = "General"
    }

    // Find doctors matching the best specialty
    const matchingDoctors = activeDoctors.filter(
      doctor => doctor.specialty.toLowerCase() === bestSpecialty.toLowerCase()
    )

    // If no matching doctors for the best specialty, try to find doctors in related specialties
    let recommendedDoctors = matchingDoctors

    if (recommendedDoctors.length === 0) {
      // If no exact specialty match, look for General practitioners
      recommendedDoctors = activeDoctors.filter(
        doctor => doctor.specialty.toLowerCase() === "general"
      )

      // If still no matches, just return all available doctors
      if (recommendedDoctors.length === 0) {
        recommendedDoctors = activeDoctors
      }
    }

    // Sort recommended doctors by experience and rating (if we had that data)
    recommendedDoctors.sort((a, b) => b.experience - a.experience)

    // Calculate confidence (0-1) based on the score and number of symptoms
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    const confidence = totalScore > 0 ? highestScore / totalScore : 0.5

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      doctorId: recommendedDoctors.length > 0 ? recommendedDoctors[0].id : null,
      specialty: bestSpecialty,
      confidence: Math.min(0.95, Math.max(0.6, confidence)), // Clamp between 0.6 and 0.95
      allDoctors: recommendedDoctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        hospital: doctor.hospital,
        rating: doctor.rating || 4.5,
      })),
      noMatchingDoctors: recommendedDoctors.length === 0
    }
  }

  const uploadMedicalRecord = async (record: Partial<MedicalRecord>) => {
    if (!user) return

    const newRecord: MedicalRecord = {
      id: `rec${Date.now()}`,
      patientId: user.id,
      doctorId: record.doctorId || "",
      date: new Date().toISOString().split("T")[0],
      type: record.type || "Document",
      title: record.title || "Medical Record",
      description: record.description || "",
      ...record,
    }

    const updatedRecords = [...medicalRecords, newRecord]
    setMedicalRecords(updatedRecords)
    localStorage.setItem("telehealth_medical_records", JSON.stringify(updatedRecords))
  }

  const sendMessage = async (message: Partial<Message>) => {
    if (!user) return

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: user.id,
      receiverId: message.receiverId || "",
      senderWalletAddress: user.walletAddress || "",
      receiverWalletAddress: message.receiverWalletAddress || "",
      content: message.content || "",
      timestamp: new Date().toISOString(),
      read: false,
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem("telehealth_messages", JSON.stringify(updatedMessages))
  }

  const markMessageAsRead = async (id: string) => {
    const updatedMessages = messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    setMessages(updatedMessages)
    localStorage.setItem("telehealth_messages", JSON.stringify(updatedMessages))
  }

  const registerDoctor = async (doctorData: Partial<Professional>) => {
    if (!user || !user.walletAddress) return

    const newDoctor: Professional = {
      id: user.id,
      name: user.name || "Doctor",
      specialty: doctorData.specialty || "General",
      experience: doctorData.experience || 0,
      hospital: doctorData.hospital || "Unknown",
      consultationFee: doctorData.consultationFee || 100,
      availability: doctorData.availability || ["Monday", "Wednesday", "Friday"],
      availableTimes: doctorData.availableTimes || ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"],
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=200",
      walletAddress: user.walletAddress,
    }

    const updatedProfessionals = [...professionals, newDoctor]
    setProfessionals(updatedProfessionals)
    localStorage.setItem("telehealth_professionals", JSON.stringify(updatedProfessionals))
  }

  const registerPatient = async (patientData: { id: string; name: string; walletAddress: string }) => {
    // This function is mainly for tracking active patients
    // The actual patient data is stored in the auth context
    const existingPatient = activePatients.find((p) => p.walletAddress === patientData.walletAddress)
    if (!existingPatient) {
      const updatedPatients = [...activePatients, patientData]
      setActivePatients(updatedPatients)
    }
  }



  return (
    <AppContext.Provider
      value={{
        professionals,
        appointments,
        healthMetrics,
        patientRequests,
        medicalRecords,
        messages,
        activeDoctors,
        activePatients,
        fetchProfessionals,
        fetchAppointments,
        fetchHealthMetrics,
        fetchPatientRequests,
        fetchMedicalRecords,
        fetchMessages,
        createAppointment,
        updateAppointment,
        cancelAppointment,
        createPatientRequest,
        updatePatientRequest,
        analyzeSymptoms,
        uploadMedicalRecord,
        sendMessage,
        markMessageAsRead,
        registerDoctor,
        registerPatient,
        updateHealthMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
