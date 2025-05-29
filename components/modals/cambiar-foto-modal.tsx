"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CambiarFotoModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar?: string
  userName: string
}

export default function CambiarFotoModal({ isOpen, onClose, currentAvatar, userName }: CambiarFotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB")
      return
    }

    setError("")
    setSelectedFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError("")

    try {
      // Aquí iría la lógica para subir la imagen a Supabase Storage
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simular upload

      // Cerrar modal y limpiar estado
      handleClose()
    } catch (error) {
      setError("Error al subir la imagen. Inténtalo nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError("")
    onClose()
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-[#005A9C]" />
            <span>Cambiar Foto de Perfil</span>
          </DialogTitle>
          <DialogDescription>
            Selecciona una nueva imagen para tu perfil. Se recomienda una imagen cuadrada de buena calidad.
          </DialogDescription>
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
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {selectedFile && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Archivo seleccionado:</p>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          {/* Botón para seleccionar archivo */}
          <div className="space-y-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed border-2 border-gray-300 hover:border-[#005A9C] hover:bg-blue-50 h-12"
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? "Cambiar Imagen" : "Seleccionar Imagen"}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">Formatos soportados: JPG, PNG, GIF (máximo 5MB)</p>
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
            disabled={!selectedFile || isLoading}
            className="bg-[#005A9C] hover:bg-[#004080] text-white"
          >
            {isLoading ? "Subiendo..." : "Guardar Foto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
