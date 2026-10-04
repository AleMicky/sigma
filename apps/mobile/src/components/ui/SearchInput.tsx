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
import { colors, radius, spacing, typography } from "@/theme";

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
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.focused,
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
        style={styles.input}
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
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 2,
  },
});