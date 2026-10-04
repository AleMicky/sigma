import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    LoginForm,
    LoginHeader,
    ServerConfigCard,
} from "../components";
import { LoginFormValues } from "../schemas/login.schema";

export function LoginScreen() {
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            // Placeholder simulation for authentication logic
            await new Promise((resolve) => setTimeout(resolve, 1200));
            console.log("Credenciales enviadas:", data.username);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-white"
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "space-between",
                    paddingTop: Math.max(insets.top, 24) + 12,
                    paddingBottom: Math.max(insets.bottom, 20) + 12,
                    paddingLeft: Math.max(insets.left, 24),
                    paddingRight: Math.max(insets.right, 24),
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="w-full max-w-sm self-center justify-center flex-1 py-4">
                    {/* Header Branding */}
                    <LoginHeader />

                    {/* Main Auth Form Box */}
                    <View className="mt-2 rounded-2xl bg-white p-1">
                        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
                    </View>

                    {/* Server Configuration Shortcut Card */}
                    <View className="mt-8">
                        <ServerConfigCard />
                    </View>
                </View>

                {/* Footer / Version info */}
                <View className="items-center pt-4">
                    <Text className="text-xs text-slate-400">
                        SIGMA Mobile • v1.0.0
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}