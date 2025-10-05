"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Microscope, Ruler, Hash, MapPin, Clock } from "lucide-react"

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

interface GrainAnalysisResultsProps {
  data: AnalysisData
}

export function GrainAnalysisResults({ data }: GrainAnalysisResultsProps) {
  const formatGrainSize = (size: number) => `${size.toFixed(3)} mm`
  const formatSorting = (sorting: number) => {
    if (sorting < 0.5) return "Very Well Sorted"
    if (sorting < 1.0) return "Well Sorted"
    if (sorting < 2.0) return "Moderately Sorted"
    if (sorting < 4.0) return "Poorly Sorted"
    return "Very Poorly Sorted"
  }

  const getSortingColor = (sorting: number) => {
    if (sorting < 1.0) return "bg-accent"
    if (sorting < 2.0) return "bg-primary"
    return "bg-destructive"
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ruler className="w-5 h-5 text-primary" />
            Mean Grain Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">{formatGrainSize(data.meanGrainSize)}</div>
            <Badge variant="secondary">{data.classification}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Microscope className="w-5 h-5 text-primary" />
            Sorting Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-foreground">σ = {data.sorting.toFixed(2)}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sorting</span>
                <span className="font-medium">{formatSorting(data.sorting)}</span>
              </div>
              <Progress
                value={Math.min((data.sorting / 4) * 100, 100)}
                className={`h-2 ${getSortingColor(data.sorting)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="w-5 h-5 text-primary" />
            Grain Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">{data.grainCount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Individual grains detected</p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Sample Metadata
          </CardTitle>
          <CardDescription>Location and timing information for this analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Coordinates</p>
              <p className="text-sm text-muted-foreground">
                {data.coordinates
                  ? `${data.coordinates.lat.toFixed(6)}, ${data.coordinates.lng.toFixed(6)}`
                  : "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Timestamp</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Analysis Method</p>
              <p className="text-sm text-muted-foreground">Automated Computer Vision</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
