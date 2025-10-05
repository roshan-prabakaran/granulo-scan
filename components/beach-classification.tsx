"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Waves,
  Mountain,
  Compass,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  MapPin,
  Wind,
  Thermometer,
} from "lucide-react"

interface AnalysisData {
  meanGrainSize: number
  sorting: number
  grainCount: number
  classification: string
  coordinates?: { lat: number; lng: number }
  timestamp: string
  imageUrl: string
  grainSizeDistribution: number[]
}

interface BeachClassificationProps {
  data: AnalysisData
}

interface ClassificationResult {
  wentworth: string
  folk: string
  shepard: string
  morphodynamic: string
  energyLevel: string
  stability: string
  erosionRisk: string
  managementRecommendations: string[]
  environmentalImplications: string[]
}

export function BeachClassification({ data }: BeachClassificationProps) {
  const [activeScheme, setActiveScheme] = useState("comprehensive")

  // Calculate comprehensive beach classification
  const classification = useMemo((): ClassificationResult => {
    const meanSize = data.meanGrainSize
    const sorting = data.sorting

    // Wentworth Scale Classification
    const getWentworthClass = (size: number): string => {
      if (size < 0.0625) return "Silt"
      if (size < 0.125) return "Very Fine Sand"
      if (size < 0.25) return "Fine Sand"
      if (size < 0.5) return "Medium Sand"
      if (size < 1.0) return "Coarse Sand"
      if (size < 2.0) return "Very Coarse Sand"
      if (size < 4.0) return "Granule"
      return "Pebble"
    }

    // Folk Classification (texture-based)
    const getFolkClass = (size: number, sorting: number): string => {
      const baseClass = getWentworthClass(size)
      if (sorting < 0.5) return `Well-Sorted ${baseClass}`
      if (sorting < 1.0) return `Moderately Sorted ${baseClass}`
      if (sorting < 2.0) return `Poorly Sorted ${baseClass}`
      return `Very Poorly Sorted ${baseClass}`
    }

    // Shepard Classification (simplified ternary)
    const getShepardClass = (size: number): string => {
      if (size < 0.0625) return "Mud"
      if (size < 2.0) return "Sand"
      return "Gravel"
    }

    // Morphodynamic Classification (Dean's Parameter approximation)
    const getMorphodynamicClass = (size: number): string => {
      // Simplified Dean's parameter calculation (Ω = Hb/(ws*T))
      // Assuming typical wave conditions for classification
      const fallVelocity = size * size * 9.8 // Simplified Stokes law approximation
      const omega = 1.5 / (fallVelocity * 10) // Assumed wave height 1.5m, period 10s

      if (omega < 1) return "Reflective"
      if (omega < 6) return "Intermediate"
      return "Dissipative"
    }

    // Energy Level Assessment
    const getEnergyLevel = (size: number, sorting: number): string => {
      if (size > 1.0 && sorting < 1.0) return "High Energy"
      if (size > 0.5 && sorting < 1.5) return "Moderate-High Energy"
      if (size > 0.25 && sorting < 2.0) return "Moderate Energy"
      if (size > 0.125) return "Low-Moderate Energy"
      return "Low Energy"
    }

    // Stability Assessment
    const getStability = (size: number, sorting: number): string => {
      if (size > 0.5 && sorting < 1.0) return "Stable"
      if (size > 0.25 && sorting < 1.5) return "Moderately Stable"
      if (size > 0.125 && sorting < 2.0) return "Moderately Unstable"
      return "Unstable"
    }

    // Erosion Risk Assessment
    const getErosionRisk = (size: number, sorting: number): string => {
      if (size < 0.125) return "Very High"
      if (size < 0.25 && sorting > 1.5) return "High"
      if (size < 0.5 && sorting > 1.0) return "Moderate"
      if (size < 1.0) return "Low"
      return "Very Low"
    }

    // Management Recommendations
    const getManagementRecommendations = (size: number, sorting: number, erosionRisk: string): string[] => {
      const recommendations: string[] = []

      if (erosionRisk === "Very High" || erosionRisk === "High") {
        recommendations.push("Implement beach nourishment programs")
        recommendations.push("Consider soft engineering solutions (dune restoration)")
        recommendations.push("Monitor shoreline changes frequently")
        recommendations.push("Restrict heavy recreational activities")
      }

      if (size < 0.25) {
        recommendations.push("Protect from wind erosion with vegetation")
        recommendations.push("Limit vehicle access to prevent compaction")
      }

      if (sorting > 1.5) {
        recommendations.push("Monitor sediment transport patterns")
        recommendations.push("Consider sediment trapping structures")
      }

      if (size > 0.5) {
        recommendations.push("Suitable for recreational activities")
        recommendations.push("Natural storm protection capabilities")
      }

      return recommendations
    }

    // Environmental Implications
    const getEnvironmentalImplications = (size: number, morphodynamic: string): string[] => {
      const implications: string[] = []

      if (morphodynamic === "Dissipative") {
        implications.push("High wave energy dissipation")
        implications.push("Good habitat for surf zone organisms")
        implications.push("Natural coastal protection")
      }

      if (morphodynamic === "Reflective") {
        implications.push("Low biological productivity in surf zone")
        implications.push("High wave reflection - potential scour")
        implications.push("Suitable for nesting sea turtles")
      }

      if (size < 0.25) {
        implications.push("Important habitat for infaunal organisms")
        implications.push("High water retention capacity")
        implications.push("Sensitive to pollution retention")
      }

      if (size > 0.5) {
        implications.push("Good drainage and oxygenation")
        implications.push("Suitable for epifaunal communities")
        implications.push("Natural filtration capabilities")
      }

      return implications
    }

    const wentworth = getWentworthClass(meanSize)
    const folk = getFolkClass(meanSize, sorting)
    const shepard = getShepardClass(meanSize)
    const morphodynamic = getMorphodynamicClass(meanSize)
    const energyLevel = getEnergyLevel(meanSize, sorting)
    const stability = getStability(meanSize, sorting)
    const erosionRisk = getErosionRisk(meanSize, sorting)

    return {
      wentworth,
      folk,
      shepard,
      morphodynamic,
      energyLevel,
      stability,
      erosionRisk,
      managementRecommendations: getManagementRecommendations(meanSize, sorting, erosionRisk),
      environmentalImplications: getEnvironmentalImplications(meanSize, morphodynamic),
    }
  }, [data])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Very High":
        return "destructive"
      case "High":
        return "destructive"
      case "Moderate":
        return "secondary"
      case "Low":
        return "accent"
      case "Very Low":
        return "accent"
      default:
        return "secondary"
    }
  }

  const getStabilityIcon = (stability: string) => {
    if (stability.includes("Stable")) return <CheckCircle className="w-4 h-4" />
    if (stability.includes("Unstable")) return <AlertTriangle className="w-4 h-4" />
    return <Info className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Classification Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-primary" />
            Beach Classification System
          </CardTitle>
          <CardDescription>
            Comprehensive sedimentological and morphodynamic classification based on grain size analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Compass className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-foreground">{classification.wentworth}</p>
              <p className="text-sm text-muted-foreground">Wentworth Scale</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Waves className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="font-semibold text-foreground">{classification.morphodynamic}</p>
              <p className="text-sm text-muted-foreground">Beach State</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Wind className="w-8 h-8 mx-auto mb-2 text-chart-3" />
              <p className="font-semibold text-foreground">{classification.energyLevel}</p>
              <p className="text-sm text-muted-foreground">Energy Level</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              {getStabilityIcon(classification.stability)}
              <p className="font-semibold text-foreground mt-2">{classification.stability}</p>
              <p className="text-sm text-muted-foreground">Stability</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Classifications */}
      <Tabs value={activeScheme} onValueChange={setActiveScheme} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comprehensive">Overview</TabsTrigger>
          <TabsTrigger value="morphodynamic">Beach State</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sediment Classification</CardTitle>
                <CardDescription>Multiple classification schemes for comprehensive analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Wentworth Scale:</span>
                    <Badge variant="default">{classification.wentworth}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Folk Classification:</span>
                    <Badge variant="secondary">{classification.folk}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Shepard Classification:</span>
                    <Badge variant="outline">{classification.shepard}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Physical Properties</CardTitle>
                <CardDescription>Beach characteristics and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Energy Level:</span>
                    <Badge variant="secondary">{classification.energyLevel}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Stability:</span>
                    <Badge variant="outline">{classification.stability}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Erosion Risk:</span>
                    <Badge variant={getRiskColor(classification.erosionRisk)}>{classification.erosionRisk}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Risk Assessment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Erosion Risk Level</span>
                      <Badge variant={getRiskColor(classification.erosionRisk)}>{classification.erosionRisk}</Badge>
                    </div>
                    <Progress
                      value={
                        classification.erosionRisk === "Very High"
                          ? 100
                          : classification.erosionRisk === "High"
                            ? 80
                            : classification.erosionRisk === "Moderate"
                              ? 60
                              : classification.erosionRisk === "Low"
                                ? 40
                                : 20
                      }
                      className="h-2"
                    />
                  </div>
                </div>

                {classification.erosionRisk === "Very High" || classification.erosionRisk === "High" ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This beach shows high erosion susceptibility. Immediate monitoring and potential intervention may
                      be required.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Beach stability appears adequate under normal conditions. Continue regular monitoring.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="morphodynamic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-primary" />
                Morphodynamic Classification
              </CardTitle>
              <CardDescription>
                Beach state classification based on wave energy and sediment characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">{classification.morphodynamic}</div>
                <p className="text-muted-foreground">Beach State</p>
              </div>

              <div className="space-y-4">
                {classification.morphodynamic === "Reflective" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Reflective Beach Characteristics:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Steep beach face with coarse sediment</li>
                      <li>• High wave reflection, low energy dissipation</li>
                      <li>• Narrow surf zone with plunging breakers</li>
                      <li>• Stable beach profile under normal conditions</li>
                    </ul>
                  </div>
                )}

                {classification.morphodynamic === "Intermediate" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Intermediate Beach Characteristics:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Moderate beach slope with mixed sediment</li>
                      <li>• Variable wave breaking patterns</li>
                      <li>• Moderate surf zone width</li>
                      <li>• Dynamic equilibrium with seasonal changes</li>
                    </ul>
                  </div>
                )}

                {classification.morphodynamic === "Dissipative" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Dissipative Beach Characteristics:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Gentle slope with fine sediment</li>
                      <li>• High energy dissipation across wide surf zone</li>
                      <li>• Spilling breakers with multiple bar systems</li>
                      <li>• Natural wave energy buffer</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Coastal Management Recommendations
              </CardTitle>
              <CardDescription>Evidence-based management strategies for this beach type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classification.managementRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Priority Actions
                </h4>
                <div className="text-sm text-muted-foreground">
                  {classification.erosionRisk === "Very High" || classification.erosionRisk === "High" ? (
                    <p>
                      High priority: Implement immediate erosion control measures and establish monitoring protocols.
                    </p>
                  ) : classification.erosionRisk === "Moderate" ? (
                    <p>Medium priority: Establish regular monitoring and prepare contingency plans.</p>
                  ) : (
                    <p>Low priority: Maintain current management practices with periodic assessment.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-primary" />
                Environmental Implications
              </CardTitle>
              <CardDescription>Ecological and environmental considerations for this beach type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classification.environmentalImplications.map((implication, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{implication}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2">Habitat Suitability</h4>
                  <p className="text-sm text-muted-foreground">
                    {data.meanGrainSize < 0.25
                      ? "Excellent for burrowing organisms and infaunal communities"
                      : data.meanGrainSize > 0.5
                        ? "Good for epifaunal organisms and mobile species"
                        : "Moderate habitat diversity with mixed communities"}
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2">Conservation Value</h4>
                  <p className="text-sm text-muted-foreground">
                    {classification.morphodynamic === "Dissipative"
                      ? "High conservation value - important for coastal protection"
                      : classification.morphodynamic === "Reflective"
                        ? "Moderate conservation value - specialized habitat"
                        : "Variable conservation value - dynamic system"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
