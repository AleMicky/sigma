import {
  FileCheck,
  History,
  Layers,
  Sliders,
  UserCheck,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"

import type { TabType } from "./types"

type ActivoDetailTabsProps = {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  documentosCount: number
  accesoriosCount: number
  mantenimientosCount: number
}

export function ActivoDetailTabs({
  activeTab,
  onTabChange,
  documentosCount,
  accesoriosCount,
  mantenimientosCount,
}: ActivoDetailTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/70 pt-1 pb-1 no-scrollbar">
      <button
        type="button"
        onClick={() => onTabChange("informacion")}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
          activeTab === "informacion"
            ? "bg-primary/10 text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <Sliders className="size-3.5" />
        <span>Información</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("documentacion")}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
          activeTab === "documentacion"
            ? "bg-primary/10 text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <FileCheck className="size-3.5" />
        <span>Documentación</span>
        <span className="size-5 rounded-full bg-primary/15 text-primary text-[10px] inline-flex items-center justify-center font-bold">
          {documentosCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("accesorios")}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
          activeTab === "accesorios"
            ? "bg-primary/10 text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <Layers className="size-3.5" />
        <span>Accesorios</span>
        <span className="size-5 rounded-full bg-primary/15 text-primary text-[10px] inline-flex items-center justify-center font-bold">
          {accesoriosCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("asignacion")}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
          activeTab === "asignacion"
            ? "bg-primary/10 text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <UserCheck className="size-3.5" />
        <span>Asignación</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("historial")}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
          activeTab === "historial"
            ? "bg-primary/10 text-primary border-b-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <History className="size-3.5" />
        <span>Historial</span>
        <span className="size-5 rounded-full bg-muted text-muted-foreground text-[10px] inline-flex items-center justify-center font-bold">
          {mantenimientosCount}
        </span>
      </button>
    </div>
  )
}
