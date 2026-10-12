# Design System Architecture & Component Inventory

## 1. Design Principles

- **Tokens-Only Styling**: No raw hex, rgb, or hsl values exist outside `src/styles/tokens/primitives.css`. Components consume semantic role tokens mapped through Tailwind CSS v4 utility classes or CSS custom variables.
- **Bottom-Up Atomic Build**: Every visual element begins at the lowest atomic tier. Atoms are composed into molecules, molecules assemble into organisms, and organisms slot into page templates.
- **One Responsibility Per File**: Strict separation of component implementation (`.tsx`), type contracts (`.types.ts`), unit tests (`.test.tsx`), and stories (`.stories.tsx`).
- **Co-Located Tests**: Unit tests reside alongside component implementations with coverage enforcement (90% branches, functions, lines, statements).
- **AI-Elements Opt-In**: Experimental or agent-generated blocks are quarantined under designated namespaces (`src/components/ai-elements/**`) and ignored by core test coverage gates until graduated.

---

## 2. Design Token System

The design token system follows a four-tier cascading hierarchy imported sequentially inside `src/app/globals.css`:

```
┌────────────────────────────────────────────────────────┐
│  src/styles/tokens/primitives.css                       │
│  Raw palette ramps, spacing & radius on :root          │
│  (DO NOT EDIT: re-convert from designer source)        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  src/styles/tokens/light.css                           │
│  Semantic role bindings for :root & [data-theme="light"]│
│  (DO NOT EDIT: derived role mappings)                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  src/styles/tokens/dark.css                            │
│  Semantic role bindings for [data-theme="dark"]        │
│  (DO NOT EDIT: derived role mappings)                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  src/styles/tokens/brand.css                           │
│  Tenant & white-label overrides (A11y AA contrast)     │
│  (EDIT to white-label)                                 │
└────────────────────────────────────────────────────────┘
```

### Semantic Role Groups

