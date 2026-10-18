# Schools Systems — Design Architecture & Carbon Design System Specifications

## 1. Overview & Single Source of Truth

The Schools Systems application frontend is engineered strictly around the **IBM Carbon Design System** (v11) as the authoritative, non-negotiable source of truth for all UI/UX design, visual foundations, interaction patterns, component anatomy, layout grids, spacing scales, typography scales, accessibility compliance, and state management.

### 1.1 Mandatory Bilingual Execution Pattern (Arabic & English First)
All frontend development, view creation, and modifications must:
- Always define corresponding translation resources for English (en) and Arabic (ar) within i18n localization resources before writing UI code.
- Fully support right-to-left (RTL) reading patterns, appropriate alignment flips, and mirrored Carbon icons.
- Avoid hardcoded text across the codebase; always load strings dynamically using the translation engine.

### Authoritative Reference Links
- Carbon Design System Core: https://carbondesignsystem.com/
- Carbon React Components: https://react.carbondesignsystem.com/
- Carbon Patterns: https://carbondesignsystem.com/patterns/
- IBM Products Carbon Extension: https://ibm-products.carbondesignsystem.com/

---

## 2. Visual Foundations & Design Tokens

### 2.1 Color Tokens & Theming
The design system enforces Carbon theme tokens using CSS custom properties (`var(--cds-*)`) and Carbon theme layers:
- **Background & Layers**:
  - Base canvas: `var(--cds-background)` (`#f4f4f4` in White/g10 theme)
  - Primary layer (`Layer 01`): `var(--cds-layer-01)` (`#ffffff`)
  - Secondary nested layer (`Layer 02`): `var(--cds-layer-02)` (`#f4f4f4`)
  - Highlighted/Selected layer: `var(--cds-layer-selected-01)` (`#edf5ff`)
- **Typography & Content**:
  - Primary Text: `var(--cds-text-primary)` (`#161616`)
  - Secondary Text: `var(--cds-text-secondary)` (`#525252`)
  - Placeholder / Helper: `var(--cds-text-helper)` / `var(--cds-text-placeholder)` (`#6f6f6f`)
  - On-Color / Inverse: `var(--cds-text-on-color)` / `var(--cds-text-inverse)` (`#ffffff`)
- **Borders & Dividers**:
  - Subtle border: `var(--cds-border-subtle)` (`#e0e0e0`)
  - Strong border: `var(--cds-border-strong)` (`#8d8d8d`)
  - Interactive border: `var(--cds-border-interactive)` (`#0f62fe`)
- **Interactive & Status**:
  - Primary Action: `var(--cds-interactive)` (`#0f62fe`)
  - Hover Action: `var(--cds-interactive-hover)` (`#0353e9`)
  - Focus Ring: `2px solid var(--cds-focus)` (`#0f62fe`) with `offset: -2px`
  - Support Success: `var(--cds-support-success)` (`#24a148`)
  - Support Warning: `var(--cds-support-warning)` (`#f1c21b`)
  - Support Error: `var(--cds-support-error)` (`#da1e28`)
  - Support Info: `var(--cds-support-info)` (`#0043ce`)

### 2.2 Typography Scale
All typography matches IBM Plex Sans typography tokens:
- **Display & Section Titles**: `heading-04` (28px / 36px, Semi-Bold), `heading-03` (20px / 28px, Semi-Bold), `heading-02` (16px / 22px, Semi-Bold)
- **Body & Content**: `body-01` (14px / 20px, Regular) and `body-02` (16px / 24px, Regular)
- **Labels & Meta**: `label-01` (12px / 16px, Regular) and `helper-text-01` (12px / 16px, Italic/Regular)
- **Code & Numeric**: `code-01` (12px) and `code-02` (14px) in IBM Plex Mono

### 2.3 Spacing Scale
Arbitrary margins and paddings are prohibited. All layouts follow Carbon's 8px grid tokens:
- `$spacing-01` (2px / 0.125rem)
- `$spacing-02` (4px / 0.25rem)
- `$spacing-03` (8px / 0.5rem)
- `$spacing-04` (12px / 0.75rem)
- `$spacing-05` (16px / 1rem)
- `$spacing-06` (24px / 1.5rem)
- `$spacing-07` (32px / 2rem)
- `$spacing-08` (40px / 2.5rem)
- `$spacing-09` (48px / 3rem)

---

## 3. Structural Archetypes: Default vs. Fluid Layouts

