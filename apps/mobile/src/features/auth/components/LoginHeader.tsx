import { Text, View } from "react-native";
import { SigmaLogoIcon } from "@/src/components/icons";

interface LoginHeaderProps {
    title?: string;
    subtitle?: string;
}

export function LoginHeader({
    title = "SIGMA",
    subtitle = "Sistema Integrado de Gestión de Mantenimiento",
}: LoginHeaderProps) {
    return (
        <View className="items-center pb-6 pt-2">
            {/* Logo Badge */}
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-500/20">
                <SigmaLogoIcon size={36} />
            </View>

            {/* App Title */}
            <Text className="text-3xl font-extrabold tracking-tight text-slate-900">
                {title}
            </Text>

            {/* Subtitle */}
            <Text className="mt-1.5 text-center text-sm font-medium text-slate-500">
                {subtitle}
            </Text>

            <View className="mt-3 rounded-full bg-slate-100 px-3 py-1">
                <Text className="text-xs font-semibold text-slate-600">
                    Acceso de Operadores y Técnicos
                </Text>
            </View>
        </View>
    );
}
