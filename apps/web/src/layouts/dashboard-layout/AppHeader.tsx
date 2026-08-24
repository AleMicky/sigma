import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { Building2 } from "lucide-react"

import { RefreshButton } from "@/shared/components/refresh-button"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"

import { AppBreadcrumb } from "./AppBreadcrumb"

export function AppHeader() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching() > 0

  return (
    <header className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground shrink-0" />
        <div className="h-4 w-px bg-border/60 shrink-0" />
        <AppBreadcrumb />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <RefreshButton
          variant="ghost"
          size="sm"
          tooltip="Sincronizar datos del sistema"
          isRefreshing={isFetching}
          onRefresh={() => queryClient.invalidateQueries()}
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
        />

        <ThemeToggle />

        <div className="h-4 w-px bg-border/60 shrink-0 mx-0.5 hidden sm:block" />

        <div className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90 px-1.5 py-1 rounded-md bg-muted/40">
          <Building2 className="size-3.5 text-amber-500" />
          <span className="font-heading">ENDE Corani S.A.</span>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema Operativo</span>
        </div>
      </div>
    </header>
  )
}


