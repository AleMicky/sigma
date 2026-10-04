import { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, spacing, typography, type ColorKey } from "@/theme";

export type KeyValueRowProps = {
  label: string;
  value?: string | number | null;
  customValue?: ReactNode;
  icon?: ReactNode;
  valueColor?: ColorKey | (string & {});
  withDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export function KeyValueRow({
  label,
  value,
  customValue,
  icon,
  valueColor = "text",
  withDivider = false,
  style,
  labelStyle,
  valueStyle,
}: KeyValueRowProps) {
  const resolvedValueColor =
    colors[valueColor as ColorKey] ?? valueColor;

  return (
    <View style={[styles.container, withDivider && styles.divider, style]}>
      <View style={styles.labelWrapper}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>

      {customValue ? (
        <View style={styles.customValueWrapper}>{customValue}</View>
      ) : (
        <Text
          style={[
            styles.value,
            { color: resolvedValueColor },
            valueStyle,
          ]}
        >
          {value !== undefined && value !== null ? String(value) : "-"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  labelWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  customValueWrapper: {
    alignItems: "flex-end",
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});