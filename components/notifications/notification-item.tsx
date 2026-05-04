"use client"

import type React from "react"

import { useState } from "react"
import { X, Check, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { DynamicNotification } from "@/lib/notifications-system"

interface NotificationItemProps {
  notification: DynamicNotification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onRemove: (id: string) => void
  compact?: boolean
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onRemove,
  compact = false,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "welcome":
        return "border-l-blue-500 bg-blue-50"
      case "feature_development":
        return "border-l-orange-500 bg-orange-50"
      case "benefit":
        return "border-l-green-500 bg-green-50"
      case "event":
        return "border-l-purple-500 bg-purple-50"
      case "system":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

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

  const handleAction = () => {
    if (notification.status === "unread") {
      onMarkAsRead(notification.id)
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(notification.id)
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss(notification.id)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove(notification.id)
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer border-l-4",
        getTypeColor(notification.type),
        notification.status === "unread" ? "shadow-md" : "shadow-sm",
        isHovered && "shadow-lg transform scale-[1.02]",
        compact && "p-2",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleAction}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between space-x-3">
          {/* Icon and Content */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg",
                notification.color || getPriorityColor(notification.priority),
              )}
            >
              {notification.icon || "📢"}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      "text-sm font-medium text-gray-900 truncate",
                      notification.status === "unread" && "font-semibold",
                    )}
                  >
                    {notification.title}
                  </h4>

                  <p
                    className={cn(
                      "text-sm text-gray-600 mt-1",
                      compact ? "line-clamp-1" : "line-clamp-2",
                    )}
                  >
                    {notification.message}
                  </p>

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

                {/* Priority badge and timestamp */}
                <div className="flex flex-col items-end space-y-1 ml-2">
                  <div className="flex items-center space-x-2">
                    {notification.priority === "urgent" && (
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                    )}
                    {notification.priority === "high" && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        Alta
                      </Badge>
                    )}
                    {notification.status === "unread" && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(notification.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div
            className={cn(
              "flex flex-col space-y-1 opacity-0 transition-opacity",
              isHovered && "opacity-100",
            )}
          >
            {notification.status === "unread" && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-green-600 hover:text-green-800"
                onClick={handleMarkAsRead}
                title="Marcar como leído"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-gray-400 hover:text-gray-600"
              onClick={handleRemove}
              title="Eliminar notificación"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expiration warning */}
        {notification.expiresAt && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Expira:{" "}
            {typeof notification.expiresAt === "string"
              ? new Date(notification.expiresAt).toLocaleDateString("es-ES")
              : notification.expiresAt.toLocaleDateString("es-ES")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
