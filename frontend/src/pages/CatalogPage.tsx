import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '../components/ProductCard';
import { useListProducts } from '../hooks/useQueries';

function ProductCardSkeleton() {
    return (
        <div className="bg-card rounded-xl overflow-hidden shadow-card border border-border/50">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
        </div>
    );
}

export default function CatalogPage() {
    const { data: products, isLoading, error } = useListProducts();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = useMemo(() => {
        if (!products) return [];
        const cats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
        return cats.sort();
    }, [products]);

    const filtered = useMemo(() => {
        if (!products) return [];
        return products.filter((p) => {
            const matchesSearch =
                !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !selectedCategory || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, search, selectedCategory]);

    return (
        <div>
            {/* Hero Banner */}
            <div className="relative w-full overflow-hidden bg-accent" style={{ maxHeight: '420px' }}>
                <img
                    src="/assets/generated/hero-banner.dim_1400x500.png"
                    alt="Solano7m — Discover Quality Products"
                    className="w-full object-cover object-center"
                    style={{ maxHeight: '420px' }}
                    onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal-800/60 to-transparent flex items-center">
                    <div className="container mx-auto px-6">
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cream-50 mb-3 drop-shadow-lg">
                            Discover Quality
                        </h1>
                        <p className="font-body text-cream-200 text-base sm:text-lg max-w-md drop-shadow">
                            Curated products crafted with care and delivered with love.
                        </p>
                    </div>
                </div>
            </div>

            {/* Catalog Content */}
            <div className="container mx-auto px-4 sm:px-6 py-10">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 font-body bg-card"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-body text-muted-foreground shrink-0">Filter:</span>
                    </div>
                </div>

                {/* Category Pills */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200 border ${
                                !selectedCategory
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-card text-foreground/70 border-border hover:border-primary/50 hover:text-foreground'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200 border ${
                                    selectedCategory === cat
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-card text-foreground/70 border-border hover:border-primary/50 hover:text-foreground'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Results count */}
                {!isLoading && products && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm font-body text-muted-foreground">
                            {filtered.length === 0
                                ? 'No products found'
                                : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
                            {selectedCategory && (
                                <> in <Badge variant="outline" className="ml-1 font-body">{selectedCategory}</Badge></>
                            )}
                        </p>
                        {(search || selectedCategory) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setSearch(''); setSelectedCategory(null); }}
                                className="text-xs font-body text-muted-foreground"
                            >
                                <X className="w-3 h-3 mr-1" /> Clear filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-16">
                        <p className="text-destructive font-body">Failed to load products. Please try again.</p>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        : filtered.map((product) => (
                            <ProductCard key={product.id.toString()} product={product} />
                        ))
                    }
                </div>

                {/* Empty state */}
                {!isLoading && !error && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                            <Search className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
                        <p className="text-muted-foreground font-body text-sm mb-4">
                            {search || selectedCategory
                                ? 'Try adjusting your search or filters.'
                                : 'No products are available yet. Check back soon!'}
                        </p>
                        {(search || selectedCategory) && (
                            <Button
                                variant="outline"
                                onClick={() => { setSearch(''); setSelectedCategory(null); }}
                                className="font-body"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
