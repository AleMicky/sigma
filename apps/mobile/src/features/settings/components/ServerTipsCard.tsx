import { Text, View } from "react-native";

export function ServerTipsCard() {
    return (
        <View className="rounded-2xl bg-amber-50/60 border border-amber-200/70 p-4">
            <Text className="text-xs font-bold text-amber-900 mb-1">
                💡 Consejos para la conexión:
            </Text>
            <Text className="text-xs text-amber-800 leading-relaxed">
                • Verifica que tu dispositivo móvil y el servidor SIGMA estén en la misma red o que la URL sea accesible públicamente.{"\n"}
                • Asegúrate de que el firewall permita conexiones en el puerto configurado (ej: 8080 o 443).
            </Text>
        </View>
    );
}
