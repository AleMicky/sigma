import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  Calendar,
  Check,
  Edit2,
  FileCheck,
  FileText,
  Info,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { activoKeys } from "@/modules/activos/activo/api/activo.keys"
import { useUpdateActivo } from "@/modules/activos/activo/api/activo.mutations"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { ActivoAtributoValorFields } from "@/modules/activos/activo/components/ActivoAtributoValorFields"
import {
  formatAtributoValor,
  formatLocalDateLong,
  syncAtributoValores,
  validateAtributos,
} from "@/modules/activos/activo/lib/activo-form.utils"
import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import { activoAtributoValorKeys } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.keys"
import type { ActivoAtributoValor } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import type { Categoria } from "@/modules/activos/categoria/api/categoria.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { TipoDato } from "@/modules/parametros/tipo-dato/api/tipo-dato.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import {
  formatDateString,
  getDocumentoEstado,
} from "@/modules/activos/activo/lib/activo-documentos.utils"

type ActivoInfoTabProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
  categoria?: Categoria | null
  ubicacion?: Ubicacion | null
  ubicaciones?: Ubicacion[]
  atributos?: ActivoAtributo[]
  atributoValores?: ActivoAtributoValor[]
  tiposDatoById?: Map<string, TipoDato>
  atributosLoading?: boolean
  documentos: ActivoDocumento[]
  isEditing?: boolean
  onToggleEdit?: (editing: boolean) => void
  onOpenAddDocument: () => void
  canManage?: boolean
}

