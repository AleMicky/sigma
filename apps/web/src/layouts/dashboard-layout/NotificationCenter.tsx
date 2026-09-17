import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Info,
  Trash2,
  Wrench,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

export type NotificationType = "approval" | "maintenance" | "system" | "warning"
export type NotificationPriority = "critical" | "warning" | "info"

export interface SystemNotification {
  id: string
  title: string
  description: string
  timeAgo: string
  type: NotificationType
  priority: NotificationPriority
  read: boolean
  to?: string
}

export function NotificationCenter({
  initialNotifications = [],
}: {
  initialNotifications?: SystemNotification[]
} = {}) {
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications)
  const [filter, setFilter] = useState<"all" | "unread" | "maintenance">("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    if (filter === "maintenance") return n.type === "maintenance" || n.type === "approval"
    return true
  })

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function deleteNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function clearAll() {
    setNotifications([])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Abrir centro de notificaciones"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 rounded-2xl p-0 shadow-2xl border-border/60 bg-popover/95 backdrop-blur-md overflow-hidden animate-in fade-in-0 zoom-in-95"
      >
        {/* Cabecera del Centro de Notificaciones */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground font-heading">
              Centro de Avisos
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {unreadCount} {unreadCount === 1 ? "nuevo" : "nuevos"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="size-3" />
                <span>Leídas</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-1 border-b border-border/40 px-3 py-1.5 bg-muted/10 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              filter === "all"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todas ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              filter === "unread"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            No leídas ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("maintenance")}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              filter === "maintenance"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Mantenimiento
          </button>
        </div>

        {/* Lista de Notificaciones con scroll */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/30 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center px-4">
              <CheckCircle2 className="size-8 text-muted-foreground/30" />
              <p className="text-xs font-medium text-muted-foreground">
                No tienes notificaciones pendientes
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon =
                item.type === "approval"
                  ? FileText
                  : item.type === "maintenance"
                    ? Wrench
                    : item.priority === "critical"
                      ? AlertCircle
                      : Info

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex items-start gap-3 p-3 transition-colors hover:bg-muted/40",
                    !item.read && "bg-primary/4 dark:bg-primary/6",
                  )}
                >
                  {/* Icono temático */}
                  <div
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs",
                      item.priority === "critical"
                        ? "bg-destructive/15 text-destructive"
                        : item.priority === "warning"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-primary/15 text-primary",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          "truncate text-xs text-foreground",
                          !item.read ? "font-bold" : "font-medium",
                        )}
                      >
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground/70">
                      <div className="flex items-center gap-1">
                        <Clock className="size-2.5" />
                        <span>{item.timeAgo}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.to && (
                          <Link
                            to={item.to}
                            onClick={() => markAsRead(item.id)}
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            <span>Ir al módulo</span>
                            <ExternalLink className="size-2.5" />
                          </Link>
                        )}
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(item.id)}
                            className="text-muted-foreground hover:text-foreground font-medium"
                          >
                            Leída
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 bg-muted/20 text-[11px]">
            <span className="text-muted-foreground">
              {notifications.length} avisos registrados
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive font-medium transition-colors"
            >
              Limpiar historial
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
