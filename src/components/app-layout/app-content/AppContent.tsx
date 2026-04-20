import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContentProps } from './AppContent.interface'
import { routes } from '@/constants/paths'
import { useAuth } from '@/helpers/provider/AuthProvider'
import { Spinner } from '@/components/ui/spinner'

const AppContent = (props: AppContentProps) => {
    const { children, isAdminOnly } = props
    const nav = useNavigate()
    const { profile, loading } = useAuth()
    const isAdmin = profile?.isAdmin

    useEffect(() => {
        if (loading) {
            return
        }

        if (isAdminOnly && !isAdmin) {
            nav(routes.home)
        }
    }, [isAdminOnly, isAdmin, loading, nav])

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><Spinner className="size-10" /></div>
    }

    if (isAdminOnly && !isAdmin) {
        return null
    }

    return (
        <div>{children}</div>
    )
}

export default AppContent