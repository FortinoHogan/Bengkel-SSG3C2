import type { AppSidebarGroup } from "@/components/app-components/app-sidebar/AppSidebar.interface"
import { House, User, Wrench } from "lucide-react"
import { routes } from "./paths"

export const sidebarMenu: AppSidebarGroup[] = [
  {
    title: "Dashboard",
    items: [
      {
        icon: House,
        title: "Home",
        url: routes.home,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        icon: User,
        title: "Manage User",
        url: routes.manageUser,
      },
      {
        icon: Wrench,
        title: "Manage Bengkel",
        url: routes.manageBengkel,
      },
    ],
    isAdminOnly: true,
  },
]
