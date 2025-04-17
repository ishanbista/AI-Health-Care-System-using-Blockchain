"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAppContext } from "@/lib/app-context"
import { HealthRecommendations } from "@/components/health-recommendations"
import {
  Brain,
  Stethoscope,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle,
  ChevronRight,
  Star,
  Calendar,
  MessageSquare,
  Video,
  ArrowRight,
  User,
  Clock,
  Salad,
  Dumbbell,
} from "lucide-react"

// Define comprehensive symptom categories and common symptoms with related specialties
const symptomCategories = [
  {
    id: "head",
    name: "Head & Neurological",
    symptoms: [
      "Headache", "Migraine", "Dizziness", "Vertigo", "Blurred vision",
      "Memory problems", "Confusion", "Seizures", "Tremors", "Numbness",
      "Tingling", "Difficulty speaking", "Balance problems", "Fainting"
    ],
    specialties: ["Neurology", "General"],
    description: "Issues related to the brain, nerves, and neurological functions"
  },
  {
    id: "eyes",
    name: "Eye & Vision",
    symptoms: [
      "Blurred vision", "Eye pain", "Redness in eyes", "Dry eyes", "Excessive tearing",
      "Sensitivity to light", "Floaters", "Double vision", "Vision loss", "Eye discharge"
    ],
    specialties: ["Ophthalmology", "General"],
    description: "Problems with eyes and vision"
  },
  {
    id: "ears",
    name: "Ear, Nose & Throat",
    symptoms: [
      "Ear pain", "Hearing loss", "Ringing in ears", "Sore throat", "Hoarseness",
      "Difficulty swallowing", "Nasal congestion", "Runny nose", "Sinus pressure", "Snoring"
    ],
    specialties: ["ENT", "General"],
    description: "Issues related to ears, nose, throat, and related structures"
  },
  {
    id: "chest",
    name: "Chest & Cardiovascular",
    symptoms: [
      "Chest pain", "Palpitations", "Shortness of breath", "Rapid heartbeat", "Irregular heartbeat",
      "High blood pressure", "Swelling in legs", "Dizziness when standing", "Fatigue", "Chest pressure"
    ],
    specialties: ["Cardiology", "General"],
    description: "Heart and blood vessel related issues"
  },
  {
    id: "respiratory",
    name: "Respiratory & Lungs",
    symptoms: [
      "Cough", "Wheezing", "Shortness of breath", "Chest congestion", "Coughing up blood",
      "Rapid breathing", "Difficulty breathing", "Chest tightness", "Excessive mucus", "Sneezing"
    ],
    specialties: ["Pulmonology", "General"],
    description: "Problems related to the lungs and breathing"
  },
  {
    id: "abdomen",
    name: "Abdomen & Digestive",
    symptoms: [
      "Abdominal pain", "Nausea", "Vomiting", "Diarrhea", "Constipation",
      "Bloating", "Heartburn", "Blood in stool", "Jaundice", "Loss of appetite",
      "Difficulty swallowing", "Excessive gas", "Stomach cramps"
    ],
    specialties: ["Gastroenterology", "General"],
    description: "Issues related to the digestive system including stomach and intestines"
  },
  {
    id: "urinary",
    name: "Urinary & Kidney",
    symptoms: [
      "Painful urination", "Frequent urination", "Blood in urine", "Urinary incontinence",
      "Difficulty urinating", "Lower back pain", "Cloudy urine", "Strong-smelling urine", "Kidney pain"
    ],
    specialties: ["Urology", "Nephrology", "General"],
    description: "Problems with the urinary tract and kidneys"
  },
  {
    id: "reproductive_male",
    name: "Male Reproductive",
    symptoms: [
      "Testicular pain", "Erectile dysfunction", "Penile discharge", "Prostate problems",
      "Genital rash", "Genital swelling", "Low libido", "Infertility concerns"
    ],
    specialties: ["Urology", "General"],
    description: "Issues related to male reproductive health"
  },
  {
    id: "reproductive_female",
    name: "Female Reproductive",
    symptoms: [
      "Menstrual irregularities", "Pelvic pain", "Vaginal discharge", "Breast pain",
      "Breast lumps", "Hot flashes", "Painful intercourse", "Infertility concerns",
      "Pregnancy symptoms", "Menopause symptoms"
    ],
    specialties: ["Gynecology", "Obstetrics", "General"],
    description: "Issues related to female reproductive health"
  },
  {
    id: "skin",
    name: "Skin & Dermatological",
    symptoms: [
      "Rash", "Itching", "Skin discoloration", "Dry skin", "Excessive sweating",
      "Acne", "Hives", "Moles", "Skin growths", "Hair loss", "Nail problems",
      "Skin infections", "Skin lesions"
    ],
    specialties: ["Dermatology", "General"],
    description: "Problems related to skin, hair, and nails"
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal",
    symptoms: [
      "Joint pain", "Muscle pain", "Back pain", "Neck pain", "Stiffness",
      "Swelling in joints", "Limited range of motion", "Muscle weakness",
      "Bone pain", "Fractures", "Sprains", "Arthritis symptoms"
    ],
    specialties: ["Orthopedics", "Rheumatology", "Physical Therapy", "General"],
    description: "Issues related to bones, joints, muscles, and connective tissues"
  },
  {
    id: "endocrine",
    name: "Endocrine & Metabolic",
    symptoms: [
      "Fatigue", "Unexplained weight changes", "Excessive thirst", "Frequent urination",
      "Heat/cold intolerance", "Hair loss", "Excessive hunger", "Slow healing",
      "Mood changes", "Blood sugar issues"
    ],
    specialties: ["Endocrinology", "General"],
    description: "Problems related to hormones and metabolism"
  },
  {
    id: "psychological",
    name: "Mental & Psychological",
    symptoms: [
      "Anxiety", "Depression", "Insomnia", "Mood swings", "Stress",
      "Panic attacks", "Difficulty concentrating", "Memory issues",
      "Behavioral changes", "Suicidal thoughts", "Addiction issues", "Hallucinations"
    ],
    specialties: ["Psychiatry", "Psychology", "General"],
    description: "Mental health and psychological well-being"
  },
  {
    id: "immune",
    name: "Immune & Allergic",
    symptoms: [
      "Allergic reactions", "Frequent infections", "Swollen lymph nodes",
      "Unexplained fever", "Autoimmune symptoms", "Rashes", "Hives",
      "Food allergies", "Seasonal allergies", "Asthma symptoms"
    ],
    specialties: ["Immunology", "Allergy", "Rheumatology", "General"],
    description: "Issues related to immune system and allergic responses"
  },
  {
    id: "general",
    name: "General & Systemic",
    symptoms: [
      "Fever", "Fatigue", "Weakness", "Weight loss", "Night sweats",
      "Malaise", "Loss of appetite", "Dizziness", "Fainting", "General pain"
    ],
    specialties: ["Internal Medicine", "General"],
    description: "General symptoms that may affect the whole body"
  }
]

