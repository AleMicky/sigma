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

import { colors, radius, spacing, typography } from "@/theme";

export type InfoMessageProps = {
  title?: string;
  message: string;
  icon?: ReactNode;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function InfoMessage({
  title,
  message,
  icon,
  onDismiss,
  actionLabel,
  onAction,
  style,
  textStyle,
  titleStyle,
}: InfoMessageProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <Ionicons
          name="information-circle"
          size={20}
          color={colors.primary}
          style={styles.icon}
        />
      )}

      <View style={styles.content}>
        {title ? (
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        ) : null}
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
          accessibilityLabel="Cerrar mensaje"
        >
          <Ionicons name="close" size={16} color={colors.primary} />
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
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: spacing.sm,
  },
  icon: {
    alignSelf: "flex-start",
    marginTop: 1,
  },
  iconContainer: {
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
    color: colors.primaryDark,
  },
  text: {
    color: "#1E40AF",
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  actionBtn: {
    paddingHorizontal: spacing.xs,
  },
  actionText: {
    color: colors.primaryDark,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: "underline",
  },
  dismissBtn: {
    padding: 2,
    alignSelf: "flex-start",
  },
});