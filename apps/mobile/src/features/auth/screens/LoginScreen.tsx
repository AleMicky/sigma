import { useState } from "react";
import {
  Image,
  StyleSheet,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppIconButton } from "@/components/ui/AppIconButton";
import { AppText } from "@/components/ui/AppText";
import { FormInput } from "@/components/form/FormInput";
import { PasswordInput } from "@/components/form/PasswordInput";
import { KeyboardScreen } from "@/components/layout/KeyboardScreen";
import { useAppTheme, spacing, radius, shadows } from "@/theme";
import { ROUTES } from "@/constants/routes";
import { useLogin } from "@/features/auth/hooks/useLogin";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

const LOGO_LIGHT = require("../../../../assets/logo-ende-corani.png");
const LOGO_DARK = require("../../../../assets/logo-ende-corani-dark.png");

export function LoginScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useLogin({
    onSuccess: () => {
      setErrorMessage(null);
      router.replace(ROUTES.APP.WELCOME as any);
    },
    onError: (error) => {
      const msg =
        error.message ||
        "Credenciales incorrectas o error al conectar con el servidor.";
      setErrorMessage(msg);
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setErrorMessage(null);
    login(values);
  };

  return (
    <KeyboardScreen statusBarStyle={isDark ? "light" : "dark"}>
      {/* Botones flotantes superiores */}
      <View style={styles.floatingTopBar}>
        <View style={shadows.sm}>
          <AppIconButton
            icon="server-outline"
            variant="tonal"
            size="sm"
            color={colors.textSecondary}
            onPress={() => router.push(ROUTES.AUTH.SERVER_CONFIG as any)}
            accessibilityLabel="Configurar servidor API"
          />
        </View>

        <View style={shadows.sm}>
          <AppIconButton
            icon={isDark ? "sunny-outline" : "moon-outline"}
            variant="tonal"
            size="sm"
            color={colors.textSecondary}
            onPress={toggleTheme}
            accessibilityLabel="Cambiar tema visual"
          />
        </View>
      </View>

      <View style={styles.container}>
        {/* Header con Logo */}
        <View style={styles.header}>
          <Image
            source={isDark ? LOGO_DARK : LOGO_LIGHT}
            style={styles.logo}
            resizeMode="contain"
          />

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
        </View>

        {/* Formulario de Inicio de Sesión */}
        <View style={styles.form}>
          {/* Mensaje de Error si la autenticación falla */}
          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: isDark ? "#450A0A" : "#FEE2E2",
                  borderColor: colors.danger,
                },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <AppText
                variant="bodySm"
                weight="medium"
                style={{ flex: 1, color: colors.danger }}
              >
                {errorMessage}
              </AppText>
            </View>
          ) : null}

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
              title={isPending ? "Ingresando..." : "Ingresar"}
              loading={isPending}
              disabled={isPending}
              onPress={handleSubmit(onSubmit)}
              size="lg"
              rightIcon={
                !isPending ? (
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={colors.white}
                  />
                ) : undefined
              }
            />
          </View>
        </View>

        {/* Footer institucional discreto */}
        <View style={styles.footer}>
          <AppText variant="caption" color="textMuted" align="center">
            ENDE CORANI S.A.
          </AppText>
        </View>
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  floatingTopBar: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  actionWrapper: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.lg,
  },
});
