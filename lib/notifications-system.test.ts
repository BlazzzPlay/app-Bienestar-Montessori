import { describe, it, expect, beforeEach, vi } from "vitest"
import { notificationSystem, DynamicNotification } from "./notifications-system"

describe("notificationSystem", () => {
  const userId = "user-1"

  beforeEach(() => {
    localStorage.clear()
  })

  describe("getUserNotifications", () => {
    it("returns empty array when no notifications exist", async () => {
      const result = await notificationSystem.getUserNotifications(userId)
      expect(result).toEqual([])
    })

    it("excludes dismissed notifications", async () => {
      await notificationSystem.addNotification(userId, "test", "T", "M")
      const all = await notificationSystem.getUserNotifications(userId)
      expect(all).toHaveLength(1)
      await notificationSystem.dismissNotification(userId, all[0].id)
      const result = await notificationSystem.getUserNotifications(userId)
      expect(result).toHaveLength(0)
    })
  })

  describe("getUnreadCount", () => {
    it("returns 0 when no unread notifications", async () => {
      const count = await notificationSystem.getUnreadCount(userId)
      expect(count).toBe(0)
    })

    it("returns count of unread notifications", async () => {
      await notificationSystem.addNotification(userId, "a", "A", "M")
      await notificationSystem.addNotification(userId, "b", "B", "M")
      const count = await notificationSystem.getUnreadCount(userId)
      expect(count).toBe(2)
    })
  })

  describe("addNotification", () => {
    it("adds a notification and returns it", async () => {
      const notif = await notificationSystem.addNotification(userId, "info", "Title", "Message")
      expect(notif.title).toBe("Title")
      expect(notif.message).toBe("Message")
      expect(notif.status).toBe("unread")
    })
  })

  describe("markAsRead", () => {
    it("marks a notification as read", async () => {
      const notif = await notificationSystem.addNotification(userId, "info", "T", "M")
      await notificationSystem.markAsRead(userId, notif.id)
      const result = await notificationSystem.getUserNotifications(userId)
      expect(result[0].status).toBe("read")
      expect(result[0].readAt).toBeDefined()
    })
  })

  describe("dismissNotification", () => {
    it("dismisses a notification", async () => {
      const notif = await notificationSystem.addNotification(userId, "info", "T", "M")
      await notificationSystem.dismissNotification(userId, notif.id)
      const result = await notificationSystem.getUserNotifications(userId)
      expect(result).toHaveLength(0)
    })
  })

  describe("removeNotification", () => {
    it("removes a notification completely", async () => {
      const notif = await notificationSystem.addNotification(userId, "info", "T", "M")
      await notificationSystem.removeNotification(userId, notif.id)
      const result = await notificationSystem.getUserNotifications(userId)
      expect(result).toHaveLength(0)
    })
  })

  describe("markAllAsRead", () => {
    it("marks all notifications as read", async () => {
      await notificationSystem.addNotification(userId, "a", "A", "M")
      await notificationSystem.addNotification(userId, "b", "B", "M")
      await notificationSystem.markAllAsRead(userId)
      const result = await notificationSystem.getUserNotifications(userId)
      expect(result.every((n) => n.status === "read")).toBe(true)
    })
  })

  describe("clearAllNotifications", () => {
    it("removes all notifications", async () => {
      await notificationSystem.addNotification(userId, "a", "A", "M")
      await notificationSystem.clearAllNotifications(userId)
      const result = await notificationSystem.getUserNotifications(userId)
      expect(result).toHaveLength(0)
    })
  })

  describe("subscribe", () => {
    it("notifies subscribers on changes", async () => {
      const listener = vi.fn()
      const unsubscribe = notificationSystem.subscribe(listener)
      await notificationSystem.addNotification(userId, "a", "A", "M")
      expect(listener).toHaveBeenCalled()
      unsubscribe()
    })
  })
})
