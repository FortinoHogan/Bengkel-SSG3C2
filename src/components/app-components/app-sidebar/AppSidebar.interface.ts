import type { LucideIcon } from "lucide-react"

export interface AppSidebarGroup {
  title?: string
  items: AppSidebarItem[]
  isAdminOnly?: boolean
}

export interface AppSidebarItem {
  icon?: LucideIcon
  title: string
  url?: string
  menus?: AppSidebarMenu[]
}

export interface AppSidebarMenu {
  title: string
  url: string
}
