import React, { type ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

import { colors, spacing, typography } from "@/theme";

export type SwipeActionItem = {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap | ReactNode;
  backgroundColor?: string;
  color?: string;
  onPress: () => void;
};

export type SwipeActionProps = {
  children: ReactNode;
  rightActions?: SwipeActionItem[];
  leftActions?: SwipeActionItem[];
  onEdit?: () => void;
  onDelete?: () => void;
  overshootRight?: boolean;
  overshootLeft?: boolean;
  friction?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

export function SwipeAction({
  children,
  rightActions,
  leftActions,
  onEdit,
  onDelete,
  overshootRight = false,
  overshootLeft = false,
  friction = 2,
  containerStyle,
}: SwipeActionProps) {
  const resolvedRightActions: SwipeActionItem[] = rightActions || [
    ...(onEdit
      ? [
          {
            label: "Editar",
            icon: "create-outline" as const,
            backgroundColor: colors.primary,
            color: colors.white,
            onPress: onEdit,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: "Eliminar",
            icon: "trash-outline" as const,
            backgroundColor: colors.danger,
            color: colors.white,
            onPress: onDelete,
          },
        ]
      : []),
  ];

  const renderActionButtons = (actions: SwipeActionItem[]) => {
    if (!actions.length) return null;

    return (
      <View style={styles.actions}>
        {actions.map((action, index) => {
          const bg = action.backgroundColor || colors.primary;
          const fg = action.color || colors.white;

          return (
            <RectButton
              key={`${action.label}-${index}`}
              style={[styles.action, { backgroundColor: bg }]}
              onPress={action.onPress}
            >
              {typeof action.icon === "string" ? (
                <Ionicons
                  name={action.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={fg}
                />
              ) : (
                action.icon
              )}

              {action.label ? (
                <Text style={[styles.actionText, { color: fg }]}>
                  {action.label}
                </Text>
              ) : null}
            </RectButton>
          );
        })}
      </View>
    );
  };

  return (
    <Swipeable
      containerStyle={containerStyle}
      friction={friction}
      overshootRight={overshootRight}
      overshootLeft={overshootLeft}
      renderRightActions={
        resolvedRightActions.length
          ? () => renderActionButtons(resolvedRightActions)
          : undefined
      }
      renderLeftActions={
        leftActions?.length ? () => renderActionButtons(leftActions) : undefined
      }
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
  },
  action: {
    minWidth: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.medium,
  },
});