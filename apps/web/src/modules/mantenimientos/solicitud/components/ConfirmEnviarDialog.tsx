import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Search,
  SendHorizontal,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react"

import { grupoAprobadorDependienteQueries } from "@/modules/organizacion/grupo-aprobador-dependiente/api/grupo-aprobador-dependiente.queries"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

import type { SolicitudMantenimiento } from "../api/solicitud.service"

type ConfirmEnviarDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudMantenimiento | null
  isPending?: boolean
  onConfirm: (aprobadoPorId: string) => void | Promise<void>
}

function getInitials(name?: string | null): string {
  if (!name) return "AP"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function ConfirmEnviarDialog({
  open,
  onOpenChange,
  solicitud,
  isPending = false,
  onConfirm,
}: ConfirmEnviarDialogProps) {
  const [selectedAprobadorId, setSelectedAprobadorId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const solicitanteId = solicitud?.solicitante?.id ?? ""

  const aprobadoresQuery = useQuery({
    ...grupoAprobadorDependienteQueries.aprobadoresSelect(solicitanteId),
    enabled: Boolean(open && solicitanteId),
  })

  const aprobadores = aprobadoresQuery.data ?? []
  const isLoadingAprobadores =
    aprobadoresQuery.isLoading && Boolean(solicitanteId)

  // Reset or pre-select approver when dialog opens or list changes
  useEffect(() => {
    if (!open) {
      setSelectedAprobadorId("")
      setSearchQuery("")
      return
    }

    if (aprobadores.length === 1) {
      setSelectedAprobadorId(aprobadores[0].id)
    } else if (
      selectedAprobadorId &&
      !aprobadores.some((a) => a.id === selectedAprobadorId)
    ) {
      setSelectedAprobadorId("")
    }
  }, [open, aprobadores, selectedAprobadorId])

  const filteredAprobadores = useMemo(() => {
    if (!searchQuery.trim()) return aprobadores
    const q = searchQuery.toLowerCase().trim()
    return aprobadores.filter(
      (a) =>
        a.nombreCompleto?.toLowerCase().includes(q) ||
        a.cargo?.toLowerCase().includes(q),
    )
  }, [aprobadores, searchQuery])

  if (!solicitud) return null

  const hasAprobadores = aprobadores.length > 0
  const canSubmit = Boolean(
    selectedAprobadorId && !isPending && !isLoadingAprobadores,
  )

  const handleSubmit = async () => {
    if (!selectedAprobadorId) return
    await onConfirm(selectedAprobadorId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg sm:max-w-[500px] p-4 sm:p-5 gap-3.5 sm:gap-4 overflow-hidden">
        <DialogHeader className="gap-1 sm:gap-1.5 pr-6 text-left">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-9 sm:size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <SendHorizontal className="size-4.5 sm:size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm sm:text-base font-semibold leading-tight text-foreground">
                Enviar Solicitud de Mantenimiento
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-normal">
                Inicia el flujo de trabajo y asigna el responsable de aprobación.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-3.5">
          {/* Solicitud Summary Card */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 text-xs font-semibold">
                <FileText className="size-3.5 text-primary shrink-0" />
                <span className="font-mono text-primary truncate">
                  {solicitud.numero || "Sin correlativo"}
                </span>
              </div>

              {/* Status Transition Badges */}
              <div className="flex items-center gap-1 shrink-0 text-[10px]">
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 font-normal uppercase text-muted-foreground text-[10px]"
                >
                  Borrador
                </Badge>
                <ArrowRight className="size-3 text-muted-foreground" />
                <Badge
                  variant="default"
                  className="h-5 px-1.5 font-medium uppercase bg-primary text-primary-foreground text-[10px]"
                >
                  Solicitado
                </Badge>
              </div>
            </div>

            {/* Title */}
            <p className="text-xs sm:text-sm font-medium text-foreground leading-snug line-clamp-2">
              {solicitud.titulo}
            </p>

            {/* Solicitante Row */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-border/50 text-xs">
              <span className="text-muted-foreground text-[11px] sm:text-xs">
                Solicitado por:
              </span>
              <div className="flex items-center gap-1.5 font-medium text-foreground max-w-[220px] sm:max-w-xs min-w-0">
                <div className="size-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="size-3 text-primary" />
                </div>
                <span className="truncate text-[11px] sm:text-xs">
                  {solicitud.solicitante?.nombre || "No especificado"}
                </span>
              </div>
            </div>
          </div>

          {/* Approver Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>Asignar Aprobador Responsable</span>
                <span className="text-destructive">*</span>
              </label>
              {hasAprobadores && (
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {aprobadores.length}{" "}
                  {aprobadores.length === 1 ? "disponible" : "disponibles"}
                </span>
              )}
            </div>

            {isLoadingAprobadores ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-xs text-muted-foreground bg-muted/20">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>Consultando aprobadores asignados…</span>
              </div>
            ) : !solicitanteId ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Sin solicitante registrado</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Esta solicitud no cuenta con un solicitante válido para determinar su grupo de aprobación.
                  </p>
                </div>
              </div>
            ) : !hasAprobadores ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Sin aprobadores asignados</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    El solicitante <span className="font-medium">({solicitud.solicitante?.nombre})</span> no tiene aprobadores asignados en su grupo de aprobación.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Search input if more than 3 approvers */}
                {aprobadores.length > 3 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o cargo…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}

                {/* Approvers Selection Cards */}
                <div className="max-h-48 sm:max-h-56 overflow-y-auto space-y-1.5 pr-0.5 overscroll-contain">
                  {filteredAprobadores.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No se encontraron aprobadores que coincidan con la búsqueda.
                    </div>
                  ) : (
                    filteredAprobadores.map((aprobador) => {
                      const isSelected = selectedAprobadorId === aprobador.id
                      return (
                        <button
                          key={aprobador.id}
                          type="button"
                          disabled={isPending}
                          onClick={() => setSelectedAprobadorId(aprobador.id)}
                          className={cn(
                            "w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all select-none cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                              : "border-border/70 bg-card hover:bg-muted/40 hover:border-border",
                            isPending && "opacity-60 cursor-not-allowed",
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Avatar with Initials */}
                            <div
                              className={cn(
                                "size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "bg-muted text-foreground/80",
                              )}
                            >
                              {getInitials(aprobador.nombreCompleto)}
                            </div>

                            {/* Name & Role */}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span
                                className={cn(
                                  "text-xs font-medium truncate",
                                  isSelected
                                    ? "text-foreground font-semibold"
                                    : "text-foreground",
                                )}
                              >
                                {aprobador.nombreCompleto}
                              </span>
                              {aprobador.cargo ? (
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {aprobador.cargo}
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/60 italic">
                                  Aprobador Asignado
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Selected Check Indicator */}
                          <div className="shrink-0 flex items-center">
                            <div
                              className={cn(
                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-transparent",
                              )}
                            >
                              {isSelected && (
                                <CheckCircle2 className="size-3 text-primary-foreground" />
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {aprobadores.length === 1 && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>Se preseleccionó al único aprobador asignado en tu grupo.</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-border/40 flex-col-reverse sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="h-8.5 text-xs w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              void handleSubmit()
            }}
            className="h-8.5 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4 w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <SendHorizontal className="size-3.5" />
            )}
            <span>{isPending ? "Enviando…" : "Enviar Solicitud"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
