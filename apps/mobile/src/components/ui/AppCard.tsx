import {
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

export function AppCard({
  style,
  ...props
}: ViewProps) {
  return (
    <View
      style={[styles.card, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});