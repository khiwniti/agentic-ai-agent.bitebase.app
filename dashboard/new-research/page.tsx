"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { ResearchMap } from "@/components/maps/research-map"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewResearchPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    location: "",
    address: "",
    radius: 1.5, // miles
    coordinates: { lat: 41.8781, lng: -87.6298 }, // Default to Chicago
    targetGroups: [] as string[],
    budget: 250000,
    dishCategories: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValues = prev[field as keyof typeof prev] as string[]
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] }
      } else {
        return { ...prev, [field]: currentValues.filter((v) => v !== value) }
      }
    })
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: { lat, lng },
      address,
    }))
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Submit the form and create the project
      router.push("/dashboard/research/results")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">New Market Research</h1>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Step {step} of 4</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-2 rounded-full ${step >= 4 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>
          <CardDescription>
            {step === 1 && "Basic information about your restaurant concept"}
            {step === 2 && "Select the location for your restaurant"}
            {step === 3 && "Define your target audience and budget"}
            {step === 4 && "Select your menu categories and confirm"}
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
                  placeholder="e.g., Downtown Italian Cafe"
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
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g., 123 Main St or Main St & 1st Ave"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="h-[400px] w-full rounded-md border">
                <ResearchMap
                  initialLat={formData.coordinates.lat}
                  initialLng={formData.coordinates.lng}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

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
                  onValueChange={(value) => handleSliderChange("radius", value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5 mi</span>
                  <span>5 mi</span>
                </div>
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
              <div className="space-y-4">
                <Label>Target Customer Groups</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="young-professionals"
                      checked={formData.targetGroups.includes("young-professionals")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("targetGroups", "young-professionals", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="young-professionals"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Young Professionals (25-34)
                      </label>
                      <p className="text-xs text-muted-foreground">Urban, higher income, tech-savvy</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="families"
                      checked={formData.targetGroups.includes("families")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("targetGroups", "families", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="families"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Families with Children
                      </label>
                      <p className="text-xs text-muted-foreground">Value-oriented, convenience-focused</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="students"
                      checked={formData.targetGroups.includes("students")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("targetGroups", "students", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="students"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Students
                      </label>
                      <p className="text-xs text-muted-foreground">Budget-conscious, social dining</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="seniors"
                      checked={formData.targetGroups.includes("seniors")}
                      onCheckedChange={(checked) => handleCheckboxChange("targetGroups", "seniors", checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="seniors"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Seniors (65+)
                      </label>
                      <p className="text-xs text-muted-foreground">Value quality, traditional service</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="tourists"
                      checked={formData.targetGroups.includes("tourists")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("targetGroups", "tourists", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="tourists"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tourists
                      </label>
                      <p className="text-xs text-muted-foreground">Experience-seeking, higher spending</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="business"
                      checked={formData.targetGroups.includes("business")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("targetGroups", "business", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="business"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Business Professionals
                      </label>
                      <p className="text-xs text-muted-foreground">Meetings, expense accounts, networking</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="budget">Initial Investment Budget</Label>
                  <span className="text-sm font-medium">${formData.budget.toLocaleString()}</span>
                </div>
                <Slider
                  id="budget"
                  min={50000}
                  max={1000000}
                  step={10000}
                  value={[formData.budget]}
                  onValueChange={(value) => handleSliderChange("budget", value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$50,000</span>
                  <span>$1,000,000</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Menu Categories</Label>
                <Tabs defaultValue="cafe" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cafe">Cafe</TabsTrigger>
                    <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
                    <TabsTrigger value="specialty">Specialty</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cafe" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="coffee"
                          checked={formData.dishCategories.includes("coffee")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "coffee", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="coffee"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Coffee & Espresso
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="tea"
                          checked={formData.dishCategories.includes("tea")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "tea", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="tea"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Tea & Infusions
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="pastries"
                          checked={formData.dishCategories.includes("pastries")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "pastries", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="pastries"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Pastries & Baked Goods
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="breakfast"
                          checked={formData.dishCategories.includes("breakfast")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "breakfast", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="breakfast"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Breakfast Items
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="sandwiches"
                          checked={formData.dishCategories.includes("sandwiches")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "sandwiches", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="sandwiches"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Sandwiches & Light Lunch
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="smoothies"
                          checked={formData.dishCategories.includes("smoothies")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "smoothies", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="smoothies"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Smoothies & Juices
                          </label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="restaurant" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="appetizers"
                          checked={formData.dishCategories.includes("appetizers")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "appetizers", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="appetizers"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Appetizers & Starters
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="entrees"
                          checked={formData.dishCategories.includes("entrees")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "entrees", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="entrees"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Main Entrees
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="pasta"
                          checked={formData.dishCategories.includes("pasta")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "pasta", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="pasta"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Pasta & Noodles
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="seafood"
                          checked={formData.dishCategories.includes("seafood")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "seafood", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="seafood"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Seafood
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="desserts"
                          checked={formData.dishCategories.includes("desserts")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "desserts", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="desserts"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Desserts
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="drinks"
                          checked={formData.dishCategories.includes("drinks")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "drinks", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="drinks"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Alcoholic Beverages
                          </label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="specialty" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="vegan"
                          checked={formData.dishCategories.includes("vegan")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "vegan", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="vegan"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Vegan Options
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="gluten-free"
                          checked={formData.dishCategories.includes("gluten-free")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "gluten-free", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="gluten-free"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Gluten-Free Options
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="organic"
                          checked={formData.dishCategories.includes("organic")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "organic", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="organic"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Organic & Local Sourced
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="fusion"
                          checked={formData.dishCategories.includes("fusion")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "fusion", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="fusion"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Fusion Cuisine
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="health-focused"
                          checked={formData.dishCategories.includes("health-focused")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "health-focused", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="health-focused"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Health-Focused Menu
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="ethnic-specialty"
                          checked={formData.dishCategories.includes("ethnic-specialty")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("dishCategories", "ethnic-specialty", checked as boolean)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="ethnic-specialty"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Ethnic Specialty Dishes
                          </label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="rounded-md border p-4">
                <div className="font-medium">Research Summary</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Project Name:</span> {formData.name || "Unnamed Project"}
                    </div>
                    <div>
                      <span className="font-medium">Cuisine Type:</span> {formData.cuisine || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{" "}
                      {formData.address || formData.location || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Analysis Radius:</span> {formData.radius} miles
                    </div>
                    <div>
                      <span className="font-medium">Target Groups:</span>{" "}
                      {formData.targetGroups.length > 0
                        ? formData.targetGroups.map((g) => g.replace("-", " ")).join(", ")
                        : "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> ${formData.budget.toLocaleString()}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Menu Categories:</span>{" "}
                      {formData.dishCategories.length > 0
                        ? formData.dishCategories.map((c) => c.replace("-", " ")).join(", ")
                        : "Not specified"}
                    </div>
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
            {step < 4 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Generate Research
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

