import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type AttachmentStatus = "ready" | "uploading" | "error";

export type AttachmentItemProps = {
  name: string;
  size?: number | string;
  mimeType?: string;
  status?: AttachmentStatus;
  date?: string;
  onPress?: () => void;
  onDownload?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type FileTypeBadge = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  tag: string;
};

function getFileBadge(name: string, mime?: string): FileTypeBadge {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const m = mime?.toLowerCase() || "";

  if (ext === "pdf" || m.includes("pdf")) {
    return {
      icon: "document-text",
      color: colors.danger,
      bgColor: colors.dangerLight,
      tag: "PDF",
    };
  }

  if (["xlsx", "xls", "csv"].includes(ext) || m.includes("sheet") || m.includes("excel")) {
    return {
      icon: "grid-outline",
      color: colors.success,
      bgColor: "#DCFCE7",
      tag: ext.toUpperCase() || "XLS",
    };
  }

  if (["doc", "docx"].includes(ext) || m.includes("word") || m.includes("officedocument")) {
    return {
      icon: "document-outline",
      color: colors.primary,
      bgColor: colors.primaryLight,
      tag: "DOC",
    };
  }

  if (["zip", "rar", "7z", "tar"].includes(ext) || m.includes("zip")) {
    return {
      icon: "archive-outline",
      color: colors.warning,
      bgColor: "#FEF3C7",
      tag: "ZIP",
    };
  }

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext) || m.startsWith("image/")) {
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
    tag: ext ? ext.toUpperCase().slice(0, 4) : "FILE",
  };
}

function formatSize(size?: number | string): string {
  if (typeof size === "string") return size;
  if (!size || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function AttachmentItem({
  name,
  size,
  mimeType,
  status = "ready",
  date,
  onPress,
  onDownload,
  onRemove,
  disabled = false,
  style,
  testID,
}: AttachmentItemProps) {
  const badge = getFileBadge(name, mimeType);
  const formattedSize = formatSize(size);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Archivo adjunto: ${name}`}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        status === "error" && styles.containerError,
        disabled && styles.containerDisabled,
        pressed && !disabled && styles.containerPressed,
        style,
      ]}
    >
      <View style={[styles.iconChip, { backgroundColor: badge.bgColor }]}>
        <Ionicons name={badge.icon} size={20} color={badge.color} />
        <Text style={[styles.tagText, { color: badge.color }]}>
          {badge.tag}
        </Text>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>

        <Text style={styles.meta}>
          {formattedSize}
          {formattedSize && date ? " • " : ""}
          {date}
          {status === "error" ? " • Error de carga" : ""}
        </Text>
      </View>

      <View style={styles.actions}>
        {onDownload ? (
          <Pressable
            hitSlop={8}
            onPress={onDownload}
            accessibilityRole="button"
            accessibilityLabel={`Descargar ${name}`}
            style={styles.actionBtn}
          >
            <Ionicons
              name="download-outline"
              size={18}
              color={colors.primary}
            />
          </Pressable>
        ) : null}

        {onRemove && !disabled ? (
          <Pressable
            hitSlop={8}
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${name}`}
            style={styles.actionBtn}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={colors.danger}
            />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  containerPressed: {
    backgroundColor: colors.surfaceSecondary,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  containerError: {
    borderColor: colors.danger,
    backgroundColor: "#FEF2F2",
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  tagText: {
    fontSize: 8,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  meta: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionBtn: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
});