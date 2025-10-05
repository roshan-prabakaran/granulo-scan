"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadZoneProps {
  onImageUpload: (file: File) => void
}

export function ImageUploadZone({ onImageUpload }: ImageUploadZoneProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    console.log("[v0] Validating file:", file.name, file.type, file.size)

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/tiff", "image/tif"]
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|tiff|tif)$/i)) {
      setError("Please upload a valid image file (JPG, PNG, or TIFF)")
      return false
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB")
      return false
    }

    return true
  }

  const handleFile = (file: File) => {
    console.log("[v0] Handling file:", file.name)
    setError(null)

    if (validateFile(file)) {
      console.log("[v0] File validated, calling onImageUpload")
      onImageUpload(file)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] File input changed")
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    console.log("[v0] Files dropped")
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClick = () => {
    console.log("[v0] Upload zone clicked")
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Card
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
          isDragActive ? "border-primary bg-primary/10 scale-[1.02]" : "border-border",
          error ? "border-destructive" : "",
        )}
      >
        <div className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/tiff,image/tif,.jpg,.jpeg,.png,.tiff,.tif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            {isDragActive ? (
              <Upload className="w-6 h-6 text-primary animate-bounce" />
            ) : (
              <ImageIcon className="w-6 h-6 text-primary" />
            )}
          </div>

          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-foreground mb-2">Drop your image here</p>
              <p className="text-sm text-muted-foreground">Release to upload the sediment image</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-foreground mb-2">Upload Sediment Image</p>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop your image here, or click to browse</p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                type="button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1 bg-card/50 p-4 rounded-lg border border-border/50">
        <p>
          <strong>Supported formats:</strong> JPG, PNG, TIFF
        </p>
        <p>
          <strong>Maximum size:</strong> 50MB
        </p>
        <p>
          <strong>Recommended:</strong> High-resolution images with good lighting and visible calibration object
        </p>
      </div>
    </div>
  )
}
