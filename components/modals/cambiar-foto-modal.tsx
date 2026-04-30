"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { storage } from "@/lib/storage"
import { database } from "@/lib/database"
import { validateImageFile, validateImageDimensions } from "@/lib/image-utils"

interface CambiarFotoModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar?: string
  userName: string
  onSuccess?: () => void
}

interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
  fileInfo?: {
    size: string
    dimensions?: { width: number; height: number }
    type: string
  }
}

export default function CambiarFotoModal({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onSuccess,
}: CambiarFotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { profile } = useAuth()

  const validateSelectedFile = async (file: File): Promise<FileValidationResult> => {
    const warnings: string[] = []

    const basicValidation = validateImageFile(file)
    if (!basicValidation.isValid) {
      return { isValid: false, error: basicValidation.error }
    }

    const dimensionValidation = await validateImageDimensions(file, 50, 50)
    if (!dimensionValidation.isValid) {
      return {
        isValid: false,
        error: dimensionValidation.error,
        fileInfo: {
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          dimensions: dimensionValidation.dimensions,
          type: file.type,
        },
      }
    }

    if (file.size > 1024 * 1024) {
      warnings.push("Imagen grande: se comprimirá automáticamente")
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      fileInfo: {
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        dimensions: dimensionValidation.dimensions,
        type: file.type,
      },
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")
    setValidationResult(null)

    try {
      const validation = await validateSelectedFile(file)
      setValidationResult(validation)

      if (!validation.isValid) {
        setError(validation.error || "Archivo inválido")
        return
      }

      setSelectedFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.onerror = () => {
        setError("Error al procesar la imagen")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error validating file:", error)
      setError("Error al validar el archivo")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !profile) return

    setIsLoading(true)
    setError("")
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await storage.uploadAvatar(selectedFile, profile.id)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.error) {
        setError(result.error.message || "Error al subir la imagen")
        return
      }

      // Actualizar el perfil con la nueva URL
      await database.updateProfile(profile.id, { avatar_url: result.data!.url })

      setSuccess(true)
      onSuccess?.()

      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (error) {
      console.error("Error inesperado:", error)
      setError("Error inesperado al subir la imagen")
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError("")
    setSuccess(false)
    setValidationResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError("")
    setValidationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Foto actualizada!</h3>
            <p className="text-gray-600">Tu foto de perfil ha sido actualizada exitosamente.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-[#005A9C]" />
            <span>Cambiar Foto de Perfil</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview de la imagen */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={previewUrl || currentAvatar || "/placeholder.svg"} alt={userName} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xl">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {previewUrl && (
                <button
                  onClick={removeSelectedFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Información del archivo */}
            {validationResult?.fileInfo && (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {validationResult.fileInfo.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {validationResult.fileInfo.size}
                  </Badge>
                  {validationResult.fileInfo.dimensions && (
                    <Badge variant="outline" className="text-xs">
                      {validationResult.fileInfo.dimensions.width}x{validationResult.fileInfo.dimensions.height}px
                    </Badge>
                  )}
                </div>
                {selectedFile && <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>}
              </div>
            )}

            {/* Advertencias */}
            {validationResult?.warnings && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-amber-700">
                        {warning}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progreso de subida */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subiendo avatar...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Botón para seleccionar archivo */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed border-2 border-gray-300 hover:border-[#005A9C] hover:bg-blue-50 h-12"
              disabled={isLoading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? "Cambiar Imagen" : "Seleccionar Imagen"}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Almacenamiento local</strong></p>
                  <p>Formatos: JPG, PNG, WEBP | Máximo: 2MB</p>
                  <p>La imagen se guarda en tu navegador.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading || !validationResult?.isValid}
            className="bg-[#005A9C] hover:bg-[#004080] text-white"
          >
            {isLoading ? "Subiendo..." : "Guardar Foto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
