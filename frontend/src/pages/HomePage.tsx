import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ShoppingBag, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-terracotta-600 to-terracotta-800 text-cream-50">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-cream-100 blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-terracotta-300 blur-3xl" />
                </div>
                <div className="container mx-auto px-4 sm:px-6 py-24 relative">
                    <div className="max-w-2xl">
                        <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight mb-6">
                            Discover Quality,<br />
                            <span className="text-cream-300">Crafted with Care</span>
                        </h1>
                        <p className="font-body text-cream-200 text-lg mb-8 leading-relaxed max-w-lg">
                            Explore our curated collection of premium products. From everyday essentials to unique finds — all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/catalog">
                                <Button size="lg" variant="secondary" className="font-body gap-2 text-base w-full sm:w-auto">
                                    Shop Now <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <ShoppingBag className="w-6 h-6 text-primary" />,
                            title: 'Curated Selection',
                            desc: 'Every product is hand-picked for quality and value.',
                        },
                        {
                            icon: <Shield className="w-6 h-6 text-primary" />,
                            title: 'Secure Shopping',
                            desc: 'Your data and transactions are always protected.',
                        },
                        {
                            icon: <Truck className="w-6 h-6 text-primary" />,
                            title: 'Fast Delivery',
                            desc: 'Quick and reliable shipping to your doorstep.',
                        },
                    ].map((f) => (
                        <div key={f.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 shadow-card">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                {f.icon}
                            </div>
                            <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                            <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-4 sm:px-6 pb-16">
                <div className="bg-accent rounded-3xl p-10 text-center border border-border/50">
                    <h2 className="font-display text-3xl font-bold mb-3">Ready to explore?</h2>
                    <p className="font-body text-muted-foreground mb-6 max-w-md mx-auto">
                        Browse our full catalog and find something you'll love.
                    </p>
                    <Link to="/catalog">
                        <Button size="lg" className="font-body gap-2">
                            View All Products <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
