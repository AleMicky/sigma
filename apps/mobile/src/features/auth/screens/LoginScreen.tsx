import { Text, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";

export function LoginScreen() {
    return (
        <View className="flex-1 justify-center bg-white px-6">
            {/* Encabezado */}
            <View className="mb-8">
                <Text className="text-3xl font-bold text-slate-900">
                    SIGMA
                </Text>

                <Text className="mt-2 text-base text-slate-500">
                    Inicia sesión para continuar
                </Text>
            </View>

            {/* Formulario */}
            <View className="gap-4">
                <Input className="h-12 rounded-xl">
                    <InputField
                        className="text-base"
                        placeholder="Usuario"
                        autoCapitalize="none"
                    />
                </Input>

                <Input className="h-12 rounded-xl">
                    <InputField
                        className="text-base"
                        placeholder="Contraseña"
                        secureTextEntry
                    />
                </Input>

                <Button className="h-12 rounded-xl">
                    <ButtonText>
                        Iniciar sesión
                    </ButtonText>
                </Button>
            </View>
        </View>
    );
}