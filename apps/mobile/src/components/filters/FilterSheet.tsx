import { type ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import { AppButton } from "@/components/ui/AppButton";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type FilterSectionProps = {
  title: string;
  subtitle?: string;
  onResetSection?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FilterSection({
  title,
  subtitle,
  onResetSection,
  children,
  style,
}: FilterSectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
          ) : null}
        </View>

        {onResetSection ? (
          <Pressable
            hitSlop={8}
            onPress={onResetSection}
            accessibilityRole="button"
            accessibilityLabel={`Restablecer filtro ${title}`}
          >
            <Text style={styles.sectionResetText}>Restablecer</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export type FilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear?: () => void;
  title?: string;
  subtitle?: string;
  activeCount?: number;
  applyLabel?: string;
  clearLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  testID?: string;
};

export function FilterSheet({
  visible,
  onClose,
  onApply,
  onClear,
  title = "Filtros Avanzados",
  subtitle = "Refina los resultados según tus criterios",
  activeCount = 0,
  applyLabel,
  clearLabel = "Limpiar Todo",
  isLoading = false,
  disabled = false,
  children,
  testID,
}: FilterSheetProps) {
  const defaultApplyLabel =
    activeCount > 0 ? `Aplicar (${activeCount})` : "Aplicar Filtros";

  const renderHeaderRight = activeCount > 0 ? (
    <View style={styles.activeBadge}>
      <Text style={styles.activeBadgeText}>
        {activeCount} activo{activeCount > 1 ? "s" : ""}
      </Text>
    </View>
  ) : null;

  return (
    <AppBottomSheet
      testID={testID}
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      headerRight={renderHeaderRight}
      showCloseButton
      scrollable
    >
      <View style={styles.contentContainer}>
        {children}

        {/* Action Footer */}
        <View style={styles.footerActions}>
          {onClear ? (
            <AppButton
              title={clearLabel}
              variant="secondary"
              size="md"
              style={styles.actionBtn}
              disabled={disabled || isLoading || activeCount === 0}
              onPress={onClear}
            />
          ) : null}

          <AppButton
            title={applyLabel || defaultApplyLabel}
            variant="primary"
            size="md"
            style={styles.actionBtn}
            loading={isLoading}
            disabled={disabled}
            onPress={onApply}
          />
        </View>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  activeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  activeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  /* SECTION */
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleContainer: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  sectionResetText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  sectionContent: {
    gap: spacing.xs,
  },

  /* FOOTER */
  footerActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flex: 1,
  },
});