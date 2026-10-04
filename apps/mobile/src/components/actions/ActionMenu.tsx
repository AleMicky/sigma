import React, { type ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/theme";
import { AppBadge, type BadgeVariant } from "../ui/AppBadge";

export type ActionMenuItem = {
  id?: string;
  label: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap | ReactNode;
  iconColor?: string;
  danger?: boolean;
  disabled?: boolean;
  badge?: string | number;
  badgeVariant?: BadgeVariant;
  onPress: () => void;
};

export type ActionMenuProps = {
  visible: boolean;
  onClose: () => void;
  actions: ActionMenuItem[];
  title?: string;
  subtitle?: string;
  showCancel?: boolean;
  cancelLabel?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function ActionMenu({
  visible,
  onClose,
  actions,
  title,
  subtitle,
  showCancel = true,
  cancelLabel = "Cancelar",
  style,
  titleStyle,
}: ActionMenuProps) {
  const handlePress = (action: ActionMenuItem) => {
    if (action.disabled) return;
    onClose();
    action.onPress();
  };

  const renderIcon = (action: ActionMenuItem) => {
    if (!action.icon) return null;
    if (typeof action.icon === "string") {
      return (
        <Ionicons
          name={action.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={
            action.disabled
              ? colors.textMuted
              : action.iconColor ||
                (action.danger ? colors.danger : colors.text)
          }
        />
      );
    }
    return action.icon;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, style]}>
          {/* Header */}
          {title || subtitle ? (
            <View style={styles.header}>
              {title ? (
                <Text style={[styles.title, titleStyle]}>{title}</Text>
              ) : null}
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Action List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.actionList}
          >
            {actions.map((action, index) => {
              const isFirst = index === 0 && !title && !subtitle;
              const isLast = index === actions.length - 1 && !showCancel;

              return (
                <Pressable
                  key={action.id || `${action.label}-${index}`}
                  onPress={() => handlePress(action)}
                  disabled={action.disabled}
                  style={({ pressed }) => [
                    styles.item,
                    isFirst && styles.itemFirst,
                    isLast && styles.itemLast,
                    action.disabled && styles.itemDisabled,
                    pressed && !action.disabled && styles.pressed,
                  ]}
                >
                  {renderIcon(action)}

                  <View style={styles.itemText}>
                    <Text
                      style={[
                        styles.label,
                        action.danger && styles.danger,
                        action.disabled && styles.labelDisabled,
                      ]}
                      numberOfLines={1}
                    >
                      {action.label}
                    </Text>

                    {action.subtitle ? (
                      <Text
                        style={[
                          styles.itemSubtitle,
                          action.disabled && styles.labelDisabled,
                        ]}
                        numberOfLines={1}
                      >
                        {action.subtitle}
                      </Text>
                    ) : null}
                  </View>

                  {action.badge !== undefined ? (
                    <AppBadge
                      label={String(action.badge)}
                      variant={
                        action.badgeVariant ||
                        (action.danger ? "danger" : "default")
                      }
                      size="sm"
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Cancel Action */}
          {showCancel ? (
            <View style={styles.cancelContainer}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  menu: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
  actionList: {
    paddingVertical: spacing.xs,
  },
  item: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  itemFirst: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  itemLast: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  itemDisabled: {
    opacity: 0.45,
  },
  pressed: {
    backgroundColor: colors.surfaceSecondary,
  },
  itemText: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  danger: {
    color: colors.danger,
  },
  cancelContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  cancelText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
});