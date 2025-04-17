"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Salad, Dumbbell, Leaf, Heart, Utensils, Droplets } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HealthRecommendationsProps {
  symptoms: string[]
  specialty: string
}

// Define diet and exercise recommendations based on symptoms and specialties
const healthRecommendations = {
  // Neurological recommendations
  Neurology: {
    diet: [
      "Omega-3 rich foods (fatty fish, flaxseeds, walnuts)",
      "Antioxidant-rich berries (blueberries, strawberries)",
      "Green leafy vegetables (spinach, kale)",
      "Turmeric with black pepper (anti-inflammatory)",
      "Limit caffeine and alcohol consumption"
    ],
    exercises: [
      "Regular aerobic exercise (30 minutes, 5 days a week)",
      "Yoga and meditation for stress reduction",
      "Balance exercises",
      "Neck and shoulder stretches",
      "Adequate sleep (7-8 hours)"
    ],
    specificSymptoms: {
      "Headache": {
        diet: [
          "Stay hydrated (8-10 glasses of water daily)",
          "Avoid trigger foods (processed foods, aged cheese, chocolate)",
          "Magnesium-rich foods (nuts, seeds, whole grains)",
          "Regular meal timing to prevent blood sugar drops"
        ],
        exercises: [
          "Gentle neck stretches",
          "Progressive muscle relaxation",
          "Deep breathing exercises",
          "Regular sleep schedule"
        ]
      },
      "Migraine": {
        diet: [
          "Identify and avoid food triggers (common ones include aged cheese, processed meats, alcohol)",
          "Maintain regular eating schedule",
          "Stay well-hydrated",
          "Consider riboflavin (vitamin B2) rich foods"
        ],
        exercises: [
          "Low-impact aerobic exercise",
          "Stress management techniques",
          "Yoga focusing on relaxation",
          "Adequate sleep hygiene"
        ]
      },
      "Confusion": {
        diet: [
          "B vitamin-rich foods (whole grains, eggs, leafy greens)",
          "Antioxidant-rich foods (berries, dark chocolate)",
          "Omega-3 fatty acids (fish, flaxseeds)",
          "Stay well-hydrated"
        ],
        exercises: [
          "Mental stimulation activities (puzzles, reading)",
          "Regular physical activity",
          "Social engagement",
          "Meditation for mental clarity"
        ]
      }
    }
  },

  // Cardiology recommendations
  Cardiology: {
    diet: [
      "DASH diet (low sodium, rich in fruits and vegetables)",
      "Omega-3 fatty acids (fatty fish, flaxseeds)",
      "Whole grains and fiber-rich foods",
      "Limit saturated fats and trans fats",
      "Reduce sodium intake"
    ],
    exercises: [
      "Regular aerobic exercise (walking, swimming, cycling)",
      "Gradual increase in physical activity",
      "Strength training 2-3 times per week",
      "Monitor heart rate during exercise",
      "Stress reduction techniques"
    ],
    specificSymptoms: {
      "Chest pain": {
        diet: [
          "Heart-healthy Mediterranean diet",
          "Potassium-rich foods (bananas, potatoes, avocados)",
          "Limit caffeine and alcohol",
          "Small, frequent meals"
        ],
        exercises: [
          "Consult doctor before starting exercise",
          "Supervised cardiac rehabilitation if recommended",
          "Gentle walking as tolerated",
          "Breathing exercises"
        ]
      },
      "Palpitations": {
        diet: [
          "Limit stimulants (caffeine, energy drinks)",
          "Avoid large meals",
          "Stay well-hydrated",
          "Magnesium-rich foods (nuts, seeds, leafy greens)"
        ],
        exercises: [
          "Low to moderate intensity exercise",
          "Yoga and meditation",
          "Regular sleep schedule",
          "Stress management techniques"
        ]
      }
    }
  },

  // Gastroenterology recommendations
  Gastroenterology: {
    diet: [
      "High-fiber foods (fruits, vegetables, whole grains)",
      "Probiotic-rich foods (yogurt, kefir, fermented foods)",
      "Small, frequent meals",
      "Stay well-hydrated",
      "Limit fatty, spicy foods and alcohol"
    ],
    exercises: [
      "Regular moderate exercise",
      "Walking after meals",
      "Yoga poses that aid digestion",
      "Abdominal strengthening exercises",
      "Stress reduction techniques"
    ],
    specificSymptoms: {
      "Abdominal pain": {
        diet: [
          "Elimination diet to identify trigger foods",
          "Low FODMAP diet may help (consult nutritionist)",
          "Small, frequent meals",
          "Peppermint tea for soothing"
        ],
        exercises: [
          "Gentle walking",
          "Yoga poses for digestion (child's pose, knees to chest)",
          "Deep breathing exercises",
          "Heat therapy"
        ]
      },
      "Nausea": {
        diet: [
          "Small, frequent meals",
          "Ginger tea or candies",
          "Bland foods (crackers, toast, rice)",
          "Stay hydrated with small sips of clear fluids"
        ],
        exercises: [
          "Fresh air and ventilation",
          "Acupressure wristbands",
          "Relaxation techniques",
          "Gentle movement as tolerated"
        ]
      },
      "Constipation": {
        diet: [
          "Increase fiber intake gradually",
          "Stay well-hydrated (8-10 glasses of water daily)",
          "Probiotic-rich foods",
          "Warm liquids in the morning"
        ],
        exercises: [
          "Regular physical activity",
          "Abdominal massage",
          "Squatting position for bowel movements",
          "Yoga poses that stimulate digestion"
        ]
      }
    }
  },

  // Orthopedics recommendations
  Orthopedics: {
    diet: [
      "Anti-inflammatory foods (fatty fish, berries, olive oil)",
      "Calcium-rich foods (dairy, fortified plant milks, leafy greens)",
      "Vitamin D sources (fatty fish, egg yolks, sunlight exposure)",
      "Collagen-supporting nutrients (vitamin C, protein)",
      "Adequate protein intake"
    ],
    exercises: [
      "Low-impact activities (swimming, cycling)",
      "Strength training with proper form",
      "Flexibility and stretching exercises",
      "Balance exercises",
      "Proper warm-up and cool-down"
    ],
    specificSymptoms: {
      "Joint pain": {
        diet: [
          "Anti-inflammatory omega-3 fatty acids",
          "Turmeric with black pepper",
          "Tart cherry juice",
          "Limit sugar and processed foods"
        ],
        exercises: [
          "Gentle range of motion exercises",
          "Aquatic exercises",
          "Isometric strengthening",
          "Joint protection techniques"
        ]
      },
      "Back pain": {
        diet: [
          "Anti-inflammatory foods",
          "Maintain healthy weight",
          "Calcium and vitamin D for bone health",
          "Stay well-hydrated"
        ],
        exercises: [
          "Core strengthening exercises",
          "Gentle stretching (cat-cow, child's pose)",
          "Walking on even surfaces",
          "Proper posture maintenance"
        ]
      }
    }
  },

  // General recommendations for all conditions
  General: {
    diet: [
      "Balanced diet rich in fruits and vegetables",
      "Adequate protein intake",
      "Whole grains and fiber-rich foods",
      "Healthy fats (olive oil, avocados, nuts)",
      "Stay well-hydrated",
      "Limit processed foods, sugar, and salt"
    ],
    exercises: [
      "Regular moderate physical activity (150 minutes per week)",
      "Mix of cardio, strength, and flexibility exercises",
      "Daily walking (at least 30 minutes)",
      "Stretching and mobility work",
      "Adequate rest and recovery",
      "Stress management techniques (meditation, deep breathing)"
    ]
  }
}

