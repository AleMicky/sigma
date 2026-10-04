import { forwardRef, useState, type ReactNode } from "react";
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
import { radius, spacing, typography, useAppTheme } from "@/theme";

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
    const { colors } = useAppTheme();
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
        {label ? (
          <Text style={[styles.label, { color: colors.text }, labelStyle]}>
            {label}
          </Text>
        ) : null}

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: editable ? colors.background : colors.surfaceSecondary,
              borderColor: error
                ? colors.danger
                : isFocused
                  ? colors.primary
                  : editable
                    ? colors.borderDark
                    : colors.border,
              borderWidth: isFocused ? 1.5 : 1,
            },
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
              { color: editable ? colors.text : colors.textSecondary },
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
              <Text style={[styles.clearText, { color: colors.textMuted }]}>✕</Text>
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
              <Text style={[styles.passwordToggleText, { color: colors.primary }]}>
                {showPassword ? "Ocultar" : "Ver"}
              </Text>
            </Pressable>
          ) : null}

          {rightIcon ? <View style={styles.rightIconContainer}>{rightIcon}</View> : null}
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : hint ? (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
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
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: typography.fontSize.md,
    paddingVertical: 0,
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
    fontSize: typography.fontSize.sm,
  },
  passwordToggleText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  error: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
});