import type { LucideIcon } from "lucide-react"

export interface AppSidebarGroup {
  title?: string
  items: AppSidebarItem[]
}

export interface AppSidebarItem {
  icon?: LucideIcon
  title: string
  url?: string
  menus?: AppSidebarMenu[]
  isAdminOnly?: boolean
}

export interface AppSidebarMenu {
  title: string
  url: string
}
