import AddUserPage from "@/views/manage-user-page/ManageUserPage"
import AuthPage from "@/views/auth-page/AuthPage"
import BengkelPage from "@/views/bengkel-page/BengkelPage"
import BengkelManagementPage from "@/views/manage-bengkel-page/ManageBengkelPage"
import HomePage from "@/views/home-page/HomePage"
import EnvironmentManagementPage from "@/views/environment-management-page/EnvironmentManagementPage"

export const routes = {
  home: "/",
  auth: "/auth",
  bengkel: "/bengkel/:id",
  environmentManagement: "/bengkel/:id/environment",
  manageBengkel: "/manage-bengkel",
  manageUser: "/manage-user",
}

export const routePaths = [
  { path: routes.home, Component: HomePage },
  { path: routes.auth, Component: AuthPage },
  { path: routes.bengkel, Component: BengkelPage },
  { path: routes.environmentManagement, Component: EnvironmentManagementPage },
  { path: routes.manageBengkel, Component: BengkelManagementPage },
  { path: routes.manageUser, Component: AddUserPage },
]
