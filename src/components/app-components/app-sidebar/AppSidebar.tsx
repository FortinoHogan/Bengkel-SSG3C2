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

    const filteredMenu = sidebarMenu.filter(group => !group.isAdminOnly || profile?.isAdmin);

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
                                    const isActive = location.pathname === item.url
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={isActive}>
                                                <Link to={item.url}>
                                                    {group.icon && <group.icon className="h-4 w-4" />}
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

                {bengkelList.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Bengkel</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {bengkelList.map((bengkel) => {
                                    const listUrl = routes.bengkel.replace(":id", String(bengkel.id))
                                    const mgmtUrl = routes.environmentManagement.replace(":id", String(bengkel.id))
                                    const isOpen =
                                        location.pathname === listUrl ||
                                        location.pathname === mgmtUrl

                                    return (
                                        <Collapsible key={bengkel.id} defaultOpen={isOpen} asChild className="group/collapsible">
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton>
                                                        <Hammer className="h-4 w-4" />
                                                        <span>{bengkel.name}</span>
                                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        <SidebarMenuSubItem>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={location.pathname === listUrl}
                                                            >
                                                                <Link to={listUrl}>Bengkel List</Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                        <SidebarMenuSubItem>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={location.pathname === mgmtUrl}
                                                            >
                                                                <Link to={mgmtUrl}>Env Management</Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
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