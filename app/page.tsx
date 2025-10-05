"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Camera, MapPin, BarChart3, Microscope, Waves, Globe, Download, Sparkles } from "lucide-react"
import { ImageUploadZone } from "@/components/image-upload-zone"
import { GrainAnalysisResults } from "@/components/grain-analysis-results"
import { StatisticalDashboard } from "@/components/statistical-dashboard"
import { GeospatialMap } from "@/components/geospatial-map"
import { BeachClassification } from "@/components/beach-classification"
import { GrainSegmentationViewer } from "@/components/grain-segmentation-viewer"
import { ResultsExportDashboard } from "@/components/results-export-dashboard"

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

export default function GrainScanApp() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<AnalysisData | null>(null)
  const [segmentationResults, setSegmentationResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback((file: File) => {
    console.log("[v0] Image uploaded:", file.name, file.size)
    const url = URL.createObjectURL(file)
    setUploadedImage(url)
    setSegmentationResults(null)
    setAnalysisResults(null)
    console.log("[v0] Image URL created:", url)
  }, [])

  const startAnalysis = useCallback(() => {
    console.log("[v0] Starting analysis, navigating to analysis tab")
    setActiveTab("analysis")
  }, [])

  const processImage = useCallback(async () => {
    console.log("[v0] Processing image with segmentation results:", segmentationResults)

    if (!uploadedImage || !segmentationResults) {
      console.log("[v0] Cannot process: missing image or segmentation results")
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    const steps = [
      { name: "Integrating segmentation data...", duration: 500 },
      { name: "Computing final statistics...", duration: 600 },
      { name: "Generating classification...", duration: 400 },
    ]

    for (let i = 0; i < steps.length; i++) {
      console.log("[v0] Processing step:", steps[i].name)
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
      setProcessingProgress(((i + 1) / steps.length) * 100)
    }

    const mockResults: AnalysisData = {
      meanGrainSize: segmentationResults.averageGrainSize,
      sorting: 0.5 + Math.random() * 0.8,
      grainCount: segmentationResults.grainCount,
      classification:
        segmentationResults.averageGrainSize < 0.25
          ? "Fine Sand"
          : segmentationResults.averageGrainSize < 0.5
            ? "Medium Sand"
            : "Coarse Sand",
      coordinates: { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.006 + (Math.random() - 0.5) * 0.1 },
      timestamp: new Date().toISOString(),
      imageUrl: uploadedImage,
      grainSizeDistribution: Array.from({ length: 20 }, () => Math.random() * 100),
    }

    console.log("[v0] Analysis complete:", mockResults)
    setAnalysisResults(mockResults)
    setIsProcessing(false)
    setActiveTab("results")
  }, [uploadedImage, segmentationResults])

  const handleSegmentationComplete = useCallback((results: any) => {
    console.log("[v0] Segmentation complete with results:", results)
    setSegmentationResults(results)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl animate-glow">
                <Microscope className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  GrainScan
                  <Sparkles className="w-5 h-5 text-primary" />
                </h1>
                <p className="text-sm text-muted-foreground">Automated Beach Sediment Analysis System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-secondary/20 border-secondary/50">
                <Waves className="w-3 h-3" />
                Coastal Research
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm p-1 h-auto">
            <TabsTrigger
              value="upload"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              disabled={!uploadedImage}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              disabled={!analysisResults}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger
              value="geospatial"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              disabled={!analysisResults}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Mapping</span>
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              disabled={!analysisResults}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="gradient-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="w-5 h-5 text-primary" />
                  Image Upload & Calibration
                </CardTitle>
                <CardDescription className="text-base">
                  Upload a high-resolution image of beach sediment. Ensure proper lighting and include a calibration
                  object for scale reference.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadZone onImageUpload={handleImageUpload} />
              </CardContent>
            </Card>

            {uploadedImage && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Image Preview</CardTitle>
                  <CardDescription>Review your uploaded image before processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded sediment sample"
                      className="w-full max-w-2xl mx-auto rounded-lg border-2 border-primary/30"
                    />
                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={startAnalysis}
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                      >
                        <Microscope className="w-4 h-4" />
                        Start Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {uploadedImage && (
              <GrainSegmentationViewer
                originalImage={uploadedImage}
                onSegmentationComplete={handleSegmentationComplete}
              />
            )}

            {segmentationResults && (
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Generate Final Analysis
                  </CardTitle>
                  <CardDescription>
                    Complete the analysis by computing statistical parameters and beach classification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isProcessing && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Finalizing Analysis</span>
                        <span className="font-medium">{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button onClick={processImage} size="lg" className="gap-2" disabled={isProcessing}>
                      <BarChart3 className="w-4 h-4" />
                      {isProcessing ? "Processing..." : "Generate Final Results"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {analysisResults && (
              <>
                <GrainAnalysisResults data={analysisResults} />
                <StatisticalDashboard data={analysisResults} />
                <BeachClassification data={analysisResults} />
              </>
            )}
          </TabsContent>

          <TabsContent value="geospatial" className="space-y-6">
            {analysisResults && <GeospatialMap data={analysisResults} />}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            {analysisResults && <ResultsExportDashboard data={analysisResults} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
