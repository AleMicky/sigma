import React, { type ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "@/theme";

export type TabRoute = {
  key: string;
  name: string;
  params?: Record<string, unknown>;
};

export type TabDescriptor = {
  options: {
    title?: string;
    tabBarLabel?:
      | string
      | ((props: {
          focused: boolean;
          color: string;
          position: "below-icon" | "beside-icon";
          children: string;
        }) => ReactNode);
    tabBarIcon?: (props: {
      focused: boolean;
      color: string;
      size: number;
    }) => ReactNode;
    tabBarBadge?: string | number;
    tabBarAccessibilityLabel?: string;
    tabBarButtonTestID?: string;
    tabBarItemStyle?: StyleProp<ViewStyle>;
    tabBarLabelStyle?: StyleProp<TextStyle>;
    [key: string]: unknown;
  };
  navigation?: unknown;
  route?: TabRoute;
};

export type BottomTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
    [key: string]: unknown;
  };
  descriptors: Record<string, TabDescriptor>;
  navigation: {
    emit: (options: {
      type: string;
      target?: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: Record<string, unknown>) => void;
    [key: string]: unknown;
  };
};

export type AppTabBarProps = BottomTabBarProps & {
  style?: StyleProp<ViewStyle>;
};


export function AppTabBar({
  state,
  descriptors,
  navigation,
  style,
}: AppTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
        style,
      ]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const descriptor = descriptors[route.key];
        const options = descriptor?.options ?? {};

        const labelText =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const badge = options.tabBarBadge;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const iconColor = focused ? colors.primary : colors.textSecondary;
        const iconSize = 22;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            testID={options.tabBarButtonTestID}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={
              options.tabBarAccessibilityLabel || labelText
            }
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
              options.tabBarItemStyle as ViewStyle,
            ]}
          >
            <View style={styles.iconWrapper}>
              {options.tabBarIcon ? (
                options.tabBarIcon({
                  focused,
                  color: iconColor,
                  size: iconSize,
                })
              ) : (
                <Ionicons
                  name={focused ? "ellipse" : "ellipse-outline"}
                  size={iconSize}
                  color={iconColor}
                />
              )}

              {badge !== undefined && badge !== null && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText} numberOfLines={1}>
                    {typeof badge === "number" && badge > 99 ? "99+" : badge}
                  </Text>
                </View>
              )}
            </View>

            {typeof options.tabBarLabel === "function" ? (
              options.tabBarLabel({
                focused,
                color: iconColor,
                position: "below-icon",
                children: route.name,
              })
            ) : (
              <Text
                style={[
                  styles.label,
                  focused && styles.labelActive,
                  options.tabBarLabelStyle as TextStyle,
                ]}
                numberOfLines={1}
              >
                {labelText}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: spacing.xs + 2,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  itemPressed: {
    opacity: 0.7,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 28,
    minHeight: 24,
  },
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});