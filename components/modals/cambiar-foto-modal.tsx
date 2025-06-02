"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, X, CheckCircle, AlertTriangle, Info, Bug, Settings, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { useAuth } from "@/hooks/useAuth"
import { minimalAvatarStorage } from "@/lib/avatar-storage-minimal"
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
  const [debugInfo, setDebugInfo] = useState("")
  const [showDebug, setShowDebug] = useState(false)
  const [systemCheck, setSystemCheck] = useState<any>(null)
  const [isCheckingSystem, setIsCheckingSystem] = useState(false)
  const [isCreatingBucket, setIsCreatingBucket] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, profile } = useAuth()

  // Verificar configuración del sistema al abrir
  useEffect(() => {
    if (isOpen) {
      runSystemCheck()
    }
  }, [isOpen])

  const runSystemCheck = async () => {
    setIsCheckingSystem(true)
    try {
      console.log("🔍 Ejecutando verificación del sistema...")
      const check = await minimalAvatarStorage.checkConfiguration()
      setSystemCheck(check)
      console.log("📊 Resultado de verificación:", check)
    } catch (error) {
      console.error("❌ Error en verificación:", error)
      setSystemCheck({
        success: false,
        details: {},
        errors: [`Error en verificación: ${error}`],
      })
    } finally {
      setIsCheckingSystem(false)
    }
  }

  const createBucket = async () => {
    setIsCreatingBucket(true)
    setError("")
    try {
      const success = await minimalAvatarStorage.createBucketIfNotExists()
      if (success) {
        // Re-verificar el sistema
        await runSystemCheck()
      } else {
        setError("No se pudo crear el bucket. Verifica los permisos en Supabase.")
      }
    } catch (error) {
      console.error("Error creando bucket:", error)
      setError(`Error creando bucket: ${error}`)
    } finally {
      setIsCreatingBucket(false)
    }
  }

  const validateSelectedFile = async (file: File): Promise<FileValidationResult> => {
    const warnings: string[] = []

    const basicValidation = validateImageFile(file)
    if (!basicValidation.isValid) {
      return {
        isValid: false,
        error: basicValidation.error,
      }
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
    setDebugInfo("")

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
    setDebugInfo("")

    try {
      console.log("🚀 Iniciando subida minimal con:", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        userRut: profile.rut,
      })

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 20
        })
      }, 200)

      // Subir avatar con servicio minimal
      const result = await minimalAvatarStorage.uploadAvatar(selectedFile, profile.rut)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!result.success) {
        console.error("❌ Error en subida:", result.error)
        setError(result.error || "Error al subir la imagen")

        if (result.debugInfo) {
          setDebugInfo(JSON.stringify(result.debugInfo, null, 2))
          setShowDebug(true)
        }
        return
      }

      console.log("✅ Avatar subido exitosamente:", result.data)
      setSuccess(true)
      onSuccess?.()

      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error("❌ Error inesperado:", error)
      setError("Error inesperado al subir la imagen")
      setDebugInfo(`Error inesperado: ${error}`)
      setShowDebug(true)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl(null)
    setError("")
    setSuccess(false)
    setValidationResult(null)
    setUploadProgress(0)
    setDebugInfo("")
    setShowDebug(false)
    setSystemCheck(null)
    onClose()
  }

  const removeSelectedFile = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl(null)
    setError("")
    setValidationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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
          <DialogDescription>
            Selecciona una nueva imagen para tu perfil. Versión simplificada para debugging.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado del sistema */}
          {systemCheck && (
            <div
              className={`border rounded-lg p-3 ${systemCheck.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Settings className={`h-4 w-4 ${systemCheck.success ? "text-green-600" : "text-red-600"}`} />
                  <span className={`text-sm font-medium ${systemCheck.success ? "text-green-900" : "text-red-900"}`}>
                    Estado del Sistema
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={runSystemCheck}
                  disabled={isCheckingSystem}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${isCheckingSystem ? "animate-spin" : ""}`} />
                </Button>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Conexión DB:</span>
                  <span>{systemCheck.details.databaseConnection ? "✅" : "❌"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bucket avatars:</span>
                  <span>{systemCheck.details.bucket ? "✅" : "❌"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Test upload:</span>
                  <span>{systemCheck.details.uploadTest?.success ? "✅" : "❌"}</span>
                </div>
              </div>

              {/* Botón para crear bucket si no existe */}
              {!systemCheck.details.bucket && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createBucket}
                    disabled={isCreatingBucket}
                    className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {isCreatingBucket ? "Creando bucket..." : "Crear bucket avatars"}
                  </Button>
                </div>
              )}

              {systemCheck.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600 space-y-1">
                  {systemCheck.errors.map((error: string, index: number) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              )}

              {systemCheck.details.bucket && (
                <div className="mt-2 text-xs text-gray-600">
                  <div>Bucket público: {systemCheck.details.bucket.public ? "Sí" : "No"}</div>
                  <div>Límite: {systemCheck.details.bucket.file_size_limit || "Sin límite"}</div>
                </div>
              )}
            </div>
          )}

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
                <span className="text-gray-600">Subiendo imagen...</span>
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
              disabled={isLoading || !systemCheck?.details.bucket}
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? "Cambiar Imagen" : "Seleccionar Imagen"}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p>
                    <strong>Versión simplificada</strong> para debugging
                  </p>
                  <p>Formatos: JPG, PNG, WEBP | Máximo: 2MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error message con debug */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-3">
              <p className="text-sm text-red-600">{error}</p>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runSystemCheck}
                  disabled={isLoading || isCheckingSystem}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  {isCheckingSystem ? "Verificando..." : "Re-verificar"}
                </Button>
                {debugInfo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <Bug className="h-3 w-3 mr-1" />
                    {showDebug ? "Ocultar" : "Ver"} Debug
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Panel de debug */}
          {debugInfo && (
            <Collapsible open={showDebug} onOpenChange={setShowDebug}>
              <CollapsibleContent className="space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <Textarea value={debugInfo} readOnly className="min-h-[150px] text-xs font-mono bg-white" />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading || !validationResult?.isValid || !systemCheck?.details.bucket}
            className="bg-[#005A9C] hover:bg-[#004080] text-white"
          >
            {isLoading ? "Subiendo..." : "Guardar Foto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
