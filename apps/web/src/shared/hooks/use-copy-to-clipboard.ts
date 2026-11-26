import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type UseCopyToClipboardResult = {
  /** Clave del último texto copiado, o `null` cuando finalizó el feedback. */
  copiedKey: string | null
  /**
   * Copia el texto al portapapeles y muestra una confirmación temporal.
   * Nunca lanza: devuelve `false` si el navegador rechaza la escritura.
   */
  copy: (text: string, key?: string) => Promise<boolean>
  /** Verdadero mientras `key` sea el último elemento copiado. */
  isCopied: (key: string) => boolean
}

/**
 * Feedback de "copiado" con temporizador cancelable al desmontar el componente.
 * Evita actualizaciones de estado sobre componentes ya desmontados y errores
 * no capturados cuando el portapapeles no está disponible.
 */
export function useCopyToClipboard(
  resetAfter = 2000,
): UseCopyToClipboardResult {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const copy = useCallback(
    async (text: string, key = "default") => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        toast.error("No se pudo copiar al portapapeles")
        return false
      }

      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
      setCopiedKey(key)
      timeoutRef.current = setTimeout(() => setCopiedKey(null), resetAfter)
      return true
    },
    [resetAfter],
  )

  const isCopied = useCallback((key: string) => copiedKey === key, [copiedKey])

  return { copiedKey, copy, isCopied }
}
