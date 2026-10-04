import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonText } from "@/src/components/ui/button";
import {
    defaultLoginValues,
    LoginFormValues,
    loginSchema,
} from "../schemas/login.schema";
import { AuthInput } from "./AuthInput";
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "./icons";

interface LoginFormProps {
    onSubmit?: (data: LoginFormValues) => Promise<void> | void;
    isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef<TextInput>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: defaultLoginValues,
        mode: "onTouched",
    });

    const isPending = isLoading || isSubmitting;

    const handleFormSubmit = async (data: LoginFormValues) => {
        try {
            if (onSubmit) {
                await onSubmit(data);
            } else {
                // Default placeholder action for demonstration
                Alert.alert(
                    "Inicio de Sesión",
                    `Intentando conectar como: ${data.username}`
                );
            }
        } catch (error: any) {
            Alert.alert(
                "Error de autenticación",
                error?.message || "No se pudo iniciar sesión. Verifica tus credenciales."
            );
        }
    };

    return (
        <View className="w-full gap-4">
            {/* Username Input */}
            <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                    <AuthInput
                        label="Usuario o Identificador"
                        placeholder="Ingresa tu usuario"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                        error={errors.username?.message}
                        leftIcon={<UserIcon size={18} color="#64748b" />}
                        editable={!isPending}
                    />
                )}
            />

            {/* Password Input */}
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                    <AuthInput
                        ref={passwordInputRef}
                        label="Contraseña"
                        placeholder="••••••••"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="go"
                        onSubmitEditing={handleSubmit(handleFormSubmit)}
                        error={errors.password?.message}
                        leftIcon={<LockIcon size={18} color="#64748b" />}
                        rightAction={
                            <TouchableOpacity
                                onPress={() => setShowPassword((prev) => !prev)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                accessibilityLabel={
                                    showPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                            >
                                {showPassword ? (
                                    <EyeOffIcon size={19} color="#64748b" />
                                ) : (
                                    <EyeIcon size={19} color="#64748b" />
                                )}
                            </TouchableOpacity>
                        }
                        editable={!isPending}
                    />
                )}
            />

            {/* Submit Button */}
            <Button
                className="mt-2 h-12 w-full rounded-xl bg-blue-600 active:bg-blue-700 shadow-sm shadow-blue-500/20"
                onPress={handleSubmit(handleFormSubmit)}
                isDisabled={isPending}
            >
                {isPending ? (
                    <View className="flex-row items-center gap-2">
                        <ActivityIndicator size="small" color="#ffffff" />
                        <ButtonText className="font-semibold text-base text-white">
                            Iniciando sesión...
                        </ButtonText>
                    </View>
                ) : (
                    <ButtonText className="font-semibold text-base text-white">
                        Iniciar sesión
                    </ButtonText>
                )}
            </Button>
        </View>
    );
}
