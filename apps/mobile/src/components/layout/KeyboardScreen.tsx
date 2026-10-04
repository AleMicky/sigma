import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";
import { spacing, useAppTheme, type SpacingKey } from "@/theme";

export type KeyboardScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  padding?: SpacingKey;
  withPadding?: boolean;
  keyboardOffset?: number;
  edges?: Edge[];
  statusBarStyle?: StatusBarStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function KeyboardScreen({
  children,
  style,
  contentContainerStyle,
  padding = "lg",
  withPadding = true,
  keyboardOffset = Platform.OS === "ios" ? 10 : 0,
  edges = ["top", "bottom", "left", "right"],
  statusBarStyle,
  refreshing,
  onRefresh,
}: KeyboardScreenProps) {
  const { colors, isDark } = useAppTheme();
  const effectiveStatusBarStyle = statusBarStyle ?? (isDark ? "light" : "dark");

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      <StatusBar style={effectiveStatusBarStyle} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            withPadding && { padding: spacing[padding] },
            contentContainerStyle,
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing ?? false}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});