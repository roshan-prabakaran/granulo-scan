"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Download, Layers, Navigation, Satellite, MapIcon, Target, Ruler, Globe, FileText } from "lucide-react"

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

interface SamplePoint {
  id: string
  coordinates: { lat: number; lng: number }
  meanGrainSize: number
  sorting: number
  classification: string
  timestamp: string
  transectPosition: "dune" | "berm" | "intertidal" | "subtidal"
  elevation?: number
}

interface GeospatialMapProps {
  data: AnalysisData
}

export function GeospatialMap({ data }: GeospatialMapProps) {
  const [mapView, setMapView] = useState<"satellite" | "terrain" | "street">("satellite")
  const [showTransects, setShowTransects] = useState(true)
  const [showClassification, setShowClassification] = useState(true)
  const [showGrainSize, setShowGrainSize] = useState(true)
  const [selectedTransect, setSelectedTransect] = useState<string>("all")
  const [zoomLevel, setZoomLevel] = useState(15)
  const [centerCoords, setCenterCoords] = useState({
    lat: data.coordinates?.lat || 40.7128,
    lng: data.coordinates?.lng || -74.006,
  })

  // Mock sample points for demonstration
  const samplePoints: SamplePoint[] = useMemo(() => {
    const baseCoords = data.coordinates || { lat: 40.7128, lng: -74.006 }

    return [
      {
        id: "current",
        coordinates: baseCoords,
        meanGrainSize: data.meanGrainSize,
        sorting: data.sorting,
        classification: data.classification,
        timestamp: data.timestamp,
        transectPosition: "berm",
        elevation: 2.5,
      },
      // Generate additional mock points along transect
      {
        id: "dune-1",
        coordinates: { lat: baseCoords.lat + 0.0005, lng: baseCoords.lng + 0.0002 },
        meanGrainSize: data.meanGrainSize * 1.2,
        sorting: data.sorting * 0.8,
        classification: "Medium Sand",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        transectPosition: "dune",
        elevation: 8.2,
      },
      {
        id: "intertidal-1",
        coordinates: { lat: baseCoords.lat - 0.0003, lng: baseCoords.lng - 0.0001 },
        meanGrainSize: data.meanGrainSize * 0.7,
        sorting: data.sorting * 1.3,
        classification: "Fine Sand",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        transectPosition: "intertidal",
        elevation: 0.5,
      },
      {
        id: "subtidal-1",
        coordinates: { lat: baseCoords.lat - 0.0008, lng: baseCoords.lng - 0.0004 },
        meanGrainSize: data.meanGrainSize * 0.5,
        sorting: data.sorting * 1.8,
        classification: "Very Fine Sand",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        transectPosition: "subtidal",
        elevation: -1.2,
      },
    ]
  }, [data])

  const getPointColor = (point: SamplePoint) => {
    if (showClassification) {
      switch (point.classification) {
        case "Very Fine Sand":
          return "#ef4444" // red
        case "Fine Sand":
          return "#f97316" // orange
        case "Medium Sand":
          return "#eab308" // yellow
        case "Coarse Sand":
          return "#22c55e" // green
        case "Very Coarse Sand":
          return "#3b82f6" // blue
        default:
          return "#6b7280" // gray
      }
    }

    if (showGrainSize) {
      const normalized = Math.min(point.meanGrainSize / 1.0, 1) // Normalize to 0-1
      const hue = (1 - normalized) * 240 // Blue to red
      return `hsl(${hue}, 70%, 50%)`
    }

    return "#0891b2" // primary color
  }

  const getPointSize = (point: SamplePoint) => {
    return point.id === "current" ? 12 : 8
  }

  const exportGeoJSON = () => {
    const geoJSON = {
      type: "FeatureCollection",
      features: samplePoints.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.coordinates.lng, point.coordinates.lat],
        },
        properties: {
          id: point.id,
          meanGrainSize: point.meanGrainSize,
          sorting: point.sorting,
          classification: point.classification,
          timestamp: point.timestamp,
          transectPosition: point.transectPosition,
          elevation: point.elevation,
        },
      })),
    }

    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: "application/geo+json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grainscan-samples-${new Date().toISOString().split("T")[0]}.geojson`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = [
      "ID",
      "Latitude",
      "Longitude",
      "Mean_Grain_Size_mm",
      "Sorting",
      "Classification",
      "Transect_Position",
      "Elevation_m",
      "Timestamp",
    ]
    const rows = samplePoints.map((point) => [
      point.id,
      point.coordinates.lat.toFixed(6),
      point.coordinates.lng.toFixed(6),
      point.meanGrainSize.toFixed(3),
      point.sorting.toFixed(3),
      point.classification,
      point.transectPosition,
      point.elevation?.toFixed(1) || "",
      point.timestamp,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grainscan-samples-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredPoints =
    selectedTransect === "all"
      ? samplePoints
      : samplePoints.filter((point) => point.transectPosition === selectedTransect)

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Geospatial Analysis & Mapping
          </CardTitle>
          <CardDescription>Interactive mapping of sediment samples with spatial analysis tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Map View</Label>
              <Select value={mapView} onValueChange={(value: any) => setMapView(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satellite">
                    <div className="flex items-center gap-2">
                      <Satellite className="w-4 h-4" />
                      Satellite
                    </div>
                  </SelectItem>
                  <SelectItem value="terrain">
                    <div className="flex items-center gap-2">
                      <MapIcon className="w-4 h-4" />
                      Terrain
                    </div>
                  </SelectItem>
                  <SelectItem value="street">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Street
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transect Filter</Label>
              <Select value={selectedTransect} onValueChange={setSelectedTransect}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="dune">Dune</SelectItem>
                  <SelectItem value="berm">Berm</SelectItem>
                  <SelectItem value="intertidal">Intertidal</SelectItem>
                  <SelectItem value="subtidal">Subtidal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-transects" checked={showTransects} onCheckedChange={setShowTransects} />
              <Label htmlFor="show-transects">Show Transects</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-classification" checked={showClassification} onCheckedChange={setShowClassification} />
              <Label htmlFor="show-classification">Color by Classification</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zoom Level: {zoomLevel}</Label>
            <Slider
              value={[zoomLevel]}
              onValueChange={(value) => setZoomLevel(value[0])}
              min={10}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Sample Location Map
          </CardTitle>
          <CardDescription>
            Current location: {centerCoords.lat.toFixed(6)}, {centerCoords.lng.toFixed(6)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mock Map Interface */}
          <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border border-border overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-green-200 via-yellow-100 to-blue-300"></div>
            </div>

            {/* Coastline representation */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 0 200 Q 150 180 300 190 T 600 200 L 600 400 L 0 400 Z"
                fill="rgba(34, 197, 94, 0.3)"
                stroke="rgba(34, 197, 94, 0.6)"
                strokeWidth="2"
              />
              <path
                d="M 0 200 Q 150 180 300 190 T 600 200"
                fill="none"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="3"
              />
            </svg>

            {/* Sample Points */}
            {filteredPoints.map((point, index) => {
              const x = 200 + (point.coordinates.lng - centerCoords.lng) * 50000
              const y = 200 + (centerCoords.lat - point.coordinates.lat) * 50000

              return (
                <div
                  key={point.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: x, top: y }}
                >
                  <div
                    className="rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125"
                    style={{
                      backgroundColor: getPointColor(point),
                      width: getPointSize(point),
                      height: getPointSize(point),
                    }}
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-popover border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                      <p className="font-semibold">{point.classification}</p>
                      <p>Size: {point.meanGrainSize.toFixed(3)} mm</p>
                      <p>Position: {point.transectPosition}</p>
                      {point.elevation && <p>Elevation: {point.elevation.toFixed(1)} m</p>}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Transect Lines */}
            {showTransects && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="150"
                  y1="150"
                  x2="250"
                  y2="250"
                  stroke="rgba(8, 145, 178, 0.6)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text x="155" y="145" fill="hsl(var(--primary))" fontSize="10" className="font-medium">
                  Transect A
                </text>
              </svg>
            )}

            {/* Scale Bar */}
            <div className="absolute bottom-4 left-4 bg-background/90 rounded px-2 py-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-foreground"></div>
                <span>100m</span>
              </div>
            </div>

            {/* North Arrow */}
            <div className="absolute top-4 right-4 bg-background/90 rounded p-2">
              <Navigation className="w-4 h-4 text-foreground" />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Map Legend
            </h4>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Sediment Classification:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Very Fine Sand</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Fine Sand</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium Sand</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Coarse Sand</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Transect Positions:</p>
                <div className="text-xs text-muted-foreground">
                  <p>• Dune: Backshore/vegetation line</p>
                  <p>• Berm: High tide mark</p>
                  <p>• Intertidal: Mid-tide zone</p>
                  <p>• Subtidal: Below low tide</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spatial Analysis */}
      <Tabs defaultValue="coordinates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
          <TabsTrigger value="transect">Transect Analysis</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
        </TabsList>

        <TabsContent value="coordinates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                GNSS Coordinates & Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <Label>Latitude (WGS84)</Label>
                    <Input value={centerCoords.lat.toFixed(6)} readOnly />
                  </div>
                  <div>
                    <Label>Longitude (WGS84)</Label>
                    <Input value={centerCoords.lng.toFixed(6)} readOnly />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>UTM Zone</Label>
                    <Input value="18T" readOnly />
                  </div>
                  <div>
                    <Label>Elevation (MSL)</Label>
                    <Input value="2.5 m" readOnly />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-2">Sample Collection Details</h4>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div>
                    <span className="font-medium">Collection Time:</span>
                    <p className="text-muted-foreground">{new Date(data.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tidal State:</span>
                    <p className="text-muted-foreground">Mid-tide (estimated)</p>
                  </div>
                  <div>
                    <span className="font-medium">Weather:</span>
                    <p className="text-muted-foreground">Clear, light winds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" />
                Beach Transect Analysis
              </CardTitle>
              <CardDescription>Spatial variation of sediment properties across beach profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Transect Profile Visualization */}
                <div className="h-48 bg-muted rounded-lg p-4 relative overflow-hidden">
                  <svg className="w-full h-full">
                    {/* Beach profile */}
                    <path
                      d="M 50 150 Q 150 100 250 120 Q 350 130 450 140"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />

                    {/* Sample points on profile */}
                    {samplePoints.map((point, index) => {
                      const x = 50 + index * 130
                      const y = 150 - (point.elevation || 0) * 10

                      return (
                        <g key={point.id}>
                          <circle cx={x} cy={y} r="6" fill={getPointColor(point)} stroke="white" strokeWidth="2" />
                          <text x={x} y={y - 15} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))">
                            {point.meanGrainSize.toFixed(2)}mm
                          </text>
                        </g>
                      )
                    })}

                    {/* Labels */}
                    <text x="75" y="170" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
                      Dune
                    </text>
                    <text x="200" y="170" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
                      Berm
                    </text>
                    <text x="325" y="170" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
                      Intertidal
                    </text>
                    <text x="450" y="170" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
                      Subtidal
                    </text>
                  </svg>
                </div>

                {/* Transect Statistics */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Grain Size Trend</h4>
                    <p className="text-sm text-muted-foreground">
                      Coarsening seaward trend typical of moderate energy beaches
                    </p>
                    <div className="text-xs">
                      <p>
                        Dune → Subtidal: {samplePoints[1]?.meanGrainSize.toFixed(3)} →{" "}
                        {samplePoints[3]?.meanGrainSize.toFixed(3)} mm
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Sorting Pattern</h4>
                    <p className="text-sm text-muted-foreground">
                      Decreasing sorting (increasing variability) toward water
                    </p>
                    <div className="text-xs">
                      <p>Best sorted: Dune (σ = {samplePoints[1]?.sorting.toFixed(2)})</p>
                      <p>Poorest sorted: Subtidal (σ = {samplePoints[3]?.sorting.toFixed(2)})</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Geospatial Data Export
              </CardTitle>
              <CardDescription>Export sample data in various GIS-compatible formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button onClick={exportGeoJSON} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Export GeoJSON
                </Button>
                <Button onClick={exportCSV} variant="outline" className="gap-2 bg-transparent">
                  <FileText className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>GeoJSON:</strong> Standard format for web mapping and GIS applications (QGIS, ArcGIS)
                </p>
                <p>
                  <strong>CSV:</strong> Tabular format with coordinates for spreadsheet analysis and database import
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-2">Export Summary</h4>
                <div className="text-sm space-y-1">
                  <p>Total samples: {samplePoints.length}</p>
                  <p>Coordinate system: WGS84 (EPSG:4326)</p>
                  <p>Data fields: Location, grain size, sorting, classification, elevation, timestamp</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
