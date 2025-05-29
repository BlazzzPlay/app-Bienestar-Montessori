"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CambiarContrasenaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CambiarContrasenaModal({ isOpen, onClose }: CambiarContrasenaModalProps) {
  const [contrasenaActual, setContrasenaActual] = useState("")
  const [nuevaContrasena, setNuevaContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      setError("Todos los campos son obligatorios")
      return
    }

    if (nuevaContrasena.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      // Aquí iría la lógica para cambiar la contraseña
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simular API call

      // Limpiar formulario y cerrar modal
      setContrasenaActual("")
      setNuevaContrasena("")
      setConfirmarContrasena("")
      onClose()
    } catch (error) {
      setError("Error al cambiar la contraseña. Inténtalo nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setContrasenaActual("")
    setNuevaContrasena("")
    setConfirmarContrasena("")
    setError("")
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-[#005A9C]" />
            <span>Cambiar Contraseña</span>
          </DialogTitle>
          <DialogDescription>
            Por tu seguridad, necesitamos verificar tu contraseña actual antes de establecer una nueva.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contraseña actual */}
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">
              Contraseña Actual
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
              Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
              Confirmar Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter className="space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#005A9C] hover:bg-[#004080] text-white" disabled={isLoading}>
              {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
