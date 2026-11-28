import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ApiError } from "@/shared/api/errors"

import { AppHeader } from "./AppHeader"

vi.mock("./AppBreadcrumb", () => ({
  AppBreadcrumb: () => <div data-testid="breadcrumb" />,
}))

vi.mock("./CommandPalette", () => ({
  CommandPalette: () => null,
}))

vi.mock("@/shared/components/ui/sidebar", () => ({
  SidebarTrigger: () => <button type="button">Sidebar</button>,
}))

vi.mock("@/shared/components/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}))

vi.mock("@/shared/components/refresh-button", () => ({
  RefreshButton: () => <button type="button">Refrescar</button>,
}))

function SiblingWithQuery({ shouldFail }: { shouldFail?: boolean }) {
  useQuery({
    queryKey: ["test-sibling", shouldFail ? "fail" : "ok"],
    queryFn: async () => {
      if (shouldFail) {
        throw new ApiError({ message: "Error interno", status: 503 })
      }
      return "ok"
    },
    retry: false,
  })
  return <div>sibling</div>
}

describe("AppHeader", () => {
  it("no actualiza AppHeader sincrónicamente mientras otro componente con useQuery renderiza", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AppHeader />
      </QueryClientProvider>,
    )

    // Montar un componente hermano que crea una query en el cache durante render
    rerender(
      <QueryClientProvider client={queryClient}>
        <AppHeader />
        <SiblingWithQuery />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("sibling")).toBeInTheDocument()
    })

    const setStateInRenderWarnings = consoleErrorSpy.mock.calls.filter((args) =>
      args.some(
        (arg) =>
          typeof arg === "string" &&
          arg.includes("Cannot update a component (`AppHeader`)"),
      ),
    )
    expect(setStateInRenderWarnings).toHaveLength(0)

    consoleErrorSpy.mockRestore()
  })

  it("muestra 'Servidor no disponible' cuando una query falla con error 5xx", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AppHeader />
        <SiblingWithQuery shouldFail />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Servidor no disponible")).toBeInTheDocument()
    })
  })
})
