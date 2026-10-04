import { Ionicons } from "@expo/vector-icons";
import {
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

export type UploadStatus = "uploading" | "success" | "error" | "paused";

export type UploadProgressProps = {
  progress: number; // 0 to 100
  status?: UploadStatus;
  label?: string;
  fileName?: string;
  fileSize?: number;
  speedText?: string;
  errorMessage?: string;
  variant?: "card" | "inline";
  onCancel?: () => void;
  onRetry?: () => void;
  onTogglePause?: () => void;
};

export function UploadProgress({
  progress,
  status = "uploading",
  label = "Subiendo archivo",
  fileName,
  fileSize,
  speedText,
  errorMessage,
  variant = "card",
  onCancel,
  onRetry,
  onTogglePause,
}: UploadProgressProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  const isSuccess = status === "success" || (normalizedProgress >= 100 && status !== "error");
  const isError = status === "error";
  const isPaused = status === "paused";

  const getStatusColor = () => {
    if (isError) return colors.danger;
    if (isSuccess) return colors.success;
    if (isPaused) return colors.warning;
    return colors.primary;
  };

  const getStatusBgColor = () => {
    if (isError) return colors.dangerLight;
    if (isSuccess) return "#DCFCE7";
    if (isPaused) return "#FEF3C7";
    return colors.primaryLight;
  };

  const statusColor = getStatusColor();
  const statusBgColor = getStatusBgColor();

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    if (isError) return "alert-circle";
    if (isSuccess) return "checkmark-circle";
    if (isPaused) return "pause-circle";
    return "cloud-upload";
  };

  const getStatusLabel = () => {
    if (isError) return errorMessage || "Error al subir archivo";
    if (isSuccess) return "Carga completada";
    if (isPaused) return "Carga en pausa";
    return label;
  };

  if (variant === "inline") {
    return (
      <View style={styles.inlineContainer}>
        <View style={styles.inlineHeader}>
          <Text numberOfLines={1} style={styles.inlineLabel}>
            {fileName || getStatusLabel()}
          </Text>
          <Text style={[styles.inlinePercentage, { color: statusColor }]}>
            {isError ? "Error" : `${Math.round(normalizedProgress)}%`}
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${normalizedProgress}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, isError && styles.cardError, isSuccess && styles.cardSuccess]}>
      <View style={styles.header}>
        <View style={[styles.statusIconCircle, { backgroundColor: statusBgColor }]}>
          <Ionicons name={getStatusIcon()} size={20} color={statusColor} />
        </View>

        <View style={styles.fileInfo}>
          <Text numberOfLines={1} style={styles.fileName}>
            {fileName || getStatusLabel()}
          </Text>
          <Text style={styles.metaText}>
            {isError
              ? errorMessage || "Reintenta la operación"
              : isSuccess
                ? `${formatFileSize(fileSize)} • Completado`
                : `${Math.round(normalizedProgress)}% de ${formatFileSize(fileSize)}${speedText ? ` • ${speedText}` : ""}`}
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.actions}>
          {isPaused && onTogglePause ? (
            <Pressable
              hitSlop={6}
              onPress={onTogglePause}
              style={styles.actionIconBtn}
              accessibilityLabel="Reanudar subida"
            >
              <Ionicons name="play" size={18} color={colors.primary} />
            </Pressable>
          ) : !isSuccess && !isError && onTogglePause ? (
            <Pressable
              hitSlop={6}
              onPress={onTogglePause}
              style={styles.actionIconBtn}
              accessibilityLabel="Pausar subida"
            >
              <Ionicons name="pause" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}

          {isError && onRetry ? (
            <Pressable
              hitSlop={6}
              onPress={onRetry}
              style={styles.actionIconBtn}
              accessibilityLabel="Reintentar subida"
            >
              <Ionicons name="reload" size={18} color={colors.primary} />
            </Pressable>
          ) : null}

          {onCancel && !isSuccess ? (
            <Pressable
              hitSlop={6}
              onPress={onCancel}
              style={styles.actionIconBtn}
              accessibilityLabel="Cancelar subida"
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${normalizedProgress}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  cardError: {
    borderColor: colors.danger,
    backgroundColor: "#FEF2F2",
  },
  cardSuccess: {
    borderColor: colors.success,
    backgroundColor: "#F0FDF4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  track: {
    height: 6,
    overflow: "hidden",
    borderRadius: radius.full,
    backgroundColor: colors.border,
    width: "100%",
  },
  progressBar: {
    height: "100%",
    borderRadius: radius.full,
  },

  /* INLINE STYLES */
  inlineContainer: {
    gap: spacing.xs,
    width: "100%",
  },
  inlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inlineLabel: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  inlinePercentage: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});