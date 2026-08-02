import type { PropsWithChildren } from "react"

import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { TooltipProvider } from "@/shared/components/ui/tooltip"

import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden">
          <AppHeader />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
