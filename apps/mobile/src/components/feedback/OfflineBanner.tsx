import React, { type ReactNode } from "react";
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

import { colors, spacing, typography } from "@/theme";

export type OfflineBannerProps = {
  visible: boolean;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function OfflineBanner({
  visible,
  message = "Sin conexión a internet",
  retryLabel = "Reintentar",
  onRetry,
  onDismiss,
  icon,
  style,
  textStyle,
}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <Ionicons
          name="cloud-offline"
          size={18}
          color={colors.white}
          style={styles.icon}
        />
      )}

      <Text style={[styles.text, textStyle]} numberOfLines={1}>
        {message}
      </Text>

      {onRetry ? (
        <Pressable
          hitSlop={8}
          onPress={onRetry}
          style={styles.retryBtn}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}

      {onDismiss ? (
        <Pressable
          hitSlop={8}
          onPress={onDismiss}
          style={styles.dismissBtn}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
        >
          <Ionicons name="close" size={16} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.danger,
  },
  icon: {
    marginRight: 2,
  },
  iconContainer: {
    marginRight: 2,
  },
  text: {
    flex: 1,
    color: colors.white,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.medium,
  },
  retryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: spacing.xs,
  },
  retryText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  dismissBtn: {
    padding: 2,
  },
});