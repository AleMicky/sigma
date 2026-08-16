import { navItems } from "@/app/config/nav.config"
import type { NavChild, NavItem, NavLeaf } from "@/shared/types/nav.types"

export function isPathActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function flattenNavChildren(children?: NavChild[]): NavLeaf[] {
  if (!children) return []
  return children.flatMap((child) =>
    "items" in child ? child.items : [child]
  )
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (isPathActive(pathname, item.to)) return true
  if (item.children) {
    return item.children.some((child) => {
      if ("items" in child) {
        return child.items.some((subItem) => isPathActive(pathname, subItem.to))
      }
      return isPathActive(pathname, child.to)
    })
  }
  return false
}

export function findActiveNavItem(pathname: string) {
  return navItems.find((item) => isNavItemActive(pathname, item)) ?? null
}
