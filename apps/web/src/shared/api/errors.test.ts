import { AxiosError, type AxiosResponse } from "axios"
import { describe, expect, it } from "vitest"

import {
  ApiError,
  getErrorMessage,
  isApiError,
  isValidationError,
  parseApiError,
} from "./errors"

function axiosErrorWith(
  status: number,
  data: unknown,
  code = "ERR_BAD_RESPONSE",
): AxiosError {
  const response = {
    status,
    data,
    statusText: "",
    headers: {},
    config: {},
  } as AxiosResponse
  return new AxiosError("Request failed", code, undefined, undefined, response)
}

describe("parseApiError", () => {
  it("devuelve la misma instancia cuando ya es un ApiError", () => {
    const error = new ApiError({ message: "Ya normalizado", status: 400 })

    expect(parseApiError(error)).toBe(error)
  })

  it("normaliza errores que no son de axios", () => {
    expect(parseApiError(new Error("Fallo local")).message).toBe("Fallo local")
    expect(parseApiError("texto").message).toBe("Ocurrió un error inesperado")
  })

  it("traduce timeouts y errores de red", () => {
    const timeout = new AxiosError("timeout", "ECONNABORTED")
    const network = new AxiosError("network", "ERR_NETWORK")

    expect(parseApiError(timeout).message).toBe(
      "La solicitud tardó demasiado tiempo en responder",
    )
    expect(parseApiError(network).message).toBe(
      "No se pudo conectar con el servidor. Verifica tu conexión.",
    )
  })

  it("usa el mensaje del body y agrupa errores de validación", () => {
    const error = axiosErrorWith(422, {
      code: "VALIDATION_FAILED",
      message: "El estado no pertenece al tipo de activo",
      validationErrors: [
        {
          field: "estadoOperativoId",
          message: "Estado inválido para el tipo",
          rejectedValue: "otro-estado",
        },
        {
          field: "estadoOperativoId",
          message: "Debe estar en el catálogo del tipo",
        },
      ],
    })

    const parsed = parseApiError(error)

    expect(parsed.status).toBe(422)
    expect(parsed.code).toBe("VALIDATION_FAILED")
    expect(parsed.message).toBe("El estado no pertenece al tipo de activo")
    expect(isValidationError(parsed)).toBe(true)
    expect(parsed.validationErrors).toEqual([
      {
        field: "estadoOperativoId",
        messages: [
          "Estado inválido para el tipo",
          "Debe estar en el catálogo del tipo",
        ],
        rejectedValue: "otro-estado",
      },
    ])
  })

  it("acepta errores de validación como JSON string y mensajes por campo", () => {
    const error = axiosErrorWith(400, {
      message: "Datos inválidos",
      errors: { codigo: ["Requerido", "Debe ser único"] },
    })

    const parsed = parseApiError(error)

    expect(parsed.validationErrors).toEqual([
      { field: "codigo", messages: ["Requerido", "Debe ser único"] },
    ])

    const asString = axiosErrorWith(
      400,
      JSON.stringify({ message: "Error serializado" }),
    )
    expect(getErrorMessage(asString)).toBe("Error serializado")
  })

  it("aplica mensajes por defecto según el status", () => {
    expect(getErrorMessage(axiosErrorWith(403, {}))).toBe(
      "No tienes permiso para realizar esta acción",
    )
    expect(getErrorMessage(axiosErrorWith(503, undefined))).toBe(
      "El servicio no está disponible temporalmente",
    )
    expect(getErrorMessage(axiosErrorWith(418, ""))).toBe(
      "Ocurrió un error al procesar la solicitud",
    )
  })

  it("identifica ApiError correctamente", () => {
    expect(isApiError(new ApiError({ message: "x" }))).toBe(true)
    expect(isApiError(new Error("x"))).toBe(false)
    expect(isValidationError(new Error("x"))).toBe(false)
  })
})
