import { useEffect, useState, type ReactNode } from "react"

import { useAuthStore } from "@/app/store/auth.store"
import { fetchAuthenticatedBlob } from "@/shared/api"
import { cn } from "@/shared/lib/utils"

type AuthenticatedImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackClassName?: string
  fallback?: ReactNode
}

function getFailureStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return null
  }

  const status: unknown = (error as { status: unknown }).status
  return typeof status === "number" ? status : null
}

function failureMessage(status: number | null): string {
  return status === 401 || status === 403
    ? "No se pudo cargar la imagen: no tienes permiso para verla."
    : "No se pudo cargar la imagen."
}

function AuthenticatedImageContent({
  src,
  alt,
  className,
  fallbackClassName,
  fallback,
}: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [failureText, setFailureText] = useState("No se pudo cargar la imagen.")

  useEffect(() => {
    if (!src) return

    let cancelled = false
    let createdUrl: string | null = null

    void fetchAuthenticatedBlob(src)
      .then((blob) => {
        if (cancelled) return
        if (blob.type && !blob.type.startsWith("image/")) {
          setFailed(true)
          setObjectUrl(null)
          return
        }
        createdUrl = URL.createObjectURL(blob)
        setObjectUrl(createdUrl)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setFailed(true)
        setObjectUrl(null)
        setFailureText(failureMessage(getFailureStatus(error)))
      })

    return () => {
      cancelled = true
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [src])

  if (!src || failed || !objectUrl) {
    if (failed) {
      return (
        <div
          role="status"
          className={cn(
            "flex items-center justify-center bg-muted text-muted-foreground",
            fallbackClassName ?? className,
          )}
        >
          {fallback}
          <span className="sr-only">{failureText}</span>
        </div>
      )
    }

    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          fallbackClassName ?? className,
        )}
        aria-hidden={!fallback}
      >
        {fallback}
      </div>
    )
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => {
        setFailed(true)
      }}
    />
  )
}

/**
 * La clave incluye la identidad de la sesión: un cambio de cuenta con la misma
 * URL no puede reutilizar el blob (ni el object URL) de la cuenta anterior.
 */
export function AuthenticatedImage(props: AuthenticatedImageProps) {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const sessionScope = useAuthStore((state) => state.sessionScope)

  return (
    <AuthenticatedImageContent
      key={`${sessionScope ?? "sin-sesion"}:${userId ?? "anonimo"}:${props.src ?? ""}`}
      {...props}
    />
  )
}
