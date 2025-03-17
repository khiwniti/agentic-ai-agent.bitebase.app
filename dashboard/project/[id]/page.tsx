import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, BarChart3, Download, DollarSign, ShoppingBag, Share, Target, Users } from "lucide-react"
import { ProjectMap } from "@/components/maps/project-map"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CompetitorList } from "@/components/dashboard/competitor-list"
import { DemographicChart } from "@/components/dashboard/demographic-chart"
import { TrafficAnalysis } from "@/components/dashboard/traffic-analysis"
import { RealEstateMetrics } from "@/components/dashboard/real-estate-metrics"

type ProjectPageProps = {
  params: {
    id: string;
  };
}

// Fixed: Ensure params are properly handled in async component
export default async function ProjectPage({ params }: ProjectPageProps) {
  // Use the await Promise.resolve to resolve the params properly
  // This is a workaround for the Next.js issue with dynamic params
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  // In a real app, you would fetch the project data based on the ID
  const projectData = {
    id,
    name: "Downtown Italian Restaurant",
    location: "Chicago, IL",
    address: "123 W Madison St, Chicago, IL 60602",
    cuisine: "Italian",
    coordinates: { lat: 41.8819, lng: -87.6278 },
    radius: 1.5,
    createdAt: "2023-06-15",
    lastUpdated: "2023-06-22",
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={projectData.name}
        text={`${projectData.address} • ${projectData.cuisine} • Created on ${projectData.createdAt}`}
      >
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </DashboardHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="place">Place</TabsTrigger>
          <TabsTrigger value="price">Price</TabsTrigger>
          <TabsTrigger value="promotion">Promotion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="col-span-2 md:row-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Market Analysis Map</CardTitle>
                <CardDescription>Interactive map showing key market insights</CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative overflow-hidden">
                <div className="h-[600px] w-full relative">
                  <ProjectMap
                    lat={projectData.coordinates.lat}
                    lng={projectData.coordinates.lng}
                    radius={projectData.radius}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <MetricCard
                    title="Population Density"
                    value="12,450"
                    unit="people/sq mi"
                    change={8}
                    description="Within 1.5 mile radius"
                  />
                  <MetricCard
                    title="Competitors"
                    value="14"
                    unit="restaurants"
                    change={-2}
                    description="Similar cuisine within radius"
                  />
                  <MetricCard
                    title="Avg. Foot Traffic"
                    value="1,850"
                    unit="people/day"
                    change={12}
                    description="Weekday average on this block"
                  />
                  <MetricCard
                    title="Rent Estimate"
                    value="$42"
                    unit="per sq ft"
                    change={3}
                    description="Commercial space in this area"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>Nearby competitors and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <CompetitorList />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Population demographics in target area</CardDescription>
              </CardHeader>
              <CardContent>
                <DemographicChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Analysis</CardTitle>
                <CardDescription>Foot and vehicle traffic patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <TrafficAnalysis />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real Estate</CardTitle>
                <CardDescription>Commercial real estate metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <RealEstateMetrics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="product" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Menu Performance</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24 items</div>
                <p className="text-xs text-muted-foreground">
                  +4 new items since last quarter
                </p>
                <div className="mt-4 h-[60px]">
                  {/* Placeholder for small chart */}
                  <div className="flex h-[60px] items-end gap-1">
                    {[40, 50, 45, 60, 55, 70, 80, 75, 85, 90, 95, 85].map((h, i) => (
                      <div 
                        key={i} 
                        className="bg-primary/90 w-full" 
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Best Sellers</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 Categories</div>
                <p className="text-xs text-muted-foreground">
                  Pasta, Pizza, and Seafood
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[85%] rounded-full bg-primary"></div>
                    </div>
                    <span className="ml-2 text-xs">Pasta (85%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[65%] rounded-full bg-primary"></div>
                    </div>
                    <span className="ml-2 text-xs">Pizza (65%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[45%] rounded-full bg-primary"></div>
                    </div>
                    <span className="ml-2 text-xs">Seafood (45%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Customer Preferences</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92% Positive</div>
                <p className="text-xs text-muted-foreground">
                  Based on 325 reviews
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Vegan Options</span>
                    <span className="text-xs font-medium">Limited</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Gluten-Free</span>
                    <span className="text-xs font-medium">Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Alcohol</span>
                    <span className="text-xs font-medium">Full Bar</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 Areas</div>
                <p className="text-xs text-muted-foreground">
                  For menu improvement
                </p>
                <div className="mt-4 space-y-2">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs font-medium">More vegan options</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs font-medium">Enhanced seasonal menu</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs font-medium">Local ingredient sourcing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Menu Analysis</CardTitle>
              <CardDescription>Performance metrics for your restaurant's offerings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Top Performing Items</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { name: "Spaghetti Carbonara", price: "$16.99", profit: "68%", popularity: "High" },
                      { name: "Margherita Pizza", price: "$14.99", profit: "72%", popularity: "Very High" },
                      { name: "Tiramisu", price: "$8.99", profit: "76%", popularity: "Medium" },
                    ].map((item, i) => (
                      <div key={i} className="rounded-md border p-4">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>Price: <span className="font-medium">{item.price}</span></div>
                          <div>Profit: <span className="font-medium">{item.profit}</span></div>
                          <div>Popularity: <span className="font-medium">{item.popularity}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-4 text-lg font-medium">Optimization Recommendations</h3>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <h4 className="flex items-center font-medium">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Menu Engineering
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Consider removing the 3 lowest-performing menu items and replacing them with variations of your top sellers.
                        This could potentially increase overall menu profitability by 12%.
                      </p>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h4 className="flex items-center font-medium">
                        <Target className="mr-2 h-4 w-4" />
                        Product Mix Strategy
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Based on market demographics, adding 2-3 premium vegan dishes could attract a new customer segment
                        and fill a gap in the local market.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="place" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic & Customer Insights</CardTitle>
              <CardDescription>Detailed analysis of location factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-[500px] w-full relative overflow-hidden rounded-md">
                  <ProjectMap
                    lat={projectData.coordinates.lat}
                    lng={projectData.coordinates.lng}
                    radius={projectData.radius}
                    layerType="heatmap"
                  />
                </div>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="text-lg font-medium">Customer Density Heatmap</h3>
                    <p className="text-sm text-muted-foreground">
                      The map shows population density with higher concentrations in red and orange areas. Your selected
                      location is in a high-density area with strong foot traffic potential.
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="text-lg font-medium">Competitor Landscape</h3>
                    <p className="text-sm text-muted-foreground">
                      There are 14 restaurants within your analysis radius, with 4 offering similar cuisine. The closest
                      direct competitor is 0.3 miles away.
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="text-lg font-medium">Delivery & Pickup Hotspots</h3>
                    <p className="text-sm text-muted-foreground">
                      Your location has strong potential for delivery services with 3 major residential complexes within
                      a 1-mile radius. The area also has good accessibility for pickup orders.
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="text-lg font-medium">Real Estate Impact</h3>
                    <p className="text-sm text-muted-foreground">
                      Commercial rent in this area averages $42 per square foot, which is 8% higher than the city
                      average but justified by the high foot traffic and visibility.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Pricing Strategy Analysis</CardTitle>
                <CardDescription>Optimize your pricing for maximum profitability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Market Positioning</h3>
                    <div className="rounded-md border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-medium">Budget</span>
                        <span className="text-sm font-medium">Premium</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 w-[65%] rounded-full bg-primary"></div>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="h-4 w-4 rounded-full border-2 border-primary bg-background"></div>
                        <span className="ml-2 text-sm">Your restaurant (65th percentile)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Price Comparison by Category</h3>
                    <div className="space-y-4">
                      {[
                        { category: "Appetizers", yourPrice: "$9.50", marketAvg: "$8.75", difference: "+9%" },
                        { category: "Main Courses", yourPrice: "$18.75", marketAvg: "$17.50", difference: "+7%" },
                        { category: "Desserts", yourPrice: "$7.50", marketAvg: "$8.25", difference: "-9%" },
                        { category: "Beverages", yourPrice: "$6.25", marketAvg: "$5.75", difference: "+9%" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md border p-3">
                          <span className="font-medium">{item.category}</span>
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">Your Avg</div>
                              <div className="font-medium">{item.yourPrice}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Market Avg</div>
                              <div className="font-medium">{item.marketAvg}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Difference</div>
                              <div className={`font-medium ${item.difference.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                {item.difference}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pricing Recommendations</CardTitle>
                <CardDescription>Suggested actions based on analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border-l-4 border-primary bg-primary/5 p-4">
                    <h4 className="flex items-center font-medium">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Dessert Pricing Opportunity
                    </h4>
                    <p className="mt-2 text-sm">
                      Your dessert prices are 9% below market average, representing an opportunity to increase margins. Consider raising prices by 5-7%.
                    </p>
                  </div>
                  
                  <div className="rounded-md border-l-4 border-primary bg-primary/5 p-4">
                    <h4 className="flex items-center font-medium">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Bundle Promotion Strategy
                    </h4>
                    <p className="mt-2 text-sm">
                      Create appetizer + entrée bundles to increase average check size by an estimated 15-20%.
                    </p>
                  </div>
                  
                  <div className="rounded-md border-l-4 border-primary bg-primary/5 p-4">
                    <h4 className="flex items-center font-medium">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Premium Menu Section
                    </h4>
                    <p className="mt-2 text-sm">
                      Introduce a "Chef's Specialties" section with 3-4 premium dishes at a 20-30% higher price point.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Analysis</CardTitle>
              <CardDescription>Cost structure and profitability insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Cost Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Food Cost</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[32%] rounded-full bg-amber-500"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Labor</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[28%] rounded-full bg-blue-500"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overhead</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[25%] rounded-full bg-purple-500"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profit Margin</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[15%] rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-4 text-lg font-medium">Profit Optimization</h3>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium">Industry Benchmark</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Average profit margin for similar restaurants: 12-18%
                      </p>
                      <div className="mt-2 text-sm">
                        Your position: <span className="font-medium text-amber-500">Average</span>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h4 className="font-medium">Improvement Potential</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        By implementing our pricing recommendations, you could increase profit margins to 18-20%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Marketing Strategy</CardTitle>
                <CardDescription>Targeted promotion recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-medium">Target Audience Segments</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        {
                          name: "Young Professionals",
                          description: "25-40 years, high disposable income",
                          channels: "Instagram, TikTok",
                          potential: "High"
                        },
                        {
                          name: "Business Clients",
                          description: "Corporate lunches and dinners",
                          channels: "LinkedIn, Email",
                          potential: "Medium"
                        },
                        {
                          name: "Food Enthusiasts",
                          description: "All ages, passionate about cuisine",
                          channels: "Food blogs, Instagram",
                          potential: "Very High"
                        },
                      ].map((segment, i) => (
                        <div key={i} className="rounded-md border p-4">
                          <h4 className="font-medium">{segment.name}</h4>
                          <div className="mt-2 space-y-2 text-sm">
                            <p className="text-muted-foreground">{segment.description}</p>
                            <div>
                              <span className="font-medium">Channels:</span> {segment.channels}
                            </div>
                            <div>
                              <span className="font-medium">Potential:</span> {segment.potential}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="mb-3 text-lg font-medium">Campaign Calendar</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border p-2 text-left">Period</th>
                            <th className="border p-2 text-left">Theme</th>
                            <th className="border p-2 text-left">Channel</th>
                            <th className="border p-2 text-left">Budget</th>
                            <th className="border p-2 text-left">Expected ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">Q1 2024</td>
                            <td className="border p-2">Winter Comfort Menu</td>
                            <td className="border p-2">Social Media, Email</td>
                            <td className="border p-2">$2,500</td>
                            <td className="border p-2">3.2x</td>
                          </tr>
                          <tr>
                            <td className="border p-2">Q2 2024</td>
                            <td className="border p-2">Spring Local Ingredients</td>
                            <td className="border p-2">Local Partnerships, PR</td>
                            <td className="border p-2">$3,500</td>
                            <td className="border p-2">2.8x</td>
                          </tr>
                          <tr>
                            <td className="border p-2">Q3 2024</td>
                            <td className="border p-2">Summer Patio Season</td>
                            <td className="border p-2">Events, Social Media</td>
                            <td className="border p-2">$4,000</td>
                            <td className="border p-2">3.5x</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Digital Presence</CardTitle>
                <CardDescription>Online visibility analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Platform Performance</h3>
                  <div className="space-y-2">
                    {[
                      { platform: "Google Business", score: 4.7, reviews: 124 },
                      { platform: "Yelp", score: 4.2, reviews: 86 },
                      { platform: "TripAdvisor", score: 4.5, reviews: 53 },
                      { platform: "Instagram", followers: "2,450" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border p-3">
                        <span className="text-sm">{item.platform}</span>
                        <div>
                          {item.score ? (
                            <div className="flex items-center">
                              <span className="mr-1 font-medium">{item.score}</span>
                              <span className="text-xs text-muted-foreground">({item.reviews} reviews)</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="font-medium">{item.followers}</span>
                              <span className="ml-1 text-xs text-muted-foreground">followers</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-medium">Action Items</h3>
                  <div className="space-y-2">
                    {[
                      "Increase post frequency on Instagram (3-4 times weekly)",
                      "Respond to all new Google reviews within 24 hours",
                      "Create a content calendar for seasonal promotions",
                      "Implement email marketing for loyal customers"
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-md border p-3">
                        <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-primary"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Loyalty & Retention</CardTitle>
              <CardDescription>Customer retention strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Program Recommendations</h3>
                  <div className="rounded-md border p-4">
                    <h4 className="font-medium">Digital Loyalty Program</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Implement a points-based digital loyalty program where customers earn 1 point per dollar spent.
                      Every 100 points can be redeemed for $10 off. Estimated cost: $1,800 setup + $250/month.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Expected impact: 22% increase in repeat customer visits within 6 months.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-4 text-lg font-medium">Special Events Calendar</h3>
                  <div className="space-y-3">
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Wine Tasting Tuesdays</h4>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Monthly</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Italian wine flight paired with appetizer samples
                      </p>
                    </div>
                    
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Chef's Table Experience</h4>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Bi-monthly</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Exclusive tasting menu with chef interaction
                      </p>
                    </div>
                    
                    <div className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Italian Cooking Classes</h4>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Quarterly</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Weekend afternoon classes with take-home recipes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

