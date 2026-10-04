import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { AppSwitch } from "@/components/ui/AppSwitch";
import { colors, spacing, typography } from "@/theme";

export type FormSwitchProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  rules?: RegisterOptions<T, Path<T>>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  description,
  rules,
  disabled,
  style,
}: FormSwitchProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange },
        fieldState: { error },
      }) => (
        <View style={[styles.container, style]}>
          <AppSwitch
            label={label}
            description={description}
            value={Boolean(value)}
            onValueChange={onChange}
            disabled={disabled}
          />

          {error?.message ? (
            <Text style={styles.errorText}>{error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
});