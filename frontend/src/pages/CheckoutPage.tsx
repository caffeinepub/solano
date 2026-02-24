import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingBag, Loader2, CheckCircle, ArrowLeft, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCart, useListProducts, usePlaceOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Product, CartItem } from '../backend';
import { toast } from 'sonner';

interface CheckoutItemRowProps {
    item: CartItem;
    product: Product;
}

function CheckoutItemRow({ item, product }: CheckoutItemRowProps) {
    const [imgError, setImgError] = React.useState(false);
    const lineTotal = (Number(product.price) / 100) * Number(item.quantity);

    return (
        <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-accent shrink-0 border border-border/50">
                {!imgError && product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-sm text-foreground line-clamp-1">{product.name}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                    ${(Number(product.price) / 100).toFixed(2)} × {Number(item.quantity)}
                </p>
            </div>
            <span className="font-display font-bold text-foreground shrink-0">
                ${lineTotal.toFixed(2)}
            </span>
        </div>
    );
}

export default function CheckoutPage() {
    const { identity } = useInternetIdentity();
    const navigate = useNavigate();
    const { data: cartItems, isLoading: cartLoading } = useGetCart();
    const { data: products, isLoading: productsLoading } = useListProducts();
    const placeOrder = usePlaceOrder();

    const isLoading = cartLoading || productsLoading;

    if (!identity) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">Sign In to Checkout</h2>
                <p className="text-muted-foreground font-body mb-6">Please sign in to complete your purchase.</p>
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

    const handlePlaceOrder = async () => {
        try {
            const orderId = await placeOrder.mutateAsync();
            toast.success('Order placed successfully!');
            navigate({ to: '/order-success/$orderId', params: { orderId: orderId.toString() } });
        } catch {
            toast.error('Failed to place order. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">
            {/* Back */}
            <Link
                to="/cart"
                className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-8 group w-fit"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Cart
            </Link>

            <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
            ) : !cartItems || cartItems.length === 0 ? (
                <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-body text-muted-foreground mb-4">Your cart is empty.</p>
                    <Link to="/catalog">
                        <Button className="font-body">Shop Now</Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 bg-accent/50 border-b border-border">
                        <h2 className="font-display font-semibold text-lg">Order Summary</h2>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-border">
                        {cartItems.map((item) => {
                            const product = products?.find((p) => p.id === item.productId);
                            if (!product) return null;
                            return (
                                <CheckoutItemRow
                                    key={item.productId.toString()}
                                    item={item}
                                    product={product}
                                />
                            );
                        })}
                    </div>

                    {/* Total & Place Order */}
                    <div className="px-6 py-4 border-t border-border bg-accent/30">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-body font-semibold text-foreground text-lg">Total</span>
                            <span className="font-display font-bold text-2xl text-primary">
                                ${grandTotal.toFixed(2)}
                            </span>
                        </div>
                        <Button
                            size="lg"
                            className="w-full font-body gap-2 text-base"
                            onClick={handlePlaceOrder}
                            disabled={placeOrder.isPending}
                        >
                            {placeOrder.isPending ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order…</>
                            ) : (
                                <><CheckCircle className="w-5 h-5" /> Place Order</>
                            )}
                        </Button>
                        <p className="text-xs font-body text-muted-foreground text-center mt-3">
                            By placing your order, you agree to our terms of service.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
