import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { formatFileSize } from "./AppFilePicker";

export type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number;
  width?: number;
  height?: number;
};

export type AppImagePickerProps = {
  label?: string;
  required?: boolean;
  value?: SelectedImage | null;
  onChange: (image: SelectedImage | null) => void;
  variant?: "card" | "avatar" | "compact";
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxSizeBytes?: number;
  error?: string;
  hint?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function AppImagePicker({
  label,
  required,
  value,
  onChange,
  variant = "card",
  allowsEditing = true,
  aspect,
  quality = 0.8,
  maxSizeBytes,
  error,
  hint,
  disabled = false,
  placeholder = "Seleccionar imagen",
}: AppImagePickerProps) {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error || localError;

  const handleAsset = (asset: ImagePicker.ImagePickerAsset) => {
    if (maxSizeBytes && asset.fileSize && asset.fileSize > maxSizeBytes) {
      setLocalError(
        `La imagen supera el tamaño máximo (${formatFileSize(maxSizeBytes)})`
      );
      return;
    }

    setLocalError(null);
    onChange({
      uri: asset.uri,
      fileName: asset.fileName ?? `img_${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    });
  };

  const openGallery = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setLocalError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      handleAsset(result.assets[0]);
    } catch {
      setLocalError("No se pudo acceder a la galería.");
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setLocalError(null);

      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permiso requerido",
          "Se requiere permiso para usar la cámara y tomar fotografías."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      handleAsset(result.assets[0]);
    } catch {
      setLocalError("No se pudo capturar la imagen con la cámara.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    setLocalError(null);
    onChange(null);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </View>
      ) : null}

      {/* AVATAR VARIANT */}
      {variant === "avatar" ? (
        <View style={styles.avatarWrapper}>
          <View
            style={[
              styles.avatarContainer,
              displayError && styles.borderError,
              disabled && styles.disabledContainer,
            ]}
          >
            {value?.uri ? (
              <Image source={{ uri: value.uri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons
                  name="person-outline"
                  size={44}
                  color={disabled ? colors.textMuted : colors.textSecondary}
                />
              </View>
            )}

            {loading ? (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            ) : null}
          </View>

          <View style={styles.avatarActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tomar foto con la cámara"
              disabled={disabled || loading}
              onPress={openCamera}
              style={({ pressed }) => [
                styles.avatarActionBtn,
                pressed && styles.btnPressed,
                disabled && styles.btnDisabled,
              ]}
            >
              <Ionicons name="camera" size={16} color={colors.primary} />
              <Text style={styles.avatarActionText}>Cámara</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Elegir foto de la galería"
              disabled={disabled || loading}
              onPress={openGallery}
              style={({ pressed }) => [
                styles.avatarActionBtn,
                pressed && styles.btnPressed,
                disabled && styles.btnDisabled,
              ]}
            >
              <Ionicons name="images" size={16} color={colors.primary} />
              <Text style={styles.avatarActionText}>Galería</Text>
            </Pressable>

            {value ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Eliminar avatar"
                disabled={disabled || loading}
                onPress={handleRemove}
                style={({ pressed }) => [
                  styles.avatarRemoveBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        /* CARD & COMPACT VARIANT */
        <View style={styles.cardWrapper}>
          {value?.uri ? (
            <View
              style={[
                styles.previewCard,
                displayError && styles.borderError,
                disabled && styles.disabledContainer,
              ]}
            >
              <Image
                source={{ uri: value.uri }}
                style={variant === "compact" ? styles.compactImage : styles.cardImage}
                resizeMode="cover"
              />

              {/* Top overlay buttons */}
              <View style={styles.cardHeaderOverlay}>
                {value.fileSize || (value.width && value.height) ? (
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>
                      {value.width && value.height ? `${value.width}×${value.height}` : ""}
                      {value.fileSize ? ` • ${formatFileSize(value.fileSize)}` : ""}
                    </Text>
                  </View>
                ) : <View />}

                {!disabled ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar imagen seleccionada"
                    onPress={handleRemove}
                    style={styles.floatingRemoveBtn}
                  >
                    <Ionicons name="close" size={18} color={colors.white} />
                  </Pressable>
                ) : null}
              </View>

              {/* Bottom replace toolbar */}
              {!disabled ? (
                <View style={styles.replaceToolbar}>
                  <Pressable
                    onPress={openCamera}
                    disabled={loading}
                    style={styles.replaceBtn}
                  >
                    <Ionicons name="camera-outline" size={16} color={colors.text} />
                    <Text style={styles.replaceBtnText}>Cambiar (Cámara)</Text>
                  </Pressable>

                  <View style={styles.replaceDivider} />

                  <Pressable
                    onPress={openGallery}
                    disabled={loading}
                    style={styles.replaceBtn}
                  >
                    <Ionicons name="images-outline" size={16} color={colors.text} />
                    <Text style={styles.replaceBtnText}>Galería</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : (
            /* Empty state upload box */
            <View
              style={[
                styles.emptyBox,
                displayError && styles.borderError,
                disabled && styles.disabledContainer,
              ]}
            >
              {loading ? (
                <View style={styles.loadingCenter}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Procesando imagen...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons
                      name="image-outline"
                      size={28}
                      color={disabled ? colors.textMuted : colors.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.placeholderText,
                      disabled && styles.disabledText,
                    ]}
                  >
                    {placeholder}
                  </Text>
                  <Text style={styles.formatHint}>
                    JPG, PNG o WEBP • Calidad optimizada
                  </Text>

                  <View style={styles.actionRow}>
                    <Pressable
                      disabled={disabled}
                      onPress={openCamera}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.cameraBtn,
                        pressed && styles.btnPressed,
                        disabled && styles.btnDisabled,
                      ]}
                    >
                      <Ionicons name="camera-outline" size={18} color={colors.white} />
                      <Text style={styles.cameraBtnText}>Cámara</Text>
                    </Pressable>

                    <Pressable
                      disabled={disabled}
                      onPress={openGallery}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.galleryBtn,
                        pressed && styles.btnPressed,
                        disabled && styles.btnDisabled,
                      ]}
                    >
                      <Ionicons
                        name="images-outline"
                        size={18}
                        color={colors.primary}
                      />
                      <Text style={styles.galleryBtnText}>Galería</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      )}

      {displayError ? (
        <Text style={styles.errorText}>{displayError}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: typography.fontWeight.bold,
  },
  borderError: {
    borderColor: colors.danger + " !important",
  },
  disabledContainer: {
    opacity: 0.6,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnDisabled: {
    opacity: 0.5,
  },

  /* AVATAR STYLES */
  avatarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderDark,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
    flex: 1,
  },
  avatarActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  avatarRemoveBtn: {
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
  },

  /* CARD & COMPACT STYLES */
  cardWrapper: {
    width: "100%",
  },
  previewCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderDark,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  cardImage: {
    width: "100%",
    height: 190,
    backgroundColor: colors.surfaceSecondary,
  },
  compactImage: {
    width: "100%",
    height: 120,
    backgroundColor: colors.surfaceSecondary,
  },
  cardHeaderOverlay: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  metaBadgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  floatingRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  replaceToolbar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  replaceBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
  },
  replaceBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  replaceDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },

  /* EMPTY STATE STYLES */
  emptyBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  formatHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  cameraBtn: {
    backgroundColor: colors.primary,
  },
  cameraBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  galleryBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  galleryBtnText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingCenter: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  disabledText: {
    color: colors.textMuted,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.danger,
  },
  hintText: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
});