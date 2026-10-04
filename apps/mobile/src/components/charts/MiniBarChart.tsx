import { memo, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { radius, spacing, typography, useAppTheme } from "@/theme";

export type BarDataPoint = {
  id?: string;
  label: string;
  value: number;
  color?: string;
  formattedValue?: string;
};

export type MiniBarChartProps = {
  data: BarDataPoint[];
  height?: number;
  barWidth?: number;
  barRadius?: number;
  showValues?: boolean;
  benchmarkValue?: number;
  benchmarkLabel?: string;
  onSelectBar?: (item: BarDataPoint, index: number) => void;
  style?: StyleProp<ViewStyle>;
  formatValue?: (val: number) => string;
};

function MiniBarChartComponent({
  data,
  height = 160,
  barWidth = 28,
  barRadius = 6,
  showValues = true,
  benchmarkValue,
  benchmarkLabel,
  onSelectBar,
  style,
  formatValue = (v) => v.toLocaleString(),
}: MiniBarChartProps) {
  const { colors, isDark } = useAppTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), benchmarkValue ?? 0, 1);

  const benchmarkY =
    benchmarkValue !== undefined
      ? height - (benchmarkValue / maxValue) * (height - 36)
      : null;

  return (
    <View style={[styles.container, style]}>
      {/* Benchmark Line (Línea de Meta/Objetivo) */}
      {benchmarkY !== null ? (
        <View
          style={[
            styles.benchmarkLineContainer,
            { top: benchmarkY },
          ]}
        >
          <View style={[styles.benchmarkLine, { borderColor: colors.warning }]} />
          {benchmarkLabel ? (
            <Text style={[styles.benchmarkText, { color: colors.warning }]}>
              {benchmarkLabel}: {formatValue(benchmarkValue!)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Grid de Barras */}
      <View style={[styles.barsArea, { height }]}>
        {data.map((item, index) => {
          const isSelected = selectedIndex === index;
          const barHeight = Math.max(
            8,
            (item.value / maxValue) * (height - 40)
          );
          const barColor =
            item.color ||
            (isSelected
              ? colors.primary
              : isDark
              ? colors.primaryLight
              : colors.primaryDark);

          return (
            <Pressable
              key={item.id ?? `bar-${index}`}
              onPress={() => {
                setSelectedIndex(index);
                onSelectBar?.(item, index);
              }}
              style={styles.barColumn}
            >
              {/* Valor superior */}
              {showValues ? (
                <Text
                  style={[
                    styles.valueText,
                    {
                      color: isSelected
                        ? colors.primary
                        : colors.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.formattedValue ?? formatValue(item.value)}
                </Text>
              ) : null}

              {/* Barra Animada */}
              <View
                style={[
                  styles.barTrack,
                  {
                    height: height - 40,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                    borderRadius: barRadius,
                  },
                ]}
              >
                <Animated.View
                  entering={FadeInDown.delay(index * 60).duration(400).springify()}
                  style={{ width: "100%", alignItems: "center" }}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: isSelected ? colors.primary : barColor,
                        borderRadius: barRadius,
                        opacity: selectedIndex === null || isSelected ? 1 : 0.45,
                      },
                    ]}
                  />
                </Animated.View>
              </View>

              {/* Etiqueta X */}
              <Text
                style={[
                  styles.labelText,
                  {
                    color: isSelected ? colors.text : colors.textMuted,
                    fontWeight: isSelected ? "700" : "500",
                  },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  barsArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  barTrack: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
  },
  valueText: {
    fontSize: 10,
    lineHeight: 12,
  },
  labelText: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  benchmarkLineContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  benchmarkLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: "dashed",
  },
  benchmarkText: {
    fontSize: 9,
    fontWeight: "700",
    paddingHorizontal: 4,
    backgroundColor: "transparent",
  },
});

export const MiniBarChart = memo(MiniBarChartComponent);
