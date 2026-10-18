# Schools Systems ERP — Monorepo & Clean Architecture Specification

## 1. Executive Summary

The **Schools Systems ERP** repository is organized as a modular TypeScript/React monorepo (`@schools/erp-monorepo`) built strictly on **Clean Architecture**, **Domain-Driven Design (DDD)**, and the **IBM Carbon Design System v11** as the single source of truth for UI/UX.

All cross-cutting foundations, domain contracts, Carbon UI layers, role portals, and institutional business modules are structured as isolated workspace packages under `packages/*` and `packages/modules/*`.

---

## 2. Monorepo Workspace Topology

```text
@schools/erp-monorepo (/)
├── tsconfig.base.json                  # Shared TypeScript compiler & @schools/* path mappings
├── tsconfig.json                       # Root workspace project configuration
├── vite.config.ts                      # Vite bundler with @schools/* workspace aliases
├── AGENTS.md                           # Authoritative Carbon & Domain Governance Rules
├── DESIGN.md                           # Carbon v11 Tokens, Grids & Pattern Specifications
├── ARCHITECTURE.md                     # Monorepo & Clean Architecture Topology Specification
├── packages/
│   ├── domain/                         # @schools/domain — Pure Entities, Schemas & Ownership Contracts
│   ├── infrastructure/                 # @schools/infrastructure — Repositories, HTTP & IndexedDB Adapters
│   ├── i18n/                           # @schools/i18n — Bilingual Arabic (RTL) & English (LTR) Engine
│   ├── core/                           # @schools/core — Module Registry, Loader, Audit, RBAC & Workspace Graph
│   ├── ui/                             # @schools/ui — IBM Carbon v11 Primitives, Patterns, Dynamic UI & Shells
│   ├── portals/                        # @schools/portals — Role-Isolated Portals (Student, Instructor, Guardian, SIS, Admin)
│   └── modules/                        # @schools/modules — Institutional Modules Aggregator
│       ├── sis/                        # @schools/module-sis — Student Information System (Authoritative Student Owner)
│       ├── academics/                  # @schools/module-academics — Curriculum, Gradebook, Attendance & Exams
│       ├── finance/                    # @schools/module-finance — Tuition, Invoices, Receipts & Installment Plans
│       ├── hr/                         # @schools/module-hr — Faculty Directory, Contracts & Encrypted Payroll
│       ├── library/                    # @schools/module-library — Library Catalog, Circulation & Campus Ops
│       └── admin/                      # @schools/module-admin — Multi-Tenant Organizations, Campuses, IAM & Audit
└── src/                                # Application Host Runtime, Router & Backward-Compatible Shims
```

---

## 3. Clean Architecture Tier & Dependency Graph Rules

Packages adhere to a strict unidirectional dependency graph (lower tiers never import from higher tiers):

| Tier | Workspace Package(s) | Allowed Internal Dependencies | Responsibility |
| :--- | :--- | :--- | :--- |
| **Tier 1** | `@schools/domain` | *None (Zero dependencies)* | Pure entity interfaces, validation schemas, audit types, and `DOMAIN_OWNERSHIP_REGISTRY` contracts. |
| **Tier 2** | `@schools/infrastructure` | `@schools/domain` | Repository interfaces (`IStudentRepository`, `IGuardianRepository`, `IEnrollmentRepository`), HTTP client, IndexedDB persistence. |
| **Tier 3** | `@schools/i18n`, `@schools/core` | `@schools/domain`, `@schools/infrastructure` | Bilingual localization (`en`/`ar`), `moduleRegistry`, `loadModuleFromConfig`, AES-256 encryption, RBAC, and workspace introspection. |
| **Tier 4** | `@schools/ui` | `@schools/domain`, `@schools/core`, `@schools/i18n` | IBM Carbon v11 UI primitives, patterns, `DataGrid`, `InteractiveGrid`, `DataView`, `EntityForm`, and shells. |
| **Tier 5** | `@schools/module-*`, `@schools/modules` | `@schools/domain`, `@schools/core`, `@schools/ui`, `@schools/i18n` | Self-contained institutional domain modules (`sis`, `academics`, `finance`, `hr`, `library`, `admin`). |
| **Tier 6** | `@schools/portals` | `@schools/ui`, `@schools/modules`, `@schools/core`, `@schools/i18n` | Role-scoped portal layouts and navigation shells. |

---

## 4. Domain-Driven Module & Entity Ownership (AGENTS.md §13)

Every institutional entity has a **single authoritative owner module**. Cross-module interactions use stable ID contracts (`EntityReferenceContract<T>`) and never duplicate authoritative records:

1. **`@schools/module-sis` (SIS)**:
   - **Authoritative Entities**: `Student`, `Guardian`, `Enrollment`, `AcademicPlacement`, `Transfer`, `Withdrawal`, `Graduation`, `StudentDocument`
   - **Referenced Entities (By ID Contract)**: `Campus` (`admin`), `Course` (`academics`), `Assessment` (`academics`), `Attendance` (`academics`), `Invoice` (`finance`)
2. **`@schools/module-academics` (Academics)**:
   - **Authoritative Entities**: `Course`, `Subject`, `Assessment`, `Attendance`, `TimetableSlot`, `ExamHallSchedule`
   - **Referenced Entities (By ID Contract)**: `Student` (`sis`), `Staff` (`hr`)
3. **`@schools/module-finance` (Finance)**:
   - **Authoritative Entities**: `Invoice`, `PaymentReceipt`, `InstallmentPlan`, `FeeStructure`
   - **Referenced Entities (By ID Contract)**: `Student` (`sis`), `Guardian` (`sis`)
4. **`@schools/module-hr` (Human Resources)**:
   - **Authoritative Entities**: `Staff`, `FacultyContract`, `LeaveQuota`
   - **Referenced Entities (By ID Contract)**: `Department` (`admin`), `User` (`admin`)
5. **`@schools/module-library` (Library)**:
   - **Authoritative Entities**: `Book`, `BookCheckout`
   - **Referenced Entities (By ID Contract)**: `Student` (`sis`)
6. **`@schools/module-admin` (Platform & IAM)**:
   - **Authoritative Entities**: `Organization`, `Campus`, `Department`, `AcademicUnit`, `User`, `Role`, `AccessPolicy`, `FeatureFlag`, `SystemAuditLog`, `Workflow`

---

## 5. IBM Carbon Design System v11 UI Layer Stack (`@schools/ui`)

In compliance with `AGENTS.md §5`, `@schools/ui` exposes four explicit architectural sub-barrels:
- `@schools/ui/primitives`: `EmptyState`, `ErrorState`, `LoadingState`, `ResponsiveGrid`, `ResponsiveStack`, and Carbon design tokens.
- `@schools/ui/patterns`: `PageHeader`, `ModuleHeader`, `EntityCardGrid`, `EntityCompactList`, `BulkTransactionToolbar`.
- `@schools/ui/dynamic-ui`: `DataGrid`, `InteractiveGrid`, `InteractiveReports`, `DataView`, `EntityForm`, `EntityPage`.
- `@schools/ui/shells`: `EduCoreShell`, `PortalShell`, `BaseShell`, `MobileBottomNav`, `ProtectedRoute`.
