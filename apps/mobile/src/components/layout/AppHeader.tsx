import { useRouter } from "expo-router";
import { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { AppIconButton } from "@/components/ui/AppIconButton";
import { spacing, typography, useAppTheme } from "@/theme";

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  bordered?: boolean;
  centerTitle?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  leftAction,
  rightAction,
  bordered = false,
  centerTitle = false,
  style,
  titleStyle,
}: AppHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        bordered && styles.bordered,
        style,
      ]}
    >
      <View style={[styles.left, centerTitle && styles.sideSlot]}>
        {showBack ? (
          <AppIconButton
            icon="arrow-back"
            accessibilityLabel="Volver"
            onPress={handleBack}
          />
        ) : (
          leftAction ?? null
        )}
      </View>

      <View style={[styles.titleContainer, centerTitle && styles.titleCenter]}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.text }, titleStyle]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.right, centerTitle && styles.sideSlot]}>
        {rightAction ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  bordered: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sideSlot: {
    minWidth: 40,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleCenter: {
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    marginTop: 2,
  },
});