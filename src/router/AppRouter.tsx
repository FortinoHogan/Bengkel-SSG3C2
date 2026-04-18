

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routePaths, routes } from '../constants/paths';
import { RequireAuth } from '@/helpers/provider/RequireAuth';
import AppLayout from '@/components/app-layout/app-siderbar-provider/AppSidebarProvider';
import AuthPage from '@/views/auth-page/AuthPage';
import { RequireGuest } from '@/helpers/provider/RequireGuest';
import NotFoundPage from '@/views/not-found-page/NotFoundPage';

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route element={<RequireGuest />}>
                    <Route path={routes.auth} element={<AuthPage />} />
                </Route>
                <Route element={<RequireAuth />}>
                    <Route element={<AppLayout />}>
                        {routePaths.map(({ path, Component }) => (
                            <Route key={path} path={path} element={<Component />} />
                        ))}
                    </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}
