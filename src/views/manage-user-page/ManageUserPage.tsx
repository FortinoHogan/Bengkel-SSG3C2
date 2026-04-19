import AppContent from "@/components/app-layout/app-content/AppContent"

const ManageUserPage = () => {
    return (
        <AppContent isAdminOnly>
            <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                Manage User
            </h1>
            <p className="text-muted-foreground">Ini page buat tambahin acccess user</p>
        </AppContent>
    )
}

export default ManageUserPage