import { type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { radius, shadows, spacing, typography, useAppTheme } from "@/theme";

export type AppBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  scrollable?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export function AppBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  headerRight,
  showHandle = true,
  showCloseButton = false,
  closeOnBackdrop = true,
  scrollable = false,
  sheetStyle,
  testID,
}: AppBottomSheetProps) {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {closeOnBackdrop ? (
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar hoja inferior"
          />
        ) : null}

        <View
          testID={testID}
          style={[
            styles.sheet,
            { backgroundColor: colors.background },
            sheetStyle,
          ]}
        >
          {showHandle ? (
            <View
              style={[styles.handle, { backgroundColor: colors.borderDark }]}
            />
          ) : null}

          {title || subtitle || showCloseButton || headerRight ? (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {title ? (
                  <Text
                    style={[styles.title, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {title}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text
                    style={[styles.subtitle, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <View style={styles.headerActions}>
                {headerRight}

                {showCloseButton ? (
                  <Pressable
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar"
                    style={({ pressed }) => [
                      styles.closeButton,
                      { backgroundColor: colors.surfaceSecondary },
                      pressed && styles.closeButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {scrollable ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.body}>{children}</View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    maxHeight: "85%",
    ...shadows.lg,
  },
  handle: {
    width: 44,
    height: 5,
    alignSelf: "center",
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  body: {
    gap: spacing.sm,
  },
  scrollContent: {
    gap: spacing.sm,
  },
});