import AppContent from "@/components/app-layout/app-content/AppContent"

const HomePage = () => {
    return (
        <AppContent>
            <h1 className="mb-2  scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                Home Page
            </h1>
            <p className="text-muted-foreground">{`Welcome to Bengkel SSG3C2 (cuma iseng ya ges maapkan kalo masih ngebug)`}</p>
        </AppContent>
    )
}

export default HomePage