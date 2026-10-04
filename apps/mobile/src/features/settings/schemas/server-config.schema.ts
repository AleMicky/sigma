import { z } from "zod";

const URL_REGEX =
    /^https?:\/\/((localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))(:\d{1,5})?(\/.*)?$/;

export const serverConfigSchema = z.object({
    url: z
        .string()
        .trim()
        .min(1, { message: "La dirección del servidor es requerida." })
        .refine(
            (val) => val.startsWith("http://") || val.startsWith("https://"),
            {
                message: "La URL debe comenzar con http:// o https://",
            }
        )
        .refine((val) => URL_REGEX.test(val), {
            message:
                "Ingresa una URL o IP válida (ej: http://192.168.1.100:8080 o https://api.sigma.com).",
        }),
});

export type ServerConfigFormValues = z.infer<typeof serverConfigSchema>;

export function validateServerUrl(url: string): { success: boolean; error?: string } {
    const result = serverConfigSchema.safeParse({ url });
    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0]?.message || "URL inválida.",
        };
    }
    return { success: true };
}
