import { useState } from "react"
import { Calendar, Edit, ImageIcon, MapPin, Package, Power, PowerOff } from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import { useDeleteActivo, useSetActivoActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"

interface ActivoCardProps {
  activo: Activo
  tipoActivo?: TipoActivo | null
  ubicacion?: Ubicacion | null
  onEdit: (activo: Activo) => void
}

export function ActivoCard({
  activo,
  tipoActivo,
  ubicacion,
  onEdit,
}: ActivoCardProps) {
  const deleteMutation = useDeleteActivo()
  const setActivoMutation = useSetActivoActivo()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isActivo = activo.activo !== false
  const isToggling =
    setActivoMutation.isPending && setActivoMutation.variables?.id === activo.id

  const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
  const TipoIcon = tipoActivo ? getTipoActivoIcon(tipoActivo.icono) : Package

  const formattedDate = activo.fechaAdquisicion
    ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <li
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5",
        isActivo
          ? "border-border/80"
          : "border-amber-500/30 bg-card/60 opacity-90",
      )}
    >
      {/* Top Accent Color Bar */}
      <div
        className="h-1 w-full shrink-0 transition-opacity opacity-80 group-hover:opacity-100"
        style={{ backgroundColor: isActivo ? tipoColor : "#9ca3af" }}
      />

      {/* Image Preview Banner with Floating Badges */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40 border-b border-border/50">
        <AuthenticatedImage
          src={activo.urlImagen}
          alt={activo.nombre}
          className={cn(
            "size-full object-cover transition-transform duration-500 group-hover:scale-105",
            !isActivo && "grayscale-[0.35]",
          )}
          fallbackClassName="size-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/80 text-muted-foreground/50"
          fallback={
            <div className="flex flex-col items-center gap-1.5">
              <ImageIcon className="size-8 opacity-40" />
              <span className="text-[11px] font-medium tracking-wide">Sin imagen</span>
            </div>
          }
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Top Badge: Tipo de Activo */}
        {tipoActivo ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-md backdrop-blur-md text-white border border-white/20"
              style={{ backgroundColor: `${tipoColor}dd` }}
            >
              <TipoIcon className="size-3 shrink-0" />
              <span className="truncate max-w-[120px]">{tipoActivo.nombre}</span>
            </span>
          </div>
        ) : null}

        {/* Floating Top Action: Direct Edit Button */}
        <Button
          size="icon-xs"
          variant="secondary"
          onClick={() => onEdit(activo)}
          className="absolute top-2.5 right-2.5 z-10 size-7 rounded-lg bg-background/80 shadow-md backdrop-blur-md opacity-90 transition-opacity hover:opacity-100 hover:bg-background"
          title="Editar activo"
        >
          <Edit className="size-3.5" />
        </Button>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-3.5 gap-2.5">
        <div className="flex flex-col gap-1.5">
          {/* Code & State Badge & Acquisition Date */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground border border-border/60">
                {activo.codigo}
              </code>
              <Badge
                variant={isActivo ? "default" : "outline"}
                className={cn(
                  "text-[10px] font-medium transition-colors h-5 px-1.5",
                  isActivo
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                )}
              >
                {isActivo ? "Activo" : "De baja"}
              </Badge>
            </div>

            {formattedDate ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0">
                <Calendar className="size-3 shrink-0" />
                {formattedDate}
              </span>
            ) : null}
          </div>

          {/* Title - clicking title triggers onEdit to navigate to form page */}
          <button
            type="button"
            onClick={() => onEdit(activo)}
            className="text-left font-heading text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1 cursor-pointer"
          >
            {activo.nombre}
          </button>

          {/* Description */}
          {activo.descripcion ? (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
              {activo.descripcion}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic line-clamp-1">
              Sin descripción adicional
            </p>
          )}
        </div>

        {/* Bottom Section: Location & Row Actions (Toggle Alta/Baja, Edit, Delete) */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <div className="min-w-0 flex-1">
            {ubicacion ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground border border-border/40 truncate max-w-full"
                title={`${ubicacion.codigo} - ${ubicacion.nombre}`}
              >
                <MapPin className="size-3 shrink-0 text-primary" />
                <span className="truncate">{ubicacion.nombre}</span>
              </span>
            ) : (
              <span className="text-xs italic text-muted-foreground/60">
                Sin ubicación
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={isToggling}
              onClick={(e) => {
                e.stopPropagation()
                setActivoMutation.mutate({
                  id: activo.id,
                  activo: !isActivo,
                })
              }}
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              title={
                isActivo
                  ? "Dar de baja el activo"
                  : "Dar de alta el activo"
              }
            >
              {isActivo ? (
                <PowerOff className="size-3.5 text-amber-600" />
              ) : (
                <Power className="size-3.5 text-emerald-600" />
              )}
              <span className="hidden sm:inline">
                {isActivo ? "Baja" : "Alta"}
              </span>
            </Button>

            <RowActions
              editLabel="Editar activo"
              deleteLabel="Eliminar activo"
              deleteDisabled={deleteMutation.isPending}
              onEdit={() => onEdit(activo)}
              onDelete={() => setConfirmOpen(true)}
            />
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar activo"
        description={`¿Seguro que deseas eliminar "${activo.nombre}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(activo.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}
