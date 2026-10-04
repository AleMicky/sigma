import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SigmaLogo } from "@/components/ui/SigmaLogo";
import { spacing } from "@/theme";

const LOGO_ENDE_DARK = require("../../../assets/logo-ende-corani-dark.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type AppSplashScreenProps = {
  /** Mensaje de carga descriptivo */
  statusMessage?: string;
};

export function AppSplashScreen({
  statusMessage = "Iniciando sistema...",
}: AppSplashScreenProps) {
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrada suave (Fade in + Scale up)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Respiración continua del logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 3. Barra de carga infinita / indeterminada
    const progressLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    progressLoop.start();

    return () => {
      pulseLoop.stop();
      progressLoop.stop();
    };
  }, [fadeAnim, scaleAnim, pulseAnim, progressAnim]);

  const progressBarTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-70, 70],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Iluminación ambiental de fondo (Glow radial sutil) */}
      <View style={styles.ambientGlow} />

      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Contenedor del Logo con Halo Pulso */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.haloRingOuter} />
          <View style={styles.haloRingInner} />
          <SigmaLogo size={88} />
        </Animated.View>

        {/* Tipografía Corporativa */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>SIGMA</Text>

          <View style={styles.tagPill}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>SISTEMA INTEGRADO DE GESTIÓN</Text>
          </View>

          <Text style={styles.brandSubtitle}>Operaciones & Mantenimiento</Text>
        </View>
      </Animated.View>

      {/* Pie de pantalla: Barra de progreso moderna + Logo Institucional */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        {/* Barra de progreso indeterminada estilizada */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                transform: [{ translateX: progressBarTranslateX }],
              },
            ]}
          />
        </View>

        <Text style={styles.statusText}>{statusMessage}</Text>

        {/* Separador sutil */}
        <View style={styles.footerDivider} />

        {/* Logo Institucional ENDE CORANI */}
        <View style={styles.institutionWrapper}>
          <Image
            source={LOGO_ENDE_DARK}
            style={styles.institutionLogo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060A13", // Deep Carbon Navy ultra oscuro y elegante
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xxl * 1.5,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  ambientGlow: {
    position: "absolute",
    top: "22%",
    width: Math.min(SCREEN_WIDTH * 0.9, 360),
    height: Math.min(SCREEN_WIDTH * 0.9, 360),
    borderRadius: 999,
    backgroundColor: "rgba(30, 58, 138, 0.14)",
    alignSelf: "center",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  haloRingOuter: {
    position: "absolute",
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.15)",
    backgroundColor: "rgba(37, 99, 235, 0.05)",
  },
  haloRingInner: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.25)",
  },
  brandContainer: {
    alignItems: "center",
    gap: 8,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 5,
    textAlign: "center",
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(30, 41, 59, 0.75)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.6)",
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  tagText: {
    color: "#E2E8F0",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  footer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    width: 140,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    overflow: "hidden",
  },
  progressBar: {
    width: 60,
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  statusText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(51, 65, 85, 0.4)",
    marginVertical: 4,
  },
  institutionWrapper: {
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.85,
  },
  institutionLogo: {
    width: 140,
    height: 40,
  },
});
