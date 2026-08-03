import { useEffect, useState, type ReactNode } from "react"

import { fetchAuthenticatedBlob } from "@/shared/api"
import { cn } from "@/shared/lib/utils"

type AuthenticatedImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackClassName?: string
  fallback?: ReactNode
}

export function AuthenticatedImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallback,
}: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) {
      setObjectUrl(null)
      setFailed(false)
      return
    }

    let cancelled = false
    let createdUrl: string | null = null

    setFailed(false)
    setObjectUrl(null)

    void fetchAuthenticatedBlob(src)
      .then((blob) => {
        if (cancelled) return
        createdUrl = URL.createObjectURL(blob)
        setObjectUrl(createdUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
          setObjectUrl(null)
        }
      })

    return () => {
      cancelled = true
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [src])

  if (!src || failed || !objectUrl) {
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
    />
  )
}
