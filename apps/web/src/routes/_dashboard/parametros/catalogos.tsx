import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { BookOpen, FolderOpen, Plus } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export const Route = createFileRoute("/_dashboard/parametros/catalogos")({
  component: ParametrosCatalogosPage,
})

type CatalogoItem = {
  id: string
  codigo: string
  nombre: string
}

type CatalogoMaster = {
  id: string
  nombre: string
  descripcion: string
  items: CatalogoItem[]
}

const catalogosEjemplo: CatalogoMaster[] = [
  {
    id: "tipo-documento",
    nombre: "Tipo de documento",
    descripcion: "Documentos de identidad aceptados",
    items: [
      { id: "ci", codigo: "CI", nombre: "Cédula de identidad" },
      { id: "pasaporte", codigo: "PAS", nombre: "Pasaporte" },
      { id: "nit", codigo: "NIT", nombre: "NIT" },
      { id: "licencia", codigo: "LIC", nombre: "Licencia de conducir" },
    ],
  },
  {
    id: "estado-activo",
    nombre: "Estado de activo",
    descripcion: "Estados operativos del inventario",
    items: [
      { id: "disponible", codigo: "DISP", nombre: "Disponible" },
      { id: "asignado", codigo: "ASIG", nombre: "Asignado" },
      { id: "mantenimiento", codigo: "MANT", nombre: "En mantenimiento" },
      { id: "baja", codigo: "BAJA", nombre: "Dado de baja" },
    ],
  },
  {
    id: "unidad-medida",
    nombre: "Unidad de medida",
    descripcion: "Unidades para atributos numéricos",
    items: [
      { id: "km", codigo: "KM", nombre: "Kilómetros" },
      { id: "hr", codigo: "HR", nombre: "Horas" },
      { id: "lt", codigo: "LT", nombre: "Litros" },
    ],
  },
]

function ParametrosCatalogosPage() {
  const [selectedId, setSelectedId] = useState<string | null>(
    catalogosEjemplo[0]?.id ?? null,
  )

  const selected = catalogosEjemplo.find((c) => c.id === selectedId) ?? null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b px-6 py-4 md:px-8">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Catálogos
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" type="button">
            <BookOpen />
            Ayuda
          </Button>
          <Button size="sm" type="button">
            <Plus />
            Crear
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(240px,340px)_1fr]">
        <MasterPanel
          catalogos={catalogosEjemplo}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <DetailPanel catalogo={selected} />
      </div>
    </div>
  )
}

function MasterPanel({
  catalogos,
  selectedId,
  onSelect,
}: {
  catalogos: CatalogoMaster[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (catalogos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border-b p-8 text-center md:border-r md:border-b-0">
        <span className="flex size-10 items-center justify-center rounded-lg border bg-muted">
          <FolderOpen className="size-4 text-muted-foreground" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">No hay catálogos</p>
          <p className="max-w-56 text-xs text-muted-foreground">
            Crea un catálogo maestro, por ejemplo Tipo de documento.
          </p>
        </div>
        <Button size="sm" type="button">
          <Plus />
          Crear
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col border-b md:border-r md:border-b-0">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Maestros
        </p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {catalogos.map((catalogo) => {
          const isActive = catalogo.id === selectedId

          return (
            <li key={catalogo.id}>
              <button
                type="button"
                onClick={() => onSelect(catalogo.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "hover:bg-muted/60",
                )}
              >
                <span className="truncate text-sm font-medium">
                  {catalogo.nombre}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {catalogo.items.length} valor
                  {catalogo.items.length === 1 ? "" : "es"}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function DetailPanel({ catalogo }: { catalogo: CatalogoMaster | null }) {
  if (!catalogo) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Selecciona un catálogo para ver sus valores.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
        <div className="min-w-0 flex flex-col gap-0.5">
          <h2 className="truncate text-base font-semibold tracking-tight">
            {catalogo.nombre}
          </h2>
          <p className="text-sm text-muted-foreground">{catalogo.descripcion}</p>
        </div>
        <Button size="sm" type="button" className="shrink-0">
          <Plus />
          Agregar valor
        </Button>
      </div>

      {catalogo.items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm font-medium">Sin valores</p>
          <p className="max-w-64 text-xs text-muted-foreground">
            Agrega ítems hijos, por ejemplo CI o Pasaporte.
          </p>
          <Button size="sm" type="button">
            <Plus />
            Agregar valor
          </Button>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto p-2 md:p-3">
          {catalogo.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50"
            >
              <div className="min-w-0 flex flex-col gap-0.5">
                <span className="truncate text-sm font-medium">
                  {item.nombre}
                </span>
                <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {item.codigo}
                </code>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
