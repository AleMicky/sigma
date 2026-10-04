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

export function ScalePressable({
  activeScale = 0.96,
  activeOpacity,
  springConfig = { damping: 15, stiffness: 300 },
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

  const resolveStyle = (state: PressableStateCallbackType) => {
    const computedStyle =
      typeof style === "function" ? style(state) : style;
    return [
      animatedStyle,
      disabled ? { opacity: 0.6 } : undefined,
      computedStyle,
    ];
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      style={resolveStyle as any}
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