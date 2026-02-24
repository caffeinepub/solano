import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useListProducts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Product } from '../backend';
import { toast } from 'sonner';

function CartItemRow({
    productId,
    quantity,
    products,
}: {
    productId: bigint;
    quantity: bigint;
    products: Product[];
}) {
    const updateCart = useUpdateCartItem();
    const removeCart = useRemoveCartItem();
    const product = products.find((p) => p.id === productId);
    const [imgError, setImgError] = React.useState(false);

    if (!product) return null;

    const price = Number(product.price) / 100;
    const qty = Number(quantity);
    const lineTotal = price * qty;
    const maxQty = Number(product.stockQuantity);

    const handleUpdate = async (newQty: number) => {
        if (newQty < 1 || newQty > maxQty) return;
        try {
            await updateCart.mutateAsync({ productId, quantity: BigInt(newQty) });
        } catch {
            toast.error('Failed to update quantity.');
        }
    };

    const handleRemove = async () => {
        try {
            await removeCart.mutateAsync(productId);
            toast.success(`${product.name} removed from cart.`);
        } catch {
            toast.error('Failed to remove item.');
        }
    };

    return (
        <div className="flex gap-4 py-5">
            {/* Image */}
            <Link to="/product/$id" params={{ id: productId.toString() }} className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-accent border border-border/50">
                    {!imgError && product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link to="/product/$id" params={{ id: productId.toString() }}>
                    <h3 className="font-display font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-xs font-body text-muted-foreground mt-0.5">{product.category}</p>
                <p className="text-sm font-body text-muted-foreground mt-1">${price.toFixed(2)} each</p>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={() => handleUpdate(qty - 1)}
                            disabled={qty <= 1 || updateCart.isPending}
                            className="px-2.5 py-1.5 hover:bg-accent transition-colors disabled:opacity-40"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 font-body font-semibold text-sm min-w-[2.5rem] text-center border-x border-border">
                            {updateCart.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : qty}
                        </span>
                        <button
                            onClick={() => handleUpdate(qty + 1)}
                            disabled={qty >= maxQty || updateCart.isPending}
                            className="px-2.5 py-1.5 hover:bg-accent transition-colors disabled:opacity-40"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button
                        onClick={handleRemove}
                        disabled={removeCart.isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                    >
                        {removeCart.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Line total */}
            <div className="shrink-0 text-right">
                <span className="font-display font-bold text-lg text-foreground">
                    ${lineTotal.toFixed(2)}
                </span>
            </div>
        </div>
    );
}

export default function CartPage() {
    const { identity } = useInternetIdentity();
    const navigate = useNavigate();
    const { data: cartItems, isLoading: cartLoading } = useGetCart();
    const { data: products, isLoading: productsLoading } = useListProducts();

    const isLoading = cartLoading || productsLoading;

    if (!identity) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">Sign In to View Cart</h2>
                <p className="text-muted-foreground font-body mb-6">
                    Please sign in to access your shopping cart.
                </p>
                <Link to="/catalog">
                    <Button variant="outline" className="font-body">Browse Products</Button>
                </Link>
            </div>
        );
    }

    const grandTotal = cartItems && products
        ? cartItems.reduce((sum, item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return sum;
            return sum + (Number(product.price) / 100) * Number(item.quantity);
        }, 0)
        : 0;

    return (
        <div className="container mx-auto px-4 sm:px-6 py-10">
            <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4 py-5">
                            <Skeleton className="w-24 h-24 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-8 w-32 mt-3" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            ) : !cartItems || cartItems.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground font-body mb-6">
                        Looks like you haven't added anything yet.
                    </p>
                    <Link to="/catalog">
                        <Button className="font-body gap-2">
                            <ShoppingBag className="w-4 h-4" /> Start Shopping
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-card rounded-2xl border border-border/50 shadow-card px-6 divide-y divide-border">
                            {cartItems.map((item) => (
                                <CartItemRow
                                    key={item.productId.toString()}
                                    productId={item.productId}
                                    quantity={item.quantity}
                                    products={products || []}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 sticky top-24">
                            <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-4">
                                {cartItems.map((item) => {
                                    const product = products?.find((p) => p.id === item.productId);
                                    if (!product) return null;
                                    const lineTotal = (Number(product.price) / 100) * Number(item.quantity);
                                    return (
                                        <div key={item.productId.toString()} className="flex justify-between text-sm font-body">
                                            <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                                                {product.name} × {Number(item.quantity)}
                                            </span>
                                            <span className="font-medium shrink-0">${lineTotal.toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-body font-semibold text-foreground">Total</span>
                                <span className="font-display font-bold text-2xl text-primary">
                                    ${grandTotal.toFixed(2)}
                                </span>
                            </div>
                            <Button
                                size="lg"
                                className="w-full font-body gap-2"
                                onClick={() => navigate({ to: '/checkout' })}
                            >
                                Proceed to Checkout <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Link to="/catalog">
                                <Button variant="ghost" size="sm" className="w-full mt-2 font-body text-muted-foreground">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
