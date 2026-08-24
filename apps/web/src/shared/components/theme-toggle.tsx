import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"

interface ThemeToggleProps {
  className?: string
  align?: "start" | "center" | "end"
  variant?: "ghost" | "outline" | "secondary"
  size?: "sm" | "default" | "icon" | "icon-sm"
}

const emptySubscribe = () => () => {}

export function ThemeToggle({
  className,
  align = "end",
  variant = "ghost",
  size = "icon-sm",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )


  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("size-8 rounded-lg text-muted-foreground", className)}
        disabled
      >
        <Sun className="size-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant={variant}
                  size={size}
                  className={cn(
                    "relative size-8 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-accent/80 active:scale-95",
                    className
                  )}
                  aria-label="Cambiar tema visual"
                />
              }
            >
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
              <span className="sr-only">Cambiar tema</span>
            </DropdownMenuTrigger>
          }
        >
          <span>Tema ({theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"})</span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          Tema: {theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align={align} className="min-w-36 rounded-xl p-1 shadow-xl border-border/70 backdrop-blur-md">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors",
            theme === "light" && "bg-primary/10 text-primary font-semibold"
          )}
        >
          <Sun className="size-3.5 text-amber-500" />
          <span>Claro</span>
          {theme === "light" && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors",
            theme === "dark" && "bg-primary/10 text-primary font-semibold"
          )}
        >
          <Moon className="size-3.5 text-sky-400" />
          <span>Oscuro</span>
          {theme === "dark" && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors",
            theme === "system" && "bg-primary/10 text-primary font-semibold"
          )}
        >
          <Monitor className="size-3.5 text-muted-foreground" />
          <span>Sistema</span>
          {theme === "system" && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
