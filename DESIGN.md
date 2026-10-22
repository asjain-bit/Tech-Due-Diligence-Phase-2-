# Design System Architecture & Component Inventory

## 1. Design Principles

- **Tokens-Only Styling**: No raw hex, rgb, or hsl values exist outside `src/styles/tokens/primitives.css`. Components consume semantic role tokens mapped through Tailwind CSS v4 utility classes or CSS custom variables.
- **Bottom-Up Atomic Build**: Every visual element begins at the lowest atomic tier. Atoms are composed into molecules, molecules assemble into organisms, and organisms slot into page templates.
- **One Responsibility Per File**: Strict separation of component implementation (`.tsx`), type contracts (`.types.ts`), unit tests (`.test.tsx`), and stories (`.stories.tsx`).
- **Co-Located Tests**: Unit tests reside alongside component implementations with coverage enforcement (90% branches, functions, lines, statements).
- **Lucide Iconography Exclusively**: Official Lucide Icons (`lucide-react`) are the sole approved iconography source. No custom SVGs, Unicode symbols, emojis, or third-party icon libraries are permitted across any component.
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
| `ThemeToggle` | `@/components/atoms/ThemeToggle` | Button cycling through light, dark, and system color modes.                                 | SiteHeader, SettingsPanel, LoginScreen, HomePage                             |
| `Icon`        | `@/components/atoms/Icon`        | Scalable vector icon mapping standard application glyphs.                                   | SearchBar, Toast, AppDialog, SiteHeader                                      |
| `StatusChip`  | `@/components/atoms/StatusChip`  | Compact semantic status pill with color-coded theme and optional dot.                       | DataTable, DashboardScreen                                                   |

### Molecules

_2+ atoms composed together for a single focused purpose._

| Name               | Path                                      | Description                                                                                      | Used in                                |
| :----------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------- | :------------------------------------- |
| `FormField`        | `@/components/molecules/FormField`        | Accessible form control pairing Label, Input/Textarea/Select, and validation messages.           | SettingsPanel                          |
| `SearchBar`        | `@/components/molecules/SearchBar`        | Search input pairing Input, search Icon, and quick action Button.                                | SiteHeader, DataTable, DashboardScreen |
| `Toast`            | `@/components/molecules/Toast`            | Ephemeral notification banner pairing Badge, status Icon, and dismiss Button.                    | AppShell, SettingsPanel, Page          |
| `AppDialog`        | `@/components/molecules/AppDialog`        | Modal dialog combining Backdrop, title, content, close Button, and actions.                      | SettingsPanel, Page                    |
| `KPICard`          | `@/components/molecules/KPICard`          | Metric display card combining summary value, delta trend Icon, and status Badge.                 | Page                                   |
| `WorkflowStepper`  | `@/components/molecules/WorkflowStepper`  | Horizontal step tracker. Completed and current steps open; later steps stay locked.              | PartnershipDetail                      |
| `ReviewersLoading` | `@/components/molecules/ReviewersLoading` | Short animated state while the agent finds and maps the Strategy or Internal Interest reviewers. | PartnershipDetail                      |
| `ConfirmDialog`    | `@/components/molecules/ConfirmDialog`    | Shared confirmation popup: icon, title, description, equal Cancel and Confirm buttons.           | PartnershipDetail, VendorWebForm       |

### Organisms

_Distinct self-contained sections; orchestrates multiple molecules and atoms._

