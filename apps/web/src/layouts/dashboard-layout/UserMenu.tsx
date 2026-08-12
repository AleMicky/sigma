import { ChevronsUpDown, LogOut, UserRound, ShieldCheck } from "lucide-react"
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
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground hover:bg-sidebar-accent/70 transition-colors"
              />
            }
          >
            <div className="relative shrink-0">
              <Avatar className="size-8.5 rounded-lg border border-border/60 shadow-2xs">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-[11px] font-bold text-white">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
            </div>
            <span className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-foreground">{displayName}</span>
              <span className="truncate text-[11px] font-medium text-muted-foreground">
                {subtitle}
              </span>
            </span>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-60 rounded-xl p-1.5 shadow-xl border-border/60"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={10}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 rounded-lg border border-border/60">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-bold text-white">
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
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-3" />
                      <span>Sesión Activa</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuGroup className="gap-1">
              <DropdownMenuItem
                className="rounded-lg cursor-pointer text-xs font-medium py-2"
                onClick={() => void navigate({ to: routes.perfil })}
              >
                <UserRound className="size-4 text-muted-foreground" />
                <span>Mi perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="rounded-lg cursor-pointer text-xs font-medium py-2"
                onClick={() => void handleLogout()}
              >
                <LogOut className="size-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
