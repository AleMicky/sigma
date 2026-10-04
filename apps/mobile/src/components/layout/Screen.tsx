import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";

export type ScreenProps = {
  children: ReactNode;
  /** Estilo para el contenedor exterior */
  style?: StyleProp<ViewStyle>;
  /** Estilo para el contenido interior o ScrollView */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Si es true, envuelve el contenido en un ScrollView */
  scrollable?: boolean;
  /** Si debe incluir el padding general por defecto (16px) */
  withPadding?: boolean;
  /** Evita que el teclado tape los inputs */
  keyboardAvoiding?: boolean;
  /** Bordes en los que aplicar el SafeArea (ej: ['top', 'bottom']) */
  edges?: Edge[];
  /** Estilo de la barra de estado */
  statusBarStyle?: StatusBarStyle;
};

export function Screen({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  withPadding = true,
  keyboardAvoiding = true,
  edges = ["top", "bottom", "left", "right"],
  statusBarStyle = "dark",
}: ScreenProps) {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        withPadding && styles.padding,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.innerContainer,
        withPadding && styles.padding,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      <StatusBar style={statusBarStyle} />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padding: {
    padding: 16,
  },
});