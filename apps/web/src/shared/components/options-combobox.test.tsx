import { useState } from "react"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "./options-combobox"

const options: OptionsComboboxOption[] = [
  { value: "1", label: "Computadora portátil", keywords: ["notebook", "laptop"] },
  { value: "2", label: "Impresora", keywords: ["tinta"] },
  { value: "3", label: "Monitor", disabled: true },
]

type HarnessProps = {
  onValueChange?: (value: string) => void
  initialValue?: string
}

function Harness({ onValueChange, initialValue = "" }: HarnessProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <OptionsCombobox
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
      ariaLabel="Tipo de activo"
    />
  )
}

afterEach(() => {
  cleanup()
})

describe("OptionsCombobox", () => {
  it("muestra la opción seleccionada y propaga aria-label", () => {
    render(<Harness initialValue="2" />)

    expect(screen.getByRole("combobox", { name: "Tipo de activo" })).toHaveValue(
      "Impresora",
    )
  })

  it("filtra por etiqueta y por keywords, sin distinguir tildes ni mayúsculas", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("combobox", { name: "Tipo de activo" }))
    await user.type(screen.getByRole("combobox", { name: "Tipo de activo" }), "NOTEBOOK")

    expect(
      screen.getByRole("option", { name: /Computadora portátil/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Impresora/ })).not.toBeInTheDocument()

    await user.clear(screen.getByRole("combobox", { name: "Tipo de activo" }))
    await user.type(screen.getByRole("combobox", { name: "Tipo de activo" }), "IMPRESORA")

    expect(screen.getByRole("option", { name: /Impresora/ })).toBeInTheDocument()
  })

  it("selecciona una opción y devuelve su value", async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    render(<Harness onValueChange={onValueChange} />)

    await user.click(screen.getByRole("combobox", { name: "Tipo de activo" }))
    await user.click(screen.getByRole("option", { name: /Impresora/ }))

    expect(onValueChange).toHaveBeenCalledWith("2")
    expect(screen.getByRole("combobox", { name: "Tipo de activo" })).toHaveValue(
      "Impresora",
    )
  })
})
