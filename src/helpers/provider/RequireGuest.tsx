import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/helpers/provider/AuthProvider"
import { routes } from "@/constants/paths"
import { Spinner } from "@/components/ui/spinner"

export function RequireGuest() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner className="size-10"/></div>

  if (user) {
    return <Navigate to={routes.home} replace />
  }

  return <Outlet />
}