export function ActivoInfoTab({
  activo,
  tipoActivo,
  categoria,
  ubicacion,
  ubicaciones = [],
  atributos = [],
  atributoValores = [],
  tiposDatoById,
  atributosLoading = false,
  documentos,
  isEditing = false,
  onToggleEdit,
  onOpenAddDocument,
  canManage = false,
}: ActivoInfoTabProps) {
  const queryClient = useQueryClient()
  const updateMutation = useUpdateActivo()

  // Form states
  const editSessionKey = `${activo.id}:${activo.updatedAt ?? ""}:${isEditing ? "edit" : "view"}`
  const [prevEditSessionKey, setPrevEditSessionKey] = useState(editSessionKey)
  const [formData, setFormData] = useState({
    codigo: activo.codigo,
    codigoAlternativo: activo.codigoAlternativo ?? "",
    nombre: activo.nombre,
    descripcion: activo.descripcion ?? "",
    ubicacionId: activo.ubicacionId ?? "",
    fechaAdquisicion: activo.fechaAdquisicion ?? "",
    activo: activo.activo,
  })

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
    setFormData({
      codigo: activo.codigo,
      codigoAlternativo: activo.codigoAlternativo ?? "",
      nombre: activo.nombre,
      descripcion: activo.descripcion ?? "",
      ubicacionId: activo.ubicacionId ?? "",
      fechaAdquisicion: activo.fechaAdquisicion ?? "",
      activo: activo.activo,
    })
    setUserAtributoValores({})
    setAtributoErrors({})
  }

  const resolvedTiposDatoById = useMemo(
    () => tiposDatoById ?? new Map<string, TipoDato>(),
    [tiposDatoById],
  )

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

  // Ensure list of ubicaciones includes current location if not present
  const allUbicaciones = useMemo(() => {
    if (ubicacion && !ubicaciones.some((u) => u.id === ubicacion.id)) {
      return [ubicacion, ...ubicaciones]
    }
    return ubicaciones
  }, [ubicacion, ubicaciones])

  const selectedUbicacion = useMemo(() => {
    return allUbicaciones.find((u) => u.id === formData.ubicacionId) ?? null
  }, [allUbicaciones, formData.ubicacionId])

  function handleCancel() {
    setFormData({
      codigo: activo.codigo,
      codigoAlternativo: activo.codigoAlternativo ?? "",
      nombre: activo.nombre,
      descripcion: activo.descripcion ?? "",
      ubicacionId: activo.ubicacionId ?? "",
      fechaAdquisicion: activo.fechaAdquisicion ?? "",
      activo: activo.activo,
    })
    setUserAtributoValores({})
    setAtributoErrors({})
    setIsConfirmSaveOpen(false)
    onToggleEdit?.(false)
  }

  function handleTriggerSubmit(e?: React.FormEvent) {
    e?.preventDefault()

    if (!canManage || !isEditing) return
    if (!formData.codigo.trim()) {
      toast.error("El código institucional es obligatorio")
      return
    }
    if (!formData.nombre.trim()) {
      toast.error("El nombre del activo es obligatorio")
      return
    }

    const nextAtributoErrors = validateAtributos(
      atributosVisibles,
      atributoFormValores,
    )
    setAtributoErrors(nextAtributoErrors)
    if (Object.keys(nextAtributoErrors).length > 0) {
      toast.error("Completa los atributos obligatorios del tipo de activo")
      return
    }

    // Open confirmation dialog
    setIsConfirmSaveOpen(true)
  }

  async function handleConfirmSave() {
    setIsSubmitting(true)
    try {
      // 1. Update Core Asset (mutations hook already displays single success toast)
      await updateMutation.mutateAsync({
        id: activo.id,
        payload: {
          codigo: formData.codigo.trim().toUpperCase(),
          codigoAlternativo: formData.codigoAlternativo.trim() || null,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          tipoActivoId: activo.tipoActivo?.id ?? activo.tipoActivoId ?? "",
          ubicacionId: formData.ubicacionId || null,
          estadoOperativoId:
            activo.estadoOperativo?.id ?? activo.estadoOperativoId ?? null,
          fechaAdquisicion: formData.fechaAdquisicion || null,
          activo: formData.activo,
        },
      })

      // 2. Sync dynamic attribute values configured for this asset type
      if (atributosVisibles.length > 0) {
        await syncAtributoValores({
          activoId: activo.id,
          atributos: atributosVisibles,
          valores: atributoFormValores,
          existentes: valoresExistentesByAtributoId,
        })
      }

      // 3. Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: activoKeys.all }),
        queryClient.invalidateQueries({
          queryKey: activoAtributoValorKeys.lists(),
        }),
      ])

      setUserAtributoValores({})
      setAtributoErrors({})
      setIsConfirmSaveOpen(false)
      onToggleEdit?.(false)
    } catch (error) {
      toast.error(
        isApiError(error)
          ? error.message
          : "Error al guardar los cambios del activo",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleTriggerSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Main Column */}
        <div className="lg:col-span-8 flex flex-col gap-3.5">
          {/* 1. FICHA GENERAL Y CLASIFICACIÓN (VIEW OR EDIT MODE) */}
          <div
            className={cn(
              "rounded-2xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 transition-all",
              isEditing
                ? "border-primary/50 ring-1 ring-primary/20 bg-card"
                : "border-border/80",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg",
                    isEditing
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {isEditing ? <Edit2 className="size-3.5" /> : <Info className="size-3.5" />}
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    {isEditing
                      ? "Editar Información del Activo"
                      : "Ubicación y Datos de Registro"}
                  </h3>
                  {isEditing && (
                    <p className="text-[11px] text-muted-foreground">
                      Modifica los datos generales y especificaciones técnicas del activo.
                    </p>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="h-7 px-2.5 text-xs gap-1"
                  >
                    <X className="size-3.5" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                    className="h-7 px-3 text-xs gap-1 shadow-xs font-semibold"
                  >
                    <Save className="size-3.5" />
                    Guardar
                  </Button>
                </div>
              ) : null}
            </div>

            {/* VIEW MODE (solo datos que no están ya visibles en la cabecera del activo) */}
            {!isEditing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Categoría */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Categoría
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Tag className="size-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {categoria?.nombre || "Sin categoría"}
                      </span>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Sede / Emplazamiento
                    </span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      {ubicacion?.nombre || "Sin ubicación asignada"}
                    </span>
                  </div>

                  {/* Fecha Adquisición */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Fecha de Adquisición
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">
                        {formatLocalDateLong(activo.fechaAdquisicion) ?? "No registrada"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descripción Completa */}
                <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/15">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Descripción y Alcance del Activo
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {activo.descripcion || "Sin descripción adicional especificada para este activo."}
                  </p>
                </div>
              </>
            ) : (
              /* EDIT MODE - ULTRA COMPACT INLINE FORM FIELDS */
              <div className="flex flex-col gap-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Código Institucional Field (col-span-4) */}
                  <div className="flex flex-col gap-1 sm:col-span-4">
                    <Label className="text-[11px] font-semibold">
                      Código Institucional <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.codigo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          codigo: e.target.value,
                        }))
                      }
                      maxLength={50}
                      placeholder="Ej. ACT-0001"
                      className="h-8 text-xs font-mono font-semibold uppercase"
                      required
                    />
                  </div>

                  {/* Nombre Field (col-span-5) */}
                  <div className="flex flex-col gap-1 sm:col-span-5">
                    <Label className="text-[11px] font-semibold flex items-center justify-between">
                      <span>Nombre del Activo <span className="text-destructive">*</span></span>
                    </Label>
                    <Input
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                      }
                      placeholder="Nombre o descripción corta del bien"
                      className="h-8 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Código Alternativo Field (col-span-3) */}
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <Label className="text-[11px] font-semibold">
                      Código Alternativo
                    </Label>
                    <Input
                      value={formData.codigoAlternativo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          codigoAlternativo: e.target.value,
                        }))
                      }
                      maxLength={50}
                      placeholder="Ej. ALT-001 (opcional)"
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  {/* Estado Habilitado - Segmented Control (col-span-4) */}
                  <div className="flex flex-col gap-1 sm:col-span-4">
                    <Label className="text-[11px] font-semibold">Estado de Habilitación</Label>
                    <div className="flex rounded-lg border border-input p-0.5 bg-muted/40 h-8">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, activo: true }))}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                          formData.activo
                            ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs border border-border/50 font-bold"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Habilitado
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, activo: false }))}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                          !formData.activo
                            ? "bg-card text-destructive shadow-2xs border border-border/50 font-bold"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-destructive" />
                        Inactivo
                      </button>
                    </div>
                  </div>

                  {/* Ubicación Field (col-span-4) */}
                  <div className="flex flex-col gap-1 sm:col-span-4">
                    <Label className="text-[11px] font-semibold">Sede / Emplazamiento</Label>
                    <Combobox
                      items={allUbicaciones}
                      itemToStringLabel={(item: Ubicacion) =>
                        item ? `${item.codigo ? `${item.codigo} - ` : ""}${item.nombre}` : ""
                      }
                      itemToStringValue={(item: Ubicacion) => item?.id ?? ""}
                      value={selectedUbicacion}
                      onValueChange={(val: Ubicacion | null) =>
                        setFormData((prev) => ({
                          ...prev,
                          ubicacionId: val?.id ?? "",
                        }))
                      }
                    >
                      <ComboboxInput
                        placeholder="Seleccionar ubicación..."
                        className="h-8 text-xs w-full"
                      />
                      <ComboboxContent className="z-50 max-h-56 min-w-[240px]">
                        <ComboboxEmpty>No se encontraron ubicaciones.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: Ubicacion) => (
                            <ComboboxItem key={item.id} value={item}>
                              <div className="flex items-center gap-1.5 text-xs">
                                {item.codigo && (
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    [{item.codigo}]
                                  </span>
                                )}
                                <span className="font-medium text-foreground">
                                  {item.nombre}
                                </span>
                              </div>
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  {/* Fecha Adquisición (col-span-4) */}
                  <div className="flex flex-col gap-1 sm:col-span-4">
                    <Label className="text-[11px] font-semibold">Fecha de Adquisición</Label>
                    <Input
                      type="date"
                      value={formData.fechaAdquisicion}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fechaAdquisicion: e.target.value,
                        }))
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  {/* Descripción Textarea (col-span-12) */}
                  <div className="flex flex-col gap-1 sm:col-span-12">
                    <Label className="text-[11px] font-semibold">
                      Descripción y Notas Técnicas
                    </Label>
                    <Textarea
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          descripcion: e.target.value,
                        }))
                      }
                      placeholder="Detalles técnicos, estado de entrega, alcance..."
                      rows={2}
                      className="text-xs resize-none min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. ESPECIFICACIONES TÉCNICAS DINÁMICAS (ATRIBUTOS DEL TIPO DE ACTIVO) */}
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
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <SlidersHorizontal className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-sm font-bold text-foreground truncate">
                    Especificaciones Técnicas
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Atributos dinámicos configurados para{" "}
                    <span className="font-medium text-foreground">
                      {tipoActivo?.nombre || "este tipo de activo"}
                    </span>
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                {atributosVisibles.length}{" "}
                {atributosVisibles.length === 1 ? "atributo" : "atributos"}
              </span>
            </div>

            {atributosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : atributosVisibles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-5 text-center text-xs text-muted-foreground">
                Este tipo de activo no tiene especificaciones técnicas configuradas.
              </div>
            ) : isEditing ? (
              <ActivoAtributoValorFields
                atributos={atributosVisibles}
                tiposDatoById={resolvedTiposDatoById}
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {atributosVisibles.map((atributo) => {
                  const tipoDato = resolvedTiposDatoById.get(atributo.tipoDatoId)
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
                      <span
                        className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate"
                        title={atributo.descripcion ?? atributo.etiqueta}
                      >
                        {atributo.etiqueta}
                      </span>
                      {formattedValue ? (
                        <span
                          className={cn(
                            "text-xs font-semibold text-foreground",
                            tipoDatoCodigo === "TEXTAREA"
                              ? "whitespace-pre-wrap leading-relaxed font-normal"
                              : "truncate",
                          )}
                          title={formattedValue}
                        >
                          {formattedValue}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/70 italic">
                          Sin registrar
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* BOTTOM SAVE BAR IN EDIT MODE */}
          {isEditing && (
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
                  className="h-7.5 px-3 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-7.5 px-4 text-xs font-semibold shadow-xs gap-1.5"
                >
                  <Check className="size-3.5" />
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          )}

          {/* 3. AUDITORÍA INTEGRADA */}
          {!isEditing && (
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <ShieldCheck className="size-4 text-amber-500" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Trazabilidad y Auditoría del Registro
                </h4>
              </div>
              <div className="rounded-xl border bg-muted/20 p-2.5">
                <AuditInfo data={activo} />
              </div>
            </div>
          )}
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

            {/* Document List */}
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

            {/* Add Document Action (solo ADMIN, REQ-BIZ-001) */}
            {canManage ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenAddDocument}
                className="w-full h-8 text-xs font-semibold border-dashed hover:border-primary hover:text-primary gap-1.5"
              >
                <Plus className="size-3.5" />
                Agregar Documento
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      {/* CONFIRMATION DIALOG FOR SAVING */}
      <Dialog open={isConfirmSaveOpen} onOpenChange={setIsConfirmSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              ¿Confirmar actualización del activo?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1">
              Estás a punto de guardar los cambios para el activo{" "}
              <strong className="text-foreground">{formData.nombre}</strong>. Se actualizarán sus datos generales y especificaciones técnicas.
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
