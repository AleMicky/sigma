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
  const subtitle = user?.roles?.[0] ?? "Organización"
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
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-full">
              <AvatarFallback className="rounded-full bg-muted text-xs font-medium">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {subtitle}
              </span>
            </span>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="start"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1 px-0.5">
                  <span className="truncate text-sm font-medium">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => void navigate({ to: routes.perfil })}
              >
                <UserRound />
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => void handleLogout()}
              >
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
