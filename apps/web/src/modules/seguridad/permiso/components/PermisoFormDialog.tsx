import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { KeyRound, Loader2, Save, Sparkles } from "lucide-react"

import { isApiError } from "@/shared/api"
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
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"

import { useCreatePermiso, useUpdatePermiso } from "../api/permiso.mutations"
import type { Permiso } from "../api/permiso.service"
import {
  defaultPermisoValues,
  HTTP_METHODS,
  permisoSchema,
} from "../schemas/permiso.schema"
import { PermisoMethodBadge } from "./PermisoMethodBadge"

type PermisoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuId: string
  menuName?: string
  menuRoute?: string | null
  permiso?: Permiso | null
  onSuccess?: (permiso: Permiso) => void
}

export function PermisoFormDialog({
  open,
  onOpenChange,
  menuId,
  menuName,
  menuRoute,
  permiso,
  onSuccess,
}: PermisoFormDialogProps) {
  const isEditing = Boolean(permiso)
  const createMutation = useCreatePermiso()
  const updateMutation = useUpdatePermiso()
  const [formError, setFormError] = useState<string | null>(null)

  // Compute a clean base route from the menu route or fallback
  const suggestedRoute = menuRoute
    ? menuRoute.startsWith("/api/v1")
      ? menuRoute
      : `/api/v1${menuRoute.startsWith("/") ? menuRoute : `/${menuRoute}`}`
    : "/api/v1/"

  const form = useForm({
    defaultValues: permiso
      ? {
          menuId: permiso.menuId,
          codigo: permiso.codigo,
          nombre: permiso.nombre,
          descripcion: permiso.descripcion ?? "",
          metodoHttp: permiso.metodoHttp,
          ruta: permiso.ruta,
          activo: permiso.activo,
        }
      : {
          ...defaultPermisoValues,
          menuId,
          ruta: suggestedRoute,
        },
    validators: {
      onSubmit: permisoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const payload = {
        menuId,
        codigo: value.codigo.trim().toUpperCase(),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion?.trim() || null,
        metodoHttp: value.metodoHttp.toUpperCase(),
        ruta: value.ruta.trim(),
        activo: value.activo,
      }

      try {
        let result: Permiso
        if (isEditing && permiso) {
          result = await updateMutation.mutateAsync({
            id: permiso.id,
            payload,
          })
        } else {
          result = await createMutation.mutateAsync(payload)
        }
        onOpenChange(false)
        onSuccess?.(result)
        form.reset()
      } catch (err) {
        if (isApiError(err)) {
          setFormError(
            err.message ??
              "Error al guardar el permiso. Verifica que el código no esté duplicado.",
          )
        } else {
          setFormError("Ocurrió un error inesperado al procesar la solicitud.")
        }
      }
    },
  })

  // Synchronize form values whenever the dialog opens
  useEffect(() => {
    if (open) {
      setFormError(null)
      if (permiso) {
        form.setFieldValue("menuId", permiso.menuId)
        form.setFieldValue("codigo", permiso.codigo)
        form.setFieldValue("nombre", permiso.nombre)
        form.setFieldValue("descripcion", permiso.descripcion ?? "")
        form.setFieldValue("metodoHttp", permiso.metodoHttp)
        form.setFieldValue("ruta", permiso.ruta)
        form.setFieldValue("activo", permiso.activo)
      } else {
        form.setFieldValue("menuId", menuId)
        form.setFieldValue("codigo", "")
        form.setFieldValue("nombre", "")
        form.setFieldValue("descripcion", "")
        form.setFieldValue("metodoHttp", "GET")
        form.setFieldValue("ruta", suggestedRoute)
        form.setFieldValue("activo", true)
      }
    }
  }, [open, permiso, menuId, suggestedRoute])

  const isPending = createMutation.isPending || updateMutation.isPending

  // Quick preset buttons helper for common REST actions
  function applyPreset(
    actionName: string,
    method: string,
    actionCode: string,
    routeSuffix: string = "",
  ) {
    const rawMenu = menuName
      ? menuName.toUpperCase().replace(/[^A-Z0-9]/gi, "_")
      : "RECURSO"
    form.setFieldValue("metodoHttp", method)
    form.setFieldValue("codigo", `${actionCode}_${rawMenu}`)
    form.setFieldValue("nombre", `${actionName} ${menuName || "Recurso"}`)
    const base = suggestedRoute.replace(/\/+$/, "")
    form.setFieldValue("ruta", `${base}${routeSuffix}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        {/* Header Compacto */}
        <DialogHeader className="px-4 py-3 sm:px-5 sm:py-3.5 border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
              <KeyRound className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold leading-tight">
                {isEditing ? "Editar Permiso" : "Nuevo Permiso de Seguridad"}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground truncate pt-0.5">
                Menú: <span className="font-semibold text-foreground">{menuName ?? "Seleccionado"}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="flex flex-col"
        >
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 space-y-3 max-h-[70vh] overflow-y-auto">
            {formError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] text-destructive font-medium">
                {formError}
              </div>
            )}

            {/* Quick Templates / Presets (Compact on Create) */}
            {!isEditing && (
              <div className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground">
                  <Sparkles className="size-3 text-primary" />
                  <span>Plantillas:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="h-5 rounded px-1.5 text-[10px] font-medium border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-colors cursor-pointer"
                    onClick={() => applyPreset("Listar", "GET", "VER")}
                  >
                    GET Ver
                  </button>
                  <button
                    type="button"
                    className="h-5 rounded px-1.5 text-[10px] font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    onClick={() => applyPreset("Crear", "POST", "CREAR")}
                  >
                    POST Crear
                  </button>
                  <button
                    type="button"
                    className="h-5 rounded px-1.5 text-[10px] font-medium border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    onClick={() => applyPreset("Actualizar", "PUT", "ACTUALIZAR", "/{id}")}
                  >
                    PUT Editar
                  </button>
                  <button
                    type="button"
                    className="h-5 rounded px-1.5 text-[10px] font-medium border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    onClick={() => applyPreset("Eliminar", "DELETE", "ELIMINAR", "/{id}")}
                  >
                    DELETE Borrar
                  </button>
                </div>
              </div>
            )}

            {/* HTTP Method and Code in 2-col row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-4">
                <form.Field name="metodoHttp">
                  {(field) => (
                    <Field className="space-y-1">
                      <FieldLabel className="text-[11px] font-semibold">
                        Método <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => {
                          if (val) field.handleChange(val)
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs font-mono font-bold">
                          <SelectValue placeholder="Método" />
                        </SelectTrigger>
                        <SelectContent>
                          {HTTP_METHODS.map((m) => (
                            <SelectItem key={m} value={m} className="font-mono text-xs">
                              <div className="flex items-center gap-1.5">
                                <PermisoMethodBadge method={m} size="sm" />
                                <span className="font-semibold">{m}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} className="text-[10px]" />
                    </Field>
                  )}
                </form.Field>
              </div>

              <div className="sm:col-span-8">
                <form.Field name="codigo">
                  {(field) => (
                    <Field className="space-y-1">
                      <FieldLabel className="text-[11px] font-semibold">
                        Código Único <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value.toUpperCase())
                        }
                        placeholder="Ej: CREAR_USUARIO"
                        className="h-8 text-xs font-mono font-semibold uppercase tracking-wider"
                      />
                      <FieldError errors={field.state.meta.errors} className="text-[10px]" />
                    </Field>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Name */}
            <form.Field name="nombre">
              {(field) => (
                <Field className="space-y-1">
                  <FieldLabel className="text-[11px] font-semibold">
                    Nombre del Permiso <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej: Crear nuevo usuario en el sistema"
                    className="h-8 text-xs"
                  />
                  <FieldError errors={field.state.meta.errors} className="text-[10px]" />
                </Field>
              )}
            </form.Field>

            {/* Route */}
            <form.Field name="ruta">
              {(field) => (
                <Field className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FieldLabel className="text-[11px] font-semibold">
                      Ruta API (Endpoint) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      (ej: /api/v1/usuarios)
                    </span>
                  </div>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="/api/v1/usuarios"
                    className="h-8 text-xs font-mono"
                  />
                  <FieldError errors={field.state.meta.errors} className="text-[10px]" />
                </Field>
              )}
            </form.Field>

            {/* Description (Single line input / compact) */}
            <form.Field name="descripcion">
              {(field) => (
                <Field className="space-y-1">
                  <FieldLabel className="text-[11px] font-semibold">
                    Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
                  </FieldLabel>
                  <Input
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Detalles breves sobre el acceso otorgado…"
                    className="h-8 text-xs"
                  />
                  <FieldError errors={field.state.meta.errors} className="text-[10px]" />
                </Field>
              )}
            </form.Field>

            {/* Status Toggle Compact */}
            <form.Field name="activo">
              {(field) => (
                <label className="flex items-center justify-between rounded-lg border border-border/60 p-2.5 bg-card hover:bg-muted/30 transition-colors cursor-pointer select-none">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-foreground">
                      Estado
                    </span>
                    <Badge
                      variant={field.state.value ? "default" : "outline"}
                      className={cn(
                        "text-[9.5px] py-0 px-1.5 font-medium h-4",
                        field.state.value
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "text-destructive border-destructive/40",
                      )}
                    >
                      {field.state.value ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                </label>
              )}
            </form.Field>
          </div>

          {/* Footer Compacto */}
          <DialogFooter className="px-4 py-2.5 sm:px-5 sm:py-3 border-t bg-muted/10 flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs gap-1.5"
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Save className="size-3" />
              )}
              <span>{isEditing ? "Guardar" : "Crear Permiso"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
