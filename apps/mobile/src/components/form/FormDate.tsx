import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

import { DateInput } from "@/components/form/DateInput";

export type FormDateProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  formatValue?: (value: unknown) => string;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function FormDate<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  hint,
  disabled,
  rules,
  formatValue,
  onPress,
  containerStyle,
  inputStyle,
  labelStyle,
}: FormDateProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value }, fieldState: { error } }) => (
        <DateInput
          label={label}
          value={
            value !== undefined && value !== null && value !== ""
              ? formatValue
                ? formatValue(value)
                : String(value)
              : undefined
          }
          placeholder={placeholder}
          hint={hint}
          disabled={disabled}
          error={error?.message}
          onPress={onPress}
          containerStyle={containerStyle}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />
      )}
    />
  );
}