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
      <SidebarProvider className="h-svh overflow-hidden bg-background">
        <AppSidebar />
        <SidebarInset className="min-h-0 overflow-hidden bg-background">
          <AppHeader />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/15">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
