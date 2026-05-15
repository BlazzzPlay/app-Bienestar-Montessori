"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, UserRound, Gift, CalendarDays, Users, Inbox, Shield, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "next-themes"
import { useNotificationSystem } from "@/hooks/useNotificationSystem"
import NotificationCenter from "@/components/notifications/notification-center"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState("perfil")
  const { unreadCount } = useNotificationSystem()
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { profile, hasFullAccess } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    if (pathname.includes("/perfil")) setActiveTab("perfil")
    if (pathname.includes("/beneficios")) setActiveTab("beneficios")
    if (pathname.includes("/eventos")) setActiveTab("eventos")
    if (pathname.includes("/directorio")) setActiveTab("directorio")
    if (pathname.includes("/sugerencias")) setActiveTab("sugerencias")
  }, [pathname])

  const tabs = [
    { id: "perfil", label: "Perfil", icon: UserRound },
    { id: "beneficios", label: "Beneficios", icon: Gift },
    { id: "eventos", label: "Eventos", icon: CalendarDays },
    { id: "directorio", label: "Directorio", icon: Users },
    { id: "sugerencias", label: "Sugerencias", icon: Inbox },
  ]

  const handleNotificacionesClick = () => {
    setShowNotificationCenter(true)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:static focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
      >
        Saltar al contenido principal
      </a>

      {/* Barra Superior */}
      <header
        aria-label="Barra superior"
        className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between"
      >
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center space-x-1">
          {/* Saludo personalizado */}
          {profile && (
            <span className="text-sm text-primary-foreground/80 hidden sm:block mr-2">
              Hola, {profile.nombre_completo.split(" ")[0]}
            </span>
          )}

          {/* Admin - solo para administradores */}
          {hasFullAccess() && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-primary-foreground/80 hover:text-primary-foreground"
              aria-label="Panel de administración"
              type="button"
              onClick={() => router.push("/admin")}
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}

          {/* Botón de notificaciones */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              type="button"
              aria-label={
                unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"
              }
              onClick={handleNotificacionesClick}
            >
              <Bell className="h-5 w-5" />
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

          {/* Botón de tema */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            aria-label="Cambiar tema"
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Área de Contenido Principal */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Barra de Navegación Inferior — 5 botones fijos */}
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 py-2 dark:bg-gray-950 dark:border-gray-800"
      >
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id === "perfil") router.push("/perfil")
                  if (tab.id === "beneficios") router.push("/beneficios")
                  if (tab.id === "eventos") router.push("/eventos")
                  if (tab.id === "directorio") router.push("/directorio")
                  if (tab.id === "sugerencias") router.push("/sugerencias")
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-secondary bg-secondary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${isActive ? "text-secondary" : ""}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </div>
  )
}
