import { SidebarTrigger } from "@/shared/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-4 md:hidden">
      <SidebarTrigger className="-ml-1" />
    </header>
  )
}
