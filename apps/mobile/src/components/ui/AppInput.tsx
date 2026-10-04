import React, { forwardRef, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

export type AppInputProps = Omit<TextInputProps, "style"> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      isPassword = false,
      clearable = false,
      onClear,
      editable = true,
      containerStyle,
      inputWrapperStyle,
      labelStyle,
      inputStyle,
      onFocus,
      onBlur,
      value,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus: TextInputProps["onFocus"] = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur: TextInputProps["onBlur"] = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const isSecure = isPassword ? !showPassword : secureTextEntry;

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.focusedWrapper,
            !editable && styles.disabledWrapper,
            error ? styles.errorWrapper : null,
            inputWrapperStyle,
          ]}
        >
          {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

          <TextInput
            ref={ref}
            editable={editable}
            value={value}
            secureTextEntry={isSecure}
            placeholderTextColor={colors.textMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.input,
              !editable && styles.disabledInput,
              inputStyle,
            ]}
            {...props}
          />

          {clearable && value && value.length > 0 ? (
            <Pressable
              hitSlop={8}
              onPress={onClear}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="Limpiar texto"
            >
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          ) : null}

          {isPassword ? (
            <Pressable
              hitSlop={8}
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              <Text style={styles.passwordToggleText}>
                {showPassword ? "Ocultar" : "Ver"}
              </Text>
            </Pressable>
          ) : null}

          {rightIcon ? <View style={styles.rightIconContainer}>{rightIcon}</View> : null}
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : null}
      </View>
    );
  }
);

AppInput.displayName = "AppInput";

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  focusedWrapper: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  disabledWrapper: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
  },
  errorWrapper: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: typography.fontSize.md,
    color: colors.text,
    paddingVertical: 0,
  },
  disabledInput: {
    color: colors.textSecondary,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
  },
  clearText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  passwordToggleText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  error: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.danger,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
});