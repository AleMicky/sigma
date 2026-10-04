import type { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
} from "react-native-reanimated";

export type FadeDirection = "none" | "up" | "down" | "left" | "right";
export type FadeExitDirection = "none" | "fade" | "up" | "down" | "left" | "right";

export type FadeInViewProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: FadeDirection;
  exitDirection?: FadeExitDirection;
  spring?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function FadeInView({
  children,
  delay = 0,
  duration = 300,
  direction = "none",
  exitDirection = "fade",
  spring = false,
  style,
  testID,
}: FadeInViewProps) {
  const getEnteringAnimation = () => {
    let anim;
    switch (direction) {
      case "up":
        anim = FadeInUp;
        break;
      case "down":
        anim = FadeInDown;
        break;
      case "left":
        anim = FadeInLeft;
        break;
      case "right":
        anim = FadeInRight;
        break;
      case "none":
      default:
        anim = FadeIn;
        break;
    }

    let builder = anim.delay(delay).duration(duration);
    if (spring) {
      builder = builder.springify().damping(16);
    }
    return builder;
  };

  const getExitingAnimation = () => {
    switch (exitDirection) {
      case "up":
        return FadeOutUp.duration(duration * 0.8);
      case "down":
        return FadeOutDown.duration(duration * 0.8);
      case "left":
        return FadeOutLeft.duration(duration * 0.8);
      case "right":
        return FadeOutRight.duration(duration * 0.8);
      case "fade":
        return FadeOut.duration(duration * 0.8);
      case "none":
      default:
        return undefined;
    }
  };

  return (
    <Animated.View
      testID={testID}
      entering={getEnteringAnimation()}
      exiting={getExitingAnimation()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}