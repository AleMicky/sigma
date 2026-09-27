import { useState, useRef } from "react"
import { useForm } from "@tanstack/react-form"
import {
  AlertCircle,
  Calendar,
  FileText,
  IdCard,
  Upload,
  X,
} from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateLicencia,
  useUpdateLicencia,
} from "../api/conductor-licencia.mutations"
import type {
  Conductor,
  ConductorLicencia,
  ConductorLicenciaPayload,
} from "../api/conductor.service"
import {
  CATEGORIAS_LICENCIA,
  ESTADOS_LICENCIA,
  conductorLicenciaSchema,
  defaultLicenciaValue,
  type ConductorLicenciaFormValues,
} from "../schemas/conductor.schema"

type ConductorLicenciaFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  conductor: Conductor
  licencia?: ConductorLicencia | null
  onSuccess?: () => void
}

export function ConductorLicenciaFormDialog({
  open,
  onOpenChange,
  conductor,
  licencia,
  onSuccess,
}: ConductorLicenciaFormDialogProps) {
  const isEditing = Boolean(licencia)
  const createMutation = useCreateLicencia()
  const updateMutation = useUpdateLicencia()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialValues: ConductorLicenciaFormValues = licencia
    ? {
        id: licencia.id,
        categoriaLicencia: licencia.categoriaLicencia,
        numeroLicencia: licencia.numeroLicencia,
        fechaEmision: licencia.fechaEmision,
        fechaVencimiento: licencia.fechaVencimiento,
        estado: licencia.estado ?? "VIGENTE",
        observacion: licencia.observacion ?? "",
        nombreArchivo: licencia.nombreArchivo,
        nombreOriginal: licencia.nombreOriginal,
        url: licencia.url,
        mimeType: licencia.mimeType,
        size: licencia.size,
        activo: licencia.activo ?? true,
      }
    : defaultLicenciaValue

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: conductorLicenciaSchema,
      onSubmit: conductorLicenciaSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload: ConductorLicenciaPayload = {
          categoriaLicencia: value.categoriaLicencia.trim().toUpperCase(),
          numeroLicencia: value.numeroLicencia.trim().toUpperCase(),
          fechaEmision: value.fechaEmision,
          fechaVencimiento: value.fechaVencimiento,
          estado: value.estado,
          observacion: value.observacion?.trim() || null,
          activo: value.activo ?? true,
        }

        if (isEditing && licencia?.id) {
          await updateMutation.mutateAsync({
            id: licencia.id,
            conductorId: conductor.id,
            payload,
            file: selectedFile,
          })
        } else {
          await createMutation.mutateAsync({
            conductorId: conductor.id,
            payload,
            file: selectedFile,
          })
        }

        onSuccess?.()
        onOpenChange(false)
        setSelectedFile(null)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la licencia de conducir."
        )
      }
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Licencia de Conducir" : "Añadir Licencia de Conducir"}
      description={
        isEditing
          ? `Actualiza los datos de la licencia para ${conductor.empleado?.nombreCompleto || "el conductor"}.`
          : `Registra una nueva licencia para ${conductor.empleado?.nombreCompleto || "el conductor"}. Si se marca como Vigente, las licencias anteriores pasarán a Historial.`
      }
      formError={formError}
      className="max-w-md sm:max-w-lg"
      onCancel={() => {
        setFormError(null)
        setSelectedFile(null)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <FormDialogSubmit
              canSubmit={canSubmit}
              isSubmitting={isSubmitting || createMutation.isPending || updateMutation.isPending}
            />
          )}
        </form.Subscribe>
      }
    >
      <div className="space-y-4 py-1">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 1. Categoría */}
          <form.Field name="categoriaLicencia">
            {(catField) => (
              <Field>
                <FieldLabel htmlFor={catField.name}>
                  <RequiredFieldLabel>Categoría</RequiredFieldLabel>
                </FieldLabel>
                <Select
                  value={catField.state.value}
                  onValueChange={(val) => catField.handleChange(val ?? "")}
                >
                  <SelectTrigger id={catField.name} className="w-full">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_LICENCIA.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          {/* 2. Nº Licencia */}
          <form.Field name="numeroLicencia">
            {(numField) => {
              const isInvalid =
                numField.state.meta.isTouched && !numField.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={numField.name}>
                    <RequiredFieldLabel>Nº de Licencia</RequiredFieldLabel>
                  </FieldLabel>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={numField.name}
                      name={numField.name}
                      value={numField.state.value}
                      onChange={(e) =>
                        numField.handleChange(e.target.value.toUpperCase())
                      }
                      onBlur={numField.handleBlur}
                      placeholder="Ej. 1234567-LP"
                      className="pl-9 font-mono uppercase text-xs"
                      aria-invalid={isInvalid}
                    />
                  </div>
                  {isInvalid && <FieldError errors={numField.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 3. Fecha Emisión */}
          <form.Field name="fechaEmision">
            {(emiField) => (
              <Field>
                <FieldLabel htmlFor={emiField.name}>
                  <RequiredFieldLabel>Fecha de Emisión</RequiredFieldLabel>
                </FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={emiField.name}
                    name={emiField.name}
                    type="date"
                    value={emiField.state.value}
                    onChange={(e) => emiField.handleChange(e.target.value)}
                    onBlur={emiField.handleBlur}
                    className="pl-9 text-xs"
                  />
                </div>
              </Field>
            )}
          </form.Field>

          {/* 4. Fecha Vencimiento */}
          <form.Field name="fechaVencimiento">
            {(vencField) => {
              const isInvalid =
                vencField.state.meta.isTouched && !vencField.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={vencField.name}>
                    <RequiredFieldLabel>Fecha de Vencimiento</RequiredFieldLabel>
                  </FieldLabel>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={vencField.name}
                      name={vencField.name}
                      type="date"
                      value={vencField.state.value}
                      onChange={(e) => vencField.handleChange(e.target.value)}
                      onBlur={vencField.handleBlur}
                      className="pl-9 text-xs"
                      aria-invalid={isInvalid}
                    />
                  </div>
                  {isInvalid && <FieldError errors={vencField.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>

        {/* 5. Estado Licencia */}
        <form.Field name="estado">
          {(estField) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={estField.name}>Estado de la Licencia</FieldLabel>
                {estField.state.value === "VIGENTE" && (
                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25">
                    Licencia Principal Activa
                  </Badge>
                )}
              </div>
              <Select
                value={estField.state.value}
                onValueChange={(val) => estField.handleChange(val as any)}
              >
                <SelectTrigger id={estField.name} className="w-full">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_LICENCIA.map((est) => (
                    <SelectItem key={est.value} value={est.value}>
                      {est.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        {/* 6. Documento Adjunto (Upload) */}
        <div className="space-y-1.5">
          <FieldLabel>Documento / Fotocopia de Licencia (Adjunto)</FieldLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground truncate max-w-[240px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Listo para subir
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={removeSelectedFile}
                className="size-6 text-muted-foreground hover:text-destructive"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : licencia?.url ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/20 p-2.5 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-emerald-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-foreground truncate max-w-[240px]">
                    {licencia.nombreOriginal || "Documento adjunto existente"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Archivo en el servidor
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs h-7 gap-1"
              >
                <Upload className="size-3" />
                Reemplazar
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/80 bg-muted/10 p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <Upload className="size-5 text-muted-foreground/70" />
              <div className="text-xs font-medium text-foreground">
                Haz clic para seleccionar o subir documento
              </div>
              <p className="text-[10px] text-muted-foreground">
                Formatos permitidos: PDF, PNG, JPG (máx. 10MB)
              </p>
            </div>
          )}
        </div>

        {/* 7. Observación */}
        <form.Field name="observacion">
          {(obsField) => (
            <Field>
              <FieldLabel htmlFor={obsField.name}>Observaciones / Notas</FieldLabel>
              <Textarea
                id={obsField.name}
                name={obsField.name}
                value={obsField.state.value ?? ""}
                onChange={(e) => obsField.handleChange(e.target.value)}
                onBlur={obsField.handleBlur}
                rows={2}
                placeholder="Ej. Renovada en SEGIP La Paz..."
                className="resize-none text-xs"
              />
            </Field>
          )}
        </form.Field>

        {/* Info Box */}
        <div className="flex items-start gap-2 rounded-xl bg-muted/40 border border-border/40 p-2.5 text-[11px] text-muted-foreground">
          <AlertCircle className="size-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            El sistema mantiene el historial completo de licencias. Al registrar una licencia <strong>Vigente</strong>, se convierte en la credencial activa del conductor.
          </span>
        </div>
      </div>
    </FormDialog>
  )
}
