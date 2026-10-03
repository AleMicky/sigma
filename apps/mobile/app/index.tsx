import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background-0">
      <Text className="text-3xl font-bold">SIGMA</Text>

      <Text className="mt-2 text-typography-500">
        Sistema Integrado de Gestión
      </Text>
    </View>
  );
}
