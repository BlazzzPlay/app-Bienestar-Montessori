"use client"

import { useState } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificationSystem } from "@/hooks/useNotificationSystem"
import NotificationItem from "./notification-item"
// Añadir la importación del hook useAuth
import { useAuth } from "@/hooks/useAuth"

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

// Añadir la verificación de rol al inicio del componente
export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { profile } = useAuth()
  const {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    loading,
    markAsRead,
    dismissNotification,
    removeNotification,
    markAllAsRead,
    clearAll,
  } = useNotificationSystem()

  const [activeTab, setActiveTab] = useState("all")

  // Si el usuario no es administrador, no mostrar el centro de notificaciones
  if (!profile || profile.rol !== "Administrador") {
    return null
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleDismiss = (notificationId: string) => {
    dismissNotification(notificationId)
  }

  const handleRemove = (notificationId: string) => {
    removeNotification(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleClearAll = () => {
    clearAll()
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Centro de Notificaciones</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-primary hover:text-primary/80"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas como leídas
                </Button>
              )}

              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpiar todo
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Mantente al día con las últimas actualizaciones y eventos del programa de bienestar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="relative">
                Todas
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                No leídas
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">
                Leídas
                {readNotifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {readNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDismiss={handleDismiss}
                        onRemove={handleRemove}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes notificaciones</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Te notificaremos cuando haya nuevas actualizaciones.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="flex-1 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDismiss={handleDismiss}
                        onRemove={handleRemove}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Check className="h-12 w-12 text-green-300 mx-auto mb-4" />
                      <p className="text-gray-500">¡Todo al día!</p>
                      <p className="text-sm text-gray-400 mt-1">
                        No tienes notificaciones sin leer.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="read" className="flex-1 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {readNotifications.length > 0 ? (
                    readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDismiss={handleDismiss}
                        onRemove={handleRemove}
                        compact
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay notificaciones leídas</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
