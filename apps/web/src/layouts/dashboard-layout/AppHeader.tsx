import { useEffect, useState } from "react"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  Building2,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  WifiOff,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { parseApiError } from "@/shared/api/errors"
import { RefreshButton } from "@/shared/components/refresh-button"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Button } from "@/shared/components/ui/button"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"

import { AppBreadcrumb } from "./AppBreadcrumb"
import { CommandPalette } from "./CommandPalette"

export function AppHeader() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching() > 0
  const [commandOpen, setCommandOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  )
  const [hasServerError, setHasServerError] = useState(false)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  const [shortcutLabel] = useState(() => {
    const platform =
      (
        navigator as Navigator & {
          userAgentData?: { platform?: string }
        }
      ).userAgentData?.platform ??
      navigator.platform ??
      ""

    return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘ K" : "Ctrl K"
  })

  // Escuchar atajo global ⌘K o Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Escuchar estado online/offline del navegador
  useEffect(() => {
    function handleOnline() {
      setIsBrowserOnline(true)
    }
    function handleOffline() {
      setIsBrowserOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // `navigator.onLine` no detecta caídas de la API: derivamos el estado también
  // de los errores de React Query (sin conexión o errores 5xx).
  useEffect(() => {
    const queryCache = queryClient.getQueryCache()
    let active = true
    let scheduled = false

    function syncConnectionState() {
      if (!active) return
      const unavailable = queryCache
        .findAll()
        .filter((query) => query.state.status === "error")
        .some((query) => {
          const error = query.state.error
          if (!error) return false
          const apiError = parseApiError(error)
          return apiError.status === undefined || apiError.status >= 500
        })

      setHasServerError(unavailable)
    }

    // Diferir al microtask para evitar actualizar AppHeader mientras otro
    // componente está en fase de render (p. ej. al montar un useQuery nuevo).
    function scheduleSync() {
      if (scheduled || !active) return
      scheduled = true
      queueMicrotask(() => {
        scheduled = false
        syncConnectionState()
      })
    }

    syncConnectionState()
    const unsubscribe = queryCache.subscribe((event) => {
      if (
        event.type === "updated" ||
        event.type === "removed" ||
        event.type === "added"
      ) {
        scheduleSync()
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  // Sincronizar el estado con el API de pantalla completa (también si se sale con Esc/F11)
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }

  async function handleRefresh() {
    setIsManualRefreshing(true)
    try {
      await queryClient.invalidateQueries()
    } finally {
      setIsManualRefreshing(false)
    }
  }

  const serverUnavailable = isBrowserOnline && hasServerError

  return (
    <>
      <header className="relative flex h-11 sm:h-12 shrink-0 items-center justify-between gap-2.5 border-b border-border/60 bg-background/95 px-3 sm:px-4 backdrop-blur-md z-10">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <SidebarTrigger className="-ml-1 size-7.5 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-md transition-colors shrink-0" />
          <div className="h-3.5 w-px bg-border/60 shrink-0" />
          <AppBreadcrumb />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sincronización manual (no ruido de refetches en segundo plano) */}
          {isManualRefreshing && (
            <div
              role="status"
              aria-live="polite"
              className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/20"
            >
              <Loader2 className="size-3 animate-spin text-primary" />
              <span>Sincronizando…</span>
            </div>
          )}

          {/* Sin conexión de red */}
          {!isBrowserOnline && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive"
            >
              <WifiOff className="size-3" />
              <span>Sin conexión</span>
            </div>
          )}

          {/* API inalcanzable aunque haya red */}
          {serverUnavailable && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive"
            >
              <AlertTriangle className="size-3" />
              <span>Servidor no disponible</span>
            </div>
          )}

          <RefreshButton
            variant="ghost"
            size="sm"
            tooltip="Sincronizar datos"
            isRefreshing={isFetching}
            onRefresh={handleRefresh}
            className="size-7.5 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-md transition-colors"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            aria-label="Abrir paleta de comandos"
            className="hidden lg:inline-flex h-7.5 gap-1.5 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <Search className="size-3.5" />
            <span>Buscar</span>
            <kbd className="ml-0.5 rounded border border-border/60 bg-muted/60 px-1 font-sans text-[10px] leading-4">
              {shortcutLabel}
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
            className="hidden sm:inline-flex size-7.5 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-md transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </Button>

          <ThemeToggle />

          <div className="h-3.5 w-px bg-border/60 shrink-0 mx-0.5 hidden sm:block" />

          <div className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border border-border/60 bg-muted/20 text-muted-foreground">
            <Building2 className="size-3.5 text-primary shrink-0" />
            <span className="tracking-tight text-foreground">
              {appConfig.companyName}
            </span>
          </div>

          {isBrowserOnline && !hasServerError && (
            <div
              role="status"
              aria-live="polite"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>En línea</span>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Paleta de Comandos */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
