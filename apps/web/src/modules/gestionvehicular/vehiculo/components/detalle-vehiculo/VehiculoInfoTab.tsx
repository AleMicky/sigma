import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  Check,
  FileCheck,
  FileText,
  Plus,
  Save,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { ActivoAtributoValorFields } from "@/modules/activos/activo/components/ActivoAtributoValorFields"
import {
  formatDateString,
  getDocumentoEstado,
} from "@/modules/activos/activo/components/detalle-activo/tabs/ActivoDocumentosTab"
import {
  formatAtributoValor,
  syncAtributoValores,
  validateAtributos,
} from "@/modules/activos/activo/lib/activo-form.utils"
import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import { activoAtributoValorKeys } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.keys"
import type { ActivoAtributoValor } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import type { TipoDato } from "@/modules/parametros/tipo-dato/api/tipo-dato.service"
import { isApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

import { vehiculoKeys } from "../../api/vehiculo.keys"
import type { VehiculoCatalogo } from "../../api/vehiculo.types"

type VehiculoInfoTabProps = {
  vehiculo: VehiculoCatalogo
  atributos: ActivoAtributo[]
  atributoValores: ActivoAtributoValor[]
  tiposDatoById: Map<string, TipoDato>
  atributosLoading?: boolean
  documentos: ActivoDocumento[]
  isEditing?: boolean
  onToggleEdit?: (editing: boolean) => void
  onOpenAddDocument: () => void
}

export function VehiculoInfoTab({
  vehiculo,
  atributos,
  atributoValores,
  tiposDatoById,
  atributosLoading = false,
  documentos,
  isEditing = false,
  onToggleEdit,
  onOpenAddDocument,
}: Readonly<VehiculoInfoTabProps>) {
  const queryClient = useQueryClient()

  const editSessionKey = `${vehiculo.id}:${isEditing ? "edit" : "view"}`
  const [prevEditSessionKey, setPrevEditSessionKey] = useState(editSessionKey)
  const [userAtributoValores, setUserAtributoValores] = useState<
    Record<string, string>
  >({})
  const [atributoErrors, setAtributoErrors] = useState<Record<string, string>>(
    {},
  )
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (prevEditSessionKey !== editSessionKey) {
    setPrevEditSessionKey(editSessionKey)
    setUserAtributoValores({})
    setAtributoErrors({})
  }

  // Solo atributos configurados con visible === true
  const atributosVisibles = useMemo(
    () =>
      atributos
        .filter((atributo) => atributo.visible === true)
        .slice()
        .sort((a, b) => a.orden - b.orden),
    [atributos],
  )

  const valoresExistentesByAtributoId = useMemo(() => {
    const map = new Map<string, ActivoAtributoValor>()
    for (const item of atributoValores) {
      map.set(item.activoAtributoId, item)
    }
    return map
  }, [atributoValores])

  // Atributos formateados provistos por la API de gestionvehicular (solo visible === true)
  const vehiculoAtributosVisibles = useMemo(
    () =>
      vehiculo.atributos
        .filter((attr) => attr.visible === true)
        .slice()
        .sort((a, b) => a.orden - b.orden),
    [vehiculo.atributos],
  )

  const atributoFormValores = useMemo(() => {
    const result: Record<string, string> = {}
    for (const atributo of atributosVisibles) {
      if (userAtributoValores[atributo.id] !== undefined) {
        result[atributo.id] = userAtributoValores[atributo.id]
      } else {
        const existente = valoresExistentesByAtributoId.get(atributo.id)
        if (existente?.valor != null) {
          result[atributo.id] = existente.valor
        } else {
          result[atributo.id] = atributo.valorDefecto ?? ""
        }
      }
    }
    return result
  }, [atributosVisibles, userAtributoValores, valoresExistentesByAtributoId])

  function handleCancel() {
    setUserAtributoValores({})
    setAtributoErrors({})
    setIsConfirmSaveOpen(false)
    onToggleEdit?.(false)
  }

  function handleTriggerSubmit(e?: React.FormEvent) {
    e?.preventDefault()

    const nextAtributoErrors = validateAtributos(
      atributosVisibles,
      atributoFormValores,
    )
    setAtributoErrors(nextAtributoErrors)
    if (Object.keys(nextAtributoErrors).length > 0) {
      toast.error("Completa los atributos obligatorios del vehículo")
      return
    }

    setIsConfirmSaveOpen(true)
  }

  async function handleConfirmSave() {
    setIsSubmitting(true)
    try {
      if (atributosVisibles.length > 0) {
        await syncAtributoValores({
          activoId: vehiculo.id,
          atributos: atributosVisibles,
          valores: atributoFormValores,
          existentes: valoresExistentesByAtributoId,
        })
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: vehiculoKeys.detail(vehiculo.id),
        }),
        queryClient.invalidateQueries({ queryKey: vehiculoKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: activoAtributoValorKeys.lists(),
        }),
      ])

      toast.success("Datos del vehículo actualizados correctamente")
      setUserAtributoValores({})
      setAtributoErrors({})
      setIsConfirmSaveOpen(false)
      onToggleEdit?.(false)
    } catch (error) {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al guardar los atributos del vehículo",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedCount = isEditing
    ? atributosVisibles.length
    : vehiculoAtributosVisibles.length > 0
      ? vehiculoAtributosVisibles.length
      : atributosVisibles.length

  const completedCount = useMemo(() => {
    if (vehiculoAtributosVisibles.length > 0) {
      return vehiculoAtributosVisibles.filter((a) =>
        Boolean((a.valorFormateado ?? a.valor)?.trim()),
      ).length
    }
    return atributosVisibles.filter((a) =>
      Boolean(valoresExistentesByAtributoId.get(a.id)?.valor?.trim()),
    ).length
  }, [vehiculoAtributosVisibles, atributosVisibles, valoresExistentesByAtributoId])

  return (
    <>
      <form
        onSubmit={handleTriggerSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-3.5"
      >
        {/* Left Main Column: SOLO atributos dinámicos visibles del vehículo */}
        <div className="lg:col-span-8 flex flex-col gap-3.5">
          <div
            className={cn(
              "rounded-2xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 transition-all",
              isEditing
                ? "border-primary/50 ring-1 ring-primary/20"
                : "border-border/80",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg",
                    isEditing
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <SlidersHorizontal className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-sm font-bold text-foreground truncate">
                    {isEditing
                      ? "Editar Datos del Vehículo"
                      : "Datos del Vehículo"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Atributos técnicos visibles configurados para{" "}
                    <span className="font-medium text-foreground">
                      {vehiculo.tipoActivo?.nombre || "Vehículo"}
                    </span>
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
                  >
                    <X className="size-3.5" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                    className="h-7 px-3 text-xs gap-1 shadow-xs font-semibold cursor-pointer"
                  >
                    <Save className="size-3.5" />
                    Guardar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  {displayedCount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      <span className="text-foreground font-bold">
                        {completedCount}/{displayedCount}
                      </span>
                      <span>completos</span>
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {isEditing ? (
              atributosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : (
                <ActivoAtributoValorFields
                  atributos={atributosVisibles}
                  tiposDatoById={tiposDatoById}
                  valores={atributoFormValores}
                  errors={atributoErrors}
                  disabled={isSubmitting}
                  onChange={(atributoId, value) => {
                    setUserAtributoValores((prev) => ({
                      ...prev,
                      [atributoId]: value,
                    }))
                    setAtributoErrors((prev) => {
                      if (!prev[atributoId]) return prev
                      const next = { ...prev }
                      delete next[atributoId]
                      return next
                    })
                  }}
                />
              )
            ) : vehiculoAtributosVisibles.length > 0 ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {vehiculoAtributosVisibles.map((attr) => {
                  const displayValue = attr.valorFormateado ?? attr.valor
                  const isWide =
                    attr.tipoDatoCodigo === "TEXTAREA" ||
                    attr.tipoDatoCodigo === "MULTISELECT"

                  return (
                    <div
                      key={attr.atributoId}
                      className={cn(
                        "flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20",
                        isWide && "sm:col-span-2 md:col-span-3",
                      )}
                    >
                      <dt
                        className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate"
                        title={attr.etiqueta}
                      >
                        {attr.etiqueta}
                      </dt>
                      {displayValue ? (
                        <dd
                          className={cn(
                            "text-xs font-semibold text-foreground",
                            attr.tipoDatoCodigo === "TEXTAREA"
                              ? "whitespace-pre-wrap leading-relaxed font-normal"
                              : "truncate",
                          )}
                          title={displayValue}
                        >
                          {displayValue}
                        </dd>
                      ) : (
                        <dd className="text-xs text-muted-foreground/70 italic">
                          Sin registrar
                        </dd>
                      )}
                    </div>
                  )
                })}
              </dl>
            ) : atributosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : atributosVisibles.length > 0 ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {atributosVisibles.map((atributo) => {
                  const tipoDato = tiposDatoById.get(atributo.tipoDatoId)
                  const tipoDatoCodigo = (tipoDato?.codigo ?? "TEXT").toUpperCase()
                  const existente = valoresExistentesByAtributoId.get(atributo.id)
                  const formattedValue = formatAtributoValor(
                    atributo,
                    existente?.valor,
                    tipoDatoCodigo,
                  )
                  const isWide =
                    tipoDatoCodigo === "TEXTAREA" ||
                    tipoDatoCodigo === "MULTISELECT"

                  return (
                    <div
                      key={atributo.id}
                      className={cn(
                        "flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20",
                        isWide && "sm:col-span-2 md:col-span-3",
                      )}
                    >
                      <dt
                        className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate"
                        title={atributo.descripcion ?? atributo.etiqueta}
                      >
                        {atributo.etiqueta}
                      </dt>
                      {formattedValue ? (
                        <dd
                          className={cn(
                            "text-xs font-semibold text-foreground",
                            tipoDatoCodigo === "TEXTAREA"
                              ? "whitespace-pre-wrap leading-relaxed font-normal"
                              : "truncate",
                          )}
                          title={formattedValue}
                        >
                          {formattedValue}
                        </dd>
                      ) : (
                        <dd className="text-xs text-muted-foreground/70 italic">
                          Sin registrar
                        </dd>
                      )}
                    </div>
                  )
                })}
              </dl>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-6 text-center text-xs text-muted-foreground">
                No existen atributos visibles configurados para este vehículo.
              </div>
            )}
          </div>

          {/* Sticky Bottom Save Bar in Edit Mode */}
          {isEditing ? (
            <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 p-3 rounded-2xl border border-primary/40 bg-background/95 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <span className="size-2 rounded-full bg-primary animate-ping" />
                <span>Modo Edición activo</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-7.5 px-3 text-xs cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-7.5 px-4 text-xs font-semibold shadow-xs gap-1.5 cursor-pointer"
                >
                  <Check className="size-3.5" />
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Sidebar: Documentación Clave */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between gap-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck className="size-4 text-primary" />
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Documentación Clave
                </h3>
              </div>

              <span className="text-[11px] font-semibold text-muted-foreground">
                {documentos.length} docs
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {documentos.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                  Sin documentos adjuntos
                </div>
              ) : (
                documentos.slice(0, 4).map((doc) => {
                  const estado = getDocumentoEstado(doc.fechaVencimiento)
                  return (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all",
                        estado === "vigente"
                          ? "border-border/70 bg-muted/20 hover:border-primary/40"
                          : estado === "por_vencer"
                            ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                            : "border-destructive/30 bg-destructive/5 hover:border-destructive/50",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg",
                            estado === "vigente"
                              ? "bg-primary/10 text-primary"
                              : estado === "por_vencer"
                                ? "bg-amber-500/15 text-amber-600"
                                : "bg-destructive/15 text-destructive",
                          )}
                        >
                          <FileText className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-xs font-bold text-foreground truncate"
                            title={doc.nombre}
                          >
                            {doc.nombre}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {doc.fechaVencimiento
                              ? `Vence: ${formatDateString(doc.fechaVencimiento)}`
                              : "Sin vencimiento"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {estado === "vigente" ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            Vigente
                          </span>
                        ) : estado === "por_vencer" ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                            Por vencer
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive border border-destructive/25">
                            Vencido
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAddDocument}
              className="w-full h-8 text-xs font-semibold border-dashed hover:border-primary hover:text-primary gap-1.5 cursor-pointer"
            >
              <Plus className="size-3.5" />
              Agregar Documento
            </Button>
          </div>
        </div>
      </form>

      {/* Confirm Save Dialog */}
      <Dialog open={isConfirmSaveOpen} onOpenChange={setIsConfirmSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              ¿Confirmar actualización de datos?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1">
              Se guardarán los atributos técnicos modificados de este vehículo.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsConfirmSaveOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmSave}
              className="font-semibold gap-1.5"
            >
              <Save className="size-3.5" />
              {isSubmitting ? "Guardando..." : "Sí, Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
