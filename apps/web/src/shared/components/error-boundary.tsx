import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react"
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

interface ErrorFallbackProps {
  error?: unknown
  title?: string
  description?: string
  onRetry?: () => void
  onGoHome?: () => void
}

function extractErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  if (typeof error === "string" && error.trim()) {
    return error
  }
  return null
}

export function ErrorFallback({
  error,
  title = "Ocurrió un error inesperado",
  description = "No pudimos renderizar esta vista correctamente. Puedes intentar recargar o volver al inicio.",
  onRetry,
  onGoHome,
}: Readonly<ErrorFallbackProps>) {
  const detail = extractErrorMessage(error)

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      window.location.assign("/")
    }
  }

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] w-full flex-1 items-center justify-center bg-background px-4 py-10"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {detail && (
          <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-left">
            <p className="break-words font-mono text-xs text-muted-foreground">
              {detail}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoHome}
            className="gap-1.5"
          >
            <Home className="size-4" aria-hidden="true" />
            Volver al inicio
          </Button>
          <Button
            type="button"
            onClick={handleRetry}
            className="gap-1.5"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Error no controlado en render:", error, errorInfo)
  }

  private readonly handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  private readonly handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign("/")
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      )
    }

    return this.props.children
  }
}

export function RouterErrorFallback({ error, reset }: Readonly<ErrorComponentProps>) {
  const router = useRouter()

  const handleRetry = () => {
    reset()
    void router.invalidate()
  }

  const handleGoHome = () => {
    reset()
    void router.navigate({ to: "/" })
  }

  return (
    <ErrorFallback
      error={error}
      onRetry={handleRetry}
      onGoHome={handleGoHome}
    />
  )
}
