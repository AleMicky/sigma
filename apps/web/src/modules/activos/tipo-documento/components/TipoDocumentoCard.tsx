import {
  CalendarClock,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

import type { TipoDocumento } from "../api/tipo-documento.service"

type TipoDocumentoCardProps = {
  tipoDocumento: TipoDocumento
  onEdit: (tipoDocumento: TipoDocumento) => void
  onQuickView: (tipoDocumento: TipoDocumento) => void
  onDelete: (tipoDocumento: TipoDocumento) => void
}

export function TipoDocumentoCard({
  tipoDocumento,
  onEdit,
  onQuickView,
  onDelete,
}: TipoDocumentoCardProps) {
  return (
    <li className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3 text-card-foreground shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
              tipoDocumento.requiereVencimiento
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            {tipoDocumento.requiereVencimiento ? (
              <CalendarClock className="size-4" />
            ) : (
              <FileText className="size-4" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-xs font-semibold text-foreground">
              {tipoDocumento.nombre}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {tipoDocumento.codigo}
              </code>
              {tipoDocumento.requiereVencimiento ? (
                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:text-amber-300">
                  <CalendarClock className="size-2.5" />
                  Vence
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground shrink-0"
              />
            }
          >
            <MoreVertical className="size-3.5" />
            <span className="sr-only">Acciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => onQuickView(tipoDocumento)}
              className="text-xs"
            >
              <Eye className="size-3.5 mr-1.5" />
              Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(tipoDocumento)}
              className="text-xs"
            >
              <Pencil className="size-3.5 mr-1.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onDelete(tipoDocumento)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <div className="my-2 min-h-[28px]">
        {tipoDocumento.descripcion ? (
          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
            {tipoDocumento.descripcion}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/50 italic">
            Sin descripción adicional
          </p>
        )}
      </div>

      {/* Footer with Audit Info */}
      <div className="border-t border-border/60 pt-2 text-[10px]">
        <AuditInfo data={tipoDocumento} compact className="text-[10px]" />
      </div>
    </li>
  )
}
