import type { ReactNode } from "react"

import { SearchField } from "@/shared/components/search-field"
import { cn } from "@/shared/lib/utils"

type MasterPanelShellProps = {
  label: string
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchAriaLabel: string
  children: ReactNode
  footer?: ReactNode
  fill?: boolean
}

export function MasterPanelShell({
  label,
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  children,
  footer,
  fill = true,
}: MasterPanelShellProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col border-b md:border-r md:border-b-0",
        fill && "h-full min-h-0 overflow-hidden",
      )}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b px-3 py-3 sm:px-4">
        <p className="hidden text-xs font-medium tracking-wide text-muted-foreground uppercase md:block">
          {label}
        </p>
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
        />
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col",
          fill && "min-h-0 overflow-hidden",
        )}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}

type DetailPanelShellProps = {
  hasSelection: boolean
  emptySelectionMessage: string
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  fill?: boolean
}

export function DetailPanelShell({
  hasSelection,
  emptySelectionMessage,
  header,
  children,
  footer,
  fill = true,
}: DetailPanelShellProps) {
  if (!hasSelection) {
    return (
      <div
        className={cn(
          "flex w-full flex-1 items-center justify-center p-6 sm:p-8",
          fill && "h-full min-h-0 overflow-hidden",
        )}
      >
        <p className="text-center text-sm text-muted-foreground">
          {emptySelectionMessage}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col",
        fill && "h-full min-h-0 overflow-hidden",
      )}
    >
      {header}
      <div
        className={cn("flex flex-1 flex-col", fill && "min-h-0 overflow-hidden")}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}

type DetailPanelHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder: string
    "aria-label": string
  }
}

export function DetailPanelHeader({
  title,
  subtitle,
  meta,
  action,
  search,
}: DetailPanelHeaderProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-2">
          <div className="min-w-0 flex flex-col gap-0.5">
            <h2 className="hidden truncate text-base font-semibold tracking-tight md:block">
              {title}
            </h2>
            {subtitle}
          </div>
          {meta}
        </div>
        {action}
      </div>
      {search ? (
        <SearchField
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          aria-label={search["aria-label"]}
        />
      ) : null}
    </div>
  )
}
