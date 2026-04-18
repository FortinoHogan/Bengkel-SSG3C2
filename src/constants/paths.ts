import AddUserPage from "@/views/manage-user-page/ManageUserPage"
import AuthPage from "@/views/auth-page/AuthPage"
import BengkelPage from "@/views/bengkel-page/BengkelPage"
import HomePage from "@/views/home-page/HomePage"

export const routes = {
  home: "/",
  auth: "/auth",
  bengkel: "/bengkel/:id",
  manageUser: "/manage-user",
}

export const routePaths = [
  { path: routes.home, Component: HomePage },
  { path: routes.auth, Component: AuthPage },
  { path: routes.bengkel, Component: BengkelPage },
  { path: routes.manageUser, Component: AddUserPage },
]
