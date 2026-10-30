import { cn } from "@/shared/lib/utils"

export type IncidenteStatus =
  | "REGISTRADO"
  | "REVISION"
  | "EN_ATENCION"
  | "VALIDACION"
  | "EN_CIERRE"
  | "CERRADO"
  | "RECHAZADO"
  | "CANCELADO"
  | string

interface IncidenteStatusBadgeProps {
  status: IncidenteStatus
  className?: string
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  REGISTRADO: {
    label: "Registrado",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    border: "border-blue-200 dark:border-blue-800",
  },
  REVISION: {
    label: "En Revisión",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-800",
  },
  EN_ATENCION: {
    label: "En Atención",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  VALIDACION: {
    label: "En Validación",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    border: "border-purple-200 dark:border-purple-800",
  },
  EN_CIERRE: {
    label: "En Cierre",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  CERRADO: {
    label: "Cerrado",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  RECHAZADO: {
    label: "Rechazado",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    border: "border-rose-200 dark:border-rose-800",
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    dot: "bg-gray-400",
    border: "border-gray-200 dark:border-gray-700",
  },
}

export function IncidenteStatusBadge({ status, className }: IncidenteStatusBadgeProps) {
  const normalized = (status || "REGISTRADO").toUpperCase().trim()
  const config = statusConfig[normalized] || {
    label: status || "Desconocido",
    bg: "bg-gray-50 dark:bg-gray-900",
    text: "text-gray-700 dark:text-gray-300",
    dot: "bg-gray-400",
    border: "border-gray-200 dark:border-gray-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  )
}

