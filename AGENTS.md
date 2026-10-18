# Carbon Design System — Source of Truth

## Objective

Build and maintain the Schools Systems frontend using the **IBM Carbon Design System as the single source of truth for UI/UX design, interaction patterns, accessibility, layout, components, spacing, typography, states, and responsive behavior**.

The implementation must follow the current official Carbon guidance rather than inventing an independent design system.

---

## 1. Absolute Priority: Multi-Lingual Setup (Arabic & English First)

Before updating any frontend code, views, or forms:
1. **Always configure English (en) and Arabic (ar) translations first** inside the i18n locales before introducing UI elements.
2. Ensure full support for right-to-left (RTL) text layout, icon flipping, and CSS alignment variables.
3. Every UI component, dropdown action, dialog, form field, and error message MUST pull text dynamically from the translation registry, ensuring flawless English-Arabic switching.

---

## 2. Authoritative Design-System Sources

Treat these official IBM Carbon resources as the authoritative sources:

* https://carbondesignsystem.com/
* https://preview.carbondesignsystem.com/
* https://ibm-products.carbondesignsystem.com/
* https://react.carbondesignsystem.com/
* https://carbondesignsystem.com/patterns/
* https://carbondesignsystem.com/components/

When making UI/UX decisions, consult these sources first.

Priority:

1. Official Carbon Design System documentation
2. Official Carbon React component documentation
3. Official Carbon patterns
4. Official Carbon foundations/tokens
5. Existing reusable Schools Systems UI components
6. Application-specific requirements

Do not contradict Carbon without a documented application-specific reason.

---

# 2. Technology Constraints

Use:

* React
* Vite
* React Router v7
* i18next
* IBM Carbon Design System
* Carbon React components

Use the official Carbon React implementation wherever an equivalent component exists.

### Prohibited

* Tailwind CSS
* Creating a parallel design system
* Reimplementing Carbon components unnecessarily
* Arbitrary UI libraries that duplicate Carbon functionality
* One-off visual implementations when a Carbon component/pattern exists
* Arbitrary spacing values
* Arbitrary typography values
* Custom interaction patterns that contradict Carbon

Carbon must remain the foundation.

---

# 3. Carbon Is the Design-System Source of Truth

Do not treat Carbon as merely a component library.

Carbon governs:

* Typography
* Color
* Spacing
* Grid
* Layout
* Component sizing
* Component states
* Interaction behavior
* Accessibility
* Responsive behavior
* Forms
* Navigation
* Data tables
* Notifications
* Modals
* Side panels
* Empty states
* Loading states
* Error states
* Content hierarchy
* Visual hierarchy
* Motion where applicable

Application UI should look and behave as a coherent Carbon-based product.

---

# 4. Default vs Fluid

Implement Carbon's **Default / Fluid** distinction intentionally.

Do not globally force everything to Fluid or everything to Default.

## Default

Use Default as the baseline for productive application interfaces.

Use Default for:

* Full-page application layouts
* Dashboards
* DataGrid
* InteractiveGrid
* InteractiveReports
* Lists
* Search results
* Filtering
* Standard forms
* Settings
* Configuration
* Administrative workflows
* Entity pages
* Data-heavy screens
* Tables
* Page-level toolbars

## Fluid

Use Fluid for contained architectural structures where controls belong directly to the surrounding container.

Use Fluid for:

* Modal forms
* Side-panel forms
* Sheets
* Wizards
* Login/authentication experiences
* Compact contained forms
* Tightly coupled form sections
* Inline editing where appropriate
* Container-level action structures where appropriate

Fluid components must follow Carbon's fluid-layout rules.

Do not introduce arbitrary gaps between adjacent fluid controls.

---

# 5. Reusable UI Architecture

Build the UI as reusable layers.

```text
Carbon Design System
        ↓
Carbon React Components
        ↓
Schools UI Primitives
        ↓
Schools UI Patterns
        ↓
Dynamic UI Components
        ↓
Portal Shells
        ↓
Application Modules
        ↓
Pages
```

Never put design-system implementation inside business modules.

---

# 6. Schools UI Layer

Create a reusable UI foundation inside `src/ui/`.
These components must compose Carbon components rather than replace them.

---

# 7. Dynamic UI Components

Create generic, metadata-driven UI components that can be reused across all modules.

*   **DataGrid**: Support columns, sorting, filtering, pagination, selection, bulk actions, row actions, etc.
*   **InteractiveGrid**: Extend DataGrid for editable/interactive workflows (inline editing, validation, save/cancel).
*   **InteractiveReports**: Reusable report structures supporting grouping, sorting, dates, filtering, export.

---

# 8. EntityForm

Create one reusable EntityForm architecture. Support modes (`create`, `edit`, `view`), presentations (`full-page`, `modal`, `side-panel`, `sheet`, `inline`), and variants (`default`, `fluid`). Do not create separate hard-coded modal forms unless behavior differs fundamentally.

---

# 9. Layout & Spacing & Typography

*   **Layout**: Use Carbon's grid and layout principles. Do not invent a custom layout system that conflicts with Carbon.
*   **Spacing**: Use Carbon spacing tokens. Never introduce arbitrary spacing values.
*   **Typography**: Use Carbon typography tokens and type styles. Do not define arbitrary font styles when Carbon provides an equivalent.

---

# 10. Component Size & Accessibility

*   **Size**: Default to `Medium`. Use `Small` for appropriately dense interfaces (toolbars) and `Large` only when justified.
*   **Accessibility**: Mandatory. Follow Carbon accessibility guidance (keyboard navigation, focus visibility, screen readers, logical tab order). Do not sacrifice accessibility for visual appearance.

---

# 11. States Are Mandatory

Every reusable component must consider all states: Default, Hover, Focus, Active, Selected, Disabled, Loading, Skeleton, Empty, Error, Success, Warning, Read-only.

For data components: No data, No search results, Filtered empty, Permission denied, Network error, Partial data, Refreshing, Saving, Saved.

---

# 12. Design Review Rule & No One-Off UI

Before implementing a new UI component, check if Carbon provides it or a pattern for it. Only create new components when there is a real gap. Do not solve a local UI requirement with a custom implementation if it can become a reusable pattern (e.g., use `FilterBar` instead of `CustomStudentFilter`).

---

# Final Principle

**Carbon is not inspiration. Carbon is the design-system source of truth.**
Use Carbon first. Compose Carbon second. Extend Carbon carefully. Create custom UI only where the application has a genuine requirement that Carbon does not already solve.

---

# 13. Domain-Driven Module & Entity Principles

A **module** is an application (like SIS, Accounting, HR, etc.). It might be a full system, a main part, or an extension/plugin. A module can own multiple entities or a single entity.

Follow this principle for all architecture:

*   **Authoritative Ownership**: A module owns its specific institutional entities. For example, SIS owns the student as an institutional entity. SIS does not own unrelated institutional resources.
*   **Referencing vs Duplication**: Modules may reference entities they do not own (e.g., SIS may reference Organization, Campus, Academic Year, Academic Term, Program, Grade, Course, Subject, Class, Section, Teacher, User, Role, Document, Notification, Payment, Assessment, Discipline, Health, Transport, Library). However, they **MUST NOT** duplicate their authoritative records.
*   **Contracts**: Always use stable IDs and strict domain contracts when linking across module boundaries.
