import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

export type FormSectionProps = {
  step?: number | string
  title: string
  description?: string
  icon?: LucideIcon | ReactNode
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  columns?: 1 | 2 | 3 | 4
}

export function FormSection({
  step,
  title,
  description,
  icon: Icon,
  badge,
  action,
  children,
  className,
  contentClassName,
  columns = 2,
}: FormSectionProps) {
  const gridColsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : columns === 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  const renderIcon = () => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      const LucideComp = Icon as LucideIcon
      return <LucideComp className="size-4 text-primary shrink-0" />
    }
    return <span className="shrink-0">{Icon}</span>
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 sm:p-5 md:p-6 shadow-2xs transition-colors",
        className,
      )}
    >
      {/* Encabezado de la Sección */}
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3.5 mb-4 sm:mb-5">
        <div className="flex items-start gap-2.5 min-w-0">
          {step !== undefined && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-mono">
              {step}
            </span>
          )}

          {renderIcon()}

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold tracking-tight text-foreground font-heading">
                {title}
              </h3>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Contenido del Formulario en Grid Responsivo */}
      <div className={cn("grid gap-4 sm:gap-5", gridColsClass, contentClassName)}>
        {children}
      </div>
    </section>
  )
}
