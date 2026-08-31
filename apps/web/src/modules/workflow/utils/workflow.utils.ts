import type { LucideIcon } from "lucide-react"
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  CheckCheck,
  FileCheck2,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react"

import type { WorkflowAction } from "../types/workflow.types"

/**
 * Utility to fix mojibake or UTF-8 double-encoding in action and status strings
 */
export function fixWorkflowEncoding(text?: string | null): string {
  if (!text) return ""
  try {
    return decodeURIComponent(escape(text))
  } catch {
    return text
  }
}

export type ActionVisuals = {
  variant: string
  icon: LucideIcon
  btnClass: string
}

export function getWorkflowActionVisuals(action?: WorkflowAction | null): ActionVisuals {
  const name = fixWorkflowEncoding(action?.name ?? "").toLowerCase()
  const val = String(action?.value ?? "").toUpperCase()

  if (val.includes("APROB") || name.includes("aprobar")) {
    return {
      variant: "emerald",
      icon: CheckCircle2,
      btnClass:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs ring-1 ring-emerald-600/30",
    }
  }
  if (val.includes("OBSERV") || name.includes("observar")) {
    return {
      variant: "amber",
      icon: AlertCircle,
      btnClass:
        "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs ring-1 ring-amber-600/30",
    }
  }
  if (val.includes("INIC") || name.includes("iniciar")) {
    return {
      variant: "sky",
      icon: Play,
      btnClass:
        "bg-sky-600 hover:bg-sky-700 text-white shadow-2xs ring-1 ring-sky-600/30",
    }
  }
  if (
    val.includes("REVIS") ||
    name.includes("revisión") ||
    name.includes("revision")
  ) {
    return {
      variant: "indigo",
      icon: Send,
      btnClass:
        "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs ring-1 ring-indigo-600/30",
    }
  }
  if (val.includes("VALID") || name.includes("validar")) {
    return {
      variant: "teal",
      icon: ShieldCheck,
      btnClass:
        "bg-teal-600 hover:bg-teal-700 text-white shadow-2xs ring-1 ring-teal-600/30",
    }
  }
  if (val.includes("CORREG") || name.includes("corregir")) {
    return {
      variant: "orange",
      icon: RotateCcw,
      btnClass:
        "bg-orange-600 hover:bg-orange-700 text-white shadow-2xs ring-1 ring-orange-600/30",
    }
  }
  if (
    val.includes("CERR") ||
    val.includes("RECIB") ||
    name.includes("cerrar") ||
    name.includes("recibir")
  ) {
    return {
      variant: "green",
      icon: CheckCheck,
      btnClass:
        "bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs ring-1 ring-emerald-700/30",
    }
  }
  if (
    val.includes("RECHAZ") ||
    val.includes("CANCEL") ||
    name.includes("rechazar") ||
    name.includes("cancelar")
  ) {
    return {
      variant: "rose",
      icon: AlertOctagon,
      btnClass:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs ring-1 ring-rose-600/30",
    }
  }

  return {
    variant: "primary",
    icon: FileCheck2,
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs",
  }
}
