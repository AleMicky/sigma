import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
  type CameraType,
  type FlashMode,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, typography, useAppTheme } from "@/theme";
import { AppButton } from "@/components/ui/AppButton";

export type QRScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string, type: string) => void;
  title?: string;
  subtitle?: string;
  barcodeTypes?: BarcodeType[];
};

export function QRScannerModal({
  visible,
  onClose,
  onScan,
  title = "Escanear Código QR / Barras",
  subtitle = "Apunta la cámara al código dentro del recuadro",
  barcodeTypes = ["qr", "ean13", "ean8", "code128", "code39"],
}: QRScannerModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const [facing, setFacing] = useState<CameraType>("back");
  const [torch, setTorch] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);

  // Laser scanning line animation
  const laserY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      laserY.value = 0;
      laserY.value = withRepeat(
        withTiming(210, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [visible]);

  const laserAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserY.value }],
  }));

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    onScan(result.data, result.type);
  };

  const handleSimulateScan = () => {
    if (scanned) return;
    setScanned(true);
    const mockData = `SIGMA-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    onScan(mockData, "qr");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Cámara o Estado de Permiso */}
        {!permission?.granted ? (
          <View style={[styles.permissionContainer, { paddingTop: insets.top + spacing.xl }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="camera" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.permTitle, { color: colors.white }]}>
              Se requiere acceso a la cámara
            </Text>
            <Text style={styles.permDesc}>
              Para escanear códigos QR y códigos de barra de documentos o inventario.
            </Text>
            <View style={styles.permBtnRow}>
              <AppButton
                title="Permitir Cámara"
                variant="primary"
                onPress={requestPermission}
              />
              <AppButton
                title="Simular Escaneo (Test)"
                variant="outline"
                onPress={handleSimulateScan}
              />
              <AppButton
                title="Cancelar"
                variant="ghost"
                onPress={onClose}
              />
            </View>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing={facing}
            enableTorch={torch}
            barcodeScannerSettings={{
              barcodeTypes,
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        )}

        {/* Overlay Superior con Botón de Cierre y Título */}
        <View
          style={[
            styles.headerOverlay,
            {
              paddingTop: insets.top + spacing.sm,
              paddingBottom: spacing.md,
            },
          ]}
        >
          <Pressable
            style={styles.actionCircleBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar escáner"
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </Pressable>

          <View style={styles.headerTitleCenter}>
            <Text style={styles.headerTitleText}>{title}</Text>
            <Text style={styles.headerSubtitleText}>{subtitle}</Text>
          </View>

          <Pressable
            style={[styles.actionCircleBtn, torch && styles.actionCircleBtnActive]}
            onPress={() => setTorch((t) => !t)}
            accessibilityRole="button"
            accessibilityLabel="Alternar linterna"
          >
            <Ionicons
              name={torch ? "flash" : "flash-off-outline"}
              size={20}
              color={colors.white}
            />
          </Pressable>
        </View>

        {/* Marco Central de Escaneo (Viewfinder) */}
        {permission?.granted ? (
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinderBox}>
              {/* Esquinas del visor */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {/* Láser escaneador */}
              <Animated.View style={[styles.laserLine, laserAnimatedStyle]} />
            </View>
          </View>
        ) : null}

        {/* Overlay Inferior con Controles */}
        <View
          style={[
            styles.footerOverlay,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={styles.footerRow}>
            <Pressable
              style={styles.footerControlBtn}
              onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
            >
              <Ionicons name="camera-reverse-outline" size={24} color={colors.white} />
              <Text style={styles.footerControlText}>Girar</Text>
            </Pressable>

            {/* Botón Simular para pruebas rápidas */}
            <Pressable
              style={[styles.simulateBtn, { backgroundColor: colors.primary }]}
              onPress={handleSimulateScan}
            >
              <Ionicons name="qr-code-outline" size={22} color={colors.white} />
              <Text style={styles.simulateBtnText}>Simular Escaneo</Text>
            </Pressable>

            {scanned ? (
              <Pressable
                style={styles.footerControlBtn}
                onPress={() => setScanned(false)}
              >
                <Ionicons name="refresh" size={24} color={colors.white} />
                <Text style={styles.footerControlText}>Reintentar</Text>
              </Pressable>
            ) : (
              <View style={{ width: 60 }} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    position: "relative",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  permTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  permDesc: {
    fontSize: typography.fontSize.sm,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  permBtnRow: {
    width: "100%",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCircleBtnActive: {
    backgroundColor: "#F59E0B",
  },
  headerTitleCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  headerTitleText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  headerSubtitleText: {
    color: "#D1D5DB",
    fontSize: typography.fontSize.xs,
    textAlign: "center",
    marginTop: 2,
  },
  viewfinderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinderBox: {
    width: 240,
    height: 240,
    position: "relative",
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#3B82F6",
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  laserLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 2,
  },
  footerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  footerControlBtn: {
    alignItems: "center",
    gap: 4,
    padding: spacing.xs,
    minWidth: 60,
  },
  footerControlText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  simulateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    elevation: 3,
  },
  simulateBtnText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
