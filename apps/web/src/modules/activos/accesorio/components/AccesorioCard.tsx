import { Eye, FolderTree, MoreVertical, Paperclip, Pencil, Trash2 } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

import type { Accesorio } from "../api/accesorio.service"

type AccesorioCardProps = {
  accesorio: Accesorio
  onEdit: (accesorio: Accesorio) => void
  onQuickView: (accesorio: Accesorio) => void
  onDelete: (accesorio: Accesorio) => void
}

export function AccesorioCard({
  accesorio,
  onEdit,
  onQuickView,
  onDelete,
}: AccesorioCardProps) {
  return (
    <li className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3 text-card-foreground shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Paperclip className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-xs font-semibold text-foreground">
              {accesorio.nombre}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {accesorio.codigo}
              </code>
              {accesorio.catalogo ? (
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 text-[9px] font-medium py-0 px-1.5"
                >
                  <FolderTree className="size-2.5 mr-1 inline" />
                  {accesorio.catalogo.nombre}
                </Badge>
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
              onClick={() => onQuickView(accesorio)}
              className="text-xs cursor-pointer"
            >
              <Eye className="size-3.5 mr-1.5" />
              Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(accesorio)}
              className="text-xs cursor-pointer"
            >
              <Pencil className="size-3.5 mr-1.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive cursor-pointer"
              onClick={() => onDelete(accesorio)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <div className="my-2 min-h-[28px]">
        {accesorio.descripcion ? (
          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
            {accesorio.descripcion}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/50 italic">
            Sin descripción adicional
          </p>
        )}
      </div>

      {/* Footer with Audit Info */}
      <div className="border-t border-border/60 pt-2 text-[10px]">
        {accesorio.auditoria ? (
          <AuditInfo
            data={{
              createdAt: accesorio.auditoria.createdAt,
              updatedAt: accesorio.auditoria.updatedAt,
              createdBy: accesorio.auditoria.createdBy,
              updatedBy: accesorio.auditoria.updatedBy,
            }}
            compact
            className="text-[10px]"
          />
        ) : null}
      </div>
    </li>
  )
}
