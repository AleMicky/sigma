import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Edit2,
  FileCheck,
  FileText,
  FolderTree,
  Info,
  Layers,
  MapPin,
  Plus,
  Route,
  Save,
  ShieldCheck,
  Tag,
  Wrench,
  X,
} from "lucide-react"
import { toast } from "sonner"

import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import { activoAtributoValorKeys } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.keys"
import type { ActivoAtributoValor } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import { activoKeys } from "@/modules/activos/activo/api/activo.keys"
import { useUpdateActivo } from "@/modules/activos/activo/api/activo.mutations"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import {
  syncAtributoValores,
  validateAtributos,
} from "@/modules/activos/activo/lib/activo-form.utils"
import type { Categoria } from "@/modules/activos/categoria/api/categoria.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { TipoDato } from "@/modules/parametros/tipo-dato/api/tipo-dato.service"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import {
  formatDateString,
  getDocumentoEstado,
} from "./ActivoDocumentosTab"

type ActivoInfoTabProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
  categoria?: Categoria | null
  ubicacion?: Ubicacion | null
  ubicaciones?: Ubicacion[]
  atributosDef: ActivoAtributo[]
  valoresByAtributoId: Map<string, string>
  rawValores?: ActivoAtributoValor[]
  tiposDatoById?: Map<string, TipoDato>
  documentos: ActivoDocumento[]
  isEditing?: boolean
  onToggleEdit?: (editing: boolean) => void
  onOpenAddDocument: () => void
}

