"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, TrendingUp, BarChart3, MapPin, Calendar } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

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

interface SampleComparisonProps {
  samples: AnalysisData[]
  onAddSample?: () => void
  onRemoveSample?: (index: number) => void
}

export function SampleComparison({ samples, onAddSample, onRemoveSample }: SampleComparisonProps) {
  const [activeView, setActiveView] = useState<"table" | "charts">("table")

  const comparisonData = samples.map((sample, index) => ({
    name: `Sample ${index + 1}`,
    meanSize: sample.meanGrainSize,
    sorting: sample.sorting,
    grainCount: sample.grainCount,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Sample Comparison
            </CardTitle>
            <CardDescription>Compare multiple sediment samples side by side</CardDescription>
          </div>
          {onAddSample && (
            <Button onClick={onAddSample} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Sample
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "table" | "charts")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="charts">Chart View</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Sample</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Mean Size</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Sorting</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Classification</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    {onRemoveSample && <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {samples.map((sample, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded overflow-hidden border border-border">
                            <img
                              src={sample.imageUrl || "/placeholder.svg"}
                              alt={`Sample ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">Sample {index + 1}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono">{sample.meanGrainSize.toFixed(3)} mm</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono">{sample.sorting.toFixed(3)} φ</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{sample.classification}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {sample.coordinates?.lat.toFixed(4)}, {sample.coordinates?.lng.toFixed(4)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(sample.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      {onRemoveSample && (
                        <td className="p-3">
                          <Button
                            onClick={() => onRemoveSample(index)}
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {samples.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No samples to compare yet</p>
                <p className="text-sm">Add samples to see comparison data</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Mean Grain Size Comparison</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.5)"
                      fontSize={12}
                      label={{
                        value: "Size (mm)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "rgba(255, 255, 255, 0.5)",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.95)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="meanSize" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Sorting Coefficient Comparison</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.5)"
                      fontSize={12}
                      label={{
                        value: "Sorting (φ)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "rgba(255, 255, 255, 0.5)",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.95)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sorting"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Average Mean Size</div>
                  <div className="text-2xl font-bold">
                    {(samples.reduce((acc, s) => acc + s.meanGrainSize, 0) / samples.length).toFixed(3)} mm
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Size Range</div>
                  <div className="text-2xl font-bold">
                    {(
                      Math.max(...samples.map((s) => s.meanGrainSize)) -
                      Math.min(...samples.map((s) => s.meanGrainSize))
                    ).toFixed(3)}{" "}
                    mm
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Grains</div>
                  <div className="text-2xl font-bold">
                    {samples.reduce((acc, s) => acc + s.grainCount, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
