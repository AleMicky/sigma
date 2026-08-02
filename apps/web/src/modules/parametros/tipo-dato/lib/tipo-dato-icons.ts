import type { LucideIcon } from "lucide-react"
import {
  Calendar,
  CheckSquare,
  Hash,
  ListChecks,
  TextCursorInput,
  ToggleLeft,
  Type,
} from "lucide-react"

const ICON_BY_CODIGO: Record<string, LucideIcon> = {
  TEXT: TextCursorInput,
  TEXTO: TextCursorInput,
  TEXTAREA: Type,
  NUMBER: Hash,
  NUMERO: Hash,
  DECIMAL: Hash,
  DATE: Calendar,
  FECHA: Calendar,
  DATETIME: Calendar,
  BOOLEAN: ToggleLeft,
  SELECT: CheckSquare,
  MULTISELECT: ListChecks,
}

export function getTipoDatoIcon(codigo: string): LucideIcon {
  return ICON_BY_CODIGO[codigo.trim().toUpperCase()] ?? Type
}
