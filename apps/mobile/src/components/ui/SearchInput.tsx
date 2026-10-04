import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { radius, spacing, typography, useAppTheme } from "@/theme";

export type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SearchInput({
  value,
  onChangeText,
  onClear,
  placeholder = "Buscar...",
  loading = false,
  style,
}: SearchInputProps) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: isFocused ? colors.primary : colors.borderDark,
          borderWidth: isFocused ? 1.5 : 1,
        },
        style,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={isFocused ? colors.primary : colors.textSecondary}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
      />

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : value ? (
        <Pressable
          hitSlop={8}
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityLabel="Limpiar búsqueda"
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 2,
  },
});