import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { AppInput, type AppInputProps } from "@/components/ui/AppInput";

export type FormInputProps<T extends FieldValues> = Omit<
  AppInputProps,
  "value" | "onChangeText" | "onBlur" | "error"
> & {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
};

export function FormInput<T extends FieldValues>({
  control,
  name,
  rules,
  clearable,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <AppInput
          value={value !== undefined && value !== null ? String(value) : ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          clearable={clearable}
          onClear={() => onChange("")}
          {...props}
        />
      )}
    />
  );
}