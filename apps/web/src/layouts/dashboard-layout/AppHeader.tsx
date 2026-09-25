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

import { appConfig } from "@/app/config"
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
      <header className="relative flex h-11 sm:h-12 shrink-0 items-center justify-between gap-2.5 border-b border-border/60 bg-background/95 px-3 sm:px-4 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <SidebarTrigger className="-ml-1 size-7.5 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-md transition-colors shrink-0" />
          <div className="h-3.5 w-px bg-border/60 shrink-0" />
          <AppBreadcrumb />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botón Command Palette rápido */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="group hidden sm:inline-flex h-7.5 items-center gap-2 rounded-md border-border/60 bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:border-border hover:text-foreground transition-colors shadow-none"
            title="Abrir paleta de comandos (⌘K)"
          >
            <Search className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="hidden md:inline">Buscar o comandos…</span>
            <kbd className="pointer-events-none rounded border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          {/* Syncing indicator */}
          {isFetching && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
              <Loader2 className="size-3 animate-spin text-primary" />
              <span>Sincronizando…</span>
            </div>
          )}

          {/* Offline warning indicator */}
          {!isOnline && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
              <WifiOff className="size-3" />
              <span>Sin conexión</span>
            </div>
          )}

          <RefreshButton
            variant="ghost"
            size="sm"
            tooltip="Sincronizar datos"
            isRefreshing={isFetching}
            onRefresh={() => queryClient.invalidateQueries()}
            className="size-7.5 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-md transition-colors"
          />

          <NotificationCenter />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
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
            <span className="tracking-tight text-foreground">{appConfig.companyName}</span>
          </div>

          {isOnline && (
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
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
