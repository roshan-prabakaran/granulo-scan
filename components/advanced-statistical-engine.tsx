"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts"
import { Calculator, TrendingUp, Sigma, Download } from "lucide-react"

interface GrainData {
  size: number // in mm
  frequency: number
  cumulativePercent: number
}

interface StatisticalParameters {
  // Folk and Ward Parameters
  meanSize: number // Mz (phi units)
  medianSize: number // D50
  sorting: number // σI (inclusive graphic standard deviation)
  skewness: number // SkI (inclusive graphic skewness)
  kurtosis: number // KG (graphic kurtosis)

  // Percentiles
  d10: number
  d16: number
  d25: number
  d50: number
  d75: number
  d84: number
  d90: number

  // Additional parameters
  uniformityCoefficient: number // Cu = D60/D10
  curvatureCoefficient: number // Cc = (D30)²/(D60×D10)

  // Classification
  wentworth: string
  folkWard: string
  sortingDescription: string
  skewnessDescription: string
  kurtosisDescription: string
}

interface AdvancedStatisticalEngineProps {
  grainSizeData: number[] // Array of grain sizes in mm
  onParametersUpdate?: (params: StatisticalParameters) => void
}

export function AdvancedStatisticalEngine({ grainSizeData, onParametersUpdate }: AdvancedStatisticalEngineProps) {
  const [binCount, setBinCount] = useState(20)
  const [useLogScale, setUseLogScale] = useState(true)
  const [showPercentiles, setShowPercentiles] = useState(true)
  const [activeMethod, setActiveMethod] = useState("folk-ward")

  // Convert mm to phi units (phi = -log2(mm))
  const mmToPhi = (mm: number) => -Math.log2(mm)
  const phiToMm = (phi: number) => Math.pow(2, -phi)

  // Generate grain size distribution
  const grainDistribution = useMemo(() => {
    if (!grainSizeData || grainSizeData.length === 0) return []

    const minSize = Math.min(...grainSizeData)
    const maxSize = Math.max(...grainSizeData)
    const binWidth = (maxSize - minSize) / binCount

    const bins: GrainData[] = []
    let cumulativeCount = 0

    for (let i = 0; i < binCount; i++) {
      const binStart = minSize + i * binWidth
      const binEnd = binStart + binWidth
      const binCenter = (binStart + binEnd) / 2

      const frequency = grainSizeData.filter((size) => size >= binStart && size < binEnd).length
      cumulativeCount += frequency

      bins.push({
        size: binCenter,
        frequency,
        cumulativePercent: (cumulativeCount / grainSizeData.length) * 100,
      })
    }

    return bins
  }, [grainSizeData, binCount])

  // Calculate statistical parameters
  const statisticalParams = useMemo((): StatisticalParameters => {
    if (!grainSizeData || grainSizeData.length === 0) {
      return {
        meanSize: 0,
        medianSize: 0,
        sorting: 0,
        skewness: 0,
        kurtosis: 0,
        d10: 0,
        d16: 0,
        d25: 0,
        d50: 0,
        d75: 0,
        d84: 0,
        d90: 0,
        uniformityCoefficient: 0,
        curvatureCoefficient: 0,
        wentworth: "Unknown",
        folkWard: "Unknown",
        sortingDescription: "Unknown",
        skewnessDescription: "Unknown",
        kurtosisDescription: "Unknown",
      }
    }

    const sortedSizes = [...grainSizeData].sort((a, b) => a - b)
    const n = sortedSizes.length

    // Calculate percentiles
    const getPercentile = (p: number) => {
      const index = (p / 100) * (n - 1)
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      const weight = index - lower

      if (upper >= n) return sortedSizes[n - 1]
      if (lower < 0) return sortedSizes[0]

      return sortedSizes[lower] * (1 - weight) + sortedSizes[upper] * weight
    }

    const d10 = getPercentile(10)
    const d16 = getPercentile(16)
    const d25 = getPercentile(25)
    const d50 = getPercentile(50) // Median
    const d75 = getPercentile(75)
    const d84 = getPercentile(84)
    const d90 = getPercentile(90)
    const d30 = getPercentile(30)
    const d60 = getPercentile(60)
    const phi5 = mmToPhi(getPercentile(5))
    const phi95 = mmToPhi(getPercentile(95))
    const phi16 = mmToPhi(d16)
    const phi50 = mmToPhi(d50)
    const phi84 = mmToPhi(d84)
    const phi75 = mmToPhi(d75)
    const phi25 = mmToPhi(d25)

    // Folk and Ward parameters
    const meanSize = (phi16 + phi50 + phi84) / 3 // Mz
    const sorting = (phi84 - phi16) / 4 + (phi95 - phi5) / 6.6 // σI
    const skewness =
      (phi16 + phi84 - 2 * phi50) / (2 * (phi84 - phi16)) + (phi5 + phi95 - 2 * phi50) / (2 * (phi95 - phi5)) // SkI
    const kurtosis = (phi95 - phi5) / (2.44 * (phi75 - phi25)) // KG

    // Additional coefficients
    const uniformityCoefficient = d60 / d10
    const curvatureCoefficient = (d30 * d30) / (d60 * d10)

    // Classifications
    const getWentworthClass = (size: number) => {
      if (size < 0.0625) return "Silt"
      if (size < 0.125) return "Very Fine Sand"
      if (size < 0.25) return "Fine Sand"
      if (size < 0.5) return "Medium Sand"
      if (size < 1.0) return "Coarse Sand"
      if (size < 2.0) return "Very Coarse Sand"
      return "Granule"
    }

    const getSortingDescription = (sorting: number) => {
      if (sorting < 0.35) return "Very Well Sorted"
      if (sorting < 0.5) return "Well Sorted"
      if (sorting < 0.71) return "Moderately Well Sorted"
      if (sorting < 1.0) return "Moderately Sorted"
      if (sorting < 2.0) return "Poorly Sorted"
      if (sorting < 4.0) return "Very Poorly Sorted"
      return "Extremely Poorly Sorted"
    }

    const getSkewnessDescription = (skewness: number) => {
      if (skewness < -0.3) return "Very Coarse Skewed"
      if (skewness < -0.1) return "Coarse Skewed"
      if (skewness < 0.1) return "Near Symmetrical"
      if (skewness < 0.3) return "Fine Skewed"
      return "Very Fine Skewed"
    }

    const getKurtosisDescription = (kurtosis: number) => {
      if (kurtosis < 0.67) return "Very Platykurtic"
      if (kurtosis < 0.9) return "Platykurtic"
      if (kurtosis < 1.11) return "Mesokurtic"
      if (kurtosis < 1.5) return "Leptokurtic"
      if (kurtosis < 3.0) return "Very Leptokurtic"
      return "Extremely Leptokurtic"
    }

    const params: StatisticalParameters = {
      meanSize,
      medianSize: d50,
      sorting,
      skewness,
      kurtosis,
      d10,
      d16,
      d25,
      d50,
      d75,
      d84,
      d90,
      uniformityCoefficient,
      curvatureCoefficient,
      wentworth: getWentworthClass(d50),
      folkWard: `${getSortingDescription(sorting)} ${getWentworthClass(d50)}`,
      sortingDescription: getSortingDescription(sorting),
      skewnessDescription: getSkewnessDescription(skewness),
      kurtosisDescription: getKurtosisDescription(kurtosis),
    }

    return params
  }, [grainSizeData])

  // Update parent component when parameters change
  useEffect(() => {
    if (onParametersUpdate) {
      onParametersUpdate(statisticalParams)
    }
  }, [statisticalParams, onParametersUpdate])

  const exportData = () => {
    const data = {
      grainSizeDistribution: grainDistribution,
      statisticalParameters: statisticalParams,
      metadata: {
        binCount,
        useLogScale,
        analysisMethod: activeMethod,
        timestamp: new Date().toISOString(),
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grainscan-analysis-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Statistical Analysis Engine
          </CardTitle>
          <CardDescription>Advanced sedimentological analysis using Folk and Ward parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Bin Count: {binCount}</Label>
              <Slider value={[binCount]} onValueChange={(value) => setBinCount(value[0])} min={10} max={50} step={1} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="log-scale" checked={useLogScale} onCheckedChange={setUseLogScale} />
              <Label htmlFor="log-scale">Log Scale</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="percentiles" checked={showPercentiles} onCheckedChange={setShowPercentiles} />
              <Label htmlFor="percentiles">Show Percentiles</Label>
            </div>

            <Button onClick={exportData} variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistical Parameters */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sigma className="w-5 h-5 text-primary" />
              Folk & Ward Parameters
            </CardTitle>
            <CardDescription>Standard sedimentological statistical measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Mean Size (Mz)</p>
                <p className="text-2xl font-bold text-primary">{statisticalParams.meanSize.toFixed(3)} φ</p>
                <p className="text-xs text-muted-foreground">{statisticalParams.medianSize.toFixed(3)} mm</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Sorting (σI)</p>
                <p className="text-2xl font-bold text-accent">{statisticalParams.sorting.toFixed(3)}</p>
                <Badge variant="secondary" className="text-xs">
                  {statisticalParams.sortingDescription}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Skewness (SkI)</p>
                <p className="text-lg font-semibold text-foreground">{statisticalParams.skewness.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">{statisticalParams.skewnessDescription}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Kurtosis (KG)</p>
                <p className="text-lg font-semibold text-foreground">{statisticalParams.kurtosis.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">{statisticalParams.kurtosisDescription}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Classification</p>
                <Badge variant="default" className="mr-2">
                  {statisticalParams.wentworth}
                </Badge>
                <Badge variant="outline">{statisticalParams.folkWard}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Percentile Analysis
            </CardTitle>
            <CardDescription>Key percentile values and engineering parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center p-2 bg-muted rounded">
                <p className="font-medium">D10</p>
                <p className="text-lg font-bold text-chart-1">{statisticalParams.d10.toFixed(3)}</p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="font-medium">D50</p>
                <p className="text-lg font-bold text-chart-2">{statisticalParams.d50.toFixed(3)}</p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="font-medium">D90</p>
                <p className="text-lg font-bold text-chart-3">{statisticalParams.d90.toFixed(3)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uniformity Coefficient (Cu)</span>
                <Badge variant="outline">{statisticalParams.uniformityCoefficient.toFixed(2)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Curvature Coefficient (Cc)</span>
                <Badge variant="outline">{statisticalParams.curvatureCoefficient.toFixed(2)}</Badge>
              </div>
            </div>

            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              <p>
                Cu {">"} 4: Well graded | 1 {"<"} Cc {"<"} 3: Good gradation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Visualizations */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribution">Size Distribution</TabsTrigger>
          <TabsTrigger value="cumulative">Cumulative Curve</TabsTrigger>
          <TabsTrigger value="probability">Probability Plot</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Grain Size Distribution</CardTitle>
              <CardDescription>Frequency histogram with statistical overlays</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={grainDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis
                    dataKey="size"
                    stroke="rgba(255, 255, 255, 0.5)"
                    fontSize={12}
                    tickFormatter={(value) => `${value.toFixed(2)}`}
                  />
                  <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.95)",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any, name: string) => [`${value} grains`, "Frequency"]}
                    labelFormatter={(value) => `Size: ${value} mm`}
                  />
                  <Bar dataKey="frequency" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  {showPercentiles && (
                    <>
                      <ReferenceLine x={statisticalParams.d50} stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine x={statisticalParams.d16} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} />
                      <ReferenceLine x={statisticalParams.d84} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cumulative">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Distribution Curve</CardTitle>
              <CardDescription>Cumulative percentage vs grain size with percentile markers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={grainDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis
                    dataKey="size"
                    stroke="rgba(255, 255, 255, 0.5)"
                    fontSize={12}
                    scale={useLogScale ? "log" : "linear"}
                    domain={useLogScale ? ["dataMin", "dataMax"] : undefined}
                  />
                  <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.95)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="cumulativePercent" stroke="#10b981" strokeWidth={3} dot={false} />
                  {showPercentiles && (
                    <>
                      <ReferenceLine y={50} stroke="#06b6d4" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine y={16} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} />
                      <ReferenceLine y={84} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="probability">
          <Card>
            <CardHeader>
              <CardTitle>Probability Plot</CardTitle>
              <CardDescription>Log-probability plot for distribution analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={grainDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis
                    dataKey="size"
                    stroke="rgba(255, 255, 255, 0.5)"
                    fontSize={12}
                    scale="log"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis
                    dataKey="cumulativePercent"
                    stroke="rgba(255, 255, 255, 0.5)"
                    fontSize={12}
                    domain={[1, 99]}
                    scale="log"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Scatter dataKey="cumulativePercent" fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
