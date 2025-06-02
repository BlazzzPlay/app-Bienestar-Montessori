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
  usuario_id: string // Cambiado de user_id a usuario_id para coincidir con la DB
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
    usuario_id: dbNotification.usuario_id,
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

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem()
    }
    return NotificationSystem.instance
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

  // Refresh notifications from database
  async refreshUserNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", userId)
        .neq("status", "dismissed")
        .order("created_at", { ascending: false })

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

  // Get user notifications
  async getUserNotifications(userId: string): Promise<DynamicNotification[]> {
    // Si hay caché, devolverla
    if (this.cachedNotifications.has(userId)) {
      return this.cachedNotifications.get(userId) || []
    }

    // Si no hay caché, refrescar desde la base de datos
    const notifications = await this.refreshUserNotifications(userId)
    return notifications || []
  }

  // Mark notification as read
  async markAsRead(userId: string, notificationId: string) {
    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "read", read_at: now })
        .eq("id", notificationId)
        .eq("usuario_id", userId)

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

  // Dismiss notification
  async dismissNotification(userId: string, notificationId: string) {
    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "dismissed", dismissed_at: now })
        .eq("id", notificationId)
        .eq("usuario_id", userId)

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

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("notificaciones")
        .select("*", { count: "exact", head: true })
        .eq("usuario_id", userId)
        .eq("status", "unread")

      if (error) {
        console.error("Error getting unread count:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Error getting unread count:", error)
      return 0
    }
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "read", read_at: now })
        .eq("usuario_id", userId)
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

  // Clear all notifications
  async clearAllNotifications(userId: string) {
    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("notificaciones")
        .update({ status: "dismissed", dismissed_at: now })
        .eq("usuario_id", userId)
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
}

// Export singleton instance
export const notificationSystem = NotificationSystem.getInstance()
