import type { AppSidebarGroup } from "@/components/app-components/app-sidebar/AppSidebar.interface"
import { House, User } from "lucide-react"
import { routes } from "./paths"

export const sidebarMenu: AppSidebarGroup[] = [
  {
    title: "Dashboard",
    icon: House,
    items: [
      { title: "Home", url: routes.home },
    ],
  },
  {
    title: "Management",
    icon: User,
    items: [
      { title: "Manage User", url: routes.manageUser },
      { title: "Manage Bengkel", url: routes.manageBengkel },
    ],
    isAdminOnly: true,
  }
]
