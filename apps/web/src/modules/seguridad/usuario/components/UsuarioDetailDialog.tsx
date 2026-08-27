import { useState } from "react"
import {
  Check,
  Copy,
  KeyRound,
  Mail,
  ShieldCheck,
  User,
  UserCheck,
  UserX,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import type { Usuario } from "../api/usuario.service"

type UsuarioDetailDialogProps = {
  usuario: Usuario | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsuarioDetailDialog({
  usuario,
  open,
  onOpenChange,
}: UsuarioDetailDialogProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!usuario) return null

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-primary">
              <User className="size-5" />
              <DialogTitle className="font-heading text-xl">
                Detalle del Usuario
              </DialogTitle>
            </div>
            <Badge
              variant={usuario.activo ? "default" : "destructive"}
              className="gap-1 font-medium"
            >
              {usuario.activo ? (
                <>
                  <UserCheck className="size-3" />
                  <span>Activo</span>
                </>
              ) : (
                <>
                  <UserX className="size-3" />
                  <span>Inactivo</span>
                </>
              )}
            </Badge>
          </div>
          <DialogDescription>
            Información registrada y estado de sincronización con Keycloak.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Tarjeta principal */}
          <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg font-heading">
              {usuario.nombre
                ? usuario.nombre.charAt(0).toUpperCase()
                : usuario.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground truncate">
                {usuario.nombre || usuario.username}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{usuario.email || "Sin correo"}</span>
              </p>
            </div>
          </div>

          {/* Grid de atributos */}
          <div className="grid grid-cols-1 gap-2.5">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground block">
                  Nombre de Usuario (Username)
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {usuario.username}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="size-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(usuario.username, "username")}
                title="Copiar username"
              >
                {copiedKey === "username" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground block flex items-center gap-1">
                  <KeyRound className="size-3 text-primary" />
                  Keycloak User ID
                </span>
                <span className="font-mono text-[11px] text-muted-foreground truncate block">
                  {usuario.keycloakUserId}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="size-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  copyToClipboard(usuario.keycloakUserId, "keycloakUserId")
                }
                title="Copiar ID de Keycloak"
              >
                {copiedKey === "keycloakUserId" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground block">
                  Identificador Interno (UUID)
                </span>
                <span className="font-mono text-[11px] text-muted-foreground truncate block">
                  {usuario.id}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="size-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(usuario.id, "id")}
                title="Copiar ID"
              >
                {copiedKey === "id" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Sección de Auditoría */}
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Registro y Auditoría</span>
            </div>
            <AuditInfo data={usuario} className="text-xs" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
