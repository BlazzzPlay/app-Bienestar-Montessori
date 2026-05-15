"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotificationSystem } from "@/hooks/useNotificationSystem"
import NotificationCenter from "@/components/notifications/notification-center"

export default function AdminNotificationBell() {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const { unreadCount } = useNotificationSystem()

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-primary-foreground/80 hover:text-primary-foreground"
          type="button"
          aria-label={
            unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"
          }
          onClick={() => setShowNotificationCenter(true)}
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

      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </>
  )
}
