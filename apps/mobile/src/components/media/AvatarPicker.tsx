import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type AvatarPickerProps = {
  uri?: string;
  name?: string;
  onChange: (uri: string) => void;
  onRemove?: () => void;
  size?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  disabled?: boolean;
  label?: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function AvatarPicker({
  uri,
  name,
  onChange,
  onRemove,
  size = 96,
  allowsEditing = true,
  aspect = [1, 1],
  quality = 0.8,
  disabled = false,
  label,
  hint,
  style,
  testID,
}: AvatarPickerProps) {
  const [loading, setLoading] = useState(false);

  const openCamera = async () => {
    try {
      setLoading(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permiso de cámara",
          "Se requiere autorización para tomar fotografías de perfil."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "No se pudo abrir la cámara.");
    } finally {
      setLoading(false);
    }
  };

  const openGallery = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "No se pudo acceder a la galería de fotos.");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;

    Alert.alert(
      "Foto de Perfil",
      "Selecciona una opción para actualizar tu avatar:",
      [
        { text: "📷 Tomar Foto", onPress: openCamera },
        { text: "🖼️ Elegir de Galería", onPress: openGallery },
        ...(uri && onRemove
          ? [{ text: "🗑️ Quitar Foto", style: "destructive" as const, onPress: onRemove }]
          : []),
        { text: "Cancelar", style: "cancel" as const },
      ]
    );
  };

  const badgeSize = Math.max(28, Math.round(size * 0.32));
  const iconSize = Math.max(14, Math.round(badgeSize * 0.55));

  return (
    <View testID={testID} style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cambiar foto de perfil"
        accessibilityState={{ disabled }}
        disabled={disabled || loading}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          { width: size, height: size },
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <AppAvatar uri={uri} name={name} size={size} />

        {loading ? (
          <View style={[styles.loadingOverlay, { borderRadius: size / 2 }]}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        ) : null}

        {/* Camera badge icon */}
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <Ionicons name="camera" size={iconSize} color={colors.white} />
        </View>
      </Pressable>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
  container: {
    alignSelf: "center",
    position: "relative",
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});