"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationSystem, type DynamicNotification } from "@/lib/notifications-system"
import { useAuth } from "./useAuth"

export function useNotificationSystem() {
  const { user, profile } = useAuth()
  const [notifications, setNotifications] = useState<DynamicNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Función para cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    // Solo cargar notificaciones para administradores
    if (profile?.rol !== "Administrador") {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Obtener notificaciones
      const userNotifications = await notificationSystem.getUserNotifications(user.id)
      setNotifications(userNotifications)

      // Obtener contador de no leídas
      const count = await notificationSystem.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile?.rol])

  useEffect(() => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    // Solo inicializar notificaciones para administradores
    const initializeNotifications = async () => {
      setLoading(true)

      // Solo para administradores
      if (profile?.rol === "Administrador") {
        // Simular contador de inicios de sesión (en una app real, esto vendría de los datos del usuario)
        const loginCount = Number.parseInt(localStorage.getItem(`loginCount_${user.id}`) || "1")

        if (profile) {
          await notificationSystem.initializeUserNotifications(user.id, profile, loginCount)
        }

        // Cargar notificaciones
        await loadNotifications()
      } else {
        setNotifications([])
        setUnreadCount(0)
        setLoading(false)
      }
    }

    initializeNotifications()

    // Suscribirse a actualizaciones de notificaciones solo para administradores
    let unsubscribe = () => {}
    if (profile?.rol === "Administrador") {
      unsubscribe = notificationSystem.subscribe((updatedNotifications) => {
        setNotifications(updatedNotifications)
        setUnreadCount(updatedNotifications.filter((n) => n.status === "unread").length)
      })
    }

    return unsubscribe
  }, [user?.id, profile, loadNotifications])

  // Modificar el incremento del contador de inicios de sesión para que solo se aplique a administradores
  useEffect(() => {
    if (user?.id && profile?.rol === "Administrador") {
      const currentCount = Number.parseInt(localStorage.getItem(`loginCount_${user.id}`) || "0")
      const newCount = currentCount + 1
      localStorage.setItem(`loginCount_${user.id}`, newCount.toString())
    }
  }, [user?.id, profile?.rol])

  const markAsRead = async (notificationId: string) => {
    if (!profile?.rol || profile?.rol !== "Administrador") return
    if (user?.id) {
      await notificationSystem.markAsRead(user.id, notificationId)
      await loadNotifications()
    }
  }

  const dismissNotification = async (notificationId: string) => {
    if (!profile?.rol || profile?.rol !== "Administrador") return
    if (user?.id) {
      await notificationSystem.dismissNotification(user.id, notificationId)
      await loadNotifications()
    }
  }

  const removeNotification = async (notificationId: string) => {
    if (!profile?.rol || profile?.rol !== "Administrador") return
    if (user?.id) {
      await notificationSystem.removeNotification(user.id, notificationId)
      await loadNotifications()
    }
  }

  const markAllAsRead = async () => {
    if (!profile?.rol || profile?.rol !== "Administrador") return
    if (user?.id) {
      await notificationSystem.markAllAsRead(user.id)
      await loadNotifications()
    }
  }

  const clearAll = async () => {
    if (!profile?.rol || profile?.rol !== "Administrador") return
    if (user?.id) {
      await notificationSystem.clearAllNotifications(user.id)
      await loadNotifications()
    }
  }

  const addCustomNotification = async (type: any, title: string, message: string, options?: any) => {
    if (!profile?.rol || profile?.rol !== "Administrador") return
    if (user?.id) {
      const result = await notificationSystem.addNotification(user.id, type, title, message, options)
      await loadNotifications()
      return result
    }
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
