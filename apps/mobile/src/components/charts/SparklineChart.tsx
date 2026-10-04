import { memo, useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { typography, useAppTheme } from "@/theme";

export type SparklineChartProps = {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showGradient?: boolean;
  showEndDot?: boolean;
  showBadge?: boolean;
  title?: string;
  style?: StyleProp<ViewStyle>;
  formatValue?: (v: number) => string;
};

function SparklineChartComponent({
  data,
  width = 240,
  height = 70,
  strokeColor,
  strokeWidth = 2.5,
  showGradient = true,
  showEndDot = true,
  showBadge = true,
  title,
  style,
  formatValue = (v) => v.toLocaleString(),
}: SparklineChartProps) {
  const { colors, isDark } = useAppTheme();

  const chartData = data.length > 1 ? data : [0, 0];
  const minVal = Math.min(...chartData);
  const maxVal = Math.max(...chartData);
  const range = maxVal - minVal || 1;

  const paddingY = 8;
  const usableHeight = height - paddingY * 2;

  // Calculate points
  const points = useMemo(() => {
    const step = width / (chartData.length - 1);
    return chartData.map((val, idx) => {
      const x = idx * step;
      const y = height - paddingY - ((val - minVal) / range) * usableHeight;
      return { x, y, val };
    });
  }, [chartData, width, height, minVal, range, usableHeight]);

  // Construct SVG Path (Line and Fill Area)
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: "", areaPath: "" };

    let lPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Smooth cubic curve control points
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      lPath += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const aPath = `${lPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    return { linePath: lPath, areaPath: aPath };
  }, [points, height]);

  // Delta calculation (first vs last)
  const firstVal = chartData[0];
  const lastVal = chartData[chartData.length - 1];
  const isPositive = lastVal >= firstVal;
  const percentageChange = firstVal !== 0 ? (((lastVal - firstVal) / firstVal) * 100).toFixed(1) : "0.0";

  const mainColor =
    strokeColor || (isPositive ? colors.success : colors.danger);
  const gradientId = `sparkline-grad-${width}-${height}`;
  const lastPoint = points[points.length - 1];

  return (
    <View style={[styles.container, style]}>
      {title || showBadge ? (
        <View style={styles.header}>
          {title ? (
            <Text style={[styles.title, { color: colors.textSecondary }]}>
              {title}
            </Text>
          ) : <View />}

          {showBadge ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isPositive
                    ? isDark
                      ? "rgba(34, 197, 94, 0.2)"
                      : "#DCFCE7"
                    : isDark
                    ? "rgba(239, 68, 68, 0.2)"
                    : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isPositive ? colors.success : colors.danger },
                ]}
              >
                {isPositive ? "↑ +" : "↓ "}{percentageChange}%
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ width, height, position: "relative" }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={mainColor} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={mainColor} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Area Fill */}
          {showGradient ? (
            <Path d={areaPath} fill={`url(#${gradientId})`} />
          ) : null}

          {/* Line Stroke */}
          <Path
            d={linePath}
            stroke={mainColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dot on Last Point */}
          {showEndDot && lastPoint ? (
            <>
              <Circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={5}
                fill={mainColor}
              />
              <Circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={2}
                fill={colors.white}
              />
            </>
          ) : null}
        </Svg>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.currentValue, { color: colors.text }]}>
          {formatValue(lastVal)}
        </Text>
        <Text style={[styles.rangeText, { color: colors.textMuted }]}>
          Min: {formatValue(minVal)} • Max: {formatValue(maxVal)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 4,
  },
  currentValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  rangeText: {
    fontSize: 10,
  },
});

export const SparklineChart = memo(SparklineChartComponent);
