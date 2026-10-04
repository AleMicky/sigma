import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, shadows, spacing, typography } from "@/theme";

export type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  submessage?: string;
};

export function LoadingOverlay({
  visible,
  message = "Cargando...",
  submessage,
}: LoadingOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={message}
        style={styles.overlay}
      >
        <View style={styles.hudCard}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.message}>{message}</Text>

          {submessage ? (
            <Text style={styles.submessage}>{submessage}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  hudCard: {
    minWidth: 160,
    maxWidth: 280,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.lg,
  },
  message: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  submessage: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
});