export function HealthRecommendations({ symptoms, specialty }: HealthRecommendationsProps) {
  // Default to general recommendations
  let dietRecommendations = healthRecommendations.General.diet
  let exerciseRecommendations = healthRecommendations.General.exercises

  // Get specialty-specific recommendations if available
  if (healthRecommendations[specialty as keyof typeof healthRecommendations]) {
    dietRecommendations = healthRecommendations[specialty as keyof typeof healthRecommendations].diet
    exerciseRecommendations = healthRecommendations[specialty as keyof typeof healthRecommendations].exercises

    // Check for symptom-specific recommendations
    const specialtyRecs = healthRecommendations[specialty as keyof typeof healthRecommendations]

    // Look for the first matching symptom with specific recommendations
    for (const symptom of symptoms) {
      if (specialtyRecs.specificSymptoms &&
          specialtyRecs.specificSymptoms[symptom as keyof typeof specialtyRecs.specificSymptoms]) {

        const symptomRecs = specialtyRecs.specificSymptoms[symptom as keyof typeof specialtyRecs.specificSymptoms]

        // Combine general specialty recommendations with symptom-specific ones
        dietRecommendations = [
          ...symptomRecs.diet.slice(0, 3),
          ...dietRecommendations.slice(0, 2)
        ]

        exerciseRecommendations = [
          ...symptomRecs.exercises.slice(0, 3),
          ...exerciseRecommendations.slice(0, 2)
        ]

        break // Use the first matching symptom's recommendations
      }
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg flex items-center gap-2 text-blue-700">
        <Salad className="h-5 w-5" />
        Lifestyle Recommendations Based on Your Symptoms
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="h-5 w-5 text-green-600" />
              Dietary Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dietRecommendations.slice(0, 5).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Leaf className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Droplets className="h-3 w-3 mr-1" />
                Stay well-hydrated
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              Exercise & Yoga Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {exerciseRecommendations.slice(0, 5).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Heart className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Salad className="h-3 w-3 mr-1" />
                Consult doctor before starting new regimen
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> These recommendations are general guidelines based on your symptoms. Always consult with your healthcare provider before making significant changes to your diet or exercise routine.
        </p>
      </div>
    </div>
  )
}
