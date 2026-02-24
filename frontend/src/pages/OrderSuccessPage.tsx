import React from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { CheckCircle, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
    const { orderId } = useParams({ from: '/order-success/$orderId' });

    return (
        <div className="container mx-auto px-4 sm:px-6 py-20 max-w-lg text-center">
            <div className="bg-card rounded-3xl border border-border/50 shadow-card p-10 animate-fade-in">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="font-display text-3xl font-bold text-foreground mb-3">
                    Order Confirmed!
                </h1>
                <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                    Thank you for your purchase. Your order has been placed successfully and is being processed.
                </p>

                {/* Order ID */}
                <div className="bg-accent rounded-xl px-6 py-4 mb-8 border border-border/50">
                    <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-display font-bold text-2xl text-primary">#{orderId}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/orders">
                        <Button variant="outline" className="font-body gap-2 w-full sm:w-auto">
                            <Package className="w-4 h-4" /> View Orders
                        </Button>
                    </Link>
                    <Link to="/catalog">
                        <Button className="font-body gap-2 w-full sm:w-auto">
                            <ShoppingBag className="w-4 h-4" /> Continue Shopping
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
