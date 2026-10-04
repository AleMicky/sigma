import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ButtonText } from "@/src/components/ui/button";
import { serverConfigService } from "../services/server-config.service";
import {
    ArrowLeftIcon,
    ServerConnectionTest,
    ServerHeaderCard,
    ServerTipsCard,
    ServerUrlInput,
    TestStatus,
} from "../components";
import { validateServerUrl } from "../schemas/server-config.schema";

export function ServerConfigScreen() {
    const insets = useSafeAreaInsets();
    const [url, setUrl] = useState("");
    const [defaultUrl, setDefaultUrl] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Testing connection state
    const [testStatus, setTestStatus] = useState<TestStatus>("idle");
    const [testMessage, setTestMessage] = useState("");
    const [latency, setLatency] = useState<number | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        try {
            const apiUrl = await serverConfigService.getApiUrl();
            const fallbackUrl = serverConfigService.getDefaultUrl();
            setUrl(apiUrl);
            setDefaultUrl(fallbackUrl);
        } catch {
            Alert.alert("Error", "No se pudo cargar la configuración actual del servidor.");
        } finally {
            setLoading(false);
        }
    }

    function handleUrlChange(newUrl: string) {
        setUrl(newUrl);

        // Reset test status on change
        if (testStatus !== "idle") {
            setTestStatus("idle");
            setTestMessage("");
        }

        // Validate dynamically if there was an active error
        if (validationError) {
            const validation = validateServerUrl(newUrl);
            setValidationError(validation.success ? null : validation.error || null);
        }
    }

    function handleClearUrl() {
        setUrl("");
        setValidationError(null);
        setTestStatus("idle");
        setTestMessage("");
    }

    async function handleTestConnection() {
        const validation = validateServerUrl(url);
        if (!validation.success) {
            setValidationError(validation.error || "URL inválida.");
            return;
        }
        setValidationError(null);

        setTestStatus("testing");
        setTestMessage("Probando conexión con el servidor...");
        setLatency(null);

        try {
            const result = await serverConfigService.testConnection(url);
            if (result.success) {
                setTestStatus("success");
                setTestMessage(result.message || "Conexión exitosa");
                if (result.latencyMs !== undefined) {
                    setLatency(result.latencyMs);
                }
            } else {
                setTestStatus("error");
                setTestMessage(result.message || "No se pudo conectar al servidor.");
            }
        } catch {
            setTestStatus("error");
            setTestMessage("Error inesperado al intentar conectar.");
        }
    }

    async function handleSave() {
        // Run Zod schema validation
        const validation = validateServerUrl(url);
        if (!validation.success) {
            setValidationError(validation.error || "URL inválida.");
            return;
        }
        setValidationError(null);

        const normalizedUrl = url.trim().replace(/\/+$/, "");

        try {
            setSaving(true);
            await serverConfigService.setApiUrl(normalizedUrl);
            Alert.alert(
                "Configuración guardada",
                "La dirección del servidor se ha actualizado correctamente.",
                [
                    {
                        text: "Aceptar",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch {
            Alert.alert("Error", "No se pudo guardar la nueva configuración.");
        } finally {
            setSaving(false);
        }
    }

    const isModifiedFromDefault = url.trim() !== defaultUrl.trim();

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-sm font-medium text-slate-500">
                    Cargando configuración...
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-slate-50"
        >
            {/* Top Navigation Bar */}
            <View
                style={{
                    paddingTop: Math.max(insets.top, 16),
                    paddingLeft: Math.max(insets.left, 16),
                    paddingRight: Math.max(insets.right, 16),
                }}
                className="bg-white border-b border-slate-200/80 pb-3 shadow-xs"
            >
                <View className="w-full max-w-lg self-center flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
                        accessibilityLabel="Regresar"
                    >
                        <ArrowLeftIcon size={20} color="#334155" />
                    </TouchableOpacity>

                    <Text className="text-lg font-bold text-slate-900">
                        Configuración de Servidor
                    </Text>

                    <View className="w-10 items-end">
                        <View
                            className={`h-2.5 w-2.5 rounded-full ${
                                testStatus === "success"
                                    ? "bg-emerald-500 ring-4 ring-emerald-100"
                                    : testStatus === "error"
                                    ? "bg-rose-500 ring-4 ring-rose-100"
                                    : "bg-slate-300"
                            }`}
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: Math.max(insets.bottom, 24) + 20,
                    paddingLeft: Math.max(insets.left, 0),
                    paddingRight: Math.max(insets.right, 0),
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="w-full max-w-lg self-center px-4 sm:px-6 pt-5 gap-5">
                    {/* Header Overview Card */}
                    <ServerHeaderCard isModifiedFromDefault={isModifiedFromDefault} />

                    {/* Main Form Box */}
                    <View className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/70">
                        {/* URL Input with Zod Error Handling */}
                        <ServerUrlInput
                            value={url}
                            onChangeText={handleUrlChange}
                            onClear={handleClearUrl}
                            error={validationError}
                        />

                        {/* Test Connection Button & Status */}
                        <ServerConnectionTest
                            status={testStatus}
                            message={testMessage}
                            latency={latency}
                            disabled={!url.trim()}
                            onTest={handleTestConnection}
                        />
                    </View>

                    {/* Information Tips */}
                    <ServerTipsCard />

                    {/* Action Buttons */}
                    <View className="gap-3 pt-2">
                        <Button
                            className="h-12 rounded-xl bg-blue-600 active:bg-blue-700 shadow-sm"
                            onPress={handleSave}
                            isDisabled={saving}
                        >
                            <ButtonText className="font-semibold text-base text-white">
                                {saving ? "Guardando configuración..." : "Guardar y aplicar"}
                            </ButtonText>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-12 rounded-xl border-slate-300 bg-white active:bg-slate-100"
                            onPress={() => router.back()}
                            isDisabled={saving}
                        >
                            <ButtonText className="font-medium text-slate-700">
                                Cancelar
                            </ButtonText>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}