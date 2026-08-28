import type { NavChild, NavItem, NavLeaf } from "@/shared/types/nav.types"

export function flattenNavChildren(children?: NavChild[]): NavLeaf[] {
  if (!children) return []
  return children.flatMap((child) =>
    "items" in child ? child.items : [child],
  )
}

export function getAllNavLeaves(items: NavItem[] = []): NavLeaf[] {
  return items.flatMap((item) => {
    if (!item.children)
      return [{ title: item.title, to: item.to, icon: item.icon }]
    return flattenNavChildren(item.children)
  })
}

export function isPathActive(
  pathname: string,
  to: string,
  allCandidateRoutes?: string[],
) {
  if (to === "/") return pathname === "/"
  if (pathname === to) return true
  if (!pathname.startsWith(`${to}/`)) return false

  if (allCandidateRoutes && allCandidateRoutes.length > 0) {
    const hasMoreSpecificMatch = allCandidateRoutes.some(
      (otherTo) =>
        otherTo !== to &&
        otherTo.length > to.length &&
        (pathname === otherTo || pathname.startsWith(`${otherTo}/`)),
    )
    return !hasMoreSpecificMatch
  }

  return true
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

export function findActiveNavItem(pathname: string, items: NavItem[] = []) {
  return items.find((item) => isNavItemActive(pathname, item)) ?? null
}
