import {
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from "react-native";
import {
  colors,
  typography,
  type ColorKey,
} from "../../theme";

export type TextVariant =
  | "h1"
  | "title"
  | "subtitle"
  | "body"
  | "bodySm"
  | "caption";

export type FontWeightKey = keyof typeof typography.fontWeight;
export type FontSizeKey = keyof typeof typography.fontSize;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  /** Sugiere claves del theme y permite strings HEX/RGB */
  color?: ColorKey | (string & {});
  size?: FontSizeKey;
  weight?: FontWeightKey;
  align?: TextStyle["textAlign"];
  transform?: TextStyle["textTransform"];
  underline?: boolean;
  strikethrough?: boolean;
  truncate?: boolean;
};

export function AppText({
  variant = "body",
  color,
  size,
  weight,
  align,
  transform,
  underline,
  strikethrough,
  truncate,
  numberOfLines,
  style,
  ...props
}: AppTextProps) {
  const resolvedColor = color
    ? (colors[color as ColorKey] ?? color)
    : undefined;

  let textDecorationLine: TextStyle["textDecorationLine"] = "none";
  if (underline && strikethrough) {
    textDecorationLine = "underline line-through";
  } else if (underline) {
    textDecorationLine = "underline";
  } else if (strikethrough) {
    textDecorationLine = "line-through";
  }

  const customStyle: TextStyle = {
    ...(resolvedColor ? { color: resolvedColor } : {}),
    ...(size ? { fontSize: typography.fontSize[size], lineHeight: typography.lineHeight[size] } : {}),
    ...(weight ? { fontWeight: typography.fontWeight[weight] } : {}),
    ...(align ? { textAlign: align } : {}),
    ...(transform ? { textTransform: transform } : {}),
    ...(textDecorationLine !== "none" ? { textDecorationLine } : {}),
  };

  return (
    <Text
      numberOfLines={truncate ? (numberOfLines ?? 1) : numberOfLines}
      ellipsizeMode={truncate ? "tail" : props.ellipsizeMode}
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