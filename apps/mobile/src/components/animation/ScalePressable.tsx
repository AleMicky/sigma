import { memo, useMemo } from "react";
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ScalePressableProps = PressableProps & {
  activeScale?: number;
  activeOpacity?: number;
  springConfig?: WithSpringConfig;
};

const DEFAULT_SPRING: WithSpringConfig = { damping: 15, stiffness: 300, mass: 0.8 };

function ScalePressableComponent({
  activeScale = 0.96,
  activeOpacity,
  springConfig = DEFAULT_SPRING,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ScalePressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: activeOpacity !== undefined ? opacity.value : 1,
  }));

  const hasFunctionStyle = typeof style === "function";

  const resolvedStaticStyle = useMemo(() => {
    if (hasFunctionStyle) return undefined;
    return [animatedStyle, disabled ? { opacity: 0.6 } : undefined, style as StyleProp<ViewStyle>];
  }, [hasFunctionStyle, animatedStyle, disabled, style]);

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      style={
        hasFunctionStyle
          ? ((state: PressableStateCallbackType) => [
              animatedStyle,
              disabled ? { opacity: 0.6 } : undefined,
              (style as (s: PressableStateCallbackType) => StyleProp<ViewStyle>)(state),
            ]) as any
          : (resolvedStaticStyle as any)
      }
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(activeScale, springConfig);
          if (activeOpacity !== undefined) {
            opacity.value = withSpring(activeOpacity, springConfig);
          }
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!disabled) {
          scale.value = withSpring(1, springConfig);
          if (activeOpacity !== undefined) {
            opacity.value = withSpring(1, springConfig);
          }
        }
        onPressOut?.(event);
      }}
    />
  );
}

export const ScalePressable = memo(ScalePressableComponent);