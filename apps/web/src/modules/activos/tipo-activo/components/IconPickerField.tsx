import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"

import {
  TIPO_ACTIVO_ICON_OPTIONS,
  getTipoActivoIcon,
  type TipoActivoIconName,
} from "../lib/tipo-activo-icons"

type IconPickerFieldProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  "aria-invalid"?: boolean
}

export function IconPickerField({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  "aria-invalid": ariaInvalid,
}: IconPickerFieldProps) {
  const SelectedIcon = getTipoActivoIcon(value || null)

  return (
    <div className="flex w-full items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
        <SelectedIcon className="size-4" />
      </span>

      <Combobox
        items={[...TIPO_ACTIVO_ICON_OPTIONS]}
        value={value || null}
        onValueChange={(next) => onChange(next ?? "")}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          placeholder="Buscar icono…"
          showClear={Boolean(value)}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          className="w-full min-w-0 flex-1"
        />
        <ComboboxContent className="z-[60]">
          <ComboboxEmpty>No se encontró el icono.</ComboboxEmpty>
          <ComboboxList>
            {(item: TipoActivoIconName) => {
              const Icon = getTipoActivoIcon(item)
              return (
                <ComboboxItem key={item} value={item}>
                  <Icon className="size-4" />
                  <span>{item}</span>
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
