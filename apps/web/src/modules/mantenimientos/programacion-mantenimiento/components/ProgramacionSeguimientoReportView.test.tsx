import { cleanup, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { afterEach, describe, expect, it } from "vitest"

import { ProgramacionSeguimientoReportView } from "./ProgramacionSeguimientoReportView"

function renderReport(
  overrides: Partial<ComponentProps<typeof ProgramacionSeguimientoReportView>> = {},
) {
  return render(
    <ProgramacionSeguimientoReportView
      programaciones={[]}
      isLoading={false}
      onEdit={() => {}}
      {...overrides}
    />,
  )
}

afterEach(cleanup)

describe("ProgramacionSeguimientoReportView (accesibilidad de tabla)", () => {
  it("expone la tabla con un nombre accesible que menciona el seguimiento", () => {
    renderReport()

    expect(
      screen.getByRole("table", { name: /seguimiento/i }),
    ).toBeInTheDocument()
  })

  it("marca los diez encabezados de columna con scope=col", () => {
    renderReport()

    const columnHeaders = screen.getAllByRole("columnheader")
    expect(columnHeaders).toHaveLength(10)
    for (const header of columnHeaders) {
      expect(header).toHaveAttribute("scope", "col")
    }
  })

  it("marca la tabla como ocupada mientras carga", () => {
    renderReport({ isLoading: true })

    expect(screen.getByRole("table", { name: /seguimiento/i })).toHaveAttribute(
      "aria-busy",
      "true",
    )
  })
})
