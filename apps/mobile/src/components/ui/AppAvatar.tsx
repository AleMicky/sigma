import { useState } from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius } from "@/theme";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

const sizeMap = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
};

export type AppAvatarProps = {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppAvatar({
  uri,
  name = "",
  size = "md",
  online,
  style,
}: AppAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimension = typeof size === "number" ? size : sizeMap[size];

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      {uri && !imageError ? (
        <Image
          source={{ uri }}
          onError={() => setImageError(true)}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: dimension * 0.38 }]}>
            {initials}
          </Text>
        </View>
      )}

      {online !== undefined ? (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: online ? colors.success : colors.textMuted,
              width: Math.max(8, dimension * 0.25),
              height: Math.max(8, dimension * 0.25),
              borderRadius: dimension * 0.125,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceSecondary,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.white,
  },
});