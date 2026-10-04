import React, { useState } from "react";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

export type DateRange = {
  startDate?: Date | null;
  endDate?: Date | null;
};

export type DateRangePreset = {
  label: string;
  getRange: () => DateRange;
};

export type DateRangePickerProps = {
  label?: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showPresets?: boolean;
  customPresets?: DateRangePreset[];
  clearable?: boolean;
  startLabel?: string;
  endLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

type PickerType = "start" | "end" | null;

export function DateRangePicker({
  label = "Rango de fechas",
  value,
  onChange,
  error,
  hint,
  disabled = false,
  minDate,
  maxDate,
  showPresets = true,
  customPresets,
  clearable = true,
  startLabel = "Desde",
  endLabel = "Hasta",
  containerStyle,
  labelStyle,
}: DateRangePickerProps) {
  const [picker, setPicker] = useState<PickerType>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const defaultPresets: DateRangePreset[] = [
    {
      label: "Hoy",
      getRange: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { startDate: today, endDate: end };
      },
    },
    {
      label: "Esta Semana",
      getRange: () => {
        const now = new Date();
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        firstDay.setHours(0, 0, 0, 0);
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        lastDay.setHours(23, 59, 59, 999);
        return { startDate: firstDay, endDate: lastDay };
      },
    },
    {
      label: "Este Mes",
      getRange: () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);
        return { startDate: firstDay, endDate: lastDay };
      },
    },
    {
      label: "Últimos 30 días",
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
      },
    },
  ];

  const presets = customPresets || defaultPresets;

  const formatDate = (date?: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleOpenPicker = (type: "start" | "end") => {
    if (disabled) return;
    const initial =
      type === "start"
        ? value.startDate ?? new Date()
        : value.endDate ?? value.startDate ?? new Date();
    setTempDate(initial);
    setPicker(type);
  };

  const handleDateChange = (date: Date) => {
    if (picker === "start") {
      const isEndBeforeNewStart =
        value.endDate && value.endDate.getTime() < date.getTime();
      onChange({
        ...value,
        startDate: date,
        endDate: isEndBeforeNewStart ? undefined : value.endDate,
      });
    } else if (picker === "end") {
      onChange({
        ...value,
        endDate: date,
      });
    }
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setPicker(null);
      if (event.type === "set" && selectedDate) {
        handleDateChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIosConfirm = () => {
    handleDateChange(tempDate);
    setPicker(null);
  };

  const handleIosCancel = () => {
    setPicker(null);
  };

  const handleClear = () => {
    if (disabled) return;
    onChange({ startDate: null, endDate: null });
  };

  const hasRangeSelected = Boolean(value.startDate || value.endDate);

  const pickerMinDate =
    picker === "end"
      ? (value.startDate ?? minDate)
      : minDate;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
        {clearable && hasRangeSelected && !disabled ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            <Text style={styles.clearText}>Limpiar rango</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Preset quick buttons */}
      {showPresets && !disabled ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsContainer}
        >
          {presets.map((preset) => (
            <Pressable
              key={preset.label}
              onPress={() => onChange(preset.getRange())}
              style={({ pressed }) => [
                styles.presetChip,
                pressed && styles.presetChipPressed,
              ]}
            >
              <Text style={styles.presetChipText}>{preset.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.row}>
        {/* Start Date Input */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${startLabel}: ${formatDate(value.startDate) ?? "No seleccionado"}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          style={({ pressed }) => [
            styles.input,
            picker === "start" && styles.inputActive,
            disabled && styles.inputDisabled,
            error ? styles.inputError : null,
            pressed && !disabled && styles.inputPressed,
          ]}
          onPress={() => handleOpenPicker("start")}
        >
          <View style={styles.textContainer}>
            <Text style={styles.caption}>{startLabel}</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.value,
                !value.startDate && styles.placeholder,
                disabled && styles.valueDisabled,
              ]}
            >
              {formatDate(value.startDate) ?? "Seleccionar"}
            </Text>
          </View>

          <Ionicons
            name="calendar-outline"
            size={18}
            color={
              picker === "start"
                ? colors.primary
                : disabled
                  ? colors.textMuted
                  : colors.textSecondary
            }
          />
        </Pressable>

        <View style={styles.arrowContainer}>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={colors.textSecondary}
          />
        </View>

        {/* End Date Input */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${endLabel}: ${formatDate(value.endDate) ?? "No seleccionado"}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          style={({ pressed }) => [
            styles.input,
            picker === "end" && styles.inputActive,
            disabled && styles.inputDisabled,
            error ? styles.inputError : null,
            pressed && !disabled && styles.inputPressed,
          ]}
          onPress={() => handleOpenPicker("end")}
        >
          <View style={styles.textContainer}>
            <Text style={styles.caption}>{endLabel}</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.value,
                !value.endDate && styles.placeholder,
                disabled && styles.valueDisabled,
              ]}
            >
              {formatDate(value.endDate) ?? "Seleccionar"}
            </Text>
          </View>

          <Ionicons
            name="calendar-outline"
            size={18}
            color={
              picker === "end"
                ? colors.primary
                : disabled
                  ? colors.textMuted
                  : colors.textSecondary
            }
          />
        </Pressable>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      {/* Android DateTimePicker */}
      {picker && Platform.OS === "android" && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          minimumDate={pickerMinDate}
          maximumDate={maxDate}
          onValueChange={(_event, selectedDate) => {
            setPicker(null);
            if (selectedDate) {
              handleDateChange(selectedDate);
            }
          }}
          onDismiss={() => setPicker(null)}
        />
      )}

      {/* iOS Modal Action Sheet */}
      {Platform.OS === "ios" && (
        <Modal
          visible={picker !== null}
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
                  {picker === "start" ? startLabel : endLabel}
                </Text>
                <Pressable onPress={handleIosConfirm} style={styles.iosHeaderBtn}>
                  <Text style={styles.iosConfirmText}>Listo</Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={pickerMinDate}
                maximumDate={maxDate}
                onValueChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  clearText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  presetsContainer: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipPressed: {
    backgroundColor: colors.border,
  },
  presetChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
  arrowContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.regular,
  },
  valueDisabled: {
    color: colors.textMuted,
  },
  placeholder: {
    color: colors.textMuted,
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