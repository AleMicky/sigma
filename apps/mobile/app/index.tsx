import { Screen } from "@/components/layout/Screen";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
 
export default function HomeScreen() {
  return (
      <Screen>
      <AppText variant="title">Login</AppText>

      <AppInput
        label="Correo"
        placeholder="correo@ejemplo.com"
      />

      <AppButton title="Ingresar" />
    </Screen>
  );
}
  
 