| Name                  | Path                                         | Description                                                                                                                                                                                                                                                         | Used in             |
| :-------------------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------ |
| `SiteHeader`          | `@/components/organisms/SiteHeader`          | Top navigation bar containing branding, search, nav links, ThemeToggle, and user Avatar.                                                                                                                                                                            | AppShell, Page      |
| `DataTable`           | `@/components/organisms/DataTable`           | Tabular data grid with client-side sorting, SearchBar filtering, and pagination controls.                                                                                                                                                                           | Page, SettingsPanel |
| `SettingsPanel`       | `@/components/organisms/SettingsPanel`       | Comprehensive configuration panel combining multiple FormFields, ThemeToggle, and save actions.                                                                                                                                                                     | AppShell, Page      |
| `Sidebar`             | `@/components/organisms/Sidebar`             | Expandable dark left navigation sidebar with user profile, Director designation & logout modal.                                                                                                                                                                     | HomePage, AppShell  |
| `PartnershipDetail`   | `@/components/organisms/PartnershipDetail`   | Case detail. Tabs sit under the back link: Overview and Review. Review is a locked step workflow (Director: Brief, Strategic Alignment, Internal Canvas, Approval; Admin: Brief with routing; Internal and Strategy teams: Brief, then Questionnaire or Judgement). | DashboardScreen     |
| `AgentActions`        | `@/components/organisms/AgentActions`        | Agent action list shown as dividers (no cards); rows expand to findings and output.                                                                                                                                                                                 | AnalysisDrawer      |
| `AssessmentBrief`     | `@/components/organisms/AssessmentBrief`     | Initial assessment brief in sections with a side panel, an AI analysis banner and the agent verdict.                                                                                                                                                                | PartnershipDetail   |
| `AnalysisDrawer`      | `@/components/organisms/AnalysisDrawer`      | Side drawer titled Agent Actions with a summary of findings.                                                                                                                                                                                                        | PartnershipDetail   |
| `AdminActionModal`    | `@/components/organisms/AdminActionModal`    | Partnership Admin Proceed popup (request type dropdown with agent confidence, optional reason) and Reject popup (mandatory reason).                                                                                                                                 | PartnershipDetail   |
| `RequestInfoModal`    | `@/components/organisms/RequestInfoModal`    | Editable email to the vendor that puts the case on hold.                                                                                                                                                                                                            | PartnershipDetail   |
| `BriefDecision`       | `@/components/organisms/BriefDecision`       | Director decision on the brief: approve, reject or request more info, each with a mandatory Reason.                                                                                                                                                                 | PartnershipDetail   |
| `VendorFormResponse`  | `@/components/organisms/VendorFormResponse`  | Large read-only dialog showing the vendor's original submission form.                                                                                                                                                                                               | PartnershipDetail   |
| `ReviewQuestionnaire` | `@/components/organisms/ReviewQuestionnaire` | Answer form for the questions the Director sent; view-only once submitted.                                                                                                                                                                                          | PartnershipDetail   |
| `QuestionnaireEditor` | `@/components/organisms/QuestionnaireEditor` | Question cards with reorder, edit, delete and add-question actions.                                                                                                                                                                                                 | SendInternalModal   |
| `AddQuestionModal`    | `@/components/organisms/AddQuestionModal`    | Popup to add or edit one questionnaire question.                                                                                                                                                                                                                    | QuestionnaireEditor |
| `SendInternalModal`   | `@/components/organisms/SendInternalModal`   | Send popup for Internal Interest: questionnaire dropdown, editable questions, reviewers.                                                                                                                                                                            | PartnershipDetail   |
| `ThinkingMode`        | `@/components/organisms/ThinkingMode`        | Full-pane animated agent analysis (five checks, moving dots) shown when a case is opened.                                                                                                                                                                           | PartnershipDetail   |
| `AuditLog`            | `@/components/organisms/AuditLog`            | Audit Log tab: timeline of case events with a colour legend (Critical, Agent, Approval, User).                                                                                                                                                                      | PartnershipDetail   |
| `JudgementForm`       | `@/components/organisms/JudgementForm`       | Strategy judgement (7 agent pre-filled criteria, reasons required on edits) plus the final strategic-fit decision; editable or view-only.                                                                                                                           | PartnershipDetail   |

### Screens & Pages

_Next.js route entries assembling templates, organisms, and views._

| Name              | Path                                         | Description                                                                                                                                                                         | Used in          |
| :---------------- | :------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- |
| `LoginScreen`     | `src/components/screens/LoginScreen.tsx`     | M42 SSO authentication screen with persona role selection (Director, Evaluator, etc.).                                                                                              | HomePage (`/`)   |
| `VendorWebForm`   | `src/components/screens/VendorWebForm.tsx`   | Vendor profile: the partnership request form, an AI check that suggests more detail, a confirmation before submitting, and the Case ID.                                             | HomePage (`/`)   |
| `DashboardScreen` | `src/components/screens/DashboardScreen.tsx` | Dashboard with 4 role-specific KPI cards and the requests table. Director and Admin columns: Case ID, Company, Solution description, Type, Stage, Days in stage, Owner, SLA status. | HomePage (`/`)   |
| `HomePage`        | `src/app/page.tsx`                           | Main application page integrating authentication state, Sidebar, and DashboardScreen.                                                                                               | App Router (`/`) |

---

## 5. Iconography & Icon Usage Ground Rules

To ensure visual consistency and strict design system adherence across the application:

### Approved Icon Library

- **Lucide Icons exclusively (`lucide-react`)**: All icons across the application must be Lucide outline icons.
- **No custom SVGs, Unicode symbols, or emojis**: Hand-drawn inline SVGs, raw SVG paths, FontAwesome/Material/Bootstrap sets, and Unicode glyphs (e.g. `▲`, `▼`, `✓`, `✕`) are strictly forbidden.
- **Semantic fallback**: If a specific icon is unavailable, select the closest semantically accurate icon from Lucide; never create custom artwork.

### Component-Wide Consistency

Use Lucide icons consistently across:

- **Navigation & Menus**: Sidebars, breadcrumbs, expand/collapse indicators (`ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`, `Menu`).
- **Actions & Controls**: Buttons, icon-only buttons, modal triggers, close actions (`X`, `Settings`, `Search`).
- **Data & Tables**: Column sorting indicators (`ChevronUp`, `ChevronDown`), pagination controls, row actions.
- **Forms & Inputs**: Search adornments, select carets, field status indicators.
- **Feedback & Notifications**: Status banners, toasts, dialog alerts (`Check`, `AlertCircle`, `Info`, `AlertTriangle`).
- **Theme & System**: Mode toggles (`Sun`, `Moon`, `Monitor`/`Laptop`), async loaders (`Loader2`).

### Standardized Icon Styling

- **Outline Style**: Standard outline stroke icons.
- **Stroke Width**: Fixed at `2px` across all sizes.
- **Size Scale**:
  - `sm` (Small inline icons): `16px` (`size={16}`)
  - `md` (Standard interface icons): `20px` (`size={20}`)
  - `lg` (Prominent action icons): `24px` (`size={24}`)
- **Color Tokens**: Icons inherit text colors or consume design token classes (e.g. `text-text-primary`, `text-text-secondary`, `text-status-success-icon`). No arbitrary inline colors or gradients.
- **Interaction & Accessibility**: Icon-only buttons must provide explicit `aria-label` attributes. Icons themselves include `aria-hidden="true"`.
