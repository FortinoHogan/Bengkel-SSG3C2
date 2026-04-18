import type { LucideIcon } from "lucide-react"

export interface AppSidebarGroup {
  title?: string
  icon?: LucideIcon
  items: AppSidebarItem[]
  isAdminOnly?: boolean
}

export interface AppSidebarItem {
  title: string
  url: string
}
