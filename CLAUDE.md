# CLAUDE.md — Agent Guidelines & Project Conventions

This project is a strict Next.js 15 App Router application with CSS-first Tailwind CSS v4, custom atomic design tokens, and rigorous quality enforcement.

## 1. Package Manager Scripts

Always use `pnpm` as the package manager:

- `pnpm dev` — Starts Next.js development server on `http://localhost:3000`.
- `pnpm build` — Creates production bundle via `next build`.
- `pnpm start` — Runs the compiled Next.js production build.
- `pnpm lint` — Runs ESLint across `src/` using flat config (`eslint.config.mjs`).
- `pnpm typecheck` — Executes `tsc --noEmit` under strict TypeScript rules.
- `pnpm test` — Runs all unit and integration tests with Vitest.
- `pnpm test:watch` — Runs Vitest in interactive watch mode.
- `pnpm test:coverage` — Runs Vitest with v8 coverage (strict 90% threshold across branches, functions, lines, statements).
- `pnpm test:e2e` — Runs end-to-end browser specs with Playwright (`e2e/`).
- `pnpm storybook` — Starts Storybook v10 dev server on port 6006.
- `pnpm build-storybook` — Compiles static Storybook bundle for deployment.
- `pnpm prepare` — Installs Husky git hooks.

## 2. Design Tokens Are Non-Negotiable

- Never use raw hex, rgb, or hsl values outside `src/styles/tokens/primitives.css`.
- Never use inline `style={{ color: '...' }}` or arbitrary colors.
- Use semantic token utility classes (e.g. `bg-bg-surface-1`, `text-text-primary`, `border-border-default`) or `var(--token-name)`.
- Core files (`primitives.css`, `light.css`, `dark.css`) carry `DO NOT EDIT` directives. Tenant/white-label adjustments belong exclusively in `src/styles/tokens/brand.css`.
- Do not create or introduce `tailwind.config.js` or `tailwind.config.ts`. Tailwind v4 is CSS-first.

## 3. Atomic Design File Conventions

Every component in `src/components/{layer}/{ComponentName}/` MUST follow this exact 5-file structure:

```
ComponentName/
  ComponentName.tsx          # Component implementation (single DOM element for atoms; no children)
  ComponentName.types.ts     # Props interface contract
  ComponentName.test.tsx     # Co-located Vitest + React Testing Library tests
  ComponentName.stories.tsx  # Storybook stories (Default, variant stories, and EdgeCases)
  index.ts                   # Named re-export of component and types
```

Every component file must begin with this exact JSDoc header:

```typescript
/**
 * ComponentName — Atom | Molecule | Organism | Template
 * One-line description.
 * Used in: NameA, NameB
 */
```

Atomic rule: _If a component composes any other component, it is NOT an atom._

## 4. Path Aliases

- Always use `@/components/{layer}/{Name}` for component imports (e.g., `import { Button } from '@/components/atoms/Button'`).
- Always use `@/contexts/ThemeContext` for context hooks.
- **NEVER** use relative `../../` imports across architectural layers.

## 5. DESIGN.md Maintenance

`DESIGN.md` resides at the repository root (`./DESIGN.md`). Whenever you add, rename, or alter a component:

- Update the component inventory tables in `DESIGN.md`.
- Ensure the path, description, and "Used in" references are accurate.

## 6. Git Hooks & Conventional Commits

- Husky 9 executes `lint-staged` on `pre-commit` and `pnpm typecheck && pnpm test` on `pre-push`.
- Commit messages are validated by `@commitlint/config-conventional` via `commit-msg`.
- All commit messages MUST strictly adhere to Conventional Commits:
  - `feat: add new search drawer molecule`
  - `fix: correct text-tertiary contrast ratio in dark theme`
  - `test: add edge cases for data table pagination`
  - `chore: update storybook configuration`
