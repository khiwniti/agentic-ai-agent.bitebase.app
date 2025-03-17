"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Share } from "lucide-react"
import { ResearchMap } from "@/components/maps/research-map"
import { ProductInsights } from "@/components/research/product-insights"
import { PlaceInsights } from "@/components/research/place-insights"
import { PriceInsights } from "@/components/research/price-insights"
import { PromotionInsights } from "@/components/research/promotion-insights"
import { InsightsSummary } from "@/components/research/insights-summary"

export default function ResearchResultsPage() {
  const [activeTab, setActiveTab] = useState("summary")

  // In a real app, this would be fetched from an API based on the research parameters
  const researchData = {
    id: "1",
    name: "Downtown Italian Cafe",
    location: "Chicago, IL",
    address: "123 W Madison St, Chicago, IL 60602",
    cuisine: "Italian",
    coordinates: { lat: 41.8819, lng: -87.6278 },
    radius: 1.5,
    targetGroups: ["young-professionals", "business"],
    budget: 250000,
    dishCategories: ["coffee", "pastries", "sandwiches", "pasta"],
    createdAt: "2023-06-15",
    lastUpdated: "2023-06-22",
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{researchData.name}</h1>
          <p className="text-muted-foreground">
            {researchData.address} • {researchData.cuisine} • Created on {researchData.createdAt}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="place">Place</TabsTrigger>
          <TabsTrigger value="price">Price</TabsTrigger>
          <TabsTrigger value="promotion">Promotion</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="col-span-2 md:row-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Market Analysis Map</CardTitle>
                <CardDescription>Interactive map showing key market insights</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] w-full">
                  <ResearchMap
                    initialLat={researchData.coordinates.lat}
                    initialLng={researchData.coordinates.lng}
                    radius={researchData.radius}
                    showLayers={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research Summary</CardTitle>
                <CardDescription>AI-generated insights based on your parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <InsightsSummary />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="product" className="space-y-4">
          <ProductInsights />
        </TabsContent>

        <TabsContent value="place" className="space-y-4">
          <PlaceInsights coordinates={researchData.coordinates} radius={researchData.radius} />
        </TabsContent>

        <TabsContent value="price" className="space-y-4">
          <PriceInsights />
        </TabsContent>

        <TabsContent value="promotion" className="space-y-4">
          <PromotionInsights />
        </TabsContent>
      </Tabs>
    </div>
  )
}

