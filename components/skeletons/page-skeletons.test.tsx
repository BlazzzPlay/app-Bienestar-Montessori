import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ListPageSkeleton, DetailPageSkeleton } from "@/components/skeletons/page-skeletons"

describe("ListPageSkeleton", () => {
  it("renders multiple skeleton cards", () => {
    render(<ListPageSkeleton count={3} />)
    const skeletons = screen.getAllByTestId("skeleton-card")
    expect(skeletons).toHaveLength(3)
  })

  it("renders default count of 6 cards when no count provided", () => {
    render(<ListPageSkeleton />)
    const skeletons = screen.getAllByTestId("skeleton-card")
    expect(skeletons).toHaveLength(6)
  })

  it("renders skeleton elements within each card", () => {
    render(<ListPageSkeleton count={1} />)
    const elements = document.querySelectorAll('[data-skeleton="true"]')
    expect(elements.length).toBeGreaterThan(0)
  })
})

describe("DetailPageSkeleton", () => {
  it("renders detail page skeleton", () => {
    render(<DetailPageSkeleton />)
    const elements = document.querySelectorAll('[data-skeleton="true"]')
    expect(elements.length).toBeGreaterThan(0)
  })
})
