import { createFileRoute } from "@tanstack/react-router"
import {
  Calendar,
  CheckSquare,
  Hash,
  TextCursorInput,
} from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"

const tiposDatoEjemplo = [
  {
    codigo: "TEXTO",
    nombre: "Texto",
    descripcion: "Cadena libre (nombre, serie, observaciones).",
    icon: TextCursorInput,
  },
  {
    codigo: "NUMERO",
    nombre: "Número",
    descripcion: "Valores numéricos (kilometraje, capacidad).",
    icon: Hash,
  },
  {
    codigo: "SELECT",
    nombre: "Select",
    descripcion: "Lista de opciones (estado, marca, color).",
    icon: CheckSquare,
  },
  {
    codigo: "FECHA",
    nombre: "Fecha",
    descripcion: "Solo fecha (alta, vencimiento, revisión).",
    icon: Calendar,
  },
] as const

export const Route = createFileRoute("/_dashboard/parametros/tipos-dato")({
  component: ParametrosTiposDatoPage,
})

function ParametrosTiposDatoPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Tipos de datos
        </h1>
        <p className="text-sm text-muted-foreground">
          Tipos disponibles para atributos de activos (ejemplo: select, fecha…).
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {tiposDatoEjemplo.map((tipo) => (
          <li
            key={tipo.codigo}
            className="flex gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <tipo.icon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{tipo.nombre}</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {tipo.codigo}
                </code>
              </div>
              <p className="text-sm text-muted-foreground">{tipo.descripcion}</p>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
