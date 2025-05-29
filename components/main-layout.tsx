"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, UserRound, Gift, CalendarDays, Users, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState("perfil")
  const router = useRouter()
  const pathname = usePathname()

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra Superior */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <Button variant="ghost" size="sm" className="p-2">
          <Bell className="h-5 w-5 text-gray-600" />
        </Button>
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
        </div>
      </nav>
    </div>
  )
}