// We'll use activeDoctors from the app context instead of mock data

export default function SymptomAnalyzerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { activeDoctors, createPatientRequest } = useAppContext()

  const [step, setStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [symptomDuration, setSymptomDuration] = useState<string>("days")
  const [symptomSeverity, setSymptomSeverity] = useState<string>("moderate")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([])
  const [noMatchingDoctors, setNoMatchingDoctors] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [requestError, setRequestError] = useState("")
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [customSymptom, setCustomSymptom] = useState("")
  const [customSymptoms, setCustomSymptoms] = useState<string[]>([])
  const [recommendedSpecialty, setRecommendedSpecialty] = useState("")

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSymptoms([])
    setStep(2)
  }

  // Handle symptom selection
  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  // Handle adding custom symptom
  const handleAddCustomSymptom = () => {
    if (customSymptom.trim() && !customSymptoms.includes(customSymptom.trim())) {
      setCustomSymptoms([...customSymptoms, customSymptom.trim()])
      setCustomSymptom("")
    }
  }

  // Handle removing custom symptom
  const handleRemoveCustomSymptom = (symptom: string) => {
    setCustomSymptoms(customSymptoms.filter(s => s !== symptom))
  }

  // Get all selected symptoms (predefined + custom)
  const allSelectedSymptoms = [...selectedSymptoms, ...customSymptoms]

  // Handle analyzing symptoms and recommending doctors with advanced AI matching
  const handleAnalyzeSymptoms = async () => {
    if (allSelectedSymptoms.length === 0) {
      return
    }

    setIsAnalyzing(true)

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get the current category
      const category = symptomCategories.find(cat => cat.id === selectedCategory)

      if (!category) {
        throw new Error("Category not found")
      }

      // Create a scoring system for specialties based on symptoms
      const specialtyScores: Record<string, number> = {}

      // Initialize scores for all specialties
      category.specialties.forEach(specialty => {
        specialtyScores[specialty] = 0
      })

      // Score based on primary category match
      category.specialties.forEach((specialty, index) => {
        // Primary specialty (first in the list) gets highest score
        specialtyScores[specialty] += 10 - (index * 2) // 10 points for first, 8 for second, etc.
      })

      // Additional scoring based on specific symptoms
      // This simulates an AI that understands which symptoms match which specialties better
      allSelectedSymptoms.forEach(symptom => {
        // Neurological symptoms
        if (["Headache", "Migraine", "Dizziness", "Vertigo", "Memory problems", "Confusion",
             "Seizures", "Tremors", "Numbness", "Tingling", "Balance problems"].includes(symptom)) {
          specialtyScores["Neurology"] = (specialtyScores["Neurology"] || 0) + 5
        }

        // Eye symptoms
        if (["Blurred vision", "Eye pain", "Redness in eyes", "Dry eyes", "Vision loss"].includes(symptom)) {
          specialtyScores["Ophthalmology"] = (specialtyScores["Ophthalmology"] || 0) + 5
        }

        // ENT symptoms
        if (["Ear pain", "Hearing loss", "Ringing in ears", "Sore throat", "Hoarseness",
             "Nasal congestion", "Sinus pressure"].includes(symptom)) {
          specialtyScores["ENT"] = (specialtyScores["ENT"] || 0) + 5
        }

        // Heart symptoms
        if (["Chest pain", "Palpitations", "Rapid heartbeat", "Irregular heartbeat",
             "High blood pressure", "Swelling in legs", "Chest pressure"].includes(symptom)) {
          specialtyScores["Cardiology"] = (specialtyScores["Cardiology"] || 0) + 5
        }

        // Lung symptoms
        if (["Cough", "Wheezing", "Shortness of breath", "Chest congestion",
             "Difficulty breathing", "Chest tightness"].includes(symptom)) {
          specialtyScores["Pulmonology"] = (specialtyScores["Pulmonology"] || 0) + 5
        }

        // Digestive symptoms
        if (["Abdominal pain", "Nausea", "Vomiting", "Diarrhea", "Constipation",
             "Bloating", "Heartburn", "Blood in stool", "Jaundice"].includes(symptom)) {
          specialtyScores["Gastroenterology"] = (specialtyScores["Gastroenterology"] || 0) + 5
        }

        // Urinary symptoms
        if (["Painful urination", "Frequent urination", "Blood in urine", "Urinary incontinence",
             "Difficulty urinating", "Kidney pain"].includes(symptom)) {
          specialtyScores["Urology"] = (specialtyScores["Urology"] || 0) + 5
          specialtyScores["Nephrology"] = (specialtyScores["Nephrology"] || 0) + 3
        }

        // Male reproductive symptoms
        if (["Testicular pain", "Erectile dysfunction", "Penile discharge", "Prostate problems"].includes(symptom)) {
          specialtyScores["Urology"] = (specialtyScores["Urology"] || 0) + 5
        }

        // Female reproductive symptoms
        if (["Menstrual irregularities", "Pelvic pain", "Vaginal discharge", "Breast pain",
             "Breast lumps", "Hot flashes", "Pregnancy symptoms", "Menopause symptoms"].includes(symptom)) {
          specialtyScores["Gynecology"] = (specialtyScores["Gynecology"] || 0) + 5
          specialtyScores["Obstetrics"] = (specialtyScores["Obstetrics"] || 0) + 3
        }

        // Skin symptoms
        if (["Rash", "Itching", "Skin discoloration", "Dry skin", "Acne", "Hives",
             "Skin infections", "Skin lesions"].includes(symptom)) {
          specialtyScores["Dermatology"] = (specialtyScores["Dermatology"] || 0) + 5
        }

        // Musculoskeletal symptoms
        if (["Joint pain", "Muscle pain", "Back pain", "Neck pain", "Stiffness",
             "Swelling in joints", "Bone pain", "Fractures", "Sprains"].includes(symptom)) {
          specialtyScores["Orthopedics"] = (specialtyScores["Orthopedics"] || 0) + 5
          specialtyScores["Rheumatology"] = (specialtyScores["Rheumatology"] || 0) + 3
          specialtyScores["Physical Therapy"] = (specialtyScores["Physical Therapy"] || 0) + 2
        }

        // Endocrine symptoms
        if (["Fatigue", "Unexplained weight changes", "Excessive thirst", "Frequent urination",
             "Heat/cold intolerance", "Excessive hunger", "Blood sugar issues"].includes(symptom)) {
          specialtyScores["Endocrinology"] = (specialtyScores["Endocrinology"] || 0) + 5
        }

        // Mental health symptoms
        if (["Anxiety", "Depression", "Insomnia", "Mood swings", "Stress", "Panic attacks",
             "Difficulty concentrating", "Behavioral changes", "Suicidal thoughts", "Addiction issues"].includes(symptom)) {
          specialtyScores["Psychiatry"] = (specialtyScores["Psychiatry"] || 0) + 5
          specialtyScores["Psychology"] = (specialtyScores["Psychology"] || 0) + 4
        }

        // Immune/allergy symptoms
        if (["Allergic reactions", "Frequent infections", "Swollen lymph nodes", "Autoimmune symptoms",
             "Food allergies", "Seasonal allergies", "Asthma symptoms"].includes(symptom)) {
          specialtyScores["Immunology"] = (specialtyScores["Immunology"] || 0) + 5
          specialtyScores["Allergy"] = (specialtyScores["Allergy"] || 0) + 5
          specialtyScores["Rheumatology"] = (specialtyScores["Rheumatology"] || 0) + 2
        }

        // General symptoms always add some points to General practice
        specialtyScores["General"] = (specialtyScores["General"] || 0) + 1
        specialtyScores["Internal Medicine"] = (specialtyScores["Internal Medicine"] || 0) + 1
      })

      // Find the specialty with the highest score
      let bestSpecialty = "General"
      let highestScore = 0

      Object.entries(specialtyScores).forEach(([specialty, score]) => {
        if (score > highestScore) {
          highestScore = score
          bestSpecialty = specialty
        }
      })

      // Set the recommended specialty for use in the UI
      setRecommendedSpecialty(bestSpecialty)

      // Get all specialties sorted by score (for potential fallbacks)
      const sortedSpecialties = Object.entries(specialtyScores)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])

      // Filter doctors by best specialty match - only use registered doctors
      let matchingDoctors = activeDoctors.filter(doctor =>
        doctor.specialty.toLowerCase() === bestSpecialty.toLowerCase()
      )

      // If no doctors match the best specialty, try the next best specialties
      if (matchingDoctors.length === 0) {
        // Try the next best specialties
        for (const specialty of sortedSpecialties) {
          if (specialty === bestSpecialty) continue // Skip the one we already tried

          matchingDoctors = activeDoctors.filter(doctor =>
            doctor.specialty.toLowerCase() === specialty.toLowerCase()
          )

          if (matchingDoctors.length > 0) {
            bestSpecialty = specialty // Update the best specialty to the one we found doctors for
            setRecommendedSpecialty(specialty)
            break
          }
        }
      }

      // If still no matching doctors, fall back to General practitioners
      if (matchingDoctors.length === 0) {
        matchingDoctors = activeDoctors.filter(doctor =>
          doctor.specialty.toLowerCase() === "general"
        )
      }

      // If absolutely no matching doctors, show the no doctors available message
      if (matchingDoctors.length === 0) {
        setNoMatchingDoctors(true)
        setRecommendedDoctors([])
      } else {
        // Sort matching doctors by rating and experience
        const sortedDoctors = [...matchingDoctors].sort((a, b) => {
          // First by exact specialty match
          const aExactMatch = a.specialty === bestSpecialty ? 1 : 0
          const bExactMatch = b.specialty === bestSpecialty ? 1 : 0
          if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch

          // Then by rating
          if (a.rating !== b.rating) return b.rating - a.rating

          // Then by experience
          return b.experience - a.experience
        })

        setRecommendedDoctors(sortedDoctors)
        setNoMatchingDoctors(false)
      }

      setStep(4)
    } catch (error) {
      console.error("Error analyzing symptoms:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle doctor selection
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId)
  }

  // Handle consultation request
  const handleRequestConsultation = async () => {
    if (!selectedDoctor) return

    setIsSubmittingRequest(true)
    setRequestError("")

    try {
      // Get the selected doctor
      const doctor = recommendedDoctors.find(doc => doc.id === selectedDoctor)

      if (!doctor) {
        throw new Error("Doctor not found")
      }

      // Create a consultation request
      await createPatientRequest({
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        symptoms: `${allSelectedSymptoms.join(", ")}. Duration: ${symptomDuration}. Severity: ${symptomSeverity}. ${additionalInfo}`,
        date: new Date().toISOString(),
        status: "pending",
        notes: "",
      })

      setRequestSuccess(true)

      // Redirect to appointments page after 2 seconds
      setTimeout(() => {
        router.push("/patient/appointments")
      }, 2000)

    } catch (error) {
      console.error("Error requesting consultation:", error)
      setRequestError("Failed to submit consultation request. Please try again.")
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">AI Symptom Analyzer</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Smart Symptom Analysis
            </CardTitle>
            <CardDescription>
              Our AI will analyze your symptoms and recommend the most appropriate specialists
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Select Symptom Category */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Select the area of your symptoms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {symptomCategories.map((category) => (
                    <Card
                      key={category.id}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedCategory === category.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {category.symptoms.slice(0, 3).join(", ")}...
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Specific Symptoms */}
            {step === 2 && selectedCategory && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Step 2: Select your symptoms</h3>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    Back
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {symptomCategories
                      .find(cat => cat.id === selectedCategory)
                      ?.symptoms.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            id={symptom}
                            checked={selectedSymptoms.includes(symptom)}
                            onCheckedChange={() => handleSymptomToggle(symptom)}
                          />
                          <label
                            htmlFor={symptom}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                  </div>

                  <div className="pt-2 border-t">
                    <Label htmlFor="customSymptom">Add other symptoms</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="customSymptom"
                        value={customSymptom}
                        onChange={(e) => setCustomSymptom(e.target.value)}
                        placeholder="Enter other symptoms"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomSymptom}
                        disabled={!customSymptom.trim()}
                      >
                        Add
                      </Button>
                    </div>

                    {customSymptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {customSymptoms.map((symptom) => (
                          <Badge key={symptom} variant="secondary" className="px-2 py-1">
                            {symptom}
                            <button
                              className="ml-1 text-gray-500 hover:text-gray-700"
                              onClick={() => handleRemoveCustomSymptom(symptom)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setStep(3)}
                  disabled={allSelectedSymptoms.length === 0}
                  className="mt-4"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Step 3: Additional Information</h3>
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                    Back
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>How long have you been experiencing these symptoms?</Label>
                    <RadioGroup value={symptomDuration} onValueChange={setSymptomDuration}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hours" id="hours" />
                        <Label htmlFor="hours">Hours</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="days" id="days" />
                        <Label htmlFor="days">Days</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weeks" id="weeks" />
                        <Label htmlFor="weeks">Weeks</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="months" id="months" />
                        <Label htmlFor="months">Months or longer</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>How severe are your symptoms?</Label>
                    <RadioGroup value={symptomSeverity} onValueChange={setSymptomSeverity}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mild" id="mild" />
                        <Label htmlFor="mild">Mild - Noticeable but not interfering with daily activities</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate">Moderate - Somewhat interfering with daily activities</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="severe" id="severe" />
                        <Label htmlFor="severe">Severe - Significantly interfering with daily activities</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Any other details you'd like to share?</Label>
                    <Textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="E.g., previous medical conditions, medications, allergies, etc."
                      rows={4}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalyzeSymptoms}
                  disabled={isAnalyzing}
                  className="mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Symptoms
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 4: Results and Doctor Recommendations */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Step 4: AI Recommendations</h3>
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                    Back
                  </Button>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 text-lg">AI Analysis Results</h4>
                      <p className="text-xs text-blue-600">Powered by advanced symptom matching</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-blue-700">Your Reported Symptoms:</h5>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {allSelectedSymptoms.map((symptom, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {noMatchingDoctors ? (
                      <div className="mt-3 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-yellow-800 font-medium">
                              No registered specialists available for your specific symptoms
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Based on our analysis, your symptoms would best be addressed by a {recommendedSpecialty} specialist, but we don't currently have any registered in our system. We recommend consulting with a general practitioner who can provide further guidance and referrals.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-green-800 font-medium">
                                Recommended Specialty: <span className="font-bold">{recommendedDoctors.length > 0 ? recommendedDoctors[0].specialty : "Specialist"}</span>
                              </p>
                              <p className="text-sm text-green-700 mt-1">
                                Our AI has analyzed your symptoms and determined that a {recommendedDoctors.length > 0 ? recommendedDoctors[0].specialty : "specialist"} would be best suited to address your health concerns.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-blue-700">Why this recommendation?</h5>
                          <p className="text-sm text-blue-600 mt-1">
                            Your symptoms of {allSelectedSymptoms.slice(0, 3).join(", ")}{allSelectedSymptoms.length > 3 ? ", and others" : ""} are commonly associated with conditions treated by {recommendedDoctors.length > 0 ? recommendedDoctors[0].specialty : "specialists"}. Early consultation can lead to better outcomes.
                          </p>
                        </div>

                      </div>
                    )}
                  </div>
                </div>

                {noMatchingDoctors ? (
                  <div className="text-center py-6">
                    <Stethoscope className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium">No Registered Specialists Available</h3>
                    <p className="text-gray-500 mt-1 max-w-md mx-auto">
                      We don't have any registered {recommendedSpecialty} specialists in our system at the moment.
                      Please consult with a general practitioner or try again later.
                    </p>


                    {/* Health Recommendations Section for No Doctors Case */}
                    <div className="bg-blue-50 p-6 rounded-lg mt-6 mb-6 border border-blue-100">
                      <h4 className="text-md font-medium mb-3 text-blue-700">While you wait for a consultation, here are some recommendations:</h4>
                      <HealthRecommendations symptoms={allSelectedSymptoms} specialty={recommendedSpecialty || "General"} />
                    </div>

                    <Button className="mt-4" onClick={() => router.push("/patient/appointments")}>
                      Book with General Practitioner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Health Recommendations Section */}
                    <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-100">
                      <HealthRecommendations
                        symptoms={allSelectedSymptoms}
                        specialty={recommendedDoctors.length > 0 ? recommendedDoctors[0].specialty : "General"}
                      />
                    </div>

                    <h4 className="font-medium">Recommended Doctors</h4>

                    {recommendedDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedDoctor === doctor.id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleDoctorSelect(doctor.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-medium">
                              {doctor.name.charAt(0)}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium">{doctor.name}</h3>
                                <p className="text-sm text-gray-500">{doctor.specialty}</p>
                              </div>

                              {doctor.id === recommendedDoctors[0].id && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Best Match
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{doctor.rating}</span>
                                <span className="text-xs text-gray-500 ml-1">({doctor.reviews})</span>
                              </div>

                              <div className="text-sm text-gray-500">
                                {doctor.experience} years exp.
                              </div>

                              <div className="text-sm text-gray-500">
                                Nrs. {doctor.consultationFee}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Available {doctor.availability}
                              </Badge>

                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                                {doctor.hospital}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      onClick={handleRequestConsultation}
                      disabled={!selectedDoctor || isSubmittingRequest || requestSuccess}
                      className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isSubmittingRequest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Request...
                        </>
                      ) : requestSuccess ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Request Submitted Successfully
                        </>
                      ) : (
                        <>
                          Request Consultation
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {requestError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <p className="text-sm">{requestError}</p>
                      </div>
                    )}

                    {requestSuccess && (
                      <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <p className="text-sm">
                          Your consultation request has been submitted successfully!
                          Redirecting to appointments page...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}
