import { useEffect, type ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export type PulseType = "opacity" | "scale" | "both";

export type PulseViewProps = {
  children: ReactNode;
  active?: boolean;
  type?: PulseType;
  minOpacity?: number;
  maxOpacity?: number;
  minScale?: number;
  maxScale?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function PulseView({
  children,
  active = true,
  type = "opacity",
  minOpacity = 0.4,
  maxOpacity = 1,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 900,
  style,
  testID,
}: PulseViewProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      if (type === "opacity" || type === "both") {
        opacity.value = maxOpacity;
        opacity.value = withRepeat(
          withTiming(minOpacity, { duration: duration / 2 }),
          -1,
          true
        );
      } else {
        opacity.value = 1;
      }

      if (type === "scale" || type === "both") {
        scale.value = maxScale;
        scale.value = withRepeat(
          withTiming(minScale, { duration: duration / 2 }),
          -1,
          true
        );
      } else {
        scale.value = 1;
      }
    } else {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    }

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, [active, type, minOpacity, maxOpacity, minScale, maxScale, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: type === "opacity" || type === "both" ? opacity.value : 1,
    transform: [
      {
        scale: type === "scale" || type === "both" ? scale.value : 1,
      },
    ],
  }));

  return (
    <Animated.View testID={testID} style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}