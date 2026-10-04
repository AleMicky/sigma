import React from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors } from "@/theme";

export type PressableFeedback = "opacity" | "scale" | "highlight" | "none";

export type AppPressableProps = Omit<PressableProps, "style"> & {
  feedback?: PressableFeedback;
  activeOpacity?: number;
  activeScale?: number;
  highlightColor?: string;
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

export function AppPressable({
  feedback = "opacity",
  activeOpacity = 0.7,
  activeScale = 0.97,
  highlightColor = colors.surfaceSecondary,
  style,
  disabled,
  ...props
}: AppPressableProps) {
  return (
    <Pressable
      disabled={disabled}
      {...props}
      style={(state) => {
        const customStyle =
          typeof style === "function" ? style(state) : style;

        if (disabled || feedback === "none") {
          return customStyle;
        }

        const feedbackStyle: ViewStyle = {};

        if (state.pressed) {
          if (feedback === "opacity") {
            feedbackStyle.opacity = activeOpacity;
          } else if (feedback === "scale") {
            feedbackStyle.transform = [{ scale: activeScale }];
          } else if (feedback === "highlight") {
            feedbackStyle.backgroundColor = highlightColor;
          }
        }

        return [customStyle, feedbackStyle];
      }}
    />
  );
}