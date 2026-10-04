import { StyleSheet, View, type ViewProps } from "react-native";
import { spacing, type SpacingKey } from "@/theme";

export type ContainerProps = ViewProps & {
  padding?: SpacingKey;
  maxWidth?: number;
  centered?: boolean;
};

export function Container({
  padding = "lg",
  maxWidth,
  centered = false,
  style,
  ...props
}: ContainerProps) {
  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: spacing[padding] },
        maxWidth ? { maxWidth, width: "100%", alignSelf: centered ? "center" : "auto" } : null,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});