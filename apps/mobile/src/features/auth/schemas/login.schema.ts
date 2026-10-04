import { z } from "zod";

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, { message: "El nombre de usuario es requerido." })
        .min(3, { message: "El usuario debe tener al menos 3 caracteres." }),
    password: z
        .string()
        .min(1, { message: "La contraseña es requerida." })
        .min(4, { message: "La contraseña debe tener al menos 4 caracteres." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const defaultLoginValues: LoginFormValues = {
    username: "",
    password: "",
};

export function validateLoginForm(values: LoginFormValues): {
    success: boolean;
    errors?: Partial<Record<keyof LoginFormValues, string>>;
} {
    const result = loginSchema.safeParse(values);
    if (!result.success) {
        const errors: Partial<Record<keyof LoginFormValues, string>> = {};
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof LoginFormValues;
            if (field && !errors[field]) {
                errors[field] = issue.message;
            }
        }
        return { success: false, errors };
    }
    return { success: true };
}
