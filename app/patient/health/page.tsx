"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PatientLayout } from "@/components/layouts/patient-layout"
import { useAppContext } from "@/lib/app-context"
import { TrendingUp, TrendingDown, Minus, Edit, Ruler, Weight, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast, Toaster } from "sonner"

// Calculate BMI and return the value and category
function calculateBMI(weight: number, height: number) {
  // Height should be in meters, weight in kg
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  const roundedBMI = Math.round(bmi * 10) / 10

  let category = ""
  let color = ""
  let percentage = 0

  if (bmi < 18.5) {
    category = "Underweight"
    color = "text-blue-500"
    percentage = 20
  } else if (bmi >= 18.5 && bmi < 25) {
    category = "Normal Weight"
    color = "text-green-500"
    percentage = 45
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight"
    color = "text-yellow-500"
    percentage = 70
  } else {
    category = "Obese"
    color = "text-red-500"
    percentage = 90
  }

  return { value: roundedBMI, category, color, percentage }
}

export default function HealthMetricsPage() {
  const { healthMetrics, updateHealthMetrics } = useAppContext()
  const [activeTab, setActiveTab] = useState("overview")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Health data form state
  const [weight, setWeight] = useState(healthMetrics?.weight.value || 70)
  const [height, setHeight] = useState(175) // Default height in cm
  const [systolic, setSystolic] = useState(120)
  const [diastolic, setDiastolic] = useState(80)
  const [bmi, setBmi] = useState({ value: 0, category: "", color: "", percentage: 0 })

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (weight && height) {
      const bmiResult = calculateBMI(weight, height)
      setBmi(bmiResult)
    }
  }, [weight, height])

  // Initialize form values when healthMetrics changes
  useEffect(() => {
    if (healthMetrics) {
      setWeight(healthMetrics.weight.value)

      // Parse blood pressure values
      const bpParts = healthMetrics.bloodPressure.value.split("/")
      if (bpParts.length === 2) {
        setSystolic(parseInt(bpParts[0]))
        setDiastolic(parseInt(bpParts[1]))
      }
    }
  }, [healthMetrics])

  const handleUpdateHealthData = async () => {
    try {
      // Update health metrics in the app context
      await updateHealthMetrics({
        weight: weight,
        bloodPressure: `${systolic}/${diastolic}`
      })

      toast.success("Health data updated successfully")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating health data:", error)
      toast.error("Failed to update health data. Please try again.")
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "worsening":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <PatientLayout>
      <Toaster />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Health Metrics</h1>
            <p className="text-gray-500">Track and monitor your health data</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Update Health Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Health Data</DialogTitle>
                  <DialogDescription>
                    Enter your latest health measurements. This data will be used to calculate your BMI and track your health over time.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Pressure (mmHg)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={systolic}
                        onChange={(e) => setSystolic(parseInt(e.target.value))}
                        placeholder="Systolic"
                      />
                      <span>/</span>
                      <Input
                        type="number"
                        value={diastolic}
                        onChange={(e) => setDiastolic(parseInt(e.target.value))}
                        placeholder="Diastolic"
                      />
                    </div>
                  </div>
                  {weight && height && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Calculated BMI</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xl font-bold ${bmi.color}`}>{bmi.value}</span>
                        <span className="text-sm text-gray-500">({bmi.category})</span>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateHealthData}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weight">Weight & BMI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Health Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthMetrics && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Blood Pressure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{healthMetrics.bloodPressure.value}</div>
                        {getTrendIcon(healthMetrics.bloodPressure.trend)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {healthMetrics.bloodPressure.trend}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Weight</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">
                          {healthMetrics.weight.value} {healthMetrics.weight.unit}
                        </div>
                        {getTrendIcon(healthMetrics.weight.trend)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{healthMetrics.weight.trend}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">BMI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{bmi.value}</div>
                        <span className={`text-sm font-medium ${bmi.color}`}>{bmi.category}</span>
                      </div>
                      <div className="w-full mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500`} style={{ width: `${bmi.percentage}%` }}></div>
                      </div>
                      <div className="w-full flex justify-between text-xs text-gray-500 mt-1">
                        <span>18.5</span>
                        <span>25</span>
                        <span>30</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Health Metrics Chart */}
            {healthMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Health Trends</CardTitle>
                  <CardDescription>Your health metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={healthMetrics.weight.history.map((item, index) => ({
                          date: item.date,
                          bloodPressureSystolic: Number.parseInt(
                            healthMetrics.bloodPressure.history[index].value.split("/")[0],
                          ),
                          bloodPressureDiastolic: Number.parseInt(
                            healthMetrics.bloodPressure.history[index].value.split("/")[1],
                          ),
                          weight: item.value,
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" stroke="#10B981" domain={[65, 75]} />
                        <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" domain={[60, 140]} />
                        <Tooltip />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="bloodPressureSystolic"
                          stroke="#3B82F6"
                          name="Blood Pressure (systolic)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="bloodPressureDiastolic"
                          stroke="#8B5CF6"
                          name="Blood Pressure (diastolic)"
                        />
                        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#10B981" name="Weight (kg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="weight" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weight</CardTitle>
                  <CardDescription>Your weight measurements over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthMetrics && (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={healthMetrics.weight.history}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[65, 70]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#10B981" name="Weight (kg)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>BMI Calculation</CardTitle>
                  <CardDescription>Your Body Mass Index</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className={`text-5xl font-bold ${bmi.color}`}>{bmi.value}</div>
                    <p className="text-lg mt-2">{bmi.category}</p>
                    <div className="w-full mt-6 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500" style={{ width: `${bmi.percentage}%` }}></div>
                    </div>
                    <div className="w-full flex justify-between text-xs text-gray-500 mt-1">
                      <span>Underweight</span>
                      <span>Normal</span>
                      <span>Overweight</span>
                      <span>Obese</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure</CardTitle>
                <CardDescription>Your blood pressure measurements over time</CardDescription>
              </CardHeader>
              <CardContent>
                {healthMetrics && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={healthMetrics.bloodPressure.history.map((item) => ({
                          date: item.date,
                          systolic: Number.parseInt(item.value.split("/")[0]),
                          diastolic: Number.parseInt(item.value.split("/")[1]),
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[60, 140]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="systolic" stroke="#3B82F6" name="Systolic (mmHg)" />
                        <Line type="monotone" dataKey="diastolic" stroke="#8B5CF6" name="Diastolic (mmHg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  )
}
