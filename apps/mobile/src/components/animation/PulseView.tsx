import { memo, useEffect, type ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
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

function PulseViewComponent({
  children,
  active = true,
  type = "opacity",
  minOpacity = 0.4,
  maxOpacity = 1,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 1000,
  style,
  testID,
}: PulseViewProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      const halfDuration = Math.max(100, Math.floor(duration / 2));
      const timingConfig = {
        duration: halfDuration,
        easing: Easing.inOut(Easing.ease),
      };

      if (type === "opacity" || type === "both") {
        opacity.value = maxOpacity;
        opacity.value = withRepeat(
          withTiming(minOpacity, timingConfig),
          -1,
          true
        );
      } else {
        cancelAnimation(opacity);
        opacity.value = 1;
      }

      if (type === "scale" || type === "both") {
        scale.value = maxScale;
        scale.value = withRepeat(
          withTiming(minScale, timingConfig),
          -1,
          true
        );
      } else {
        cancelAnimation(scale);
        scale.value = 1;
      }
    } else {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
      scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
    }

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, [active, type, minOpacity, maxOpacity, minScale, maxScale, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const isOpacityActive = type === "opacity" || type === "both";
    const isScaleActive = type === "scale" || type === "both";

    return {
      opacity: isOpacityActive ? opacity.value : 1,
      transform: [
        {
          scale: isScaleActive ? scale.value : 1,
        },
      ],
    };
  }, [type]);

  return (
    <Animated.View testID={testID} style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

export const PulseView = memo(PulseViewComponent);