import { sidebarMenu } from "@/constants/SidebarMenu"
import type { AppSidebarGroup } from "./AppSidebar.interface"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarFooter,
    useSidebar,
    SidebarHeader,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Link, useLocation } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, ChevronsUpDown, Hammer, LogOut } from "lucide-react"
import { useAuth } from "@/helpers/provider/AuthProvider"
import { useEffect, useState } from "react"
import { BengkelService } from "@/helpers/services/BengkelService"
import { routes } from "@/constants/paths"
import AppModal from "../app-modal/AppModal"

export function AppSidebar() {
    const location = useLocation()
    const { isMobile } = useSidebar()
    const { user, profile, handleLogoutAuth } = useAuth();
    const [bengkelList, setBengkelList] = useState<{ id: number; name: string }[]>([]);
    const [isShowError, setIsShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const filteredMenu = sidebarMenu
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !item.isAdminOnly || profile?.isAdmin),
        }))
        .filter((group) => group.items.length > 0)

    const bengkelGroup: AppSidebarGroup | null = bengkelList.length
        ? {
            title: "Bengkel",
            items: bengkelList.map((bengkel) => ({
                icon: Hammer,
                title: bengkel.name,
                menus: [
                    {
                        title: "Bengkel List",
                        url: routes.bengkel.replace(":id", String(bengkel.id)),
                    },
                    {
                        title: "Env Management",
                        url: routes.environmentManagement.replace(":id", String(bengkel.id)),
                    },
                ],
            })),
        }
        : null

    const allMenuGroups = bengkelGroup ? [...filteredMenu, bengkelGroup] : filteredMenu

    const handleLogout = () => {
        handleLogoutAuth();
    }

    const fetchBengkels = async () => {
        const res = await BengkelService.getMasterBengkelList();
        if (res.error) {
            setIsShowError(true);
            setErrorMessage(res.error || "Failed to fetch bengkel data.");
        } else if (res.data && res.data.length > 0) {
            setBengkelList(res.data.map((b) => ({ id: b.bengkelId, name: b.bengkelName })));
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
                {allMenuGroups.map((group, groupIndex) => (
                    <SidebarGroup key={group.title ?? `sidebar-group-${groupIndex}`}>
                        {group.title && (
                            <SidebarGroupLabel>
                                {group.title}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const hasSubMenus = Boolean(item.menus?.length)
                                    const isActive = item.url
                                        ? location.pathname === item.url
                                        : item.menus?.some((menu) => location.pathname === menu.url) ?? false

                                    if (hasSubMenus) {
                                        return (
                                            <Collapsible
                                                key={item.title}
                                                defaultOpen={isActive}
                                                asChild
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton isActive={isActive}>
                                                            {item.icon && <item.icon className="h-4 w-4" />}
                                                            <span>{item.title}</span>
                                                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.menus?.map((menu) => (
                                                                <SidebarMenuSubItem key={menu.url}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={location.pathname === menu.url}
                                                                    >
                                                                        <Link to={menu.url}>{menu.title}</Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        )
                                    }

                                    if (!item.url) {
                                        return null
                                    }

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={isActive}>
                                                <Link to={item.url}>
                                                    {item.icon && <item.icon className="h-4 w-4" />}
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