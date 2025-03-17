"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react"
import { LocationMap } from "@/components/maps/location-map"

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    location: "",
    address: "",
    radius: 1.5, // miles
    coordinates: { lat: 41.8781, lng: -87.6298 }, // Default to Chicago
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, radius: value[0] }))
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: { lat, lng },
      address,
    }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Submit the form and create the project
      router.push("/dashboard/project/1")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Create New Project" text="Set up a new restaurant market research project." />

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Step {step} of 3</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>
          <CardDescription>
            {step === 1 && "Basic information about your restaurant concept"}
            {step === 2 && "Select the location for your restaurant"}
            {step === 3 && "Define the analysis area and parameters"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Downtown Italian Restaurant"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Select value={formData.cuisine} onValueChange={(value) => handleSelectChange("cuisine", value)}>
                  <SelectTrigger id="cuisine">
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="mexican">Mexican</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="thai">Thai</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="cafe">Cafe</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="steakhouse">Steakhouse</SelectItem>
                    <SelectItem value="seafood">Seafood</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">General Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Chicago, IL"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Specific Address or Intersection</Label>
                <div className="flex space-x-2">
                  <Input
                    id="address"
                    name="address"
                    placeholder="e.g., 123 Main St or Main St & 1st Ave"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  <Button variant="outline" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="h-[400px] w-full rounded-md border">
                <LocationMap
                  initialLat={formData.coordinates.lat}
                  initialLng={formData.coordinates.lng}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              <div className="rounded-md border p-4">
                <div className="font-medium">Selected Location</div>
                <div className="text-sm text-muted-foreground">
                  {formData.address || "No specific address selected"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="radius">Analysis Radius (miles)</Label>
                  <span className="text-sm font-medium">{formData.radius} miles</span>
                </div>
                <Slider
                  id="radius"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={[formData.radius]}
                  onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5 mi</span>
                  <span>5 mi</span>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="h-[300px] w-full">
                  <LocationMap
                    initialLat={formData.coordinates.lat}
                    initialLng={formData.coordinates.lng}
                    radius={formData.radius}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-md border p-4">
                <div className="font-medium">Analysis Parameters</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Project Name</div>
                    <div className="text-muted-foreground">{formData.name || "Unnamed Project"}</div>
                  </div>
                  <div>
                    <div className="font-medium">Cuisine Type</div>
                    <div className="text-muted-foreground">{formData.cuisine || "Not specified"}</div>
                  </div>
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-muted-foreground">
                      {formData.address || formData.location || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Analysis Radius</div>
                    <div className="text-muted-foreground">{formData.radius} miles</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={handleNext}>
            {step < 3 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Create Project
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  )
}

