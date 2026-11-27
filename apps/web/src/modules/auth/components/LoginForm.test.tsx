import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/shared/api"

import { LoginForm } from "./LoginForm"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  mutateAsync: vi.fn(),
  redirect: "/gestion-vehicular/solicitudes" as string | undefined,
}))

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
  useSearch: () => ({ redirect: mocks.redirect }),
}))

vi.mock("../api/auth.mutations", () => ({
  useLogin: () => ({ mutateAsync: mocks.mutateAsync }),
}))

beforeEach(() => {
  mocks.redirect = "/gestion-vehicular/solicitudes"
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("LoginForm (REQ-SEG-109)", () => {
  it("valida, envía credenciales recortadas y navega al redirect saneado", async () => {
    const user = userEvent.setup()
    mocks.mutateAsync.mockResolvedValue(undefined)
    mocks.navigate.mockResolvedValue(undefined)

    render(<LoginForm />)

    await user.type(screen.getByLabelText("Usuario"), "  ana  ")
    await user.type(screen.getByLabelText("Contraseña"), "secreto")
    await user.click(
      screen.getByRole("button", { name: /Acceder a la plataforma/i }),
    )

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        username: "ana",
        password: "secreto",
      })
    })
    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith({
        href: "/gestion-vehicular/solicitudes",
        replace: true,
      })
    })
  })

  it("muestra errores 401 sin revelar detalles del proveedor", async () => {
    const user = userEvent.setup()
    mocks.mutateAsync.mockRejectedValue(
      new ApiError({ message: "Token inválido", status: 401 }),
    )

    render(<LoginForm />)

    await user.type(screen.getByLabelText("Usuario"), "ana")
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta")
    await user.click(
      screen.getByRole("button", { name: /Acceder a la plataforma/i }),
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usuario o contraseña incorrectos",
    )
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it("no envía el formulario con campos vacíos", async () => {
    const user = userEvent.setup()

    render(<LoginForm />)
    await user.click(
      screen.getByRole("button", { name: /Acceder a la plataforma/i }),
    )

    expect(mocks.mutateAsync).not.toHaveBeenCalled()
    expect(await screen.findByText("El usuario es obligatorio")).toBeVisible()
  })

  it("asocia cada FieldError con su campo mediante aria-describedby", async () => {
    const user = userEvent.setup()

    render(<LoginForm />)
    await user.click(
      screen.getByRole("button", { name: /Acceder a la plataforma/i }),
    )

    const username = await screen.findByLabelText("Usuario")
    const password = screen.getByLabelText("Contraseña")
    expect(username).toHaveAttribute("aria-describedby", "username-error")
    expect(password).toHaveAttribute("aria-describedby", "password-error")
    expect(username).toHaveAccessibleDescription(
      "El usuario es obligatorio",
    )
    expect(password).toHaveAccessibleDescription(
      "La contraseña es obligatoria",
    )
  })

  it("el toggle de contraseña es alcanzable por Tab y anuncia su estado", async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.tab()
    expect(document.activeElement).toBe(screen.getByLabelText("Usuario"))
    await user.tab()
    expect(document.activeElement).toBe(screen.getByLabelText("Contraseña"))
    await user.tab()
    const toggle = screen.getByRole("button", { name: "Mostrar contraseña" })
    expect(document.activeElement).toBe(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    await user.click(toggle)
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text")
    expect(
      screen.getByRole("button", { name: "Ocultar contraseña" }),
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("marca el botón de envío como ocupado mientras se valida", async () => {
    const user = userEvent.setup()
    let resolveLogin = (): void => undefined
    mocks.mutateAsync.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve
        }),
    )
    mocks.navigate.mockResolvedValue(undefined)

    render(<LoginForm />)
    await user.type(screen.getByLabelText("Usuario"), "ana")
    await user.type(screen.getByLabelText("Contraseña"), "secreto")

    const submit = screen.getByRole("button", {
      name: /Acceder a la plataforma/i,
    })
    await user.click(submit)

    await waitFor(() => {
      expect(submit).toHaveAttribute("aria-busy", "true")
    })

    resolveLogin()
    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalled()
    })
  })
})
