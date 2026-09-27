import { useEffect, useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { FolderTree, Loader2, Save, Sparkles } from "lucide-react"

import { isApiError } from "@/shared/api"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import { useCreateMenu, useUpdateMenu } from "../api/menu.mutations"
import type { Menu } from "../api/menu.service"
import { defaultMenuValues, menuSchema } from "../schemas/menu.schema"
import { AVAILABLE_MENU_ICONS, DynamicLucideIcon } from "./DynamicLucideIcon"

const NONE_PARENT = "__none__"

const COLOR_PRESETS = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Violeta", value: "#8B5CF6" },
  { name: "Esmeralda", value: "#10B981" },
  { name: "Ámbar", value: "#F59E0B" },
  { name: "Cian", value: "#06B6D4" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Pizarra", value: "#64748B" },
  { name: "Rojo", value: "#EF4444" },
] as const

function getNextOrder(parentId: string | null | undefined, menus: Menu[]): number {
  const targetParentId = !parentId || parentId === NONE_PARENT ? null : parentId
  const siblings = menus.filter((m) => {
    if (targetParentId === null) {
      return !m.menuPadreId
    }
    return m.menuPadreId === targetParentId
  })
  if (siblings.length === 0) {
    return 1
  }
  const maxOrder = Math.max(...siblings.map((s) => (typeof s.orden === "number" ? s.orden : 0)), 0)
  return maxOrder + 1
}

type MenuFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: Menu | null
  parentMenuId?: string | null
  availableMenus?: Menu[]
  onSuccess?: (menu: Menu) => void
}

