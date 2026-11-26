import { createElement } from "react"
import { type LucideProps } from "lucide-react"

import { resolveLucideIcon } from "../lib/menu-icons"

type DynamicLucideIconProps = LucideProps & {
  name?: string | null
  fallback?: React.ComponentType<LucideProps> | null
}

export function DynamicLucideIcon({
  name,
  fallback = null,
  ...props
}: DynamicLucideIconProps) {
  const IconComponent = resolveLucideIcon(name)

  if (!IconComponent) {
    if (!fallback) return null
    return createElement(fallback, props)
  }

  return createElement(IconComponent, props)
}
