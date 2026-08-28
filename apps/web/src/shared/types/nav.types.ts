import type { LucideIcon } from "lucide-react"

import type { routes } from "@/app/config/routes"

type DeepStringValues<T> = T extends string
  ? T
  : { [K in keyof T]: DeepStringValues<T[K]> }[keyof T]

export type AppPath = DeepStringValues<typeof routes> | (string & {})

export interface NavNode {
  id?: string
  title: string
  to?: string
  icon?: LucideIcon
  children?: NavNode[]
  badge?: string | number
  order?: number
}

export interface NavSection {
  id?: string
  title: string
  code?: string
  to?: string
  icon?: LucideIcon
  children?: NavNode[]
  order?: number
}

export type NavLeaf = {
  title: string
  to: string
  icon: LucideIcon
}

export type NavSubGroup = {
  title: string
  icon?: LucideIcon
  items: NavLeaf[]
}

export type NavChild = NavNode
export type NavItem = NavSection

