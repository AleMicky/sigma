import {
  Image,
  StyleSheet,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppIconButton } from "@/components/ui/AppIconButton";
import { AppText } from "@/components/ui/AppText";
import { FormInput } from "@/components/form/FormInput";
import { PasswordInput } from "@/components/form/PasswordInput";
import { KeyboardScreen } from "@/components/layout/KeyboardScreen";
import { FadeInView, PulseView } from "@/components/animation";
import { useAppTheme, spacing, shadows } from "@/theme";

import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

const LOGO_LIGHT = require("../../../../assets/logo-ende-corani.png");
const LOGO_DARK = require("../../../../assets/logo-ende-corani-dark.png");

export function LoginScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log("Login form submitted:", values);
  };

  return (
    <KeyboardScreen statusBarStyle={isDark ? "light" : "dark"}>
      {/* Botón flotante independiente en la esquina superior derecha */}
      <View style={[styles.floatingThemeToggle, shadows.sm]}>
        <AppIconButton
          icon={isDark ? "sunny-outline" : "moon-outline"}
          variant="tonal"
          size="sm"
          color={colors.textSecondary}
          onPress={toggleTheme}
          accessibilityLabel="Cambiar tema visual"
        />
      </View>

      <View style={styles.container}>
        {/* Header con Animación FadeIn y Logo Adaptativo */}
        <FadeInView direction="down" duration={500} spring style={styles.header}>
          <PulseView
            type="scale"
            minScale={0.97}
            maxScale={1.03}
            duration={3200}
            active={true}
          >
            <Image
              source={isDark ? LOGO_DARK : LOGO_LIGHT}
              style={styles.logo}
              resizeMode="contain"
            />
          </PulseView>

          <View style={styles.titleWrapper}>
            <AppText variant="title" weight="bold" align="center">
              SIGMA
            </AppText>
            <AppText
              variant="bodySm"
              color="textSecondary"
              align="center"
              style={styles.subtitle}
            >
              Ingresa tus credenciales para continuar
            </AppText>
          </View>
        </FadeInView>

        {/* Formulario con Animación Suave */}
        <FadeInView direction="up" delay={150} duration={500} spring style={styles.form}>
          <FormInput
            control={control}
            name="username"
            label="Usuario"
            placeholder="Ingrese su usuario"
            autoCapitalize="none"
            autoCorrect={false}
            clearable
            leftIcon={
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.textSecondary}
              />
            }
          />

          <PasswordInput
            control={control}
            name="password"
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textSecondary}
              />
            }
          />

          <View style={styles.actionWrapper}>
            <AppButton
              title={isSubmitting ? "Ingresando..." : "Ingresar"}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              size="lg"
              rightIcon={
                !isSubmitting ? (
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={colors.white}
                  />
                ) : undefined
              }
            />
          </View>
        </FadeInView>

        {/* Footer con Animación Sutil */}
        <FadeInView direction="up" delay={300} duration={500} style={styles.footer}>
          <AppText variant="caption" color="textMuted" align="center">
            ENDE CORANI S.A.
          </AppText>
        </FadeInView>
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  floatingThemeToggle: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 99,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  logo: {
    width: 200,
    height: 70,
  },
  titleWrapper: {
    alignItems: "center",
    gap: spacing.xs,
  },
  subtitle: {
    marginTop: 2,
  },
  form: {
    gap: spacing.md,
    marginVertical: "auto",
  },
  actionWrapper: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.lg,
  },
});
