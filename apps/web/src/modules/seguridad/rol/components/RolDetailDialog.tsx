import { useState } from "react"
import {
  Check,
  CheckCircle2,
  Copy,
  FileText,
  FolderTree,
  KeyRound,
  Shield,
  Tag,
  XCircle,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import type { Rol } from "../api/rol.service"
import { getFriendlyRoleName } from "../utils/rol.utils"

type RolDetailDialogProps = {
  rol: Rol | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignMenus?: (rol: Rol) => void
}

export function RolDetailDialog({
  rol,
  open,
  onOpenChange,
  onAssignMenus,
}: RolDetailDialogProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!rol) return null

  function copyToClipboard(text: string, key: string) {
    void navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Shield className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                {getFriendlyRoleName(rol)}
              </DialogTitle>
              <DialogDescription className="text-xs font-mono">
                Rol del Sistema SIGMA
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 text-sm">
          {/* Identificadores Principales */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Código de Rol */}
            <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
              <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="size-3.5 text-primary" />
                  Código
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-6 cursor-pointer"
                  onClick={() => copyToClipboard(rol.codigo, "codigo")}
                  title="Copiar código"
                >
                  {copiedKey === "codigo" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-foreground truncate">
                {rol.codigo}
              </p>
            </div>

            {/* Estado */}
            <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-primary" />
                Estado del Rol
              </span>
              <div className="mt-1.5">
                <Badge
                  variant={rol.activo ? "default" : "destructive"}
                  className="gap-1.5 text-xs font-medium"
                >
                  {rol.activo ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Activo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-3.5" />
                      <span>Inactivo</span>
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FileText className="size-3.5 text-primary" />
              Descripción
            </span>
            <p className="mt-1.5 text-xs text-foreground leading-relaxed">
              {rol.descripcion || (
                <span className="italic text-muted-foreground">
                  Sin descripción registrada en Keycloak.
                </span>
              )}
            </p>
          </div>

          {/* IDs Técnicos */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 p-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Identificadores Técnicos
            </span>

            {/* ID Interno */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground font-medium shrink-0">
                ID Local (BD):
              </span>
              <div className="flex items-center gap-1 min-w-0">
                <code className="truncate rounded bg-background px-1.5 py-0.5 font-mono text-[11px] border border-border/60">
                  {rol.id}
                </code>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-6 shrink-0 cursor-pointer"
                  onClick={() => copyToClipboard(rol.id, "id")}
                >
                  {copiedKey === "id" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Keycloak Role ID */}
            {rol.keycloakRoleId && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground font-medium shrink-0">
                  <KeyRound className="size-3 text-amber-500" />
                  Keycloak Role ID:
                </span>
                <div className="flex items-center gap-1 min-w-0">
                  <code className="truncate rounded bg-background px-1.5 py-0.5 font-mono text-[11px] border border-border/60">
                    {rol.keycloakRoleId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-6 shrink-0 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(rol.keycloakRoleId, "keycloakRoleId")
                    }
                  >
                    {copiedKey === "keycloakRoleId" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Información de Auditoría */}
          <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Registro de Auditoría
            </span>
            <AuditInfo data={rol} className="text-xs" />
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between gap-2 border-t pt-3">
          {onAssignMenus && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onAssignMenus(rol)
              }}
              className="gap-1.5 border-primary/40 text-primary hover:bg-primary/5 text-xs font-medium cursor-pointer"
            >
              <FolderTree className="size-3.5" />
              <span>Configurar Menús y Accesos</span>
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
