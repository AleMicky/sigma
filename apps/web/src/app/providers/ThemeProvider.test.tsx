import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "./ThemeProvider"
import { useTheme } from "./theme-context"

function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button type="button" onClick={() => setTheme("dark")}>
        Oscuro
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        Claro
      </button>
    </div>
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove("light", "dark")
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it("no renderiza etiquetas <script> en React y aplica el tema en documentElement", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})

    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(container.querySelector("script")).toBeNull()
    expect(screen.getByTestId("theme")).toHaveTextContent("system")
    expect(screen.getByTestId("resolved")).toHaveTextContent("light")
    expect(document.documentElement).toHaveClass("light")

    fireEvent.click(screen.getByRole("button", { name: "Oscuro" }))

    expect(screen.getByTestId("theme")).toHaveTextContent("dark")
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark")
    expect(document.documentElement).toHaveClass("dark")
    expect(window.localStorage.getItem("theme")).toBe("dark")
    expect(consoleErrorSpy).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })
})
