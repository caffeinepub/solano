# Specification

## Summary
**Goal:** Add an admin panel for product management, with role-based access control enforced on both the backend and frontend.

**Planned changes:**
- Add backend logic to designate a specific principal as admin and enforce admin-only access on all product create, update, and delete operations.
- Add an `/admin` page accessible only to authenticated admin users, featuring a product list table with edit and delete actions, an "Add Product" form, an "Edit Product" form, and a delete confirmation prompt.
- Show an access-denied message on `/admin` for unauthenticated or non-admin users.
- Add an "Admin" navigation link in the app header that is only visible to admin users, linking to `/admin`.

**User-visible outcome:** The app owner (admin) can navigate to the admin panel from the header to add, edit, and delete products. Non-admin and unauthenticated users are blocked from accessing the admin panel.
