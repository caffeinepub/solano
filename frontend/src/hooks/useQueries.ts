import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, CartItem, StoreOrder, UserProfile } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false,
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched,
    };
}

export function useSaveCallerUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery<boolean>({
        queryKey: ['isCallerAdmin'],
        queryFn: async () => {
            if (!actor) return false;
            return actor.isCallerAdmin();
        },
        enabled: !!actor && !actorFetching && !!identity,
        retry: false,
    });
}

// ─── Products ────────────────────────────────────────────────────────────────

export function useListProducts() {
    const { actor, isFetching } = useActor();

    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.listProducts();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetProduct(productId: bigint | null) {
    const { actor, isFetching } = useActor();

    return useQuery<Product | null>({
        queryKey: ['product', productId?.toString()],
        queryFn: async () => {
            if (!actor || productId === null) return null;
            return actor.getProduct(productId);
        },
        enabled: !!actor && !isFetching && productId !== null,
    });
}

export function useCreateProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            name: string;
            description: string;
            price: bigint;
            imageUrl: string;
            category: string;
            stockQuantity: bigint;
        }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createProduct(
                params.name,
                params.description,
                params.price,
                params.imageUrl,
                params.category,
                params.stockQuantity,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            id: bigint;
            name: string;
            description: string;
            price: bigint;
            imageUrl: string;
            category: string;
            stockQuantity: bigint;
        }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.updateProduct(
                params.id,
                params.name,
                params.description,
                params.price,
                params.imageUrl,
                params.category,
                params.stockQuantity,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useDeleteProduct() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productId: bigint) => {
            if (!actor) throw new Error('Actor not available');
            return actor.deleteProduct(productId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export function useGetCart() {
    const { actor, isFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery<CartItem[]>({
        queryKey: ['cart'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getCart();
        },
        enabled: !!actor && !isFetching && !!identity,
    });
}

export function useAddToCart() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.addToCart(productId, quantity);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

export function useUpdateCartItem() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.updateCartItem(productId, quantity);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

export function useRemoveCartItem() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productId: bigint) => {
            if (!actor) throw new Error('Actor not available');
            return actor.removeCartItem(productId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useGetOrders() {
    const { actor, isFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery<StoreOrder[]>({
        queryKey: ['orders'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getOrders();
        },
        enabled: !!actor && !isFetching && !!identity,
    });
}

export function usePlaceOrder() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.placeOrder();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}
