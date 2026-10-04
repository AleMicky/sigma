import { memo, type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { typography, useAppTheme } from "@/theme";

export type ProgressRingProps = {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientColors?: [string, string];
  trackColor?: string;
  showPercentage?: boolean;
  label?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function ProgressRingComponent({
  progress = 0,
  size = 120,
  strokeWidth = 12,
  color,
  gradientColors,
  trackColor,
  showPercentage = true,
  label,
  children,
  style,
}: ProgressRingProps) {
  const { colors, isDark } = useAppTheme();

  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  const defaultTrack =
    trackColor || (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)");
  const primaryColor = color || colors.primary;
  const gradStart = gradientColors ? gradientColors[0] : primaryColor;
  const gradEnd = gradientColors
    ? gradientColors[1]
    : isDark
    ? colors.primaryDark
    : colors.primary;

  const gradientId = `progress-grad-${size}-${strokeWidth}`;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradStart} />
            <Stop offset="100%" stopColor={gradEnd} />
          </LinearGradient>
        </Defs>

        {/* Círculo de fondo (Track) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={defaultTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Círculo de Progreso Activo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Contenido Central */}
      <View style={styles.contentContainer}>
        {children ? (
          children
        ) : (
          <>
            {showPercentage ? (
              <Text style={[styles.percentageText, { color: colors.text }]}>
                {Math.round(clampedProgress)}%
              </Text>
            ) : null}
            {label ? (
              <Text
                style={[styles.labelText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  percentageText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
    fontWeight: typography.fontWeight.medium,
  },
});

export const ProgressRing = memo(ProgressRingComponent);
