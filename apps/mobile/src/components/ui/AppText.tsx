import {
  StyleSheet,
  Text,
  type TextProps,
} from "react-native";

type AppTextProps = TextProps & {
  variant?: "title" | "subtitle" | "body" | "caption";
};

export function AppText({
  variant = "body",
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[styles[variant], style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  body: {
    fontSize: 16,
    color: "#374151",
  },
  caption: {
    fontSize: 13,
    color: "#6B7280",
  },
});