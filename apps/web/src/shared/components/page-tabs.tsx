import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

export type PageTab = {
  label: string
  to: string
}

type PageTabsProps = {
  tabs: PageTab[]
  activeTo: string
  className?: string
}

export function PageTabs({ tabs, activeTo, className }: PageTabsProps) {
  return (
    <nav
      aria-label="Secciones"
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-border",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTo === tab.to

        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
              isActive
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {isActive ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground" />
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
