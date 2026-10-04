import { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {
  AppBadge,
  type BadgeAppearance,
  type BadgeVariant,
} from "@/components/ui/AppBadge";
import { colors, spacing, typography } from "@/theme";

export type StatusRowProps = {
  label?: string;
  status: string;
  variant?: BadgeVariant;
  appearance?: BadgeAppearance;
  dot?: boolean;
  icon?: ReactNode;
  subtitle?: string;
  withDivider?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function StatusRow({
  label = "Estado",
  status,
  variant = "default",
  appearance = "subtle",
  dot = true,
  icon,
  subtitle,
  withDivider = false,
  style,
}: StatusRowProps) {
  return (
    <View style={[styles.container, withDivider && styles.divider, style]}>
      <View style={styles.left}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <View style={styles.textWrapper}>
          <Text style={styles.label}>{label}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <AppBadge
        label={status}
        variant={variant}
        appearance={appearance}
        dot={dot}
      />
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
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: spacing.sm,
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});