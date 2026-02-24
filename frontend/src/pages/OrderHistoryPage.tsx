import React from 'react';
import { Link } from '@tanstack/react-router';
import { Package, ShoppingBag, Clock, CheckCircle, Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useGetOrders, useListProducts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { StoreOrder } from '../backend';

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
        pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
        processing: { variant: 'default', icon: <Loader className="w-3 h-3 animate-spin" /> },
        completed: { variant: 'outline', icon: <CheckCircle className="w-3 h-3" /> },
        cancelled: { variant: 'destructive', icon: null },
    };
    const config = variants[status.toLowerCase()] || variants.pending;

    return (
        <Badge variant={config.variant} className="font-body text-xs gap-1 capitalize">
            {config.icon}
            {status}
        </Badge>
    );
}

function OrderCard({ order, products }: { order: StoreOrder; products: ReturnType<typeof useListProducts>['data'] }) {
    const date = new Date(Number(order.timestamp) / 1_000_000);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-accent/40 border-b border-border">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-foreground">Order #{order.orderId.toString()}</span>
                        <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs font-body text-muted-foreground mt-0.5">
                        {formattedDate} at {formattedTime}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-body text-muted-foreground">Total</p>
                    <p className="font-display font-bold text-xl text-primary">
                        ${(Number(order.total) / 100).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4 space-y-3">
                {order.items.map((item, idx) => {
                    const product = products?.find((p) => p.id === item.productId);
                    const itemPrice = Number(item.price) / 100;
                    const lineTotal = itemPrice * Number(item.quantity);

                    return (
                        <div key={idx} className="flex items-center justify-between text-sm font-body">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-accent border border-border/50 shrink-0 overflow-hidden">
                                    {product?.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-foreground/80 line-clamp-1">
                                    {product?.name || `Product #${item.productId.toString()}`}
                                </span>
                                <span className="text-muted-foreground shrink-0">× {Number(item.quantity)}</span>
                            </div>
                            <span className="font-medium shrink-0 ml-4">${lineTotal.toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function OrderHistoryPage() {
    const { identity } = useInternetIdentity();
    const { data: orders, isLoading: ordersLoading } = useGetOrders();
    const { data: products, isLoading: productsLoading } = useListProducts();

    const isLoading = ordersLoading || productsLoading;

    if (!identity) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">Sign In to View Orders</h2>
                <p className="text-muted-foreground font-body mb-6">
                    Please sign in to view your order history.
                </p>
                <Link to="/catalog">
                    <Button variant="outline" className="font-body">Browse Products</Button>
                </Link>
            </div>
        );
    }

    // Sort orders in reverse chronological order
    const sortedOrders = orders ? [...orders].sort((a, b) => Number(b.orderId) - Number(a.orderId)) : [];

    return (
        <div className="container mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold">Order History</h1>
                <Link to="/catalog">
                    <Button variant="outline" size="sm" className="font-body gap-2">
                        <ShoppingBag className="w-4 h-4" /> Shop More
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                            <div className="px-6 py-4 bg-accent/40 border-b border-border">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : sortedOrders.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-semibold mb-2">No orders yet</h2>
                    <p className="text-muted-foreground font-body mb-6">
                        You haven't placed any orders yet. Start shopping!
                    </p>
                    <Link to="/catalog">
                        <Button className="font-body gap-2">
                            <ShoppingBag className="w-4 h-4" /> Start Shopping
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedOrders.map((order) => (
                        <OrderCard
                            key={order.orderId.toString()}
                            order={order}
                            products={products}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
