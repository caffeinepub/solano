import React, { useState } from 'react';
import { ShieldAlert, Plus, Pencil, Trash2, Loader2, X, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
    useIsCallerAdmin,
    useListProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
} from '../hooks/useQueries';
import type { Product } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// ─── Product Form ─────────────────────────────────────────────────────────────

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
    stockQuantity: string;
}

const emptyForm: ProductFormData = {
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    stockQuantity: '',
};

function productToForm(p: Product): ProductFormData {
    return {
        name: p.name,
        description: p.description,
        price: p.price.toString(),
        imageUrl: p.imageUrl,
        category: p.category,
        stockQuantity: p.stockQuantity.toString(),
    };
}

interface ProductFormProps {
    form: ProductFormData;
    onChange: (field: keyof ProductFormData, value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isSubmitting: boolean;
    submitLabel: string;
}

function ProductForm({ form, onChange, onSubmit, onCancel, isSubmitting, submitLabel }: ProductFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="pf-name">Product Name *</Label>
                    <Input
                        id="pf-name"
                        value={form.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="e.g. Handcrafted Vase"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="pf-category">Category *</Label>
                    <Input
                        id="pf-category"
                        value={form.category}
                        onChange={(e) => onChange('category', e.target.value)}
                        placeholder="e.g. Home Decor"
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="pf-description">Description</Label>
                <Textarea
                    id="pf-description"
                    value={form.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Describe the product…"
                    rows={3}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="pf-price">Price (in cents) *</Label>
                    <Input
                        id="pf-price"
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => onChange('price', e.target.value)}
                        placeholder="e.g. 2999 = $29.99"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="pf-stock">Stock Quantity *</Label>
                    <Input
                        id="pf-stock"
                        type="number"
                        min="0"
                        value={form.stockQuantity}
                        onChange={(e) => onChange('stockQuantity', e.target.value)}
                        placeholder="e.g. 50"
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="pf-image">Image URL</Label>
                <Input
                    id="pf-image"
                    value={form.imageUrl}
                    onChange={(e) => onChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} disabled={isSubmitting} className="min-w-[120px]">
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving…
                        </span>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </div>
        </div>
    );
}

// ─── Access Denied ────────────────────────────────────────────────────────────

function AccessDenied({ isAuthenticated }: { isAuthenticated: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-destructive" />
            </div>
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                <p className="text-muted-foreground max-w-sm">
                    {isAuthenticated
                        ? 'You do not have admin privileges to access this page.'
                        : 'Please sign in with an admin account to access this page.'}
                </p>
            </div>
        </div>
    );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
    const { identity } = useInternetIdentity();
    const isAuthenticated = !!identity;

    const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
    const { data: products, isLoading: productsLoading } = useListProducts();

    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    // Add product dialog
    const [addOpen, setAddOpen] = useState(false);
    const [addForm, setAddForm] = useState<ProductFormData>(emptyForm);

    // Edit product dialog
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState<ProductFormData>(emptyForm);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const handleAddChange = (field: keyof ProductFormData, value: string) => {
        setAddForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditChange = (field: keyof ProductFormData, value: string) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddSubmit = async () => {
        if (!addForm.name.trim() || !addForm.category.trim() || !addForm.price || !addForm.stockQuantity) {
            toast.error('Please fill in all required fields.');
            return;
        }
        try {
            await createProduct.mutateAsync({
                name: addForm.name.trim(),
                description: addForm.description.trim(),
                price: BigInt(Math.round(Number(addForm.price))),
                imageUrl: addForm.imageUrl.trim(),
                category: addForm.category.trim(),
                stockQuantity: BigInt(Math.round(Number(addForm.stockQuantity))),
            });
            toast.success('Product added successfully!');
            setAddOpen(false);
            setAddForm(emptyForm);
        } catch (err) {
            toast.error('Failed to add product. Please try again.');
        }
    };

    const handleEditOpen = (product: Product) => {
        setEditProduct(product);
        setEditForm(productToForm(product));
    };

    const handleEditSubmit = async () => {
        if (!editProduct) return;
        if (!editForm.name.trim() || !editForm.category.trim() || !editForm.price || !editForm.stockQuantity) {
            toast.error('Please fill in all required fields.');
            return;
        }
        try {
            await updateProduct.mutateAsync({
                id: editProduct.id,
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                price: BigInt(Math.round(Number(editForm.price))),
                imageUrl: editForm.imageUrl.trim(),
                category: editForm.category.trim(),
                stockQuantity: BigInt(Math.round(Number(editForm.stockQuantity))),
            });
            toast.success('Product updated successfully!');
            setEditProduct(null);
        } catch (err) {
            toast.error('Failed to update product. Please try again.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await deleteProduct.mutateAsync(deleteTarget.id);
            toast.success(`"${deleteTarget.name}" deleted.`);
            setDeleteTarget(null);
        } catch (err) {
            toast.error('Failed to delete product. Please try again.');
        }
    };

    // Loading state
    if (adminLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    // Access denied
    if (!isAuthenticated || !isAdmin) {
        return <AccessDenied isAuthenticated={isAuthenticated} />;
    }

    const formatPrice = (price: bigint) => {
        const cents = Number(price);
        return `$${(cents / 100).toFixed(2)}`;
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Admin Panel</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your store's product catalog</p>
                </div>
                <Button
                    onClick={() => { setAddForm(emptyForm); setAddOpen(true); }}
                    className="flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Button>
            </div>

            {/* Products Table */}
            {productsLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                </div>
            ) : !products || products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center border border-dashed border-border rounded-xl">
                    <PackageSearch className="w-12 h-12 text-muted-foreground/50" />
                    <div>
                        <p className="font-medium text-foreground">No products yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Click "Add Product" to create your first listing.</p>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden shadow-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="w-16">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Category</TableHead>
                                <TableHead className="hidden md:table-cell">Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id.toString()} className="hover:bg-muted/20 transition-colors">
                                    <TableCell>
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded-md border border-border"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                                                <PackageSearch className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{product.category}</TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{product.stockQuantity.toString()}</TableCell>
                                    <TableCell className="font-semibold text-primary">{formatPrice(product.price)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditOpen(product)}
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                title="Edit product"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteTarget(product)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                title="Delete product"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Add Product Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-display text-xl">Add New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                        form={addForm}
                        onChange={handleAddChange}
                        onSubmit={handleAddSubmit}
                        onCancel={() => setAddOpen(false)}
                        isSubmitting={createProduct.isPending}
                        submitLabel="Add Product"
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={!!editProduct} onOpenChange={(open) => { if (!open) setEditProduct(null); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-display text-xl">Edit Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                        form={editForm}
                        onChange={handleEditChange}
                        onSubmit={handleEditSubmit}
                        onCancel={() => setEditProduct(null)}
                        isSubmitting={updateProduct.isPending}
                        submitLabel="Save Changes"
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteProduct.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteProduct.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteProduct.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting…
                                </span>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
