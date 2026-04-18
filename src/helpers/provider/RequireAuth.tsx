import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { routes } from "@/constants/paths"
import { supabase } from "../supabase/client"
import { Spinner } from "@/components/ui/spinner"

export function RequireAuth() {
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session)
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner className="size-10" /></div>

    if (!isAuthenticated) {
        return <Navigate to={routes.auth} replace />
    }

    return <Outlet />
}