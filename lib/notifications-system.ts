import { supabase } from "./supabase"

export type NotificationType = "welcome" | "feature_development" | "benefit" | "event" | "system" | "general"
export type NotificationPriority = "low" | "medium" | "high" | "urgent"
export type NotificationStatus = "unread" | "read" | "dismissed"

export interface NotificationTemplate {
  id: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  color?: string
  actionText?: string
  actionUrl?: string
  priority: NotificationPriority
  autoExpire?: number // minutes
  conditions?: {
    userRoles?: string[]
    userBienestar?: boolean
    minLoginCount?: number
    maxLoginCount?: number
  }
}

export interface DynamicNotification {
  id: string
  user_id: string
  template_id: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  color?: string
  action_text?: string
  action_url?: string
  priority: NotificationPriority
  status: NotificationStatus
  created_at: Date | string
  read_at?: Date | string | null
  dismissed_at?: Date | string | null
  expires_at?: Date | string | null
  metadata?: Record<string, any>
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "welcome_new_user",
    type: "welcome",
    title: "¡Bienvenido a Bienestar Montessori!",
    message:
      "Te damos la bienvenida a tu portal de beneficios. Aquí podrás acceder a todos los convenios, eventos y servicios disponibles para el personal del colegio.",
    icon: "👋",
    color: "bg-blue-500",
    actionText: "Explorar Beneficios",
    actionUrl: "/beneficios",
    priority: "medium",
    autoExpire: 10080, // 7 days
    conditions: {
      maxLoginCount: 3,
    },
  },
  {
    id: "feature_under_development",
    type: "feature_development",
    title: "Funcionalidad en Desarrollo",
    message:
      "Algunas funciones están temporalmente restringidas mientras realizamos mejoras. Solo los administradores tienen acceso completo durante esta fase.",
    icon: "🚧",
    color: "bg-orange-500",
    actionText: "Ver Mi Perfil",
    actionUrl: "/perfil",
    priority: "medium",
    autoExpire: 1440, // 24 hours
    conditions: {
      userRoles: ["Beneficiario", "Visualizador", "Presidente", "Directorio"],
    },
  },
  {
    id: "new_benefit_available",
    type: "benefit",
    title: "Nuevo Beneficio Disponible",
    message:
      "Se ha agregado un nuevo convenio a tu programa de bienestar. ¡Revisa los detalles y aprovecha esta oportunidad!",
    icon: "🎁",
    color: "bg-green-500",
    actionText: "Ver Beneficios",
    actionUrl: "/beneficios",
    priority: "high",
    conditions: {
      userBienestar: true,
    },
  },
  {
    id: "upcoming_event",
    type: "event",
    title: "Próximo Evento de Bienestar",
    message:
      "No te pierdas los próximos eventos organizados por el comité de bienestar. ¡Tu participación es importante!",
    icon: "📅",
    color: "bg-purple-500",
    actionText: "Ver Eventos",
    actionUrl: "/eventos",
    priority: "medium",
  },
  {
    id: "system_maintenance",
    type: "system",
    title: "Mantenimiento Programado",
    message:
      "El sistema estará en mantenimiento el próximo domingo de 2:00 a 6:00 AM. Durante este tiempo, algunas funciones podrían no estar disponibles.",
    icon: "⚙️",
    color: "bg-gray-500",
    priority: "low",
    autoExpire: 2880, // 48 hours
  },
]

// Función para convertir el formato de la base de datos al formato de la aplicación
function mapDbNotificationToApp(dbNotification: any): DynamicNotification {
  return {
    id: dbNotification.id,
    user_id: dbNotification.user_id,
    template_id: dbNotification.template_id || "unknown",
    type: dbNotification.type,
    title: dbNotification.title,
    message: dbNotification.message,
    icon: dbNotification.icon,
    color: dbNotification.color,
    action_text: dbNotification.action_text,
    action_url: dbNotification.action_url,
    priority: dbNotification.priority || "medium",
    status: dbNotification.status || "unread",
    created_at: dbNotification.created_at,
    read_at: dbNotification.read_at,
    dismissed_at: dbNotification.dismissed_at,
    expires_at: dbNotification.expires_at,
    metadata: dbNotification.metadata,
  }
}

