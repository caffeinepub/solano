import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Loader2, Minus, Plus, ImageOff, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useGetProduct, useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function ProductDetailPage() {
    const { id } = useParams({ from: '/product/$id' });
    const navigate = useNavigate();
    const { identity } = useInternetIdentity();
    const productId = BigInt(id);

    const { data: product, isLoading, error } = useGetProduct(productId);
    const addToCart = useAddToCart();
    const [quantity, setQuantity] = useState(1);
    const [imgError, setImgError] = useState(false);

    const maxQty = product ? Number(product.stockQuantity) : 0;
    const price = product ? Number(product.price) / 100 : 0;
    const inStock = maxQty > 0;

    const handleAddToCart = async () => {
        if (!identity) {
            toast.error('Please sign in to add items to your cart');
            return;
        }
        if (!product) return;
        try {
            await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(quantity) });
            toast.success(`${product.name} added to cart!`, {
                description: `${quantity} item${quantity > 1 ? 's' : ''} added.`,
            });
        } catch {
            toast.error('Failed to add to cart. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-10">
                <Skeleton className="h-8 w-32 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-12 w-full mt-6" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">Product Not Found</h2>
                <p className="text-muted-foreground font-body mb-6">This product doesn't exist or has been removed.</p>
                <Button onClick={() => navigate({ to: '/catalog' })} className="font-body">
                    Back to Shop
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-10">
            {/* Back button */}
            <button
                onClick={() => navigate({ to: '/catalog' })}
                className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Shop
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-accent shadow-card">
                    {!imgError && product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    )}
                    {!inStock && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <span className="bg-card text-foreground/70 font-body font-semibold px-4 py-2 rounded-full border border-border text-sm">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex flex-col">
                    <Badge variant="outline" className="w-fit mb-3 font-body text-xs">
                        {product.category}
                    </Badge>

                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="font-display text-3xl font-bold text-primary">
                            ${price.toFixed(2)}
                        </span>
                    </div>

                    <Separator className="my-4" />

                    <p className="font-body text-foreground/80 leading-relaxed mb-6">
                        {product.description}
                    </p>

                    {/* Stock info */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-destructive'}`} />
                        <span className="text-sm font-body text-muted-foreground">
                            {inStock
                                ? `${maxQty} in stock`
                                : 'Out of stock'}
                        </span>
                    </div>

                    {/* Quantity selector */}
                    {inStock && (
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-body font-medium text-foreground">Quantity</span>
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-2 hover:bg-accent transition-colors disabled:opacity-40"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 font-body font-semibold text-sm min-w-[3rem] text-center border-x border-border">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                                    className="px-3 py-2 hover:bg-accent transition-colors disabled:opacity-40"
                                    disabled={quantity >= maxQty}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart */}
                    <Button
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={!inStock || addToCart.isPending || !identity}
                        className="font-body text-base gap-2 w-full sm:w-auto"
                    >
                        {addToCart.isPending ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Adding…</>
                        ) : (
                            <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                        )}
                    </Button>

                    {!identity && (
                        <p className="text-xs font-body text-muted-foreground mt-2">
                            Sign in to add items to your cart.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
