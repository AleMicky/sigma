import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { Building2 } from "lucide-react"

import { AppBreadcrumb } from "./AppBreadcrumb"

export function AppHeader() {
  return (
    <header className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md transition-all">
      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground shrink-0" />
        <div className="h-4 w-px bg-border/60 shrink-0" />
        <AppBreadcrumb />
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
          <Building2 className="size-3.5 text-amber-500" />
          <span>ENDE Corani S.A.</span>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema Activo</span>
        </div>
      </div>
    </header>
  )
}

