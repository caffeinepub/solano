import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { ShoppingCart, Package, Store, Menu, X, Heart } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCart } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';

interface LayoutProps {
    children: React.ReactNode;
}

function CartBadge() {
    const { identity } = useInternetIdentity();
    const { data: cartItems } = useGetCart();

    if (!identity || !cartItems || cartItems.length === 0) return null;

    return (
        <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
            {cartItems.length > 9 ? '9+' : cartItems.length}
        </span>
    );
}

function NavLink({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

    return (
        <Link
            to={to}
            className={`relative font-body font-medium text-sm transition-colors duration-200 ${
                isActive
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
            } ${className}`}
        >
            {children}
            {isActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
        </Link>
    );
}

export default function Layout({ children }: LayoutProps) {
    const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
    const queryClient = useQueryClient();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const isAuthenticated = !!identity;
    const isLoggingIn = loginStatus === 'logging-in';

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
            queryClient.clear();
        } else {
            try {
                await login();
            } catch (error: unknown) {
                const err = error as Error;
                if (err?.message === 'User is already authenticated') {
                    await clear();
                    setTimeout(() => login(), 300);
                }
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm shadow-nav border-b border-border">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <img
                                src="/assets/generated/solano7m-logo.dim_320x80.png"
                                alt="Solano7m"
                                className="h-9 w-auto object-contain"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = 'none';
                                    const sibling = target.nextElementSibling as HTMLElement;
                                    if (sibling) sibling.style.display = 'block';
                                }}
                            />
                            <span
                                className="font-display font-bold text-xl text-primary hidden"
                                style={{ display: 'none' }}
                            >
                                Solano7m
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            <NavLink to="/catalog">
                                <span className="flex items-center gap-1.5">
                                    <Store className="w-4 h-4" />
                                    Shop
                                </span>
                            </NavLink>
                            {isAuthenticated && (
                                <>
                                    <NavLink to="/orders">
                                        <span className="flex items-center gap-1.5">
                                            <Package className="w-4 h-4" />
                                            Orders
                                        </span>
                                    </NavLink>
                                </>
                            )}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated && (
                                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-accent transition-colors">
                                    <ShoppingCart className="w-5 h-5 text-foreground/80" />
                                    <CartBadge />
                                </Link>
                            )}

                            <Button
                                onClick={handleAuth}
                                disabled={isLoggingIn || isInitializing}
                                variant={isAuthenticated ? 'outline' : 'default'}
                                size="sm"
                                className="hidden md:flex font-body"
                            >
                                {isLoggingIn ? 'Signing in…' : isAuthenticated ? 'Sign Out' : 'Sign In'}
                            </Button>

                            {/* Mobile menu toggle */}
                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3 animate-fade-in">
                        <Link
                            to="/catalog"
                            className="flex items-center gap-2 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Store className="w-4 h-4" /> Shop
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/cart"
                                    className="flex items-center gap-2 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ShoppingCart className="w-4 h-4" /> Cart
                                </Link>
                                <Link
                                    to="/orders"
                                    className="flex items-center gap-2 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Package className="w-4 h-4" /> Orders
                                </Link>
                            </>
                        )}
                        <div className="pt-2 border-t border-border">
                            <Button
                                onClick={() => { handleAuth(); setMobileMenuOpen(false); }}
                                disabled={isLoggingIn || isInitializing}
                                variant={isAuthenticated ? 'outline' : 'default'}
                                size="sm"
                                className="w-full font-body"
                            >
                                {isLoggingIn ? 'Signing in…' : isAuthenticated ? 'Sign Out' : 'Sign In'}
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-charcoal-700 text-cream-200 mt-16">
                <div className="container mx-auto px-4 sm:px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="font-display text-lg font-semibold text-cream-100 mb-3">Solano7m</h3>
                            <p className="text-sm text-cream-300 leading-relaxed">
                                Curated products with a passion for quality and style. Discover your next favorite thing.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-body font-semibold text-cream-100 mb-3 text-sm uppercase tracking-wider">Shop</h4>
                            <ul className="space-y-2 text-sm text-cream-300">
                                <li><Link to="/catalog" className="hover:text-cream-100 transition-colors">All Products</Link></li>
                                <li><Link to="/cart" className="hover:text-cream-100 transition-colors">Shopping Cart</Link></li>
                                <li><Link to="/orders" className="hover:text-cream-100 transition-colors">Order History</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-body font-semibold text-cream-100 mb-3 text-sm uppercase tracking-wider">Account</h4>
                            <ul className="space-y-2 text-sm text-cream-300">
                                <li><Link to="/orders" className="hover:text-cream-100 transition-colors">My Orders</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-charcoal-500 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-cream-400">
                            © {new Date().getFullYear()} Solano7m. All rights reserved.
                        </p>
                        <p className="text-xs text-cream-400 flex items-center gap-1">
                            Built with <Heart className="w-3 h-3 fill-terracotta-400 text-terracotta-400" /> using{' '}
                            <a
                                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'solano7m')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-terracotta-300 hover:text-terracotta-200 transition-colors"
                            >
                                caffeine.ai
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