| Aspect | Default Layout | Fluid Layout |
| :--- | :--- | :--- |
| **Primary Domain** | High-density administrative workspaces, lists, dashboards, interactive grids, interactive reports | Contained dialogs, side-panels, modals, wizards, compact credential sheets |
| **Grid Rhythm** | Distinct, bordered component blocks with generous gutter separation | Edge-to-edge inputs, flush stacked fields, borderless internal dividers |
| **Control Sizing** | `size="md"` (40px) or `size="sm"` (32px for toolbars) | Full-width container-bound interactive cells with floating labels |
| **Surfaces** | Full-page views (`DataView`, `InteractiveGrid`, `EntityPage`) | Modal forms (`EntityForm`), sliding side drawers, compact action sheets |

---

## 4. Reusable UI Architecture Hierarchy

```text
IBM Carbon Design System (Foundations, Tokens, Carbon React v11)
                     ↓
Schools UI Primitives (src/ui/layout, src/ui/data, src/ui/feedback)
                     ↓
Dynamic UI Components (DataGrid, DataView, InteractiveGrid, InteractiveReports, EntityForm)
                     ↓
Portal Shells (Header, SideNav, Global Search, Notification Center, Audit Trail)
                     ↓
Institutional Modules (SIS, Admissions, Gradebook, Attendance, Finance, HR, Transcripts)
                     ↓
Entity Pages (List, Detail, Analytics, Reports, Inline Batch Editing)
```

---

## 5. Core Data Components & Interaction Patterns

### 5.1 InteractiveGrid (Batch Multi-Cell Editing & Keyboard Navigation)
- **Multi-Cell Inline Editing**: Direct cell activation via double-click, Enter, or character typing.
- **Keyboard Navigation Matrix**:
  - `Arrow Keys` (`Up`, `Down`, `Left`, `Right`): Cell-by-cell navigation across rows and columns.
  - `Tab` / `Shift+Tab`: Traverses editable fields sequentially across rows with wrap-around.
  - `Enter` / `F2`: Enters edit mode; when editing, commits value and advances to next row.
  - `Escape`: Cancels current active edit and restores cell focus.
  - `Ctrl+S` / `Cmd+S`: Commits staged batch transactions to the authoritative data provider.
  - `Ctrl+Z` / `Cmd+Z`: Rolls back all uncommitted edits.
- **Transaction Bar**: Staged modifications show modified cell count, row count, per-cell revert button, and bulk commit/rollback actions.
- **Dirty State Visuals**: Blue corner marker indicating modified cells with tooltip displaying original value.

### 5.2 DataView & Saved Filter Presets
- **Multimodal View Modes**: Seamless toggle between Table view, Responsive Card Grid (`EntityCardGrid`), and Compact List (`EntityCompactList`).
- **Filter Presets Engine (`FilterPresetsBar`)**:
  - Stored persistently in IndexedDB via `presetStorageKey`.
  - Save, rename, activate, and delete named query combinations (search strings, status chips, column sort order).
- **Multi-Format Export Engine**:
  - **Excel (.xlsx)**: Formatted workbooks with title banner, column metadata, and typed values.
  - **CSV (.csv)**: RFC 4180-compliant export with UTF-8 BOM encoding and formula injection mitigation.
  - **PDF (.pdf)**: Institutional report formatting with print preview and audit trail logging.

### 5.3 EntityForm
- Standardized form engine handling modes (`create`, `edit`, `view`), presentations (`full-page`, `modal`, `side-panel`, `sheet`), and variants (`default`, `fluid`).
- Field schema validation (required, regex, numeric ranges, custom validators).

---

## 6. Mandatory Component States

Every component must handle the full spectrum of UI states:
1. **Default**: Pristine idle rendering.
2. **Hover / Focus / Active**: Carbon-compliant focus ring (`2px #0f62fe`).
3. **Selected**: Layer tint (`--cds-layer-selected-01`).
4. **Disabled / Read-only**: Subtle muted styling with tooltip explanation where applicable.
5. **Loading / Skeleton**: `DataTableSkeleton`, `SkeletonText`, and `Loading` spinners.
6. **Empty States**: Differentiated between:
   - `No data`: Zero records exist in the institutional entity.
   - `Filtered empty`: Search/filter returned 0 matches, with a "Reset Filters" action.
   - `Permission denied`: User lacks access to entity/field.
   - `Network error`: Failed fetch with a "Retry" button.

---

## 7. Accessibility (WCAG 2.1 AA)
- Full keyboard operability (tab order, arrow key navigation, roving tabindex).
- High contrast compliance (minimum 4.5:1 for body text, 3:1 for UI elements and graphical components).
- Screen-reader friendly aria attributes (`aria-label`, `aria-expanded`, `aria-describedby`, `role="grid"`, `role="gridcell"`).
- Dynamic announce notifications using Carbon `ToastNotification` and `InlineNotification`.
