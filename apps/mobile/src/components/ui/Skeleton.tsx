import { useEffect, useRef } from "react";
import {
  Animated,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { radius, useAppTheme } from "@/theme";

export type SkeletonVariant = "rectangular" | "circular" | "text";

export type SkeletonProps = {
  width?: ViewStyle["width"];
  height?: number;
  borderRadius?: number;
  variant?: SkeletonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius,
  variant = "rectangular",
  style,
}: SkeletonProps) {
  const { colors, isDark } = useAppTheme();
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  const resolvedRadius =
    borderRadius ??
    (variant === "circular"
      ? typeof height === "number"
        ? height / 2
        : radius.full
      : variant === "text"
        ? radius.sm
        : radius.md);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : colors.borderDark,
          width,
          height,
          borderRadius: resolvedRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {},
});