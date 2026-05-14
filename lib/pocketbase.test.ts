import { describe, it, expect, beforeEach, vi } from "vitest"

// -------------------------------------------------------------------
// Mock PocketBase constructor — each call produces a fresh instance
// so we can test singleton vs per-request semantics.
// -------------------------------------------------------------------
const mockLoadFromCookie = vi.fn()
const instances: any[] = []

function createMockInstance() {
  const instance = {
    collection: vi.fn(),
    authStore: {
      loadFromCookie: mockLoadFromCookie,
      clear: vi.fn(),
      record: null,
      isValid: false,
      token: "",
      exportToCookie: vi.fn(() => ""),
      onChange: vi.fn(() => vi.fn()),
      save: vi.fn(),
    },
    files: {
      getURL: vi.fn(() => "http://localhost:8090/api/files/test/record/file.jpg"),
      getToken: vi.fn(),
    },
    beforeSend: undefined as
      | ((
          url: string,
          options: Record<string, any>,
        ) => Record<string, any> | Promise<Record<string, any>>)
      | undefined,
  }
  instances.push(instance)
  return instance
}

vi.mock("pocketbase", () => ({
  default: vi.fn(() => createMockInstance()),
}))

// -------------------------------------------------------------------
// SUT
// -------------------------------------------------------------------
import { createBrowserClient, createServerClient, resetBrowserClient } from "./pocketbase"
import PocketBase from "pocketbase"

describe("createBrowserClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    instances.length = 0
    resetBrowserClient()
  })

  it("returns a PocketBase instance", () => {
    const pb = createBrowserClient()
    expect(pb).toBeDefined()
    expect(PocketBase).toHaveBeenCalledTimes(1)
  })

  it("returns the same instance on multiple calls (singleton)", () => {
    const pb1 = createBrowserClient()
    const pb2 = createBrowserClient()
    expect(pb1).toBe(pb2)
    expect(PocketBase).toHaveBeenCalledTimes(1)
  })

  it("sets up beforeSend with 10s timeout", () => {
    const pb = createBrowserClient()
    expect(pb.beforeSend).toBeDefined()
    const beforeSend = pb.beforeSend!

    const url = "http://localhost:8090/api/collections/users/auth-with-password"
    const options: any = {}
    const result = beforeSend(url, options)
    expect(result).toEqual({ url, options })
    expect(options.timeout).toBe(10_000)
  })

  it("resets singleton when resetBrowserClient is called", () => {
    const pb1 = createBrowserClient()
    resetBrowserClient()
    const pb2 = createBrowserClient()
    expect(pb1).not.toBe(pb2) // different instance
    expect(PocketBase).toHaveBeenCalledTimes(2) // called twice
  })
})

describe("createServerClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    instances.length = 0
  })

  it("creates a new PocketBase instance each call", () => {
    const cookie = "pb_auth=token123"
    const pb1 = createServerClient(cookie)
    const pb2 = createServerClient(cookie)
    expect(pb1).not.toBe(pb2) // different instances
    expect(PocketBase).toHaveBeenCalledTimes(2)
  })

  it("loads auth from the provided cookie string", () => {
    const cookie = "pb_auth=token123"
    const pb = createServerClient(cookie)
    expect(mockLoadFromCookie).toHaveBeenCalledWith(cookie)
    expect(pb).toBeDefined()
  })

  it("creates separate isolated instances for different cookies", () => {
    const pb1 = createServerClient("cookie_a")
    const pb2 = createServerClient("cookie_b")
    expect(pb1).not.toBe(pb2)
    expect(mockLoadFromCookie).toHaveBeenCalledTimes(2)
  })

  it("sets up beforeSend with 10s timeout", () => {
    const pb = createServerClient("test-cookie")
    expect(pb.beforeSend).toBeDefined()
    const beforeSend = pb.beforeSend!

    const options: any = {}
    const result = beforeSend("http://localhost:8090/api/collections/users/records", options)
    expect(options.timeout).toBe(10_000)
    expect(result).toEqual({ url: expect.any(String), options })
  })
})
