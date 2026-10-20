import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreatePlanMantenimiento,
  useUpdatePlanMantenimiento,
} from "../api/plan-mantenimiento.mutations"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"
import {
  defaultPlanMantenimientoValues,
  planMantenimientoSchema,
} from "../schemas/plan-mantenimiento.schema"

type PlanMantenimientoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  planMantenimiento?: PlanMantenimiento | null
  onSuccess?: (planMantenimiento: PlanMantenimiento) => void
}

export function PlanMantenimientoFormDialog({
  open,
  onOpenChange,
  planMantenimiento,
  onSuccess,
}: PlanMantenimientoFormDialogProps) {
  const isEditing = Boolean(planMantenimiento)
  const createMutation = useCreatePlanMantenimiento()
  const updateMutation = useUpdatePlanMantenimiento()
  const [formError, setFormError] = useState<string | null>(null)

  const tiposActivoQuery = useQuery(
    tipoActivoQueries.list({ page: 0, size: 200, sortBy: "nombre", direction: "ASC" }),
  )
  const tiposActivo = useMemo(
    () => tiposActivoQuery.data?.content ?? [],
    [tiposActivoQuery.data?.content],
  )

  const form = useForm({
    defaultValues: planMantenimiento
      ? {
          tipoActivoId: planMantenimiento.tipoActivoId,
          codigo: planMantenimiento.codigo,
          nombre: planMantenimiento.nombre,
          descripcion: planMantenimiento.descripcion ?? "",
        }
      : defaultPlanMantenimientoValues,
    validators: {
      onSubmit: planMantenimientoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          tipoActivoId: value.tipoActivoId,
          codigo: value.codigo.trim().toUpperCase(),
          nombre: value.nombre.trim(),
          descripcion: (value.descripcion ?? "").trim() || null,
        }

        const saved =
          isEditing && planMantenimiento
            ? await updateMutation.mutateAsync({
                id: planMantenimiento.id,
                payload,
              })
            : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el plan de mantenimiento.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={
        isEditing
          ? "Editar plan de mantenimiento"
          : "Nuevo plan de mantenimiento"
      }
      description={
        isEditing
          ? "Actualiza la información del plan de mantenimiento preventivo."
          : "Define un nuevo plan de mantenimiento y asígnalo a un tipo de activo."
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
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
              isSubmitting={isSubmitting}
            />
          )}
        </form.Subscribe>
      }
    >
      <div className="space-y-4">
        {/* Tipo de Activo */}
        <form.Field name="tipoActivoId">
          {(field) => {
            const isInvalid = Boolean(field.state.meta.errors.length)
            const selectedTipoActivo =
              tiposActivo.find((t) => t.id === field.state.value) ?? null

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor="tipoActivoId">
                  Tipo de Activo
                </RequiredFieldLabel>
                <Combobox
                  items={tiposActivo}
                  itemToStringLabel={(item: TipoActivo) => item?.nombre ?? ""}
                  itemToStringValue={(item: TipoActivo) => item?.id ?? ""}
                  value={selectedTipoActivo}
                  onValueChange={(val: TipoActivo | null) => {
                    field.handleChange(val?.id ?? "")
                  }}
                  disabled={
                    tiposActivoQuery.isLoading ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  <div className="relative w-full">
                    <ComboboxInput
                      id="tipoActivoId"
                      placeholder={
                        tiposActivoQuery.isLoading
                          ? "Cargando tipos de activo..."
                          : "Selecciona un tipo de activo..."
                      }
                      className="w-full text-xs"
                      showClear
                    />
                    {tiposActivoQuery.isLoading && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <ComboboxContent className="z-50 max-h-60 min-w-70">
                    <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
                      {tiposActivoQuery.isLoading
                        ? "Cargando tipos de activo..."
                        : "No se encontraron tipos de activo."}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item: TipoActivo) => (
                        <ComboboxItem
                          key={item.id}
                          value={item}
                          className="cursor-pointer py-1.5 px-2 text-xs"
                        >
                          <span className="font-medium text-foreground">
                            {item.nombre}
                          </span>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Código */}
        <form.Field name="codigo">
          {(field) => {
            const isInvalid = Boolean(field.state.meta.errors.length)
            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Código Identificador
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.toUpperCase().replace(/\s+/g, "_"),
                    )
                  }
                  placeholder="Ej: PLAN-TRAC-01"
                  className="font-mono uppercase text-xs"
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Nombre */}
        <form.Field name="nombre">
          {(field) => {
            const isInvalid = Boolean(field.state.meta.errors.length)
            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Nombre del Plan
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Mantenimiento Periódico 5000 Km"
                  className="text-xs"
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Descripción */}
        <form.Field name="descripcion">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Describe los alcances o detalles generales del plan..."
                rows={3}
                className="text-xs resize-none"
                disabled={createMutation.isPending || updateMutation.isPending}
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.Field>

        {/* Audit info in edit mode */}
        {isEditing && planMantenimiento ? (
          <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1 mt-1 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Auditoría
            </p>
            <AuditInfo data={planMantenimiento} compact />
          </div>
        ) : null}
      </div>
    </FormDialog>
  )
}
