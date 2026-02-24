import React from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingCart, Loader2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Product } from '../backend';
import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { identity } = useInternetIdentity();
    const addToCart = useAddToCart();
    const [imgError, setImgError] = React.useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!identity) {
            toast.error('Please sign in to add items to your cart');
            return;
        }

        try {
            await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
            toast.success(`${product.name} added to cart!`, {
                description: 'View your cart to checkout.',
            });
        } catch (err) {
            toast.error('Failed to add to cart. Please try again.');
        }
    };

    const price = Number(product.price) / 100;
    const inStock = Number(product.stockQuantity) > 0;

    return (
        <Link to="/product/$id" params={{ id: product.id.toString() }} className="group block">
            <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border/50 h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-accent overflow-hidden">
                    {!imgError && product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent">
                            <ImageOff className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-xs font-body font-medium bg-card/90 backdrop-blur-sm">
                            {product.category}
                        </Badge>
                    </div>
                    {!inStock && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <span className="bg-card text-foreground/70 text-xs font-body font-semibold px-3 py-1 rounded-full border border-border">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-foreground text-base leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-muted-foreground text-xs font-body line-clamp-2 mb-3 flex-1">
                        {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="font-display font-bold text-lg text-primary">
                            ${price.toFixed(2)}
                        </span>
                        <Button
                            size="sm"
                            onClick={handleAddToCart}
                            disabled={!inStock || addToCart.isPending}
                            className="font-body text-xs gap-1.5"
                        >
                            {addToCart.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <ShoppingCart className="w-3.5 h-3.5" />
                            )}
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
