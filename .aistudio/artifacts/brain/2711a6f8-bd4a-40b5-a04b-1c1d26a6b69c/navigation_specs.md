# Navigation Subsystem Specifications & Security Policy

## 1. Overview
The navigation subsystem is a core foundation service for the Momken Education ERP, providing a database-backed, hierarchical, and localized menu structure. It replaces in-memory and hard-coded navigation definitions.

## 2. Architecture
The system follows a layered architecture:
- **Prisma Repository**: Authoritative persistence layer (PostgreSQL).
- **Navigation Service**: Business logic layer (hierarchy construction, permission enforcement, translation fallback).
- **Navigation Controller**: HTTP interface (REST API contract).
- **Frontend Hook (`useNavigationMenu`)**: React hook for dynamic retrieval.

## 3. Database Model & Constraints
- **Hierarchy**: `NavigationMenuItem` uses a self-referencing relationship (`NavigationTree` - `parentId`) with strict `onDelete: Restrict` to prevent orphaning.
- **Cycle Prevention**: Validated via business logic in `NavigationService` before persistence.
- **Type Constraints**: Database-level check constraints ensure `GROUP`/`DIVIDER` have no route, and `LINK`/`EXTERNAL_LINK` require a valid path.
- **Tenant Scoping**: All menu data is scoped by `tenantId` (inherited from existing tenancy models).

## 4. Security & Access Control
- **Authorization**: All management endpoints require navigation-management permissions verified via `NavigationPolicy` using `AdminAuthEngine`.
- **Visibility**: Menus items are hidden at the API layer based on user `PrincipalContext` permissions.
- **Tenancy**: Data isolation is enforced in every repository query (all queries filtered by `tenantId`).
- **Audit**: All administrative actions (Create, Update, Delete, Reorder) are recorded in the `NavigationAuditLog` table for immutability and compliance.

## 5. API Contract (v1)
- `GET /api/v1/navigation/menus/:key`: Retrieves localized, permission-filtered tree.
- `PATCH /api/v1/navigation/items/:id`: Updates item fields.
- `PUT /api/v1/navigation/menus/:id/order`: Transactional reordering of sibling items.

## 6. Frontend Integration
- **`useNavigationMenu(key)`**: Manages data fetching, loading/error states, and localization (English/Arabic).
- **Admin UI**: Built with Carbon Design System (DataTable, Modals, Dropdowns).
