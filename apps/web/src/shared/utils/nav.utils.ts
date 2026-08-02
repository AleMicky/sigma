import { navItems } from "@/app/config/nav.config"

export function isPathActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function findActiveNavItem(pathname: string) {
  return (
    navItems.find(
      (item) =>
        item.children?.some((child) => isPathActive(pathname, child.to)) ||
        (item.children && isPathActive(pathname, item.to)),
    ) ?? null
  )
}
