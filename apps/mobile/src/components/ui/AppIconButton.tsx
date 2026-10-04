import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  type PressableProps,
} from "react-native";
import { radius, useAppTheme, type ColorKey } from "@/theme";

export type IconButtonVariant =
  | "ghost"
  | "tonal"
  | "outline"
  | "filled"
  | "danger";

export type IconButtonSize = "sm" | "md" | "lg";

export type AppIconButtonProps = Omit<PressableProps, "style"> & {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: ColorKey | (string & {});
  iconSize?: number;
  loading?: boolean;
  badgeCount?: number;
  badgeDot?: boolean;
  style?: StyleProp<ViewStyle>;
};

const sizeMap = {
  sm: { button: 32, icon: 18 },
  md: { button: 40, icon: 22 },
  lg: { button: 48, icon: 26 },
};

export function AppIconButton({
  icon,
  accessibilityLabel,
  variant = "ghost",
  size = "md",
  color,
  iconSize,
  loading = false,
  badgeCount,
  badgeDot = false,
  disabled,
  style,
  ...props
}: AppIconButtonProps) {
  const { colors } = useAppTheme();
  const currentSize = sizeMap[size];
  const finalIconSize = iconSize ?? currentSize.icon;

  const defaultIconColor =
    variant === "filled"
      ? colors.white
      : variant === "danger"
        ? colors.danger
        : colors.text;

  const resolvedColor = color
    ? (colors[color as ColorKey] ?? color)
    : defaultIconColor;

  const isDisabled = disabled || loading;

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "tonal":
        return { backgroundColor: colors.surfaceSecondary };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "filled":
        return { backgroundColor: colors.primary };
      case "danger":
        return { backgroundColor: colors.dangerLight };
      case "ghost":
      default:
        return { backgroundColor: "transparent" };
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        getVariantStyle(),
        {
          width: currentSize.button,
          height: currentSize.button,
        },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={resolvedColor} />
      ) : (
        <>
          <Ionicons name={icon} size={finalIconSize} color={resolvedColor} />

          {badgeCount && badgeCount > 0 ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.danger,
                  borderColor: colors.background,
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </Text>
            </View>
          ) : badgeDot ? (
            <View
              style={[
                styles.badgeDot,
                {
                  backgroundColor: colors.danger,
                  borderColor: colors.background,
                },
              ]}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    position: "relative",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  disabled: {
    opacity: 0.4,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  badgeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});