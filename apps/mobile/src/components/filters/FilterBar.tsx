import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import {
  FilterChip,
  type FilterChipSize,
  type FilterChipVariant,
} from "@/components/filters/FilterChip";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type FilterOption = {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number | string;
  disabled?: boolean;
};

export type FilterBarProps = {
  options: FilterOption[];
  value?: string;
  onChange?: (value: string) => void;
  multiSelect?: boolean;
  values?: string[];
  onMultiChange?: (values: string[]) => void;
  onOpenFilterSheet?: () => void;
  activeFilterCount?: number;
  onClear?: () => void;
  showClear?: boolean;
  chipSize?: FilterChipSize;
  chipVariant?: FilterChipVariant;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export function FilterBar({
  options,
  value,
  onChange,
  multiSelect = false,
  values = [],
  onMultiChange,
  onOpenFilterSheet,
  activeFilterCount = 0,
  onClear,
  showClear = false,
  chipSize = "md",
  chipVariant = "subtle",
  style,
  contentContainerStyle,
  testID,
}: FilterBarProps) {
  const handleChipPress = (optionValue: string) => {
    if (multiSelect) {
      if (!onMultiChange) return;
      const isSelected = values.includes(optionValue);
      if (isSelected) {
        onMultiChange(values.filter((v) => v !== optionValue));
      } else {
        onMultiChange([...values, optionValue]);
      }
    } else {
      if (onChange) {
        onChange(optionValue);
      }
    }
  };

  const isOptionSelected = (optionValue: string) => {
    if (multiSelect) {
      return values.includes(optionValue);
    }
    return value === optionValue;
  };

  const hasActiveFilters = multiSelect
    ? values.length > 0
    : value !== undefined && value !== "" && value !== "all";

  return (
    <View testID={testID} style={[styles.wrapper, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      >
        {/* Leading Filter Sheet Button */}
        {onOpenFilterSheet ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir filtros avanzados${activeFilterCount > 0 ? `, ${activeFilterCount} activos` : ""}`}
            onPress={onOpenFilterSheet}
            style={({ pressed }) => [
              styles.filterSheetBtn,
              activeFilterCount > 0 && styles.filterSheetBtnActive,
              styles[`btnSize_${chipSize}`],
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={chipSize === "sm" ? 14 : 16}
              color={activeFilterCount > 0 ? colors.white : colors.text}
            />
            <Text
              style={[
                styles.filterSheetBtnText,
                activeFilterCount > 0 && styles.filterSheetBtnTextActive,
                styles[`text_${chipSize}`],
              ]}
            >
              Filtros
            </Text>

            {activeFilterCount > 0 ? (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountBadgeText}>
                  {activeFilterCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}

        {/* Filter Chips */}
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            icon={option.icon}
            count={option.count}
            disabled={option.disabled}
            size={chipSize}
            variant={chipVariant}
            selected={isOptionSelected(option.value)}
            onPress={() => handleChipPress(option.value)}
          />
        ))}

        {/* Clear Filters Button */}
        {showClear && hasActiveFilters && onClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar todos los filtros"
            onPress={onClear}
            style={({ pressed }) => [
              styles.clearBtn,
              styles[`btnSize_${chipSize}`],
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="close-outline"
              size={chipSize === "sm" ? 14 : 16}
              color={colors.danger}
            />
            <Text style={[styles.clearBtnText, styles[`text_${chipSize}`]]}>
              Limpiar
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.75,
  },

  /* FILTER SHEET BUTTON */
  filterSheetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: colors.surfaceSecondary,
  },
  filterSheetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterSheetBtnText: {
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  filterSheetBtnTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  filterCountBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  /* CLEAR BUTTON */
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dangerLight,
    backgroundColor: colors.dangerLight,
  },
  clearBtnText: {
    fontWeight: typography.fontWeight.medium,
    color: colors.danger,
  },

  /* BUTTON SIZES */
  btnSize_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    minHeight: 28,
  },
  btnSize_md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  btnSize_lg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },

  /* TEXT SIZES */
  text_sm: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  text_md: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  text_lg: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
});