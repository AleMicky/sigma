import type { NavItem, NavLeaf, NavNode, NavSection } from "@/shared/types/nav.types"

export function isPathActive(
  pathname: string,
  to?: string,
  allCandidateRoutes?: string[],
): boolean {
  if (!to) return false
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

export function isNavNodeActive(pathname: string, node: NavNode): boolean {
  if (node.to && isPathActive(pathname, node.to)) return true
  if (node.children && node.children.length > 0) {
    return node.children.some((child) => isNavNodeActive(pathname, child))
  }
  return false
}

export function isNavSectionActive(
  pathname: string,
  section: NavSection,
): boolean {
  if (section.to && isPathActive(pathname, section.to)) return true
  if (section.children && section.children.length > 0) {
    return section.children.some((child) => isNavNodeActive(pathname, child))
  }
  return false
}

export function flattenNavNodeLeaves(node: NavNode): NavLeaf[] {
  if (!node.children || node.children.length === 0) {
    if (node.to && node.icon) {
      return [{ title: node.title, to: node.to, icon: node.icon }]
    }
    return []
  }
  return node.children.flatMap(flattenNavNodeLeaves)
}

export function flattenNavChildren(children?: NavNode[]): NavLeaf[] {
  if (!children || children.length === 0) return []
  return children.flatMap(flattenNavNodeLeaves)
}

export function getAllNavLeaves(items: NavItem[] = []): NavLeaf[] {
  return items.flatMap((item) => {
    if (item.children && item.children.length > 0) {
      return item.children.flatMap(flattenNavNodeLeaves)
    }
    if (item.to && item.icon) {
      return [{ title: item.title, to: item.to, icon: item.icon }]
    }
    return []
  })
}


export function isNavItemActive(pathname: string, item: NavItem): boolean {
  return isNavSectionActive(pathname, item)
}

export function findActiveNavItem(pathname: string, items: NavItem[] = []) {
  return items.find((item) => isNavItemActive(pathname, item)) ?? null
}

