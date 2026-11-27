import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import type { AuthUser } from "@/app/router/router.context"
import { useAuthStore } from "@/app/store/auth.store"
import { jwtForTests } from "@/test/jwt"

import { AuthenticatedImage } from "./authenticated-image"

const mocks = vi.hoisted(() => ({
  fetchBlob: vi.fn(),
  createObjectURL: vi.fn(),
  revokeObjectURL: vi.fn(),
}))

vi.mock("@/shared/api", () => ({
  fetchAuthenticatedBlob: mocks.fetchBlob,
}))

function signIn(user: AuthUser): void {
  act(() => {
    useAuthStore.getState().setSession({
      user,
      accessToken: jwtForTests(3600),
      refreshToken: null,
      expiresIn: 3600,
    })
  })
}

function userWithId(id: string): AuthUser {
  return {
    id,
    username: id,
    name: id,
    email: `${id}@example.com`,
    roles: ["ADMIN"],
  }
}

beforeAll(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: mocks.createObjectURL,
  })
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: mocks.revokeObjectURL,
  })
})

beforeEach(() => {
  signIn(userWithId("user-1"))
  mocks.fetchBlob.mockReset()
  mocks.createObjectURL.mockReset()
  mocks.revokeObjectURL.mockReset()
})

afterEach(() => {
  cleanup()
  act(() => useAuthStore.getState().clearSession())
})

describe("AuthenticatedImage (REQ-SEG-111)", () => {
  it("no reutiliza el blob al cambiar de cuenta con la misma src", async () => {
    mocks.fetchBlob.mockResolvedValue(new Blob(["a"], { type: "image/png" }))
    mocks.createObjectURL
      .mockReturnValueOnce("blob:user-1")
      .mockReturnValueOnce("blob:user-2")

    render(<AuthenticatedImage src="/files/foto.png" alt="Foto del activo" />)

    expect(await screen.findByRole("img", { name: "Foto del activo" })).toHaveAttribute(
      "src",
      "blob:user-1",
    )

    signIn(userWithId("user-2"))

    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Foto del activo" })).toHaveAttribute(
        "src",
        "blob:user-2",
      )
    })
    expect(mocks.fetchBlob).toHaveBeenCalledTimes(2)
    expect(mocks.fetchBlob).toHaveBeenCalledWith("/files/foto.png")
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:user-1")
  })

  it("expone un estado accesible cuando la imagen devuelve 403", async () => {
    mocks.fetchBlob.mockRejectedValue(
      Object.assign(new Error("Prohibido"), { status: 403 }),
    )

    render(<AuthenticatedImage src="/files/privada.png" alt="Foto privada" />)

    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("no tienes permiso para verla")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(mocks.createObjectURL).not.toHaveBeenCalled()
  })
})
