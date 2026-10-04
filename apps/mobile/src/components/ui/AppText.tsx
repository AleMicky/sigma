import {
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from "react-native";
import { colors, typography, type ColorKey } from "../../theme";

export type TextVariant = "h1" | "title" | "subtitle" | "body" | "bodySm" | "caption";
export type FontWeightKey = keyof typeof typography.fontWeight;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: ColorKey | string;
  weight?: FontWeightKey;
  align?: TextStyle["textAlign"];
};

export function AppText({
  variant = "body",
  color,
  weight,
  align,
  style,
  ...props
}: AppTextProps) {
  const textColor = color
    ? (colors[color as ColorKey] ?? color)
    : undefined;

  const customStyle: TextStyle = {
    ...(textColor ? { color: textColor } : {}),
    ...(weight ? { fontWeight: typography.fontWeight[weight] } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  return (
    <Text
      style={[styles[variant], customStyle, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: typography.fontSize.xxxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  body: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.text,
  },
  bodySm: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
  },
});