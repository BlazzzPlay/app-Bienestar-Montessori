// Placeholder para Analytics - se activará cuando se instalen las dependencias
export const analyticsReady = false

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("Analytics Event:", eventName, properties)
  }
}

export function useAnalytics() {
  return {
    ready: false,
    trackEvent,
  }
}
