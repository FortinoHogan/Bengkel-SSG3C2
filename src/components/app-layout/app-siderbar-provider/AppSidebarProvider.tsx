import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-components/app-sidebar/AppSidebar"
import AppThemeSwitcher from "../app-theme-switcher/AppThemeSwitcher"

export default function AppSidebarProvider() {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen">
                <AppSidebar />
                <main className="flex-1">
                    <div className="flex items-center justify-between mr-4">
                        <div className="p-2 flex items-center gap-2">
                            <SidebarTrigger />
                            <Separator orientation="vertical" />
                        </div>
                        <AppThemeSwitcher />
                    </div>
                    <Separator />

                    <div className="p-4">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}