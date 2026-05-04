"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { DynamicNotification } from "@/lib/notifications-system"

interface NotificationToastProps {
  notification: DynamicNotification
  onDismiss: () => void
  onMarkAsRead: () => void
  autoHide?: boolean
  duration?: number
}

// Replace the formatTimeAgo function with the same safer version
const formatTimeAgo = (date: Date | string | undefined) => {
  if (!date) {
    return "Hace un momento"
  }

  let dateObj: Date

  try {
    if (typeof date === "string") {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return "Hace un momento"
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Hace un momento"
    }

    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) {
      return "Hace un momento"
    } else if (minutes < 60) {
      return `Hace ${minutes} min`
    } else if (hours < 24) {
      return `Hace ${hours}h`
    } else if (days < 7) {
      return `Hace ${days}d`
    } else {
      return dateObj.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })
    }
  } catch (error) {
    console.warn("Error formatting date:", error)
    return "Hace un momento"
  }
}

export default function NotificationToast({
  notification,
  onDismiss,
  onMarkAsRead,
  autoHide = true,
  duration = 5000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoHide, duration])

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50"
      case "high":
        return "border-l-orange-500 bg-orange-50"
      case "medium":
        return "border-l-blue-500 bg-blue-50"
      case "low":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss()
    }, 300)
  }

  const handleAction = () => {
    onMarkAsRead()
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
    handleDismiss()
  }

  if (!isVisible) return null

  return (
    <Card
      className={cn(
        "fixed top-4 right-4 z-50 w-96 shadow-lg border-l-4 transition-all duration-300",
        getPriorityColor(notification.priority),
        isLeaving ? "transform translate-x-full opacity-0" : "transform translate-x-0 opacity-100",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-3">
          {/* Icon and Content */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
                notification.color || "bg-blue-500",
              )}
            >
              {notification.icon || "📢"}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{notification.title}</h4>

              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>

              {/* Action button */}
              {notification.actionText && notification.actionUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                  onClick={handleAction}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {notification.actionText}
                </Button>
              )}
            </div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto text-gray-400 hover:text-gray-600"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
