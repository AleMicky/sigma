import { ChevronsUpDown, LogOut, UserRound } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { routes } from "@/app/config"
import { useAuthStore } from "@/app/store/auth.store"
import { useLogout } from "@/modules/auth/api/auth.mutations"
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar"

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function UserMenu() {
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogout()

  const displayName = user?.name ?? "Usuario"
  const subtitle = user?.roles?.[0] ?? "Operador"
  const initials = getInitials(displayName)

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // La sesión local se limpia igual si Keycloak ya invalidó el token.
    } finally {
      await navigate({ to: "/login" })
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={displayName}
                className="group rounded-xl data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-all duration-200"
              />
            }
          >
            <div className="relative shrink-0">
              <Avatar className="size-9 rounded-xl border border-primary/20 shadow-xs transition-transform duration-200 group-hover:scale-105">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-xs font-bold text-white shadow-inner">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar animate-pulse" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                {displayName}
              </span>
              <div className="flex items-center gap-1">
                <span className="inline-block size-1 rounded-full bg-emerald-500" />
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  {subtitle}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70 transition-transform group-hover:text-foreground group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-64 rounded-2xl p-2 shadow-2xl border-border/60 bg-popover/95 backdrop-blur-md"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={10}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-2.5">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-xl border border-primary/20 shadow-xs">
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-xs font-bold text-white">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {displayName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email ?? "usuario@endecorani.bo"}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Conectado con Keycloak</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuGroup className="gap-1">
              <DropdownMenuItem
                className="rounded-xl cursor-pointer text-xs font-medium py-2 px-2.5 hover:bg-sidebar-accent transition-colors"
                onClick={() => void navigate({ to: routes.perfil })}
              >
                <UserRound className="size-4 text-primary shrink-0" />
                <span>Mi perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="rounded-xl cursor-pointer text-xs font-medium py-2 px-2.5 text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => void handleLogout()}
              >
                <LogOut className="size-4 shrink-0" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
