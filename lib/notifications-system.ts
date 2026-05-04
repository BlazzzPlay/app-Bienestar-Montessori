export interface DynamicNotification {
  id: string
  type: string
  title: string
  message: string
  status: "unread" | "read" | "dismissed"
  createdAt: string
  readAt?: string
  metadata?: Record<string, any>
  // UI display fields (optional, used by notification-item/toast)
  priority?: string
  color?: string
  icon?: string
  actionUrl?: string
  actionText?: string
  expiresAt?: Date | string
  created_at?: string
}

const STORAGE_KEY = "bm_notifications"

function getStored(userId: string): DynamicNotification[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function setStored(userId: string, notifications: DynamicNotification[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(notifications))
  } catch (e) {
    console.error("Error saving notifications:", e)
  }
}

let listeners: ((notifications: DynamicNotification[]) => void)[] = []

function emit(userId: string) {
  const notifications = getStored(userId)
  listeners.forEach((cb) => cb(notifications))
}

export const notificationSystem = {
  async getUserNotifications(userId: string): Promise<DynamicNotification[]> {
    return getStored(userId).filter((n) => n.status !== "dismissed")
  },

  async getUnreadCount(userId: string): Promise<number> {
    return getStored(userId).filter((n) => n.status === "unread").length
  },

  async initializeUserNotifications(userId: string, _profile: any, _loginCount: number) {
    const existing = getStored(userId)
    if (existing.length > 0) return

    const welcome: DynamicNotification = {
      id: `notif-${Date.now()}`,
      type: "welcome",
      title: "Bienvenido al Panel de Administración",
      message: "Aquí podrás gestionar notificaciones y ver estadísticas del sistema.",
      status: "unread",
      createdAt: new Date().toISOString(),
    }
    setStored(userId, [welcome])
    emit(userId)
  },

  subscribe(callback: (notifications: DynamicNotification[]) => void) {
    listeners.push(callback)
    return () => {
      listeners = listeners.filter((cb) => cb !== callback)
    }
  },

  async markAsRead(userId: string, notificationId: string) {
    const notifications = getStored(userId)
    const index = notifications.findIndex((n) => n.id === notificationId)
    if (index !== -1) {
      notifications[index].status = "read"
      notifications[index].readAt = new Date().toISOString()
      setStored(userId, notifications)
      emit(userId)
    }
  },

  async dismissNotification(userId: string, notificationId: string) {
    const notifications = getStored(userId)
    const index = notifications.findIndex((n) => n.id === notificationId)
    if (index !== -1) {
      notifications[index].status = "dismissed"
      setStored(userId, notifications)
      emit(userId)
    }
  },

  async removeNotification(userId: string, notificationId: string) {
    const notifications = getStored(userId).filter((n) => n.id !== notificationId)
    setStored(userId, notifications)
    emit(userId)
  },

  async markAllAsRead(userId: string) {
    const notifications = getStored(userId).map((n) =>
      n.status === "unread"
        ? { ...n, status: "read" as const, readAt: new Date().toISOString() }
        : n,
    )
    setStored(userId, notifications)
    emit(userId)
  },

  async clearAllNotifications(userId: string) {
    setStored(userId, [])
    emit(userId)
  },

  async addNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    options?: any,
  ): Promise<DynamicNotification> {
    const notifications = getStored(userId)
    const notification: DynamicNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      message,
      status: "unread",
      createdAt: new Date().toISOString(),
      metadata: options,
    }
    notifications.unshift(notification)
    setStored(userId, notifications)
    emit(userId)
    return notification
  },
}
