import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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

export type ModalSize = "sm" | "md" | "lg" | "fullscreen";

export type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  headerRight?: ReactNode;
  size?: ModalSize;
  scrollable?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export function AppModal({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  headerRight,
  size = "md",
  scrollable = false,
  closeOnBackdrop = true,
  showCloseButton = true,
  contentStyle,
  testID,
}: AppModalProps) {
  const { colors } = useAppTheme();
  const isFullscreen = size === "fullscreen";

  const renderContent = () => (
    <View
      testID={testID}
      style={[
        styles.content,
        { backgroundColor: colors.background },
        sizeStyles[size],
        isFullscreen && styles.fullscreenContent,
        contentStyle,
      ]}
    >
      {/* Header */}
      {title || subtitle || icon || showCloseButton || headerRight ? (
        <View style={styles.header}>
          {icon ? <View style={styles.headerIcon}>{icon}</View> : null}

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
                accessibilityLabel="Cerrar modal"
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: colors.surfaceSecondary },
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Body */}
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

      {/* Footer */}
      {footer ? (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {footer}
        </View>
      ) : null}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isFullscreen ? "slide" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        {closeOnBackdrop && !isFullscreen ? (
          <Pressable style={styles.backdrop} onPress={onClose} />
        ) : null}

        {renderContent()}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const sizeStyles = StyleSheet.create({
  sm: {
    maxWidth: 340,
  },
  md: {
    maxWidth: 440,
  },
  lg: {
    maxWidth: 560,
  },
  fullscreen: {
    maxWidth: "100%",
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    width: "100%",
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.lg,
  },
  fullscreenContent: {
    flex: 1,
    borderRadius: 0,
    paddingTop: spacing.xxl,
    margin: -spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerIcon: {
    marginRight: spacing.xs,
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
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
});