| Role Group      | Custom Property Pattern                                                                                                                                                                                                                    | Description / Purpose                                                         |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Backgrounds** | `--bg-default`, `--bg-surface-1` .. `5`, `--bg-overlay`, `--bg-input`, `--bg-tooltip`, `--bg-modal`, `--bg-sidebar`, `--bg-hover`, `--bg-pressed`, `--bg-selected`, `--bg-disabled`                                                        | Container surfaces, modal backdrops, and interactive state fills.             |
| **Text**        | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled`, `--text-placeholder`, `--text-inverse`, `--text-on-primary`, `--text-accent`, `--text-link`, `--text-success`, `--text-warning`, `--text-error`, `--text-info` | Content typography, labels, state feedback, and accessibility-tuned contrast. |
| **Borders**     | `--border-default`, `--border-subtle`, `--border-strong`, `--border-focus`                                                                                                                                                                 | Structural separators, card containers, and active input rings.               |
| **Actions**     | `--action-primary-{bg-default, bg-hover, bg-pressed, text, bg-soft}`, `--action-destructive-{bg-default, bg-hover, text}`                                                                                                                  | Key call-to-actions, secondary soft buttons, and destructive confirmations.   |
| **Status**      | `--status-{success, warning, error, info}-{bg, text, border, icon}`                                                                                                                                                                        | Contextual badges, system toasts, alerts, and inline form feedback.           |

---

## 3. Layout: AppShell

```
┌──────────────────────────────────────────────────────────┐
│ topbar  (56px)                                            │
├───────────┬───────────────────────────────┬───────────────┤
│ leftbar   │ main (flex-grow)              │ rightbar      │
│ (165px /  │                               │ (~280px,      │
│ 48px      │                               │ hide/show)    │
│ collapsed)│                               │               │
└───────────┴───────────────────────────────┴───────────────┘
```

### Slot Props

- `topbar`: ReactNode rendered at the fixed 56px header region.
- `leftbar`: Optional ReactNode sidebar (collapses between 165px and 48px).
- `main`: Primary viewport workspace expanding across remaining space (`flex-grow`).
- `rightbar`: Optional ReactNode inspector panel (~280px, toggled via `isRightbarOpen`).

---

## 4. Component Inventory

### Atoms

_Single DOM element, zero component children._

| Name          | Path                             | Description                                                                                 | Used in                                                                      |
| :------------ | :------------------------------- | :------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------- |
| `Button`      | `@/components/atoms/Button`      | Interactive push button supporting primary, destructive, outline, ghost, and soft variants. | FormField, SearchBar, Toast, AppDialog, DataTable, SettingsPanel, SiteHeader |
| `Input`       | `@/components/atoms/Input`       | Single-line text input control with error and size states.                                  | FormField, SearchBar, SettingsPanel, DataTable                               |
| `Textarea`    | `@/components/atoms/Textarea`    | Multi-line text entry field with resize control.                                            | SettingsPanel                                                                |
| `Select`      | `@/components/atoms/Select`      | Dropdown select menu with options prop or direct option children.                           | DataTable, SettingsPanel                                                     |
| `Badge`       | `@/components/atoms/Badge`       | Compact status indicator pill with semantic variant themes.                                 | KPICard, DataTable, Toast                                                    |
| `Spinner`     | `@/components/atoms/Spinner`     | Accessible animated SVG circular loader for async operations.                               | DataTable, SiteHeader                                                        |
| `Avatar`      | `@/components/atoms/Avatar`      | Image avatar with automatic monogram fallback.                                              | SiteHeader, SettingsPanel                                                    |
| `ThemeToggle` | `@/components/atoms/ThemeToggle` | Button cycling through light, dark, and system color modes.                                 | SiteHeader, SettingsPanel                                                    |
| `Icon`        | `@/components/atoms/Icon`        | Scalable vector icon mapping standard application glyphs.                                   | SearchBar, Toast, AppDialog, SiteHeader                                      |

### Molecules

_2+ atoms composed together for a single focused purpose._

| Name        | Path                               | Description                                                                            | Used in                       |
| :---------- | :--------------------------------- | :------------------------------------------------------------------------------------- | :---------------------------- |
| `FormField` | `@/components/molecules/FormField` | Accessible form control pairing Label, Input/Textarea/Select, and validation messages. | SettingsPanel                 |
| `SearchBar` | `@/components/molecules/SearchBar` | Search input pairing Input, search Icon, and quick action Button.                      | SiteHeader, DataTable         |
| `Toast`     | `@/components/molecules/Toast`     | Ephemeral notification banner pairing Badge, status Icon, and dismiss Button.          | AppShell, SettingsPanel, Page |
| `AppDialog` | `@/components/molecules/AppDialog` | Modal dialog combining Backdrop, title, content, close Button, and actions.            | SettingsPanel, Page           |
| `KPICard`   | `@/components/molecules/KPICard`   | Metric display card combining summary value, delta trend Icon, and status Badge.       | Page                          |

### Organisms

_Distinct self-contained sections; orchestrates multiple molecules and atoms._

| Name            | Path                                   | Description                                                                                     | Used in             |
| :-------------- | :------------------------------------- | :---------------------------------------------------------------------------------------------- | :------------------ |
| `SiteHeader`    | `@/components/organisms/SiteHeader`    | Top navigation bar containing branding, search, nav links, ThemeToggle, and user Avatar.        | AppShell, Page      |
| `DataTable`     | `@/components/organisms/DataTable`     | Tabular data grid with client-side sorting, SearchBar filtering, and pagination controls.       | Page, SettingsPanel |
| `SettingsPanel` | `@/components/organisms/SettingsPanel` | Comprehensive configuration panel combining multiple FormFields, ThemeToggle, and save actions. | AppShell, Page      |

### Templates

_Layout skeletons defining slots and structural containment._

| Name       | Path                              | Description                                                                                         | Used in |
| :--------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------- | :------ |
| `AppShell` | `@/components/templates/AppShell` | Application frame providing topbar (56px), leftbar (165px/48px), main, and rightbar (~280px) slots. | Page    |

### Pages

_Next.js route entries assembling templates and organisms._

| Name       | Path               | Description                                                                         | Used in          |
| :--------- | :----------------- | :---------------------------------------------------------------------------------- | :--------------- |
| `HomePage` | `src/app/page.tsx` | Production infrastructure dashboard demonstrating the full atomic design hierarchy. | App Router (`/`) |
