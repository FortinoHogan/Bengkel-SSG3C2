import { sidebarMenu } from "@/constants/SidebarMenu"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    useSidebar,
    SidebarHeader,
} from "@/components/ui/sidebar"

import { Link, useLocation } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronsUpDown, Hammer, LogOut } from "lucide-react"
import { useAuth } from "@/helpers/provider/AuthProvider"
import { useEffect, useState } from "react"
import { BengkelService } from "@/helpers/services/BengkelService"
import { AppSidebarGroup } from "./AppSidebar.interface"
import { routes } from "@/constants/paths"
import AppModal from "../app-modal/AppModal"

export function AppSidebar() {
    const location = useLocation()
    const { isMobile } = useSidebar()
    const { user, profile, handleLogoutAuth } = useAuth();
    const [bengkelMenu, setBengkelMenu] = useState<AppSidebarGroup>();
    const [isShowError, setIsShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const filteredMenu = [
        ...sidebarMenu.filter(group => !group.isAdminOnly || profile?.isAdmin),
        ...(bengkelMenu ? [bengkelMenu] : [])
    ];

    const handleLogout = () => {
        handleLogoutAuth();
    }

    const fetchBengkels = async () => {
        const res = await BengkelService.getMasterBengkelList();
        if (res.error) {
            setIsShowError(true);
            setErrorMessage(res.error || "Failed to fetch bengkel data.");
        } else if (res.data && res.data.length > 0) {
            setBengkelMenu({
                title: "Bengkel",
                icon: Hammer,
                items: res.data.map((bengkel) => ({
                    title: bengkel.bengkelName,
                    url: routes.bengkel.replace(":id", String(bengkel.bengkelId)),
                }))
            });
        }
    }

    useEffect(() => {
        fetchBengkels()
    }, []);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className=" data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Hammer className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">Bengkel SSG3C2</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {filteredMenu.map((group) => (
                    <SidebarGroup key={group.title}>
                        {group.title && (
                            <SidebarGroupLabel>
                                {group.title}
                            </SidebarGroupLabel>
                        )}

                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive =
                                        location.pathname === item.url

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                            >
                                                <Link to={item.url}>
                                                    {group.icon && (
                                                        <group.icon className="h-4 w-4" />
                                                    )}
                                                    {item.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="rounded-full">
                                            <img src="/assets/img/avatar.png" alt="" className="object-contain w-full h-full rounded-full" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="rounded-full">
                                                <img src="/assets/img/avatar.png" alt="" className="object-contain w-full h-full rounded-full" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{user.name}</span>
                                            <span className="truncate text-xs">{user.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { handleLogout() }}>
                                    <LogOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <AppModal
                open={isShowError}
                title="Error"
                description={errorMessage}
                onClose={() => { setIsShowError(false); setErrorMessage(""); }}
                onSubmit={() => { setIsShowError(false); setErrorMessage(""); }}
            />
        </Sidebar>
    )
}