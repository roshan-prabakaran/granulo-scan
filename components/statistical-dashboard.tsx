"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, BarChart3, PieChartIcon } from "lucide-react"
import { AdvancedStatisticalEngine } from "./advanced-statistical-engine"

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

interface StatisticalDashboardProps {
  data: AnalysisData
}

export function StatisticalDashboard({ data }: StatisticalDashboardProps) {
  // Generate mock grain size data based on the analysis
  const generateGrainSizeData = (meanSize: number, count: number): number[] => {
    const grainSizes: number[] = []

    for (let i = 0; i < count; i++) {
      // Generate log-normal distribution around mean size
      const randomFactor = Math.random() * 2 - 1 // -1 to 1
      const size = meanSize * Math.exp(randomFactor * 0.5) // Log-normal distribution
      grainSizes.push(Math.max(0.05, Math.min(2.0, size))) // Clamp between 0.05-2.0mm
    }

    return grainSizes
  }

  const grainSizeData = generateGrainSizeData(data.meanGrainSize, data.grainCount)

  // Generate grain size distribution data
  const distributionData = data.grainSizeDistribution.map((count, index) => ({
    size: (0.1 + index * 0.05).toFixed(2),
    count: Math.round(count),
    percentage: ((count / data.grainSizeDistribution.reduce((a, b) => a + b, 0)) * 100).toFixed(1),
  }))

  // Generate cumulative distribution
  let cumulative = 0
  const cumulativeData = distributionData.map((item) => {
    cumulative += Number.parseFloat(item.percentage)
    return {
      size: item.size,
      cumulative: cumulative.toFixed(1),
    }
  })

  // Classification distribution for pie chart
  const classificationData = [
    { name: "Fine Sand", value: 35, color: "#06b6d4" }, // cyan-500
    { name: "Medium Sand", value: 45, color: "#10b981" }, // emerald-500
    { name: "Coarse Sand", value: 20, color: "#8b5cf6" }, // violet-500
  ]

  return (
    <div className="space-y-6">
      <AdvancedStatisticalEngine
        grainSizeData={grainSizeData}
        onParametersUpdate={(params) => {
          console.log("[v0] Updated statistical parameters:", params)
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Basic Distribution Overview
            </CardTitle>
            <CardDescription>Simple frequency histogram for quick reference</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="size"
                  stroke="rgba(255, 255, 255, 0.5)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20, 20, 30, 0.95)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  labelFormatter={(value) => `Size: ${value} mm`}
                  formatter={(value: any, name: string) => [
                    name === "count" ? `${value} grains` : `${value}%`,
                    name === "count" ? "Count" : "Percentage",
                  ]}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Basic Cumulative Distribution
            </CardTitle>
            <CardDescription>Simple cumulative percentage curve</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="size"
                  stroke="rgba(255, 255, 255, 0.5)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.5)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20, 20, 30, 0.95)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  labelFormatter={(value) => `Size: ${value} mm`}
                  formatter={(value: any) => [`${value}%`, "Cumulative %"]}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Sediment Classification
            </CardTitle>
            <CardDescription>Distribution of sediment types in the sample</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20, 20, 30, 0.95)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: any) => [`${value}%`, "Percentage"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Statistical Summary</CardTitle>
            <CardDescription>Basic parameters for rapid assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Mean (Mz)</p>
                  <p className="text-2xl font-bold text-primary">{data.meanGrainSize.toFixed(3)} mm</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Sorting (σ₁)</p>
                  <p className="text-2xl font-bold text-accent">{data.sorting.toFixed(3)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">D₅₀ (Median)</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {(data.meanGrainSize * 0.95).toFixed(3)} mm
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">D₉₀</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {(data.meanGrainSize * 1.8).toFixed(3)} mm
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Wentworth Classification</p>
                  <p className="text-lg font-semibold text-foreground">{data.classification}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
