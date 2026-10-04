import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { PulseView } from "@/components/animation/PulseView";

export type SigmaLogoProps = {
  /** Tamaño en píxeles (ancho y alto) */
  size?: number;
  /** Si debe tener una animación sutil de pulso/respiración */
  animated?: boolean;
  /** Radio de curvatura del contenedor (por defecto 22% del tamaño) */
  borderRadius?: number;
  /** Color inicial del gradiente de fondo */
  startColor?: string;
  /** Color final del gradiente de fondo */
  endColor?: string;
  /** Color del trazo del símbolo Sigma */
  strokeColor?: string;
  /** Color del punto de estado activo */
  dotColor?: string;
  /** Estilo adicional para el contenedor */
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function SigmaLogo({
  size = 64,
  animated = false,
  borderRadius,
  startColor = "#0F172A",
  endColor = "#1E3A8A",
  strokeColor = "#FFFFFF",
  dotColor = "#22C55E",
  style,
  testID,
}: SigmaLogoProps) {
  const rx = borderRadius ?? Math.round(size * 0.22);
  const gradientId = `sigma-bg-${Math.round(size)}-${startColor.replace("#", "")}`;

  const svgElement = (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      testID={testID}
      style={style}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={startColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={endColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Fondo con bordes redondeados y gradiente */}
      <Rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx={rx > 0 ? 14 : 0}
        fill={`url(#${gradientId})`}
      />

      {/* Símbolo Sigma (\Sigma) */}
      <Path
        d="M45 16H20.5L31 31.5 19 48h27"
        fill="none"
        stroke={strokeColor}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Punto de estado activo (LED verde) */}
      <Circle cx="49" cy="49" r="4" fill={dotColor} />
    </Svg>
  );

  if (animated) {
    return (
      <PulseView active type="scale" duration={1500}>
        <View style={style}>{svgElement}</View>
      </PulseView>
    );
  }

  return <View style={style}>{svgElement}</View>;
}
