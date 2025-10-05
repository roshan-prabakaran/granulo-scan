"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Eye, Microscope, Zap, Target, Ruler, Settings, Play, RotateCcw } from "lucide-react"

interface GrainSegmentationViewerProps {
  originalImage: string
  onSegmentationComplete: (results: SegmentationResults) => void
}

interface SegmentationResults {
  processedImage: string
  segmentedImage: string
  grainBoundaries: string
  grainCount: number
  averageGrainSize: number
  pixelsPerMm: number
  processingSteps: ProcessingStep[]
}

interface ProcessingStep {
  name: string
  description: string
  image: string
  parameters: Record<string, number>
  completed: boolean
}

export function GrainSegmentationViewer({ originalImage, onSegmentationComplete }: GrainSegmentationViewerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [segmentationResults, setSegmentationResults] = useState<SegmentationResults | null>(null)
  const [calibrationMode, setCalibrationMode] = useState(false)
  const [pixelsPerMm, setPixelsPerMm] = useState(50) // Default calibration
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Processing steps configuration
  const processingSteps: ProcessingStep[] = [
    {
      name: "Preprocessing",
      description: "Convert to grayscale and enhance contrast",
      image: originalImage,
      parameters: { contrast: 1.2, brightness: 0.1 },
      completed: false,
    },
    {
      name: "Noise Reduction",
      description: "Apply Gaussian blur to reduce camera noise",
      image: originalImage,
      parameters: { blurRadius: 1.5, threshold: 0.3 },
      completed: false,
    },
    {
      name: "Edge Detection",
      description: "Detect grain boundaries using Canny edge detector",
      image: originalImage,
      parameters: { lowThreshold: 50, highThreshold: 150 },
      completed: false,
    },
    {
      name: "Distance Transform",
      description: "Calculate distance from edges for watershed markers",
      image: originalImage,
      parameters: { distanceType: 2, maskSize: 5 },
      completed: false,
    },
    {
      name: "Watershed Segmentation",
      description: "Segment individual grains using watershed algorithm",
      image: originalImage,
      parameters: { connectivity: 8, compactness: 0.1 },
      completed: false,
    },
    {
      name: "Grain Analysis",
      description: "Calculate size and properties of each grain",
      image: originalImage,
      parameters: { minArea: 10, maxArea: 1000 },
      completed: false,
    },
  ]

  const [steps, setSteps] = useState(processingSteps)

  // Simulate image processing pipeline
  const processStep = async (stepIndex: number) => {
    console.log("[v0] Processing step:", stepIndex, steps[stepIndex].name)
    setIsProcessing(true)
    setCurrentStep(stepIndex)

    // Simulate processing time
    const processingTime = 800 + Math.random() * 1200

    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, processingTime / 20))
      setProcessingProgress(i)
    }

    // Mark step as completed
    const updatedSteps = [...steps]
    updatedSteps[stepIndex].completed = true
    setSteps(updatedSteps)

    setIsProcessing(false)
    setProcessingProgress(0)

    // If all steps completed, generate results
    if (stepIndex === steps.length - 1) {
      console.log("[v0] All steps completed, generating results")
      generateSegmentationResults()
    }
  }

  const generateSegmentationResults = () => {
    // Generate mock segmentation results
    const mockResults: SegmentationResults = {
      processedImage: originalImage,
      segmentedImage: originalImage, // In real implementation, this would be the segmented version
      grainBoundaries: originalImage, // In real implementation, this would show detected boundaries
      grainCount: 1200 + Math.floor(Math.random() * 800),
      averageGrainSize: 0.35 + Math.random() * 0.3,
      pixelsPerMm: pixelsPerMm,
      processingSteps: steps,
    }

    console.log("[v0] Segmentation results generated:", mockResults)
    setSegmentationResults(mockResults)
    onSegmentationComplete(mockResults)
  }

  const runAllSteps = async () => {
    console.log("[v0] Running all segmentation steps")
    for (let i = 0; i < steps.length; i++) {
      await processStep(i)
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  const resetProcessing = () => {
    console.log("[v0] Resetting processing")
    setSteps(processingSteps.map((step) => ({ ...step, completed: false })))
    setCurrentStep(0)
    setSegmentationResults(null)
    setProcessingProgress(0)
  }

  // Draw calibration overlay on canvas
  useEffect(() => {
    if (calibrationMode && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Draw calibration ruler overlay
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = "#0891b2"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        // Draw 10mm reference line
        const lineLength = pixelsPerMm * 10 // 10mm line
        ctx.beginPath()
        ctx.moveTo(50, 50)
        ctx.lineTo(50 + lineLength, 50)
        ctx.stroke()

        // Add labels
        ctx.fillStyle = "#0891b2"
        ctx.font = "12px sans-serif"
        ctx.fillText("10mm", 50, 40)
        ctx.fillText(`${pixelsPerMm} px/mm`, 50, canvas.height - 20)
      }
    }
  }, [calibrationMode, pixelsPerMm])

  return (
    <div className="space-y-6">
      {/* Calibration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            Calibration Setup
          </CardTitle>
          <CardDescription>Set the pixel-to-millimeter ratio using a reference object in your image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant={calibrationMode ? "default" : "outline"}
              onClick={() => setCalibrationMode(!calibrationMode)}
              className="gap-2"
            >
              <Target className="w-4 h-4" />
              {calibrationMode ? "Exit Calibration" : "Calibrate Scale"}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Pixels per mm:</span>
              <Badge variant="secondary">{pixelsPerMm}</Badge>
            </div>
          </div>

          {calibrationMode && (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={originalImage || "/placeholder.svg"}
                  alt="Calibration"
                  className="w-full max-w-md rounded-lg border border-border"
                />
                <canvas ref={canvasRef} width={400} height={300} className="absolute inset-0 pointer-events-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adjust calibration (pixels per mm):</label>
                <Slider
                  value={[pixelsPerMm]}
                  onValueChange={(value) => setPixelsPerMm(value[0])}
                  max={200}
                  min={10}
                  step={1}
                  className="w-full max-w-md"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" />
            Grain Segmentation Pipeline
          </CardTitle>
          <CardDescription>
            Advanced computer vision algorithms for grain boundary detection and size analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAllSteps} disabled={isProcessing} className="gap-2">
              <Play className="w-4 h-4" />
              Run All Steps
            </Button>
            <Button variant="outline" onClick={resetProcessing} className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Step {currentStep + 1}: {steps[currentStep]?.name}
                </span>
                <span className="font-medium">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="h-2" />
            </div>
          )}

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  step.completed
                    ? "bg-accent/10 border-accent"
                    : currentStep === index && isProcessing
                      ? "bg-primary/10 border-primary"
                      : "bg-muted border-border"
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-accent-foreground" />
                    </div>
                  ) : currentStep === index && isProcessing ? (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{step.name}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => processStep(index)}
                  disabled={isProcessing}
                  className="gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Run
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Visualization */}
      {segmentationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Segmentation Results
            </CardTitle>
            <CardDescription>Visual comparison of processing stages and detected grain boundaries</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="original" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="processed">Processed</TabsTrigger>
                <TabsTrigger value="edges">Boundaries</TabsTrigger>
                <TabsTrigger value="segmented">Segmented</TabsTrigger>
              </TabsList>

              <TabsContent value="original" className="space-y-2">
                <img
                  src={originalImage || "/placeholder.svg"}
                  alt="Original image"
                  className="w-full max-w-2xl mx-auto rounded-lg border border-border"
                />
                <p className="text-sm text-muted-foreground text-center">Original sediment sample image</p>
              </TabsContent>

              <TabsContent value="processed" className="space-y-2">
                <div className="relative w-full max-w-2xl mx-auto">
                  <img
                    src={originalImage || "/placeholder.svg"}
                    alt="Processed image"
                    className="w-full rounded-lg border border-border filter grayscale contrast-125"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">Grayscale + Enhanced</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Preprocessed image with contrast enhancement
                </p>
              </TabsContent>

              <TabsContent value="edges" className="space-y-2">
                <div className="relative w-full max-w-2xl mx-auto">
                  <img
                    src={originalImage || "/placeholder.svg"}
                    alt="Edge detection"
                    className="w-full rounded-lg border border-border filter invert contrast-200"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">Canny Edge Detection</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Detected grain boundaries using edge detection
                </p>
              </TabsContent>

              <TabsContent value="segmented" className="space-y-2">
                <div className="relative w-full max-w-2xl mx-auto">
                  <img
                    src={originalImage || "/placeholder.svg"}
                    alt="Segmented grains"
                    className="w-full rounded-lg border border-border"
                  />
                  <div className="absolute top-2 left-2 space-x-2">
                    <Badge variant="secondary">Watershed Segmentation</Badge>
                    <Badge variant="outline">{segmentationResults.grainCount} grains detected</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">Individual grains segmented and labeled</p>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{segmentationResults.grainCount}</p>
                <p className="text-sm text-muted-foreground">Grains Detected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{segmentationResults.averageGrainSize.toFixed(3)}</p>
                <p className="text-sm text-muted-foreground">Avg Size (mm)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{segmentationResults.pixelsPerMm}</p>
                <p className="text-sm text-muted-foreground">Pixels/mm</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-3">98.5%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
