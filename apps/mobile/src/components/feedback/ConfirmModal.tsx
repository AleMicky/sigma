import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { colors, radius, shadows, spacing, typography } from "@/theme";

export type ConfirmModalVariant = "primary" | "danger" | "warning";

export type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  loading?: boolean;
  dismissible?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  customContent?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  loading = false,
  dismissible = true,
  icon,
  customContent,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const defaultIcon =
    variant === "danger"
      ? "trash-outline"
      : variant === "warning"
        ? "warning-outline"
        : "help-circle-outline";

  const selectedIcon = icon ?? defaultIcon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible && !loading ? onCancel : undefined}
    >
      <View style={styles.overlay}>
        {dismissible ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={!loading ? onCancel : undefined}
          />
        ) : null}

        <View style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              variant === "danger" && styles.dangerCircle,
              variant === "warning" && styles.warningCircle,
            ]}
          >
            <Ionicons
              name={selectedIcon}
              size={28}
              color={
                variant === "danger"
                  ? colors.danger
                  : variant === "warning"
                    ? colors.warning
                    : colors.primary
              }
            />
          </View>

          <Text style={styles.title}>{title}</Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {customContent}

          <View style={styles.actions}>
            <AppButton
              title={cancelText}
              variant="outline"
              size="md"
              disabled={loading}
              onPress={onCancel}
              style={styles.flex1}
            />

            <AppButton
              title={confirmText}
              variant={variant === "danger" ? "danger" : "primary"}
              size="md"
              loading={loading}
              onPress={onConfirm}
              style={styles.flex1}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  dangerCircle: {
    backgroundColor: colors.dangerLight,
  },
  warningCircle: {
    backgroundColor: "#FEF3C7",
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  flex1: {
    flex: 1,
  },
});