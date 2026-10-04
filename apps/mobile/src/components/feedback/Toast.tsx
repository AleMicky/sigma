import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, shadows, spacing, typography } from "@/theme";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastProps = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

const iconMap = {
  success: "checkmark-circle",
  error: "alert-circle",
  warning: "warning",
  info: "information-circle",
} as const;

export function Toast({
  title,
  message,
  variant = "info",
  onDismiss,
  style,
}: ToastProps) {
  const stylesConfig = variantConfig[variant];

  return (
    <View style={[styles.container, stylesConfig.container, style]}>
      <Ionicons
        name={iconMap[variant]}
        size={22}
        color={stylesConfig.iconColor}
        style={styles.icon}
      />

      <View style={styles.textContainer}>
        {title ? (
          <Text style={[styles.title, { color: stylesConfig.titleColor }]}>
            {title}
          </Text>
        ) : null}
        <Text style={[styles.message, { color: stylesConfig.messageColor }]}>
          {message}
        </Text>
      </View>

      {onDismiss ? (
        <Pressable
          hitSlop={8}
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Cerrar notificación"
        >
          <Ionicons name="close" size={18} color={stylesConfig.iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadows.md,
  },
  icon: {
    marginRight: spacing.sm,
    alignSelf: "flex-start",
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  message: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  dismissButton: {
    marginLeft: spacing.sm,
    padding: 2,
    alignSelf: "flex-start",
  },
});

const variantConfig = {
  success: {
    container: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
    iconColor: colors.success,
    titleColor: "#14532D",
    messageColor: "#166534",
  },
  error: {
    container: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
    iconColor: colors.danger,
    titleColor: "#7F1D1D",
    messageColor: "#991B1B",
  },
  warning: {
    container: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
    iconColor: colors.warning,
    titleColor: "#78350F",
    messageColor: "#92400E",
  },
  info: {
    container: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
    iconColor: colors.primary,
    titleColor: "#1E3A8A",
    messageColor: "#1E40AF",
  },
};