export class NotificationSystem {
  private static instance: NotificationSystem
  private listeners: Set<(notifications: DynamicNotification[]) => void> = new Set()
  private cachedNotifications: Map<string, DynamicNotification[]> = new Map()
  private tableExists: boolean | null = null

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem()
    }
    return NotificationSystem.instance
  }

  // Check if notifications table exists
  private async checkTableExists(): Promise<boolean> {
    if (this.tableExists !== null) {
      return this.tableExists
    }

    try {
      const { error } = await supabase.from("notificaciones").select("id").limit(1)
      this.tableExists = !error
      return this.tableExists
    } catch (error) {
      console.warn("Notifications table does not exist, using fallback mode")
      this.tableExists = false
      return false
    }
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: DynamicNotification[]) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Notify all subscribers
  private notifyListeners(userId: string) {
    const notifications = this.cachedNotifications.get(userId) || []
    this.listeners.forEach((callback) => callback(notifications))
  }

  // Check if user meets template conditions
  private meetsConditions(template: NotificationTemplate, userProfile: any, loginCount = 1): boolean {
    const { conditions } = template
    if (!conditions) return true

    // Check user roles
    if (conditions.userRoles && !conditions.userRoles.includes(userProfile.rol)) {
      return false
    }

    // Check bienestar status
    if (conditions.userBienestar !== undefined && conditions.userBienestar !== userProfile.es_bienestar) {
      return false
    }

    // Check login count range
    if (conditions.minLoginCount && loginCount < conditions.minLoginCount) {
      return false
    }

    if (conditions.maxLoginCount && loginCount > conditions.maxLoginCount) {
      return false
    }

    return true
  }

  // Generate notification from template (fallback mode)
  private generateNotificationFallback(
    template: NotificationTemplate,
    userId: string,
    metadata?: Record<string, any>,
  ): DynamicNotification {
    const now = new Date()
    const expiresAt = template.autoExpire ? new Date(now.getTime() + template.autoExpire * 60 * 1000) : undefined

    return {
      id: `${template.id}_${userId}_${Date.now()}`,
      user_id: userId,
      template_id: template.id,
      type: template.type,
      title: template.title,
      message: template.message,
      icon: template.icon,
      color: template.color,
      action_text: template.actionText,
      action_url: template.actionUrl,
      priority: template.priority,
      status: "unread",
      created_at: now,
      expires_at: expiresAt,
      metadata,
    }
  }

  // Initialize notifications for a user (with fallback)
  async initializeUserNotifications(userId: string, userProfile: any, loginCount = 1) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Fallback mode: use in-memory notifications
      return this.initializeUserNotificationsFallback(userId, userProfile, loginCount)
    }

    const notifications: DynamicNotification[] = []

    try {
      // Obtener notificaciones existentes para el usuario
      const { data: existingNotifications, error: fetchError } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError)
        return this.initializeUserNotificationsFallback(userId, userProfile, loginCount)
      }

      // Procesar cada plantilla
      for (const template of NOTIFICATION_TEMPLATES) {
        if (this.meetsConditions(template, userProfile, loginCount)) {
          // Verificar si esta notificación ya existe para el usuario
          const alreadyExists = existingNotifications?.some(
            (n) => n.template_id === template.id && n.status !== "dismissed",
          )

          if (!alreadyExists) {
            const notification = this.generateNotificationFallback(template, userId)

            // Intentar insertar en la base de datos
            try {
              const { data, error } = await supabase
                .from("notificaciones")
                .insert([
                  {
                    id: notification.id,
                    user_id: notification.user_id,
                    template_id: notification.template_id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    icon: notification.icon,
                    color: notification.color,
                    action_text: notification.action_text,
                    action_url: notification.action_url,
                    priority: notification.priority,
                    status: notification.status,
                    expires_at: notification.expires_at,
                    metadata: notification.metadata,
                  },
                ])
                .select()

              if (error) {
                console.error("Error creating notification:", error)
                // Add to fallback cache
                notifications.push(notification)
              } else if (data) {
                notifications.push(mapDbNotificationToApp(data[0]))
              }
            } catch (insertError) {
              console.error("Error inserting notification:", insertError)
              notifications.push(notification)
            }
          }
        }
      }

      // Actualizar caché y notificar
      await this.refreshUserNotifications(userId)
      return notifications
    } catch (error) {
      console.error("Error initializing notifications:", error)
      return this.initializeUserNotificationsFallback(userId, userProfile, loginCount)
    }
  }

  // Fallback initialization (in-memory)
  private initializeUserNotificationsFallback(userId: string, userProfile: any, loginCount = 1) {
    const notifications: DynamicNotification[] = []
    const existingNotifications = this.cachedNotifications.get(userId) || []

    for (const template of NOTIFICATION_TEMPLATES) {
      if (this.meetsConditions(template, userProfile, loginCount)) {
        const alreadyExists = existingNotifications.some(
          (n) => n.template_id === template.id && n.status !== "dismissed",
        )

        if (!alreadyExists) {
          const notification = this.generateNotificationFallback(template, userId)
          notifications.push(notification)
        }
      }
    }

    // Update cache
    const allNotifications = [...existingNotifications, ...notifications]
    const activeNotifications = allNotifications.filter((n) => !n.expires_at || new Date(n.expires_at) > new Date())

    this.cachedNotifications.set(userId, activeNotifications)
    this.notifyListeners(userId)

    return notifications
  }

  // Refresh notifications from database (with fallback)
  async refreshUserNotifications(userId: string) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Use cached notifications
      const notifications = this.cachedNotifications.get(userId) || []
      this.notifyListeners(userId)
      return notifications
    }

    try {
      // Build query carefully to handle missing columns
      let query = supabase
        .from("notificaciones")
        .select(
          "id, user_id, template_id, type, title, message, icon, color, action_text, action_url, priority, status, created_at, read_at, dismissed_at, metadata",
        )
        .eq("user_id", userId)
        .neq("status", "dismissed")
        .order("created_at", { ascending: false })

      // Try to add expires_at filter if column exists
      try {
        const now = new Date().toISOString()
        query = query.or(`expires_at.gt.${now},expires_at.is.null`)
      } catch (error) {
        // Column doesn't exist, continue without expires_at filter
        console.warn("expires_at column not available, skipping expiration filter")
      }

      const { data, error } = await query

      if (error) {
        console.error("Error refreshing notifications:", error)
        return this.cachedNotifications.get(userId) || []
      }

      // Mapear a formato de aplicación
      const notifications = data?.map(mapDbNotificationToApp) || []

      // Actualizar caché
      this.cachedNotifications.set(userId, notifications)

      // Notificar a los listeners
      this.notifyListeners(userId)

      return notifications
    } catch (error) {
      console.error("Error refreshing notifications:", error)
      return this.cachedNotifications.get(userId) || []
    }
  }

  // Add a custom notification (with fallback)
  async addNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      icon?: string
      color?: string
      actionText?: string
      actionUrl?: string
      priority?: NotificationPriority
      autoExpire?: number
      metadata?: Record<string, any>
    },
  ) {
    const tableExists = await this.checkTableExists()

    const now = new Date()
    const expiresAt = options?.autoExpire ? new Date(now.getTime() + options.autoExpire * 60 * 1000) : null

    const notificationData: DynamicNotification = {
      id: `custom_${userId}_${Date.now()}`,
      user_id: userId,
      template_id: "custom",
      type,
      title,
      message,
      icon: options?.icon,
      color: options?.color,
      action_text: options?.actionText,
      action_url: options?.actionUrl,
      priority: options?.priority || "medium",
      status: "unread",
      created_at: now,
      expires_at: expiresAt,
      metadata: options?.metadata,
    }

    if (!tableExists) {
      // Fallback mode
      const existingNotifications = this.cachedNotifications.get(userId) || []
      const updatedNotifications = [notificationData, ...existingNotifications]
      this.cachedNotifications.set(userId, updatedNotifications)
      this.notifyListeners(userId)
      return notificationData
    }

    try {
      const { data, error } = await supabase
        .from("notificaciones")
        .insert([
          {
            id: notificationData.id,
            user_id: notificationData.user_id,
            template_id: notificationData.template_id,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            icon: notificationData.icon,
            color: notificationData.color,
            action_text: notificationData.action_text,
            action_url: notificationData.action_url,
            priority: notificationData.priority,
            status: notificationData.status,
            expires_at: notificationData.expires_at,
            metadata: notificationData.metadata,
          },
        ])
        .select()

      if (error) {
        console.error("Error adding notification:", error)
        // Fallback to cache
        const existingNotifications = this.cachedNotifications.get(userId) || []
        const updatedNotifications = [notificationData, ...existingNotifications]
        this.cachedNotifications.set(userId, updatedNotifications)
        this.notifyListeners(userId)
        return notificationData
      }

      // Actualizar caché
      await this.refreshUserNotifications(userId)

      return data ? mapDbNotificationToApp(data[0]) : notificationData
    } catch (error) {
      console.error("Error adding notification:", error)
      // Fallback to cache
      const existingNotifications = this.cachedNotifications.get(userId) || []
      const updatedNotifications = [notificationData, ...existingNotifications]
      this.cachedNotifications.set(userId, updatedNotifications)
      this.notifyListeners(userId)
      return notificationData
    }
  }

  // Get user notifications (with fallback)
  async getUserNotifications(userId: string): Promise<DynamicNotification[]> {
    // Si hay caché, devolverla
    if (this.cachedNotifications.has(userId)) {
      return this.cachedNotifications.get(userId) || []
    }

    // Si no hay caché, refrescar desde la base de datos
    const notifications = await this.refreshUserNotifications(userId)
    return notifications || []
  }

  // Mark notification as read (with fallback)
  async markAsRead(userId: string, notificationId: string) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Fallback mode
      const notifications = this.cachedNotifications.get(userId) || []
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, status: "read" as NotificationStatus, read_at: new Date() } : n,
      )
      this.cachedNotifications.set(userId, updated)
      this.notifyListeners(userId)
      return
    }

    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "read", read_at: now })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (error) {
        console.error("Error marking notification as read:", error)
        return
      }

      // Actualizar caché
      await this.refreshUserNotifications(userId)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Dismiss notification (with fallback)
  async dismissNotification(userId: string, notificationId: string) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Fallback mode
      const notifications = this.cachedNotifications.get(userId) || []
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, status: "dismissed" as NotificationStatus, dismissed_at: new Date() } : n,
      )
      this.cachedNotifications.set(userId, updated)
      this.notifyListeners(userId)
      return
    }

    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "dismissed", dismissed_at: now })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (error) {
        console.error("Error dismissing notification:", error)
        return
      }

      // Actualizar caché
      await this.refreshUserNotifications(userId)
    } catch (error) {
      console.error("Error dismissing notification:", error)
    }
  }

  // Remove notification (with fallback)
  async removeNotification(userId: string, notificationId: string) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Fallback mode
      const notifications = this.cachedNotifications.get(userId) || []
      const updated = notifications.filter((n) => n.id !== notificationId)
      this.cachedNotifications.set(userId, updated)
      this.notifyListeners(userId)
      return
    }

    try {
      const { error } = await supabase.from("notificaciones").delete().eq("id", notificationId).eq("user_id", userId)

      if (error) {
        console.error("Error removing notification:", error)
        return
      }

      // Actualizar caché
      await this.refreshUserNotifications(userId)
    } catch (error) {
      console.error("Error removing notification:", error)
    }
  }

  // Get unread count (with fallback)
  async getUnreadCount(userId: string): Promise<number> {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Fallback mode
      const notifications = this.cachedNotifications.get(userId) || []
      return notifications.filter((n) => n.status === "unread").length
    }

    try {
      const { count, error } = await supabase
        .from("notificaciones")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "unread")

      if (error) {
        console.error("Error getting unread count:", error)
        // Fallback to cache
        const notifications = this.cachedNotifications.get(userId) || []
        return notifications.filter((n) => n.status === "unread").length
      }

      return count || 0
    } catch (error) {
      console.error("Error getting unread count:", error)
      // Fallback to cache
      const notifications = this.cachedNotifications.get(userId) || []
      return notifications.filter((n) => n.status === "unread").length
    }
  }

  // Mark all as read (with fallback)
  async markAllAsRead(userId: string) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Fallback mode
      const notifications = this.cachedNotifications.get(userId) || []
      const updated = notifications.map((n) =>
        n.status === "unread" ? { ...n, status: "read" as NotificationStatus, read_at: new Date() } : n,
      )
      this.cachedNotifications.set(userId, updated)
      this.notifyListeners(userId)
      return
    }

    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "read", read_at: now })
        .eq("user_id", userId)
        .eq("status", "unread")

      if (error) {
        console.error("Error marking all as read:", error)
        return
      }

      // Actualizar caché
      await this.refreshUserNotifications(userId)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  // Clear all notifications (with fallback)
  async clearAllNotifications(userId: string) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      // Fallback mode
      this.cachedNotifications.set(userId, [])
      this.notifyListeners(userId)
      return
    }

    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "dismissed", dismissed_at: now })
        .eq("user_id", userId)
        .neq("status", "dismissed")

      if (error) {
        console.error("Error clearing all notifications:", error)
        return
      }

      // Actualizar caché
      await this.refreshUserNotifications(userId)
    } catch (error) {
      console.error("Error clearing all notifications:", error)
    }
  }

  // Broadcast notification to all users (with fallback)
  async broadcastNotification(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      icon?: string
      color?: string
      actionText?: string
      actionUrl?: string
      priority?: NotificationPriority
      autoExpire?: number
      targetRoles?: string[]
      targetBienestar?: boolean
      metadata?: Record<string, any>
    },
  ) {
    const tableExists = await this.checkTableExists()

    if (!tableExists) {
      console.warn("Cannot broadcast notifications: table does not exist")
      return
    }

    try {
      // Obtener todos los usuarios que cumplen con los criterios
      let query = supabase.from("perfiles").select("id")

      if (options?.targetRoles && options.targetRoles.length > 0) {
        query = query.in("rol", options.targetRoles)
      }

      if (options?.targetBienestar !== undefined) {
        query = query.eq("es_bienestar", options.targetBienestar)
      }

      const { data: users, error } = await query

      if (error) {
        console.error("Error fetching users for broadcast:", error)
        return
      }

      // Crear notificaciones para cada usuario
      const now = new Date()
      const expiresAt = options?.autoExpire ? new Date(now.getTime() + options.autoExpire * 60 * 1000) : null

      const notifications = users?.map((user) => ({
        id: `broadcast_${user.id}_${Date.now()}`,
        user_id: user.id,
        template_id: "broadcast",
        type,
        title,
        message,
        icon: options?.icon,
        color: options?.color,
        action_text: options?.actionText,
        action_url: options?.actionUrl,
        priority: options?.priority || "medium",
        status: "unread",
        expires_at: expiresAt,
        metadata: options?.metadata,
      }))

      if (notifications && notifications.length > 0) {
        const { error: insertError } = await supabase.from("notificaciones").insert(notifications)

        if (insertError) {
          console.error("Error broadcasting notifications:", insertError)
        }

        // Actualizar caché para usuarios afectados
        for (const user of users || []) {
          await this.refreshUserNotifications(user.id)
        }
      }
    } catch (error) {
      console.error("Error broadcasting notifications:", error)
    }
  }
}

// Export singleton instance
export const notificationSystem = NotificationSystem.getInstance()
