import { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import {
  radius as themeRadius,
  shadows,
  spacing,
  useAppTheme,
  type RadiusKey,
  type ShadowKey,
  type SpacingKey,
} from "../../theme";

export type CardVariant = "outlined" | "elevated" | "filled";

export type AppCardProps = ViewProps & {
  children?: ReactNode;
  variant?: CardVariant;
  padding?: SpacingKey;
  radius?: RadiusKey;
  shadow?: ShadowKey;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({
  children,
  variant = "outlined",
  padding = "lg",
  radius = "lg",
  shadow = variant === "elevated" ? "md" : "none",
  onPress,
  style,
  ...props
}: AppCardProps) {
  const { colors } = useAppTheme();

  const getDynamicVariantStyle = () => {
    switch (variant) {
      case "filled":
        return {
          backgroundColor: colors.surface,
          borderColor: "transparent",
        };
      case "elevated":
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "outlined":
      default:
        return {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  const cardStyles = [
    styles.base,
    getDynamicVariantStyle(),
    shadows[shadow],
    {
      padding: spacing[padding],
      borderRadius: themeRadius[radius],
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyles, pressed && styles.pressed]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

AppCard.Header = function CardHeader({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.header, style]}>{children}</View>;
};

AppCard.Body = function CardBody({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.body, style]}>{children}</View>;
};

AppCard.Footer = function CardFooter({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.footer,
        { borderTopColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  header: {
    marginBottom: spacing.sm,
  },
  body: {
    flex: 1,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
});