export function ActivoInfoTab({
  activo,
  tipoActivo,
  categoria,
  ubicacion,
  ubicaciones = [],
  atributosDef,
  valoresByAtributoId,
  rawValores = [],
  tiposDatoById = new Map(),
  documentos,
  isEditing = false,
  onToggleEdit,
  onOpenAddDocument,
}: ActivoInfoTabProps) {
  const queryClient = useQueryClient()
  const updateMutation = useUpdateActivo()

  // Form states
  const [formData, setFormData] = useState({
    codigo: activo.codigo,
    nombre: activo.nombre,
    descripcion: activo.descripcion ?? "",
    ubicacionId: activo.ubicacionId ?? "",
    fechaAdquisicion: activo.fechaAdquisicion ?? "",
    activo: activo.activo,
  })

  const [formValores, setFormValores] = useState<Record<string, string>>({})
  const [atributoErrors, setAtributoErrors] = useState<Record<string, string>>({})
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Sync initial values when entering edit mode or when active asset changes
  useEffect(() => {
    setFormData({
      codigo: activo.codigo,
      nombre: activo.nombre,
      descripcion: activo.descripcion ?? "",
      ubicacionId: activo.ubicacionId ?? "",
      fechaAdquisicion: activo.fechaAdquisicion ?? "",
      activo: activo.activo,
    })

    const initialMap: Record<string, string> = {}
    valoresByAtributoId.forEach((val, key) => {
      initialMap[key] = val
    })
    setFormValores(initialMap)
    setAtributoErrors({})
  }, [activo, valoresByAtributoId, isEditing])

  const existingValoresMap = useMemo(() => {
    const map = new Map<string, ActivoAtributoValor>()
    rawValores.forEach((v) => {
      if (v.activoAtributoId) {
        map.set(v.activoAtributoId, v)
      }
    })
    return map
  }, [rawValores])

  function handleAtributoChange(atributoId: string, value: string) {
    setFormValores((prev) => ({ ...prev, [atributoId]: value }))
    if (atributoErrors[atributoId]) {
      setAtributoErrors((prev) => {
        const next = { ...prev }
        delete next[atributoId]
        return next
      })
    }
  }

  function handleCancel() {
    setFormData({
      codigo: activo.codigo,
      nombre: activo.nombre,
      descripcion: activo.descripcion ?? "",
      ubicacionId: activo.ubicacionId ?? "",
      fechaAdquisicion: activo.fechaAdquisicion ?? "",
      activo: activo.activo,
    })
    const initialMap: Record<string, string> = {}
    valoresByAtributoId.forEach((val, key) => {
      initialMap[key] = val
    })
    setFormValores(initialMap)
    setAtributoErrors({})
    setIsConfirmSaveOpen(false)
    onToggleEdit?.(false)
  }

  function handleTriggerSubmit(e?: React.FormEvent) {
    e?.preventDefault()

    if (!formData.codigo.trim()) {
      toast.error("El código institucional es obligatorio")
      return
    }
    if (!formData.nombre.trim()) {
      toast.error("El nombre del activo es obligatorio")
      return
    }

    // Validate dynamic attributes
    const errors = validateAtributos(atributosDef, formValores)
    if (Object.keys(errors).length > 0) {
      setAtributoErrors(errors)
      toast.error("Por favor completa los atributos obligatorios requeridos")
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
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          tipoActivoId: activo.tipoActivoId,
          ubicacionId: formData.ubicacionId || null,
          fechaAdquisicion: formData.fechaAdquisicion || null,
          activo: formData.activo,
        },
      })

      // 2. Sync dynamic attribute values
      await syncAtributoValores({
        activoId: activo.id,
        atributos: atributosDef,
        valores: formValores,
        existentes: existingValoresMap,
      })

      // 3. Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: activoKeys.detail(activo.id) }),
        queryClient.invalidateQueries({
          queryKey: activoAtributoValorKeys.all,
        }),
        queryClient.invalidateQueries({ queryKey: activoKeys.lists() }),
      ])

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

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
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
                      : "Información General del Activo"}
                  </h3>
                  {isEditing && (
                    <p className="text-[11px] text-muted-foreground">
                      Modifica los campos del bien y guarda los cambios directamente.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <>
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
                  </>
                ) : (
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => onToggleEdit?.(true)}
                    className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                  >
                    <Edit2 className="size-3" />
                    Editar en Ficha
                  </Button>
                )}
              </div>
            </div>

            {/* VIEW MODE */}
            {!isEditing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  {/* Código */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Código Institucional
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {activo.codigo}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(activo.codigo, "Código")}
                        className="text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 p-0.5 cursor-pointer"
                        title="Copiar código"
                      >
                        <Copy className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Nombre */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Nombre Oficial
                    </span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {activo.nombre}
                    </span>
                  </div>

                  {/* Estado del Activo */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Estado de Habilitación
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          activo.activo ? "bg-emerald-500" : "bg-destructive",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-bold",
                          activo.activo
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive",
                        )}
                      >
                        {activo.activo ? "Habilitado / Operativo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Categoría de Activo
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FolderTree className="size-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {categoria?.nombre || "General"}
                      </span>
                      {categoria?.codigo && (
                        <Badge variant="secondary" className="font-mono text-[9px] px-1 py-0">
                          {categoria.codigo}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Tipo de Activo */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Tipo de Activo
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Tag className="size-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {tipoActivo?.nombre || "No especificado"}
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
                        {activo.fechaAdquisicion
                          ? new Date(activo.fechaAdquisicion).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "No registrada"}
                      </span>
                    </div>
                  </div>

                  {/* Alta en el Sistema */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Fecha de Registro
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {activo.createdAt
                        ? new Date(activo.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Reciente"}
                    </span>
                  </div>

                  {/* Última Modificación */}
                  <div className="flex flex-col justify-between gap-1 p-2.5 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Última Modificación
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {activo.updatedAt
                        ? new Date(activo.updatedAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Sin cambios"}
                    </span>
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
                  {/* Código Field (col-span-4) */}
                  <div className="flex flex-col gap-1 sm:col-span-4">
                    <Label className="text-[11px] font-semibold flex items-center justify-between">
                      <span>Código <span className="text-destructive">*</span></span>
                      <span className="text-[10px] text-muted-foreground font-normal">Identificador</span>
                    </Label>
                    <Input
                      value={formData.codigo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          codigo: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                        }))
                      }
                      placeholder="EJ: ACT-001"
                      className="font-mono uppercase h-8 text-xs font-bold"
                      required
                    />
                  </div>

                  {/* Nombre Field (col-span-8) */}
                  <div className="flex flex-col gap-1 sm:col-span-8">
                    <Label className="text-[11px] font-semibold flex items-center justify-between">
                      <span>Nombre del Activo <span className="text-destructive">*</span></span>
                      <span className="text-[10px] text-muted-foreground font-normal">Denominación oficial</span>
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

          {/* 2. ATRIBUTOS TÉCNICOS PARAMETRIZADOS (VIEW OR EDIT MODE) */}
          <div
            className={cn(
              "rounded-2xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 transition-all",
              isEditing
                ? "border-indigo-500/40 ring-1 ring-indigo-500/20 bg-card"
                : "border-border/80",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Layers className="size-3.5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Especificaciones Técnicas Parametrizadas
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Atributos definidos para el tipo{" "}
                    <strong>{tipoActivo?.nombre || "de activo"}</strong>
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="font-mono text-xs">
                {atributosDef.length} atributos
              </Badge>
            </div>

            {atributosDef.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                No hay atributos técnicos adicionales configurados para este tipo de activo.
              </div>
            ) : isEditing ? (
              /* Inline Compact Editor for Attributes */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {atributosDef.map((attr) => {
                  const tipoDato = tiposDatoById.get(attr.tipoDatoId)
                  const codigo = (tipoDato?.codigo ?? "TEXT").toUpperCase()
                  const value = formValores[attr.id] ?? ""
                  const error = atributoErrors[attr.id]
                  const disabled = !attr.editable || isSubmitting
                  const isWide = codigo === "TEXTAREA" || codigo === "MULTISELECT"

                  return (
                    <div
                      key={attr.id}
                      className={cn(
                        "flex flex-col justify-between gap-1.5 p-2.5 rounded-xl border bg-muted/15 transition-all",
                        error
                          ? "border-destructive/60 bg-destructive/5 ring-1 ring-destructive/20"
                          : "border-border/60 hover:border-primary/40",
                        isWide && "sm:col-span-2 md:col-span-3",
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-foreground truncate">
                          {attr.etiqueta}{" "}
                          {attr.requerido && <span className="text-destructive font-bold">*</span>}
                        </span>
                        {attr.requerido && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                            REQ
                          </span>
                        )}
                      </div>

                      {/* Compact Input Renderers */}
                      <div className="w-full">
                        {codigo === "TEXTAREA" ? (
                          <Textarea
                            value={value}
                            disabled={disabled}
                            rows={2}
                            onChange={(e) => handleAtributoChange(attr.id, e.target.value)}
                            placeholder={`Ingresa ${attr.etiqueta.toLowerCase()}...`}
                            className="text-xs resize-none"
                          />
                        ) : codigo === "NUMBER" || codigo === "DECIMAL" ? (
                          <Input
                            type="number"
                            step={codigo === "DECIMAL" ? "any" : "1"}
                            value={value}
                            disabled={disabled}
                            onChange={(e) => handleAtributoChange(attr.id, e.target.value)}
                            placeholder="0"
                            className="h-8 text-xs font-mono"
                          />
                        ) : codigo === "DATE" ? (
                          <Input
                            type="date"
                            value={value}
                            disabled={disabled}
                            onChange={(e) => handleAtributoChange(attr.id, e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        ) : codigo === "BOOLEAN" ? (
                          <div className="flex rounded-md border border-input p-0.5 bg-muted/40 h-8">
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => handleAtributoChange(attr.id, "true")}
                              className={cn(
                                "flex-1 flex items-center justify-center text-[11px] font-semibold rounded transition-all cursor-pointer",
                                value === "true"
                                  ? "bg-card text-primary shadow-2xs font-bold"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => handleAtributoChange(attr.id, "false")}
                              className={cn(
                                "flex-1 flex items-center justify-center text-[11px] font-semibold rounded transition-all cursor-pointer",
                                value === "false"
                                  ? "bg-card text-foreground shadow-2xs font-bold"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              No
                            </button>
                          </div>
                        ) : codigo === "SELECT" ? (
                          <Select
                            value={value || null}
                            disabled={disabled}
                            onValueChange={(next) => handleAtributoChange(attr.id, next ?? "")}
                          >
                            <SelectTrigger className="h-8 text-xs w-full">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent className="z-50 max-h-56">
                              {(attr.opciones ?? []).map((opcion) => (
                                <SelectItem key={opcion.value} value={opcion.value}>
                                  {opcion.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={value}
                            disabled={disabled}
                            onChange={(e) => handleAtributoChange(attr.id, e.target.value)}
                            placeholder={`Ej. ${attr.etiqueta}`}
                            className="h-8 text-xs font-medium"
                          />
                        )}
                      </div>

                      {error && (
                        <span className="text-[10px] font-medium text-destructive">
                          {error}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* View mode for dynamic attributes */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {atributosDef.map((attr) => {
                  const valor = valoresByAtributoId.get(attr.id)
                  const hasValue = Boolean(valor)

                  return (
                    <div
                      key={attr.id}
                      className={cn(
                        "flex flex-col justify-between gap-1 p-2.5 rounded-xl border transition-colors",
                        hasValue
                          ? "border-border/60 bg-muted/15 hover:bg-muted/30"
                          : "border-border/40 bg-muted/5 opacity-80",
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                          {attr.etiqueta}
                        </span>
                        {attr.requerido && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                            REQ
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold truncate",
                          hasValue
                            ? "text-foreground font-mono"
                            : "text-muted-foreground/60 italic text-xs font-normal",
                        )}
                      >
                        {valor || "Sin registrar"}
                      </span>
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

          {/* 3. DOS TARJETAS DE ESTADO DESTACADAS */}
          {!isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Highlight 1: Próximo Servicio */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 shadow-2xs">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Próximo Mantenimiento
                  </span>
                  <span className="text-lg font-heading font-black text-foreground">
                    50,000 km
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    En aprox. 4,800 km o 45 días
                  </span>
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Wrench className="size-4.5" />
                </div>
              </div>

              {/* Highlight 2: Bitácora Activa */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xs">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Bitácora Activa / Custodia
                  </span>
                  <span className="text-sm font-heading font-bold text-foreground truncate">
                    Operación Sede Central
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Custodio: Ing. Carlos Mendoza
                  </span>
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Route className="size-4.5" />
                </div>
              </div>
            </div>
          )}

          {/* 4. AUDITORÍA INTEGRADA */}
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

            {/* Add Document Action */}
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
              <strong className="text-foreground">{formData.nombre}</strong> (
              <span className="font-mono text-foreground font-semibold">
                {formData.codigo}
              </span>
              ). Se actualizarán sus datos generales y especificaciones técnicas.
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
