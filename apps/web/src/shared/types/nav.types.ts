import type { LucideIcon } from "lucide-react"

import type { routes } from "@/app/config/routes"

type DeepStringValues<T> = T extends string
  ? T
  : { [K in keyof T]: DeepStringValues<T[K]> }[keyof T]

export type AppPath = DeepStringValues<typeof routes>

export type NavLeaf = {
  title: string
  to: AppPath
  icon: LucideIcon
}

export type NavSubGroup = {
  title: string
  icon?: LucideIcon
  items: NavLeaf[]
}

export type NavChild = NavLeaf | NavSubGroup

export type NavItem = {
  title: string
  to: AppPath
  icon: LucideIcon
  children?: NavChild[]
}
