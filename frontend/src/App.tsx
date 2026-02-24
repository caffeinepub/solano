import React from 'react';
import {
    createRouter,
    createRoute,
    createRootRoute,
    RouterProvider,
    Outlet,
} from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminPage from './pages/AdminPage';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';

// Root layout component
function RootLayout() {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

    const isAuthenticated = !!identity;
    const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

    return (
        <Layout>
            <Outlet />
            <ProfileSetupModal open={showProfileSetup} />
        </Layout>
    );
}

// Route definitions
const rootRoute = createRootRoute({
    component: RootLayout,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: HomePage,
});

const catalogRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/catalog',
    component: CatalogPage,
});

const productDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/product/$id',
    component: ProductDetailPage,
});

const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cart',
    component: CartPage,
});

const checkoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/checkout',
    component: CheckoutPage,
});

const orderSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/order-success/$orderId',
    component: OrderSuccessPage,
});

const ordersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/orders',
    component: OrderHistoryPage,
});

const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminPage,
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    catalogRoute,
    productDetailRoute,
    cartRoute,
    checkoutRoute,
    orderSuccessRoute,
    ordersRoute,
    adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <RouterProvider router={router} />
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    );
}
