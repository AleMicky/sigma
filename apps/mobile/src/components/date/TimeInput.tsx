import React, { useState } from "react";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

export type TimeInputProps = {
  label?: string;
  value?: Date | null;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  is24Hour?: boolean;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  clearable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  onChange: (date: Date | null) => void;
};

export function TimeInput({
  label,
  value,
  placeholder = "Seleccione una hora",
  error,
  hint,
  disabled = false,
  required = false,
  is24Hour = true,
  minuteInterval = 1,
  clearable = false,
  containerStyle,
  inputStyle,
  labelStyle,
  onChange,
}: TimeInputProps) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  const formattedValue = value
    ? value.toLocaleTimeString("es-BO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: !is24Hour,
      })
    : null;

  const handleOpen = () => {
    if (disabled) return;
    setTempDate(value ?? new Date());
    setOpen(true);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (event.type === "set" && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      // iOS keeps tracking selected date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIosConfirm = () => {
    onChange(tempDate);
    setOpen(false);
  };

  const handleIosCancel = () => {
    setOpen(false);
  };

  const handleClear = () => {
    if (disabled) return;
    onChange(null);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required ? <Text style={styles.requiredStar}> *</Text> : null}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.input,
          disabled && styles.inputDisabled,
          error ? styles.inputError : null,
          open && styles.inputActive,
          pressed && !disabled && styles.inputPressed,
          inputStyle,
        ]}
      >
        <Ionicons
          name="time-outline"
          size={20}
          color={
            error
              ? colors.danger
              : open
                ? colors.primary
                : disabled
                  ? colors.textMuted
                  : colors.textSecondary
          }
          style={styles.leadingIcon}
        />

        <Text
          numberOfLines={1}
          style={[
            styles.value,
            !formattedValue && styles.placeholder,
            disabled && styles.valueDisabled,
          ]}
        >
          {formattedValue ?? placeholder}
        </Text>

        <View style={styles.trailingContainer}>
          {clearable && value && !disabled ? (
            <Pressable
              hitSlop={8}
              onPress={handleClear}
              style={styles.clearButton}
              accessibilityLabel="Borrar hora seleccionada"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          ) : null}
        </View>
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      {/* Android DateTimePicker */}
      {open && Platform.OS === "android" && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="time"
          is24Hour={is24Hour}
          minuteInterval={minuteInterval}
          display="default"
          onChange={handleChange}
        />
      )}

      {/* iOS Modal Action Sheet */}
      {Platform.OS === "ios" && (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={handleIosCancel}
        >
          <Pressable style={styles.iosModalOverlay} onPress={handleIosCancel}>
            <Pressable
              style={styles.iosPickerContainer}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.iosHeader}>
                <Pressable onPress={handleIosCancel} style={styles.iosHeaderBtn}>
                  <Text style={styles.iosCancelText}>Cancelar</Text>
                </Pressable>
                <Text style={styles.iosHeaderTitle}>
                  {label || "Seleccionar Hora"}
                </Text>
                <Pressable onPress={handleIosConfirm} style={styles.iosHeaderBtn}>
                  <Text style={styles.iosConfirmText}>Listo</Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="time"
                is24Hour={is24Hour}
                minuteInterval={minuteInterval}
                display="spinner"
                onChange={handleChange}
                textColor={colors.text}
                style={styles.iosPicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: typography.fontWeight.bold,
  },
  input: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  inputActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    opacity: 0.7,
  },
  inputError: {
    borderColor: colors.danger,
  },
  leadingIcon: {
    marginRight: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  valueDisabled: {
    color: colors.textMuted,
  },
  placeholder: {
    color: colors.textMuted,
  },
  trailingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs / 2,
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
  iosModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  iosPickerContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  iosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iosHeaderTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  iosHeaderBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  iosCancelText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  iosConfirmText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  iosPicker: {
    height: 200,
    width: "100%",
  },
});