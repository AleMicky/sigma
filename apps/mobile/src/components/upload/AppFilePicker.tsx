import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type SelectedFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
};

export type AppFilePickerProps = {
  label?: string;
  required?: boolean;
  value?: SelectedFile | null;
  onChange: (file: SelectedFile | null) => void;
  mimeTypes?: string | string[];
  maxSizeBytes?: number;
  error?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
};

type FileTypeInfo = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  tag: string;
};

function getFileTypeInfo(fileName?: string, mimeType?: string): FileTypeInfo {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";
  const mime = mimeType?.toLowerCase() || "";

  if (ext === "pdf" || mime.includes("pdf")) {
    return {
      icon: "document-text",
      color: colors.danger,
      bgColor: colors.dangerLight,
      tag: "PDF",
    };
  }

  if (["xlsx", "xls", "csv"].includes(ext) || mime.includes("sheet") || mime.includes("excel")) {
    return {
      icon: "grid-outline",
      color: colors.success,
      bgColor: "#DCFCE7",
      tag: ext.toUpperCase() || "XLS",
    };
  }

  if (["doc", "docx"].includes(ext) || mime.includes("word") || mime.includes("officedocument")) {
    return {
      icon: "document-outline",
      color: colors.primary,
      bgColor: colors.primaryLight,
      tag: "DOC",
    };
  }

  if (["zip", "rar", "tar", "gz", "7z"].includes(ext) || mime.includes("zip") || mime.includes("archive")) {
    return {
      icon: "archive-outline",
      color: colors.warning,
      bgColor: "#FEF3C7",
      tag: "ZIP",
    };
  }

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext) || mime.startsWith("image/")) {
    return {
      icon: "image-outline",
      color: "#8B5CF6",
      bgColor: "#EDE9FE",
      tag: "IMG",
    };
  }

  return {
    icon: "document-attach-outline",
    color: colors.textSecondary,
    bgColor: colors.surfaceSecondary,
    tag: ext ? ext.toUpperCase() : "FILE",
  };
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function AppFilePicker({
  label,
  required,
  value,
  onChange,
  mimeTypes = "*/*",
  maxSizeBytes,
  error,
  hint,
  disabled = false,
  clearable = true,
  placeholder = "Seleccionar un archivo...",
}: AppFilePickerProps) {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error || localError;

  const handlePick = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setLocalError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      if (maxSizeBytes && asset.size && asset.size > maxSizeBytes) {
        setLocalError(
          `El archivo excede el tamaño máximo permitido (${formatFileSize(maxSizeBytes)})`
        );
        return;
      }

      onChange({
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
      });
    } catch {
      setLocalError("Ocurrió un error al seleccionar el archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    setLocalError(null);
    onChange(null);
  };

  const fileInfo = value ? getFileTypeInfo(value.name, value.mimeType) : null;

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={value ? `Archivo: ${value.name}` : placeholder}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePick}
        style={({ pressed }) => [
          styles.card,
          value && styles.cardSelected,
          displayError ? styles.cardError : null,
          disabled && styles.cardDisabled,
          pressed && !disabled && styles.cardPressed,
        ]}
      >
        {value && fileInfo ? (
          <View style={styles.selectedContent}>
            <View style={[styles.iconChip, { backgroundColor: fileInfo.bgColor }]}>
              <Ionicons name={fileInfo.icon} size={22} color={fileInfo.color} />
              <Text style={[styles.tagText, { color: fileInfo.color }]}>
                {fileInfo.tag}
              </Text>
            </View>

            <View style={styles.fileDetails}>
              <Text numberOfLines={1} style={styles.fileName}>
                {value.name}
              </Text>
              <Text style={styles.fileMeta}>
                {formatFileSize(value.size)}
                {value.mimeType ? ` • ${value.mimeType.split("/")[1] || value.mimeType}` : ""}
              </Text>
            </View>

            {clearable && !disabled ? (
              <Pressable
                hitSlop={8}
                onPress={handleRemove}
                style={styles.clearButton}
                accessibilityLabel="Eliminar archivo"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons
                  name="cloud-upload-outline"
                  size={24}
                  color={disabled ? colors.textMuted : colors.primary}
                />
              )}
            </View>

            <View style={styles.emptyTextContainer}>
              <Text
                style={[
                  styles.placeholderText,
                  disabled && styles.disabledText,
                ]}
              >
                {loading ? "Cargando archivo..." : placeholder}
              </Text>
              <Text style={styles.subtext}>
                Toca para buscar en tu dispositivo
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </View>
        )}
      </Pressable>

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
  card: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    backgroundColor: colors.surfaceSecondary,
  },
  cardDisabled: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    opacity: 0.6,
  },
  cardError: {
    borderColor: colors.danger,
  },
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  },
  fileDetails: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  fileMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  emptyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  emptyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTextContainer: {
    flex: 1,
    gap: 2,
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  subtext: {
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