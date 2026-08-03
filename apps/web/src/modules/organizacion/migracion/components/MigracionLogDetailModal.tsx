import React, { useState } from "react"
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Database,
  Globe,
  Layers,
  Terminal,
} from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

import type { RegistroMigracion } from "../api/migracion.service"
import { MigracionStatusBadge } from "./MigracionStatusBadge"

interface MigracionLogDetailModalProps {
  log: RegistroMigracion | null
  open: boolean
  onClose: () => void
}

export const MigracionLogDetailModal: React.FC<MigracionLogDetailModalProps> = ({
  log,
  open,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!log) return null

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    toast.success(`Copiado: ${label}`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formattedJson = JSON.stringify(
    {
      id: log.id,
      sistemaOrigen: log.sistemaOrigen,
      entidad: log.entidad,
      idOrigen: log.idOrigen,
      idDestino: log.idDestino,
      estado: log.estado,
      mensaje: log.mensaje,
      fechaRegistro: log.fechaRegistro,
    },
    null,
    2,
  )

  const formattedDate = log.fechaRegistro
    ? new Date(log.fechaRegistro).toLocaleString("es-ES", {
        dateStyle: "full",
        timeStyle: "medium",
      })
    : "-"

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card text-card-foreground border-border shadow-xl">
        {/* Dialog Header */}
        <DialogHeader className="border-b border-border px-6 py-4 flex flex-row items-center justify-between space-y-0 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Terminal className="size-4" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-semibold">
                Detalle del Registro de Migración
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {log.id}
              </p>
            </div>
          </div>
          <div>
            <MigracionStatusBadge estado={log.estado} />
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-muted/40 border border-border rounded-xl p-3 flex items-center gap-3">
              <Globe className="size-4 text-primary shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                  Sistema Origen
                </span>
                <span className="text-xs font-semibold text-foreground truncate block">
                  {log.sistemaOrigen || "N/A"}
                </span>
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-xl p-3 flex items-center gap-3">
              <Layers className="size-4 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                  Entidad
                </span>
                <span className="text-xs font-semibold text-foreground truncate block">
                  {log.entidad || "N/A"}
                </span>
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-xl p-3 flex items-center gap-3">
              <Database className="size-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                  Fecha Registro
                </span>
                <span className="text-xs font-semibold text-foreground truncate block">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* ID Mapping Diagram */}
          <div className="bg-muted/30 border border-border rounded-xl p-4 text-xs">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2.5 block font-medium">
              Mapeo de Identificadores
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-background p-3 rounded-lg border border-border">
              <div className="flex-1 space-y-1 w-full sm:w-auto">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  ID Origen ({log.sistemaOrigen})
                </div>
                <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-md border border-border text-foreground font-mono">
                  <span>{log.idOrigen || "SIN_ID"}</span>
                  <button
                    onClick={() => handleCopy(log.idOrigen, "ID Origen")}
                    className="text-muted-foreground hover:text-foreground ml-2"
                  >
                    {copiedField === "ID Origen" ? (
                      <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-muted-foreground shrink-0">
                <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
              </div>

              <div className="flex-1 space-y-1 w-full sm:w-auto">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  UUID SIGMA (Destino)
                </div>
                <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-md border border-border text-foreground font-mono">
                  <span className="truncate">{log.idDestino || "N/A"}</span>
                  {log.idDestino && (
                    <button
                      onClick={() => handleCopy(log.idDestino!, "UUID Destino")}
                      className="text-muted-foreground hover:text-foreground ml-2"
                    >
                      {copiedField === "UUID Destino" ? (
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Log Message */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block">
              Mensaje o Traza de Resultado
            </span>
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed font-mono overflow-x-auto ${
                log.estado === "ERROR"
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-muted/40 border-border text-foreground"
              }`}
            >
              {log.mensaje || "Sin mensaje registrado."}
            </div>
          </div>

          {/* Raw JSON Code Block */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <Code2 className="size-3.5 text-primary" /> Payload JSON
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(formattedJson, "JSON")}
                className="h-7 text-xs"
              >
                {copiedField === "JSON" ? (
                  <>
                    <Check className="size-3.5 mr-1 text-emerald-600" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 mr-1" /> Copiar JSON
                  </>
                )}
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl bg-muted/50 border border-border text-foreground text-xs overflow-x-auto font-mono leading-relaxed">
              <code>{formattedJson}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border px-6 py-3 flex items-center justify-end bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
