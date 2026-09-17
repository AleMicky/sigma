import { useEffect, useState } from "react"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  WifiOff,
} from "lucide-react"

import { RefreshButton } from "@/shared/components/refresh-button"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Button } from "@/shared/components/ui/button"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"

import { AppBreadcrumb } from "./AppBreadcrumb"
import { CommandPalette } from "./CommandPalette"
import { NotificationCenter } from "./NotificationCenter"

export function AppHeader() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching() > 0
  const [commandOpen, setCommandOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  )

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

  // Escuchar estado online/offline
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Toggle fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      void document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <>
      <header className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md transition-colors sticky top-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors shrink-0" />
          <div className="h-4 w-px bg-border/60 shrink-0" />
          <AppBreadcrumb />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botón Command Palette rápido */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="hidden sm:inline-flex h-8 items-center gap-2 rounded-lg border-border/60 bg-muted/30 px-2.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all"
            title="Abrir paleta de comandos (⌘K)"
          >
            <Search className="size-3.5" />
            <span className="hidden md:inline">Comandos…</span>
            <kbd className="pointer-events-none rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground/80">
              ⌘K
            </kbd>
          </Button>

          {/* Syncing indicator */}
          {isFetching && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[11px] font-medium text-primary ring-1 ring-primary/20 animate-in fade-in-0 duration-200">
              <Loader2 className="size-3 animate-spin text-primary" />
              <span>Sincronizando…</span>
            </div>
          )}

          {/* Offline warning indicator */}
          {!isOnline && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive shadow-2xs animate-pulse">
              <WifiOff className="size-3" />
              <span>Sin conexión</span>
            </div>
          )}

          <RefreshButton
            variant="ghost"
            size="sm"
            tooltip="Sincronizar datos del sistema"
            isRefreshing={isFetching}
            onRefresh={() => queryClient.invalidateQueries()}
            className="size-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
          />

          <NotificationCenter />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex size-8 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>

          <ThemeToggle />

          <div className="h-4 w-px bg-border/60 shrink-0 mx-0.5 hidden sm:block" />

          <div className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90 px-2 py-1 rounded-lg bg-muted/50 border border-border/40">
            <Building2 className="size-3.5 text-amber-500" />
            <span className="font-heading">ENDE Corani S.A.</span>
          </div>

          {isOnline && (
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operativo</span>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Paleta de Comandos */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
