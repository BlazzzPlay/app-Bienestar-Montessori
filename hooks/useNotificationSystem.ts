"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { database } from "@/lib/database"
import { useAuth } from "./useAuth"
import type { Notificacion } from "@/lib/supabase"

export interface DynamicNotification {
  id: string
  type: string
  title: string
  message: string
  status: "unread" | "read" | "dismissed"
  createdAt: string
  readAt?: string
  metadata?: Record<string, any>
  priority?: string
  color?: string
  icon?: string
  actionUrl?: string
  actionText?: string
  expiresAt?: Date | string
  created_at?: string
}

function mapToDynamic(n: Notificacion): DynamicNotification {
  return {
    id: n.id,
    type: n.tipo,
    title: n.titulo,
    message: n.mensaje,
    status: n.estado === "no_leida" ? "unread" : n.estado === "leida" ? "read" : "dismissed",
    createdAt: n.creado_en,
    created_at: n.creado_en,
    readAt: n.leido_en ?? undefined,
    metadata: n.metadata ?? undefined,
    priority: n.prioridad,
    color: n.color ?? undefined,
    icon: n.icono ?? undefined,
    actionUrl: n.action_url ?? undefined,
    actionText: n.action_text ?? undefined,
  }
}

export function useNotificationSystem() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<DynamicNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const realtimeConnectedRef = useRef(false)

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data } = await database.getNotificaciones(user.id)
      const mapped = (data || []).map(mapToDynamic)
      setNotifications(mapped)
      setUnreadCount(mapped.filter((n) => n.status === "unread").length)
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    loadNotifications()

    const channel = supabase
      .channel(`notificaciones:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = mapToDynamic(payload.new as Notificacion)
          setNotifications((prev) => [newNotif, ...prev])
          setUnreadCount((prev) => prev + 1)
          toast(newNotif.title, {
            description: newNotif.message,
          })
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          realtimeConnectedRef.current = true
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          realtimeConnectedRef.current = false
          if (!pollingRef.current) {
            pollingRef.current = setInterval(() => {
              loadNotifications()
            }, 30000)
          }
        }
      })

    // Fallback: start polling if no realtime connection after 10s
    const fallbackTimer = setTimeout(() => {
      if (!realtimeConnectedRef.current && !pollingRef.current) {
        pollingRef.current = setInterval(() => {
          loadNotifications()
        }, 30000)
      }
    }, 10000)

    return () => {
      channel.unsubscribe()
      clearTimeout(fallbackTimer)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [user?.id, loadNotifications])

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return
    const { error } = await database.marcarNotificacionLeida(notificationId)
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: "read" as const, readAt: new Date().toISOString() }
            : n,
        ),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const dismissNotification = async (notificationId: string) => {
    if (!user?.id) return
    const { error } = await database.archivarNotificacion(notificationId)
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, status: "dismissed" as const } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const removeNotification = async (notificationId: string) => {
    if (!user?.id) return
    const wasUnread = notifications.find((n) => n.id === notificationId)?.status === "unread"
    const { error } = await database.eliminarNotificacion(notificationId)
    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    const { error } = await database.marcarTodasNotificacionesLeidas(user.id)
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.status === "unread"
            ? { ...n, status: "read" as const, readAt: new Date().toISOString() }
            : n,
        ),
      )
      setUnreadCount(0)
    }
  }

  const clearAll = async () => {
    if (!user?.id) return
    const { error } = await database.limpiarNotificaciones(user.id)
    if (!error) {
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const addCustomNotification = async (
    _type: any,
    _title: string,
    _message: string,
    _options?: any,
  ) => {
    console.warn("addCustomNotification is deprecated; use broadcastNotificacion instead")
    return null
  }

  const unreadNotifications = notifications.filter((n) => n.status === "unread")
  const readNotifications = notifications.filter((n) => n.status === "read")

  return {
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
    addCustomNotification,
    refreshNotifications: loadNotifications,
  }
}
