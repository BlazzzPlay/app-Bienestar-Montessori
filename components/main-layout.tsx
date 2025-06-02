"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, UserRound, Gift, CalendarDays, Users, Inbox, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNotificationSystem } from "@/hooks/useNotificationSystem"
import NotificationCenter from "@/components/notifications/notification-center"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState("perfil")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { unreadCount } = useNotificationSystem()
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { signOut, profile, hasFullAccess, isInDevelopment } = useAuth()

  useEffect(() => {
    if (pathname.includes("/perfil")) setActiveTab("perfil")
    if (pathname.includes("/beneficios")) setActiveTab("beneficios")
    if (pathname.includes("/eventos")) setActiveTab("eventos")
    if (pathname.includes("/directorio")) setActiveTab("directorio")
    if (pathname.includes("/sugerencias")) setActiveTab("sugerencias")
    if (pathname.includes("/admin")) setActiveTab("admin")
  }, [pathname])

  const allTabs = [
    { id: "perfil", label: "Perfil", icon: UserRound },
    { id: "beneficios", label: "Beneficios", icon: Gift },
    { id: "eventos", label: "Eventos", icon: CalendarDays },
    { id: "directorio", label: "Directorio", icon: Users },
    { id: "sugerencias", label: "Sugerencias", icon: Inbox },
  ]

  // Agregar tab de admin solo para administradores
  const adminTab = { id: "admin", label: "Admin", icon: Settings }

  // Filtrar tabs según el acceso durante desarrollo
  let tabs =
    isInDevelopment && !hasFullAccess()
      ? allTabs.filter((tab) => tab.id === "perfil") // Solo mostrar perfil para usuarios regulares
      : allTabs // Mostrar todas las tabs para administradores o cuando no esté en desarrollo

  // Agregar tab de admin para administradores
  if (hasFullAccess()) {
    tabs = [...tabs, adminTab]
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push("/login")
    }
    setShowLogoutDialog(false)
  }

  const handleNotificacionesClick = () => {
    setShowNotificationCenter(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra Superior */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-2">
          {/* Saludo personalizado */}
          {profile && (
            <span className="text-sm text-gray-600 hidden sm:block">Hola, {profile.nombre_completo.split(" ")[0]}</span>
          )}

          {/* Botón de notificaciones - solo visible para administradores */}
          {profile && profile.rol === "Administrador" && (
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2" onClick={handleNotificacionesClick}>
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Área de Contenido Principal */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Barra de Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  // Agregar navegación
                  if (tab.id === "perfil") router.push("/perfil")
                  if (tab.id === "beneficios") router.push("/beneficios")
                  if (tab.id === "eventos") router.push("/eventos")
                  if (tab.id === "directorio") router.push("/directorio")
                  if (tab.id === "sugerencias") router.push("/sugerencias")
                  if (tab.id === "admin") router.push("/admin")
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive ? "text-[#005A9C] bg-blue-50" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? "text-[#005A9C]" : ""}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Salir</span>
          </button>
        </div>
      </nav>

      {/* Notification Center */}
      <NotificationCenter isOpen={showNotificationCenter} onClose={() => setShowNotificationCenter(false)} />

      {/* Dialog de confirmación para cerrar sesión */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder a la
              aplicación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
