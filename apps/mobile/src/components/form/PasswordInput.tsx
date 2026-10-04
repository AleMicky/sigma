import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { AppInput, type AppInputProps } from "@/components/ui/AppInput";

export type PasswordInputProps<T extends FieldValues> = Omit<
  AppInputProps,
  "value" | "onChangeText" | "onBlur" | "error" | "isPassword" | "secureTextEntry"
> & {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
};

export function PasswordInput<T extends FieldValues>({
  control,
  name,
  rules,
  label = "Contraseña",
  placeholder = "••••••••",
  ...props
}: PasswordInputProps<T>) {
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
          label={label}
          placeholder={placeholder}
          value={value !== undefined && value !== null ? String(value) : ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
      )}
    />
  );
}