export function MenuFormSheet({
  open,
  onOpenChange,
  menu,
  parentMenuId,
  availableMenus = [],
  onSuccess,
}: MenuFormSheetProps) {
  const isEditing = Boolean(menu)
  const createMutation = useCreateMenu()
  const updateMutation = useUpdateMenu()
  const [formError, setFormError] = useState<string | null>(null)

  // Filter out self when editing
  const filteredParents = useMemo(
    () => availableMenus.filter((m) => !isEditing || m.id !== menu?.id),
    [availableMenus, isEditing, menu?.id],
  )

  const initialParentId =
    menu?.menuPadreId ?? parentMenuId ?? NONE_PARENT

  const autoOrder = useMemo(
    () => getNextOrder(initialParentId, availableMenus),
    [initialParentId, availableMenus],
  )

  const form = useForm({
    defaultValues: menu
      ? {
          codigo: menu.codigo,
          nombre: menu.nombre,
          tipo: (menu.tipo ?? "ITEM") as "MODULO" | "AGRUPADOR" | "ITEM",
          icono: menu.icono ?? "",
          color: menu.color ?? "",
          ruta: menu.ruta ?? "",
          badge: menu.badge ?? "",
          descripcion: menu.descripcion ?? "",
          visibleEnMenu: menu.visibleEnMenu ?? true,
          menuPadreId: initialParentId,
          orden: String(menu.orden ?? 0),
          activo: menu.activo,
        }
      : {
          ...defaultMenuValues,
          icono: "",
          color: "",
          menuPadreId: initialParentId,
          orden: String(autoOrder),
        },
    validators: {
      onSubmit: menuSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const parentId =
        value.menuPadreId && value.menuPadreId !== NONE_PARENT
          ? value.menuPadreId
          : null

      const parsedOrder = parseInt(value.orden || "0", 10)
      const finalOrder = isNaN(parsedOrder) ? 0 : parsedOrder

      try {
        const targetId = menu?.id
        const saved =
          isEditing && targetId
            ? await updateMutation.mutateAsync({
                id: targetId,
                payload: {
                  codigo: (value.codigo || menu.codigo).trim(),
                  nombre: value.nombre.trim(),
                  tipo: value.tipo,
                  icono: value.icono?.trim() || null,
                  color: value.color?.trim() || null,
                  ruta: value.ruta?.trim() || null,
                  badge: value.badge?.trim() || null,
                  descripcion: value.descripcion?.trim() || null,
                  visibleEnMenu: value.visibleEnMenu ?? true,
                  menuPadreId: parentId,
                  orden: finalOrder,
                  activo: value.activo ?? true,
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                tipo: value.tipo,
                icono: value.icono?.trim() || null,
                color: value.color?.trim() || null,
                ruta: value.ruta?.trim() || null,
                badge: value.badge?.trim() || null,
                descripcion: value.descripcion?.trim() || null,
                visibleEnMenu: value.visibleEnMenu ?? true,
                menuPadreId: parentId,
                orden: finalOrder,
                activo: value.activo ?? true,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la información del menú.",
        )
      }
    },
  })

  useEffect(() => {
    if (open) {
      if (menu) {
        form.setFieldValue("codigo", menu.codigo)
        form.setFieldValue("nombre", menu.nombre)
        form.setFieldValue("tipo", (menu.tipo ?? "ITEM") as "MODULO" | "AGRUPADOR" | "ITEM")
        form.setFieldValue("icono", menu.icono ?? "")
        form.setFieldValue("color", menu.color ?? "")
        form.setFieldValue("ruta", menu.ruta ?? "")
        form.setFieldValue("badge", menu.badge ?? "")
        form.setFieldValue("descripcion", menu.descripcion ?? "")
        form.setFieldValue("visibleEnMenu", menu.visibleEnMenu ?? true)
        form.setFieldValue("menuPadreId", menu.menuPadreId ?? NONE_PARENT)
        form.setFieldValue("orden", String(menu.orden ?? 0))
        form.setFieldValue("activo", menu.activo)
      } else {
        const calculated = getNextOrder(initialParentId, availableMenus)
        form.setFieldValue("codigo", "")
        form.setFieldValue("nombre", "")
        form.setFieldValue("tipo", initialParentId === NONE_PARENT ? "MODULO" : "ITEM")
        form.setFieldValue("icono", "")
        form.setFieldValue("color", "")
        form.setFieldValue("ruta", "")
        form.setFieldValue("badge", "")
        form.setFieldValue("descripcion", "")
        form.setFieldValue("visibleEnMenu", true)
        form.setFieldValue("menuPadreId", initialParentId)
        form.setFieldValue("orden", String(calculated))
        form.setFieldValue("activo", true)
      }
    }
  }, [open, menu, initialParentId, availableMenus])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl p-0 flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderTree className="size-4.5" />
            </div>
            <SheetTitle className="text-xl font-bold">
              {isEditing ? "Editar Menú" : "Nuevo Menú"}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
            {isEditing
              ? "Modifica el nombre, icono, ruta, nivel jerárquico y orden del menú."
              : "Registra un nuevo elemento de navegación con orden calculado automáticamente."}
          </SheetDescription>
        </SheetHeader>

        {/* Form Body */}
        <form
          id="menu-sheet-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-4"
        >
          {formError ? (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs font-medium text-destructive">
              {formError}
            </div>
          ) : null}

          {/* Código & Nombre */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="codigo">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>
                      Código <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={isEditing}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      required
                      aria-required
                      aria-invalid={isInvalid}
                      placeholder="SEGURIDAD_MENUS"
                      className={isEditing ? "bg-muted cursor-not-allowed font-mono" : "font-mono"}
                    />
                    {isEditing && (
                      <p className="text-[11px] text-muted-foreground">
                        El código es inmutable y no se puede modificar.
                      </p>
                    )}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="nombre">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>
                      Nombre <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                      aria-required
                      aria-invalid={isInvalid}
                      placeholder="Administración de Menús"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </div>

          {/* Menú Padre */}
          <form.Field name="menuPadreId">
            {(field) => {
              const selectedParent = availableMenus.find(
                (m) => m.id === field.state.value,
              )

              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>Menú Padre (Jerarquía)</FieldLabel>
                  <Select
                    value={field.state.value ?? NONE_PARENT}
                    onValueChange={(val) => {
                      const newParent = val ?? NONE_PARENT
                      field.handleChange(newParent)
                      // Auto calculate next order for this parent level if creating
                      if (!isEditing) {
                        const calculatedOrder = getNextOrder(newParent, availableMenus)
                        form.setFieldValue("orden", String(calculatedOrder))
                      }
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Sin menú padre (Módulo Raíz)">
                        {!field.state.value || field.state.value === NONE_PARENT ? (
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-primary" />
                            <span className="font-medium text-foreground">
                              Sin menú padre (Módulo Raíz)
                            </span>
                          </div>
                        ) : selectedParent ? (
                          <div className="flex items-center gap-2 truncate">
                            <DynamicLucideIcon name={selectedParent.icono ?? undefined} className="size-3.5 text-muted-foreground shrink-0" />
                            <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                              {selectedParent.codigo}
                            </code>
                            <span className="truncate">{selectedParent.nombre}</span>
                          </div>
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value={NONE_PARENT}>
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-primary" />
                          <span className="font-medium">
                            Sin menú padre (Módulo Raíz)
                          </span>
                        </div>
                      </SelectItem>
                      {filteredParents.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2 truncate">
                            <DynamicLucideIcon name={m.icono ?? undefined} className="size-3.5 text-muted-foreground shrink-0" />
                            <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                              {m.codigo}
                            </code>
                            <span className="truncate">{m.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )
            }}
          </form.Field>

          {/* Ruta del menú */}
          <form.Field name="ruta">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Ruta de Navegación</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="/seguridad/menus"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Ruta relativa de la aplicación web vinculada a este menú (dejar vacío si es solo contenedor).
                  </p>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          {/* Icon Picker with live preview */}
          <form.Field name="icono">
            {(field) => {
              const hasIcon = Boolean(field.state.value && field.state.value.trim())

              return (
                <Field className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>
                      Icono del Menú <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
                    </FieldLabel>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Vista previa:</span>
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {hasIcon ? (
                          <DynamicLucideIcon name={field.state.value} className="size-4" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono font-medium">Ø</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.toLowerCase().trim())}
                      placeholder="Ej: shield, users, folder-tree... (dejar vacío si no lleva icono)"
                      className="font-mono text-xs flex-1"
                    />
                    {hasIcon && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.handleChange("")}
                        className="text-xs text-muted-foreground hover:text-destructive h-9 px-2.5"
                        title="Quitar icono"
                      >
                        Quitar
                      </Button>
                    )}
                  </div>

                  {/* Popular icon buttons */}
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Sugerencias de iconos:
                      </p>
                      <button
                        type="button"
                        onClick={() => field.handleChange("")}
                        className={`text-[11px] font-medium transition-colors cursor-pointer ${
                          !hasIcon ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Sin icono (Agrupador / Título)
                      </button>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-32 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => field.handleChange("")}
                        title="Sin icono (Agrupador o título)"
                        className={`flex size-8 items-center justify-center rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                          !hasIcon
                            ? "bg-primary text-primary-foreground border-primary shadow-xs scale-105"
                            : "bg-card border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Ø
                      </button>
                      {AVAILABLE_MENU_ICONS.map((item) => {
                        const Icon = item.icon
                        const isSelected = field.state.value === item.name
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => field.handleChange(item.name)}
                            title={`${item.label} (${item.name})`}
                            className={`flex size-8 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-xs scale-105"
                                : "bg-card border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="size-4" />
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Puedes dejar el icono vacío para títulos o agrupadores de sección en la navegación.
                    </p>
                  </div>
                </Field>
              )
            }}
          </form.Field>

          {/* Tipo de Menú & Color de Acento */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="tipo">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Tipo de Elemento</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as "MODULO" | "AGRUPADOR" | "ITEM")}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MODULO">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500" />
                          <span>Módulo (Sección Principal)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="AGRUPADOR">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-amber-500" />
                          <span>Agrupador / Carpeta (Sin Ruta)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ITEM">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          <span>Interfaz / Pantalla (Con Ruta)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="color">
              {(field) => (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Color de Acento</FieldLabel>
                    {field.state.value && (
                      <span
                        className="size-3.5 rounded-full ring-1 ring-border"
                        style={{ backgroundColor: field.state.value }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="#3B82F6"
                      className="font-mono text-xs flex-1"
                    />
                    {field.state.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.handleChange("")}
                        className="text-xs text-muted-foreground hover:text-destructive h-9 px-2"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                  {/* Preset swatches */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => field.handleChange(p.value)}
                        className={`size-6 rounded-md transition-all ring-offset-background cursor-pointer ${
                          field.state.value?.toLowerCase() === p.value.toLowerCase()
                            ? "ring-2 ring-primary scale-110"
                            : "hover:scale-105 opacity-80 hover:opacity-100 ring-1 ring-black/10"
                        }`}
                        style={{ backgroundColor: p.value }}
                        title={`${p.name} (${p.value})`}
                      />
                    ))}
                  </div>
                </Field>
              )}
            </form.Field>
          </div>

          {/* Badge & Descripción */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="badge">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Badge / Etiqueta</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nuevo, Beta, Pro..."
                    className="text-xs"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="descripcion">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Descripción / Tooltip</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Descripción funcional del menú"
                    className="text-xs"
                  />
                </Field>
              )}
            </form.Field>
          </div>

          {/* Orden & Estado Activo & Visible */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-1">
            <form.Field name="orden">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name}>Orden</FieldLabel>
                      <button
                        type="button"
                        onClick={() => {
                          const currentParent = form.getFieldValue("menuPadreId")
                          form.setFieldValue(
                            "orden",
                            String(getNextOrder(currentParent, availableMenus)),
                          )
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                        title="Calcular el siguiente orden automáticamente"
                      >
                        <Sparkles className="size-3" />
                        <span>Auto</span>
                      </button>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      inputMode="numeric"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "")
                        field.handleChange(digitsOnly)
                      }}
                      placeholder="1"
                      className="font-mono text-xs"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="visibleEnMenu">
              {(field) => (
                <Field className="justify-between">
                  <FieldLabel htmlFor={field.name}>Visibilidad</FieldLabel>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        id={field.name}
                        type="checkbox"
                        checked={field.state.value ?? true}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
                      />
                      <span className="font-medium text-foreground text-xs">
                        Mostrar en Sidebar
                      </span>
                    </label>
                  </div>
                </Field>
              )}
            </form.Field>

            <form.Field name="activo">
              {(field) => (
                <Field className="justify-between">
                  <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        id={field.name}
                        type="checkbox"
                        checked={field.state.value ?? true}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
                      />
                      <span className="font-medium text-foreground text-xs">
                        {field.state.value ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </div>
                </Field>
              )}
            </form.Field>
          </div>
        </form>

        {/* Footer */}
        <SheetFooter className="p-4 border-t bg-card flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="menu-sheet-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isEditing ? "Guardar Cambios" : "Crear Menú"}</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
