import React, { type ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

import { SelectInput } from "@/components/form/SelectInput";

export type FormSelectProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rules?: RegisterOptions<T, Path<T>>;
  getLabel?: (value: unknown) => string;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  hint,
  disabled,
  leftIcon,
  rightIcon,
  rules,
  getLabel,
  onPress,
  containerStyle,
  inputStyle,
  labelStyle,
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value }, fieldState: { error } }) => (
        <SelectInput
          label={label}
          value={
            getLabel
              ? getLabel(value)
              : value !== undefined && value !== null && value !== ""
                ? String(value)
                : undefined
          }
          placeholder={placeholder}
          hint={hint}
          disabled={disabled}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
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