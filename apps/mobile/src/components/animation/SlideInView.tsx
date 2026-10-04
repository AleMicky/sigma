import type { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  SlideOutDown,
  SlideOutLeft,
  SlideOutRight,
  SlideOutUp,
} from "react-native-reanimated";

export type SlideDirection = "left" | "right" | "top" | "bottom";
export type SlideExitDirection = "left" | "right" | "top" | "bottom" | "none";

export type SlideInViewProps = {
  children: ReactNode;
  direction?: SlideDirection;
  exitDirection?: SlideExitDirection;
  delay?: number;
  duration?: number;
  spring?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function SlideInView({
  children,
  direction = "right",
  exitDirection = "left",
  delay = 0,
  duration = 300,
  spring = false,
  style,
  testID,
}: SlideInViewProps) {
  const getEnteringAnimation = () => {
    let anim;
    switch (direction) {
      case "left":
        anim = SlideInLeft;
        break;
      case "right":
        anim = SlideInRight;
        break;
      case "top":
        anim = SlideInUp;
        break;
      case "bottom":
        anim = SlideInDown;
        break;
      default:
        anim = SlideInRight;
        break;
    }

    let builder = anim.delay(delay).duration(duration);
    if (spring) {
      builder = builder.springify().damping(18);
    }
    return builder;
  };

  const getExitingAnimation = () => {
    switch (exitDirection) {
      case "left":
        return SlideOutLeft.duration(duration * 0.8);
      case "right":
        return SlideOutRight.duration(duration * 0.8);
      case "top":
        return SlideOutUp.duration(duration * 0.8);
      case "bottom":
        return SlideOutDown.duration(duration * 0.8);
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