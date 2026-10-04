import React from "react";
import {
  RefreshControl,
  type RefreshControlProps,
} from "react-native";

import { colors } from "@/theme";

export type AppRefreshControlProps = RefreshControlProps & {
  title?: string;
  titleColor?: string;
};

export function AppRefreshControl({
  tintColor = colors.primary,
  colors: indicatorColors = [colors.primary],
  progressBackgroundColor = colors.background,
  title,
  titleColor = colors.textSecondary,
  ...props
}: AppRefreshControlProps) {
  return (
    <RefreshControl
      tintColor={tintColor}
      colors={indicatorColors}
      progressBackgroundColor={progressBackgroundColor}
      title={title}
      titleColor={titleColor}
      {...props}
    />
  );
}