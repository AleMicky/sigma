import type { AnyFieldApi } from "@tanstack/react-form"
import { Package } from "lucide-react"

import type { CategoriaInsumo } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.service"
import type { UnidadMedida } from "@/modules/parametros/unidad-medida/api/unidad-medida.service"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
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

type InsumoFormMainSectionProps = {
  form: any
  categorias: CategoriaInsumo[]
  unidadesMedida: UnidadMedida[]
}

export function InsumoFormMainSection({
  form,
  categorias,
  unidadesMedida,
}: InsumoFormMainSectionProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Package className="size-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Datos Generales del Insumo
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Código */}
        <form.Field name="codigo">
          {(field: AnyFieldApi) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Código
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="INS-001"
                  aria-invalid={isInvalid}
                  required
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Nombre */}
        <form.Field name="nombre">
          {(field: AnyFieldApi) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Nombre del Insumo
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Aceite Sintético ISO 68"
                  aria-invalid={isInvalid}
                  required
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Marca */}
        <form.Field name="marca">
          {(field: AnyFieldApi) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Marca / Fabricante</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Mobil / Shell / SKF"
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Categoría de Insumo */}
        <form.Field name="categoriaInsumoId">
          {(field: AnyFieldApi) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Categoría
                </RequiredFieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val ?? "")}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder="Selecciona una categoría…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre} ({cat.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Unidad de Medida */}
        <form.Field name="unidadMedidaId">
          {(field: AnyFieldApi) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Unidad de Medida
                </RequiredFieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val ?? "")}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder="Selecciona unidad de medida…" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((um) => (
                      <SelectItem key={um.id} value={um.id}>
                        {um.nombre} ({um.simbolo ?? um.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      {/* Descripción */}
      <form.Field name="descripcion">
        {(field: AnyFieldApi) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>Descripción detallada</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Especificaciones o notas generales sobre el insumo…"
                rows={3}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </div>
  )
}
