import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { spacing, typography, useAppTheme, type ColorKey, type SpacingKey } from "@/theme";

export type DividerProps = {
  orientation?: "horizontal" | "vertical";
  label?: string;
  color?: ColorKey | (string & {});
  spacingVertical?: SpacingKey;
  spacingHorizontal?: SpacingKey;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function Divider({
  orientation = "horizontal",
  label,
  color = "border",
  spacingVertical = "md",
  spacingHorizontal = "none",
  style,
  labelStyle,
}: DividerProps) {
  const { colors } = useAppTheme();
  const resolvedColor = colors[color as ColorKey] ?? color;

  if (orientation === "vertical") {
    return (
      <View
        style={[
          styles.vertical,
          {
            backgroundColor: resolvedColor,
            marginHorizontal: spacing[spacingHorizontal] || spacing.md,
            marginVertical: spacing[spacingVertical],
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View
        style={[
          styles.labelContainer,
          { marginVertical: spacing[spacingVertical] },
          style,
        ]}
      >
        <View style={[styles.horizontalLine, { backgroundColor: resolvedColor }]} />
        <Text style={[styles.labelText, { color: colors.textSecondary }, labelStyle]}>
          {label}
        </Text>
        <View style={[styles.horizontalLine, { backgroundColor: resolvedColor }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          backgroundColor: resolvedColor,
          marginVertical: spacing[spacingVertical],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: "100%",
    alignSelf: "stretch",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  horizontalLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  labelText: {
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});