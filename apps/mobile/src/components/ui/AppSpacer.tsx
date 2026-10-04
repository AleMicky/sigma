import React from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { spacing, type SpacingKey } from "@/theme";

export type AppSpacerProps = {
  size?: SpacingKey | number;
  horizontal?: boolean;
  flex?: number;
  style?: StyleProp<ViewStyle>;
};

export function AppSpacer({
  size = "md",
  horizontal = false,
  flex,
  style,
}: AppSpacerProps) {
  const pixelSize = typeof size === "number" ? size : spacing[size];

  if (flex !== undefined) {
    return <View style={[{ flex }, style]} />;
  }

  return (
    <View
      style={[
        horizontal ? { width: pixelSize } : { height: pixelSize },
        style,
      ]}
    />
  );
}