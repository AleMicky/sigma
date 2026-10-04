import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { AppButton } from "./AppButton";
import { colors, radius, spacing, typography } from "@/theme";

export type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  customIcon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
};

export function EmptyState({
  title = "Sin datos",
  description = "No hay información disponible.",
  icon = "folder-open-outline",
  customIcon,
  actionLabel,
  onAction,
  fullScreen = false,
  style,
  titleStyle,
  descriptionStyle,
}: EmptyStateProps) {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        style,
      ]}
    >
      {customIcon ? (
        customIcon
      ) : icon ? (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={32} color={colors.textSecondary} />
        </View>
      ) : null}

      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {description ? (
        <Text style={[styles.description, descriptionStyle]}>
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          size="sm"
          variant="primary"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xs,
  },
  fullScreen: {
    flex: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  description: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  actionButton: {
    marginTop: spacing.md,
  },
});