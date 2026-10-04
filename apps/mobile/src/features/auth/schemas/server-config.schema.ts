import { z } from "zod";

export const serverConfigSchema = z.object({
  protocol: z.enum(["http", "https"]),
  host: z
    .string()
    .trim()
    .min(1, "La dirección IP o Host es obligatoria")
    .transform((val) => {
      // Remove protocol or trailing paths if pasted by user
      return val.replace(/^https?:\/\//, "").split("/")[0].split(":")[0].trim();
    }),
  port: z
    .string()
    .trim()
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 65535;
    }, "Puerto inválido (1 - 65535)")
    .optional(),
});

export type ServerConfigFormValues = z.infer<typeof serverConfigSchema>;
