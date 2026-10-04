import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type ImagePreviewProps = {
  visible: boolean;
  uri?: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  testID?: string;
};

export function ImagePreview({
  visible,
  uri,
  title = "Vista previa",
  subtitle,
  onClose,
  onShare,
  onDownload,
  onDelete,
  testID,
}: ImagePreviewProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const insets = useSafeAreaInsets();

  if (!uri) {
    return null;
  }

  return (
    <Modal
      testID={testID}
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, spacing.md),
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        {/* Header Bar */}
        <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <Pressable
              hitSlop={12}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar visor de imagen"
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </Pressable>
          </View>

          {/* Image Display */}
          <View style={styles.imageContainer}>
            {imageLoading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.white} />
              </View>
            ) : null}

            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {onShare ? (
              <Pressable
                onPress={onShare}
                accessibilityRole="button"
                accessibilityLabel="Compartir imagen"
                style={styles.footerActionBtn}
              >
                <Ionicons name="share-outline" size={22} color={colors.white} />
                <Text style={styles.footerActionText}>Compartir</Text>
              </Pressable>
            ) : null}

            {onDownload ? (
              <Pressable
                onPress={onDownload}
                accessibilityRole="button"
                accessibilityLabel="Descargar imagen"
                style={styles.footerActionBtn}
              >
                <Ionicons name="download-outline" size={22} color={colors.white} />
                <Text style={styles.footerActionText}>Guardar</Text>
              </Pressable>
            ) : null}

            {onDelete ? (
              <Pressable
                onPress={onDelete}
                accessibilityRole="button"
                accessibilityLabel="Eliminar imagen"
                style={styles.footerActionBtn}
              >
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
                <Text style={[styles.footerActionText, { color: colors.danger }]}>
                  Eliminar
                </Text>
              </Pressable>
            ) : null}
          </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.94)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 2,
  },
  headerTitleContainer: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  footerActionBtn: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  footerActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});