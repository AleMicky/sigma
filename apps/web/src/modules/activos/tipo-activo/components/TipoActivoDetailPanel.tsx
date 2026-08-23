import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Boxes,
  Sliders,
  Tag,
} from "lucide-react"

import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { TipoActivoAtributosPage } from "@/modules/activos/activo-atributo/pages/TipoActivoAtributosPage"
import { TipoActivoComponentesPage } from "@/modules/activos/componente/pages/TipoActivoComponentesPage"
import {
  DetailPanelHeader,
  DetailPanelShell,
} from "@/shared/components/master-detail"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

import { tipoActivoQueries } from "../api/tipo-activo.queries"
import type { TipoActivo } from "../api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoDetailPanelProps = {
  tipoActivo: TipoActivo | null
}

type DetailTab = "atributos" | "componentes"

export function TipoActivoDetailPanel({
  tipoActivo,
}: TipoActivoDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("atributos")

  const tipoQuery = useQuery({
    ...tipoActivoQueries.detail(tipoActivo?.id ?? ""),
    enabled: Boolean(tipoActivo?.id),
  })

  const categoriaQuery = useQuery({
    ...categoriaQueries.detail(tipoActivo?.categoriaId ?? ""),
    enabled: Boolean(tipoActivo?.categoriaId),
  })

  if (!tipoActivo) {
    return (
      <DetailPanelShell
        hasSelection={false}
        emptySelectionMessage="Selecciona un tipo de activo del panel izquierdo para configurar sus atributos dinámicos y componentes estructurales."
      >
        <div />
      </DetailPanelShell>
    )
  }

  const currentTipo = tipoQuery.data ?? tipoActivo
  const color = currentTipo.color || DEFAULT_TIPO_ACTIVO_COLOR
  const TipoIcon = getTipoActivoIcon(currentTipo.icono)

  return (
    <DetailPanelShell
      hasSelection={true}
      emptySelectionMessage=""
      header={
        <DetailPanelHeader
          title={
            <div className="flex items-center gap-2.5">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                style={{ backgroundColor: color }}
              >
                <TipoIcon className="size-4" />
              </span>
              <span className="truncate font-heading text-lg font-bold text-foreground">
                {currentTipo.nombre}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground border border-border/60">
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-[10px] uppercase">
                  {color}
                </span>
              </span>
              {categoriaQuery.data ? (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-medium"
                >
                  <Tag className="size-3 text-primary" />
                  <span>{categoriaQuery.data.nombre}</span>
                </Badge>
              ) : null}
            </div>
          }
          subtitle={
            currentTipo.descripcion ? (
              <p className="line-clamp-2 text-xs text-muted-foreground pt-0.5">
                {currentTipo.descripcion}
              </p>
            ) : undefined
          }
        />
      }
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-3 sm:px-4">
        {/* Selector de pestañas compacto y limpio */}
        <div className="flex items-center gap-1 border-b border-border/60 pb-px shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("atributos")}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer",
              activeTab === "atributos"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <Sliders className="size-3.5" />
            <span>Atributos Dinámicos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("componentes")}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer",
              activeTab === "componentes"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <Boxes className="size-3.5" />
            <span>Componentes Estructurales</span>
          </button>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-1">
          {activeTab === "atributos" ? (
            <TipoActivoAtributosPage
              key={`attr-${currentTipo.id}`}
              tipoActivoId={currentTipo.id}
            />
          ) : (
            <TipoActivoComponentesPage
              key={`comp-${currentTipo.id}`}
              tipoActivoId={currentTipo.id}
            />
          )}
        </div>
      </div>
    </DetailPanelShell>
  )
}
