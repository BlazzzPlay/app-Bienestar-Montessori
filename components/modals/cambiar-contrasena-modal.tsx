"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
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
import { useAuth } from "@/hooks/useAuth"

interface CambiarContrasenaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CambiarContrasenaModal({ isOpen, onClose }: CambiarContrasenaModalProps) {
  const [nuevaContrasena, setNuevaContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const { updatePassword, user } = useAuth()

  // Simplificar la función validateRUTFormat para que solo valide formato básico:
  const validateRUTFormat = (rut: string): { isValid: boolean; message?: string } => {
    if (!rut || rut.trim() === "") {
      return { isValid: false, message: "El RUT es obligatorio" }
    }

    // Limpiar RUT
    const cleanRUT = rut.replace(/[.-]/g, "").toLowerCase()

    if (cleanRUT.length < 8 || cleanRUT.length > 9) {
      return { isValid: false, message: "El RUT debe tener entre 8 y 9 caracteres" }
    }

    const numbers = cleanRUT.slice(0, -1)
    const verifier = cleanRUT.slice(-1)

    if (!/^\d+$/.test(numbers)) {
      return { isValid: false, message: "El RUT solo debe contener números y dígito verificador" }
    }

    if (!/^[0-9k]$/.test(verifier)) {
      return { isValid: false, message: "Dígito verificador inválido (debe ser 0-9 o K)" }
    }

    return { isValid: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones mejoradas
    if (!nuevaContrasena || !confirmarContrasena) {
      setError("Todos los campos son obligatorios")
      return
    }

    // Validar formato de RUT
    const rutValidation = validateRUTFormat(nuevaContrasena)
    if (!rutValidation.isValid) {
      setError(rutValidation.message || "RUT inválido")
      return
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Los RUTs no coinciden")
      return
    }

    // Validar que el nuevo RUT sea diferente al actual (si es posible obtenerlo)
    if (
      nuevaContrasena.replace(/[.-]/g, "").toLowerCase() ===
      (user?.user_metadata?.current_rut || "").replace(/[.-]/g, "").toLowerCase()
    ) {
      setError("El nuevo RUT debe ser diferente al actual")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await updatePassword(nuevaContrasena)

      if (error) {
        setError(error.message || "Error al cambiar el RUT. Inténtalo nuevamente.")
      } else {
        setSuccess(true)
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setError("Error inesperado. Inténtalo nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setNuevaContrasena("")
    setConfirmarContrasena("")
    setError("")
    setSuccess(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡RUT actualizado!</h3>
            <p className="text-gray-600">Tu RUT ha sido cambiado exitosamente.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <span>Cambiar RUT</span>
          </DialogTitle>
          <DialogDescription>
            Establece un nuevo RUT para tu cuenta. Asegúrate de que sea correcto y fácil de
            recordar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nuevo RUT */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
              Nuevo RUT
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={nuevaContrasena}
                onChange={(e) => {
                  setNuevaContrasena(e.target.value)
                  if (error) setError("") // Limpiar error al escribir
                }}
                placeholder="Formato: 12345678-9"
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

          {/* Confirmar RUT */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
              Confirmar Nuevo RUT
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repite el nuevo RUT"
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
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Cambiando..." : "Cambiar RUT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
