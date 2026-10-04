import { Ionicons } from "@expo/vector-icons";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { colors, spacing, typography } from "@/theme";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  disabled = false,
  style,
}: PaginationProps) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <View style={[styles.container, style]}>
      <AppButton
        title="Anterior"
        size="sm"
        variant="outline"
        disabled={disabled || isFirstPage}
        leftIcon={
          <Ionicons
            name="chevron-back"
            size={16}
            color={isFirstPage ? colors.textMuted : colors.text}
          />
        }
        onPress={onPrevious}
      />

      <View style={styles.indicator}>
        <Text style={styles.text}>
          <Text style={styles.pageHighlight}>{page}</Text> de{" "}
          {Math.max(1, totalPages)}
        </Text>
      </View>

      <AppButton
        title="Siguiente"
        size="sm"
        variant="outline"
        disabled={disabled || isLastPage}
        rightIcon={
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isLastPage ? colors.textMuted : colors.text}
          />
        }
        onPress={onNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  indicator: {
    paddingHorizontal: spacing.sm,
  },
  text: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  pageHighlight: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
});