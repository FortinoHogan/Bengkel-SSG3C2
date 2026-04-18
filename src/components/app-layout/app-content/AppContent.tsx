import { useNavigate } from 'react-router-dom'
import { AppContentProps } from './AppContent.interface'
import { routes } from '@/constants/paths'
import { useAuth } from '@/helpers/provider/AuthProvider'

const AppContent = (props: AppContentProps) => {
    const { children, isAdminOnly } = props
    const nav = useNavigate()
    const { profile } = useAuth()
    const isAdmin = profile?.isAdmin

    if (isAdminOnly && !isAdmin) {
        nav(routes.home)
    }

    return (
        <div>{children}</div>
    )
}

export default AppContent