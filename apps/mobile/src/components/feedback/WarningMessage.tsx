import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

export type WarningMessageProps = {
  title?: string;
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function WarningMessage({
  title,
  message,
  onDismiss,
  actionLabel,
  onAction,
  style,
  textStyle,
}: WarningMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="warning"
        size={20}
        color={colors.warning}
        style={styles.icon}
      />

      <View style={styles.content}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={[styles.text, textStyle]}>{message}</Text>
      </View>

      {actionLabel && onAction ? (
        <Pressable
          hitSlop={8}
          onPress={onAction}
          style={styles.actionBtn}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}

      {onDismiss ? (
        <Pressable
          hitSlop={8}
          onPress={onDismiss}
          style={styles.dismissBtn}
          accessibilityRole="button"
          accessibilityLabel="Cerrar advertencia"
        >
          <Ionicons name="close" size={16} color={colors.warning} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: spacing.sm,
  },
  icon: {
    alignSelf: "flex-start",
    marginTop: 1,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: "#B45309",
  },
  text: {
    color: "#92400E",
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  actionBtn: {
    paddingHorizontal: spacing.xs,
  },
  actionText: {
    color: "#B45309",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: "underline",
  },
  dismissBtn: {
    padding: 2,
    alignSelf: "flex-start",
  },
});