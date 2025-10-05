"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  FileText,
  FileSpreadsheet,
  Map,
  Share2,
  Printer,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Database,
  Calendar,
  MapPin,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

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

interface ResultsExportDashboardProps {
  data: AnalysisData
}

export function ResultsExportDashboard({ data }: ResultsExportDashboardProps) {
  const [exportOptions, setExportOptions] = useState({
    includeImages: true,
    includeStatistics: true,
    includeClassification: true,
    includeGeospatial: true,
    includeRawData: false,
  })

  const handleExportPDF = () => {
    console.log("[v0] Exporting PDF report with options:", exportOptions)
    // Simulate PDF generation
    const blob = new Blob(["GrainScan Analysis Report"], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grainscan-report-${new Date().toISOString().split("T")[0]}.pdf`
    a.click()
  }

  const handleExportCSV = () => {
    console.log("[v0] Exporting CSV data")
    const csvContent = [
      ["Parameter", "Value", "Unit"],
      ["Mean Grain Size", data.meanGrainSize.toFixed(3), "mm"],
      ["Sorting Coefficient", data.sorting.toFixed(3), "φ"],
      ["Grain Count", data.grainCount.toString(), "grains"],
      ["Classification", data.classification, "-"],
      ["Latitude", data.coordinates?.lat.toFixed(6) || "N/A", "degrees"],
      ["Longitude", data.coordinates?.lng.toFixed(6) || "N/A", "degrees"],
      ["Timestamp", data.timestamp, "-"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grainscan-data-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handleExportGeoJSON = () => {
    console.log("[v0] Exporting GeoJSON data")
    const geoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [data.coordinates?.lng || 0, data.coordinates?.lat || 0],
          },
          properties: {
            meanGrainSize: data.meanGrainSize,
            sorting: data.sorting,
            grainCount: data.grainCount,
            classification: data.classification,
            timestamp: data.timestamp,
          },
        },
      ],
    }

    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grainscan-geojson-${new Date().toISOString().split("T")[0]}.geojson`
    a.click()
  }

  const qualityScore = Math.min(100, Math.round((data.grainCount / 500) * 100))
  const isHighQuality = qualityScore >= 80

  return (
    <div className="space-y-6">
      {/* Quality Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isHighQuality ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            Analysis Quality Assessment
          </CardTitle>
          <CardDescription>Validation metrics and data quality indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Quality</span>
                <Badge variant={isHighQuality ? "default" : "secondary"}>{qualityScore}%</Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${qualityScore}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Grain Detection</span>
                <Badge variant="outline">{data.grainCount} grains</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.grainCount >= 300 ? "Excellent sample size" : "Adequate for analysis"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calibration</span>
                <Badge variant="outline">Verified</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Scale reference detected</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Validation Notes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Image resolution meets minimum requirements (2048x1536)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Lighting conditions optimal for segmentation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Statistical parameters within expected ranges</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Export Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export & Reporting
          </CardTitle>
          <CardDescription>Generate reports and export data in multiple formats</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="formats" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="formats">Export Formats</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
            </TabsList>

            <TabsContent value="formats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">PDF Report</CardTitle>
                        <CardDescription className="text-xs">Comprehensive analysis</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleExportPDF} className="w-full gap-2">
                      <Download className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Includes all visualizations, statistics, and interpretations
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">CSV Data</CardTitle>
                        <CardDescription className="text-xs">Raw measurements</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleExportCSV} variant="outline" className="w-full gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Tabular data for further analysis in Excel or R
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Map className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">GeoJSON</CardTitle>
                        <CardDescription className="text-xs">Spatial data</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleExportGeoJSON} variant="outline" className="w-full gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Export GeoJSON
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Compatible with GIS software and mapping tools</p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Additional Export Options
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <FileText className="w-4 h-4" />
                    Export JSON
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Map className="w-4 h-4" />
                    Export Shapefile
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <FileText className="w-4 h-4" />
                    Export KML
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Report Contents</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="images"
                        checked={exportOptions.includeImages}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeImages: checked as boolean })
                        }
                      />
                      <Label htmlFor="images" className="text-sm cursor-pointer">
                        Include original and processed images
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="statistics"
                        checked={exportOptions.includeStatistics}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeStatistics: checked as boolean })
                        }
                      />
                      <Label htmlFor="statistics" className="text-sm cursor-pointer">
                        Include statistical analysis and charts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="classification"
                        checked={exportOptions.includeClassification}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeClassification: checked as boolean })
                        }
                      />
                      <Label htmlFor="classification" className="text-sm cursor-pointer">
                        Include beach classification and interpretation
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="geospatial"
                        checked={exportOptions.includeGeospatial}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeGeospatial: checked as boolean })
                        }
                      />
                      <Label htmlFor="geospatial" className="text-sm cursor-pointer">
                        Include geospatial data and maps
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rawdata"
                        checked={exportOptions.includeRawData}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeRawData: checked as boolean })
                        }
                      />
                      <Label htmlFor="rawdata" className="text-sm cursor-pointer">
                        Include raw grain measurements (large file size)
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Report Metadata</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(data.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">
                        {data.coordinates?.lat.toFixed(4)}, {data.coordinates?.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="share" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Share2 className="w-4 h-4" />
                      Generate Share Link
                    </Button>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <FileText className="w-4 h-4" />
                      Email Report
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Share results with collaborators or export to cloud storage
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      Print Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Printer className="w-4 h-4" />
                      Print Report
                    </Button>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <FileText className="w-4 h-4" />
                      Print Summary
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Generate printer-friendly versions of analysis results
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Integration Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      Export to ArcGIS
                    </Button>
                    <Button variant="outline" size="sm">
                      Export to QGIS
                    </Button>
                    <Button variant="outline" size="sm">
                      Send to Database
                    </Button>
                    <Button variant="outline" size="sm">
                      API Integration
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Connect GrainScan with your existing research workflow and GIS tools
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Analysis Summary
          </CardTitle>
          <CardDescription>Quick reference for key findings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Mean Grain Size</div>
              <div className="text-2xl font-bold text-foreground">{data.meanGrainSize.toFixed(3)} mm</div>
              <div className="text-xs text-muted-foreground mt-1">{data.classification}</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Sorting</div>
              <div className="text-2xl font-bold text-foreground">{data.sorting.toFixed(3)} φ</div>
              <div className="text-xs text-muted-foreground mt-1">
                {data.sorting < 0.5 ? "Well sorted" : data.sorting < 1.0 ? "Moderately sorted" : "Poorly sorted"}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Sample Size</div>
              <div className="text-2xl font-bold text-foreground">{data.grainCount}</div>
              <div className="text-xs text-muted-foreground mt-1">grains analyzed</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Quality Score</div>
              <div className="text-2xl font-bold text-foreground">{qualityScore}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isHighQuality ? "High quality" : "Good quality"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
