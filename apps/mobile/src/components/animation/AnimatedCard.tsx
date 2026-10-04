import type { ReactNode } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { radius, spacing, useAppTheme } from "@/theme";

export type AnimatedCardVariant = "default" | "elevated" | "outlined" | "filled";
export type AnimatedCardEntrance = "fadeUp" | "fadeIn" | "zoom" | "none";

export type AnimatedCardProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  variant?: AnimatedCardVariant;
  entrance?: AnimatedCardEntrance;
  activeScale?: number;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function AnimatedCard({
  children,
  delay = 0,
  duration = 300,
  variant = "default",
  entrance = "fadeUp",
  activeScale = 0.98,
  onPress,
  onLongPress,
  disabled = false,
  style,
  testID,
}: AnimatedCardProps) {
  const { colors, isDark } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getEnteringAnimation = () => {
    switch (entrance) {
      case "fadeUp":
        return FadeInUp.delay(delay).duration(duration).springify().damping(18);
      case "fadeIn":
        return FadeIn.delay(delay).duration(duration);
      case "zoom":
        return ZoomIn.delay(delay).duration(duration).springify().damping(16);
      case "none":
      default:
        return undefined;
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: isDark ? colors.surface : colors.background,
          shadowColor: isDark ? "#000000" : "#64748B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 10,
          elevation: 4,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? colors.border : "transparent",
        };
      case "outlined":
        return {
          backgroundColor: isDark ? colors.surface : colors.surfaceSecondary,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case "filled":
        return {
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 0,
        };
      case "default":
      default:
        return {
          backgroundColor: isDark ? colors.surface : colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  const isInteractive = Boolean(onPress || onLongPress);

  const cardNode = (
    <Animated.View
      style={[
        styles.card,
        getVariantStyle(),
        animatedScaleStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  const content = isInteractive ? (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        if (!disabled) {
          scale.value = withSpring(activeScale, { damping: 15, stiffness: 300 });
        }
      }}
      onPressOut={() => {
        if (!disabled) {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }
      }}
    >
      {cardNode}
    </Pressable>
  ) : (
    cardNode
  );

  const enteringAnim = getEnteringAnimation();

  if (enteringAnim) {
    return <Animated.View entering={enteringAnim}>{content}</Animated.View>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.6,
  },
});