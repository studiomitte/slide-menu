# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **ddev** for local development. There is a dedicated `cypress` ddev service for running e2e tests.

```sh
ddev start                  # start all services (frontend + cypress containers)
ddev ssh -s frontend        # shell into the frontend container
ddev ssh -s cypress         # shell into the cypress container
```

Inside the frontend container:

```sh
npm run watch        # dev server at http://frontend:8080 (slide-menu.frontend.ddev.site:9999)
npm run build        # tsc compile + vite bundle → dist/
npm run typecheck    # type-check only, no emit
npm run lint         # oxlint on the three core source files (0 warnings tolerance)
npm run format       # oxfmt on src/ (configured via .oxfmtrc.json, single quotes)
```

Tests use a custom ddev host command that auto-starts the Vite dev server if needed:

```sh
ddev test            # starts dev server if not running, then runs cypress in the cypress container
npm run test         # alias for ddev test
```

**Release flow:** `npm run version-patch|minor|major` runs lint + typecheck + format + tests + build then bumps version; `npm run publish-version` pushes and publishes to npm.

Tests target `http://frontend:8080` and require the dev server (`npm run watch`) to be running in the frontend container first.

## Two build outputs

There are two distinct outputs from a single source:

| Output                                       | Entry point                | Purpose                                                                         |
| -------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `dist/slide-menu.js` + `dist/slide-menu.css` | `src/lib/SlideMenu.min.ts` | Standalone browser bundle (Vite) — exposes `window.SlideMenu`, fires `sm.ready` |
| `dist/index.js` + type declarations          | `src/index.ts`             | ES module for npm consumers (tsc only)                                          |

`src/lib/SlideMenu.min.ts` just imports the SCSS and re-exports `SlideMenu`. The Vite config (`vite.config.js`) takes this as its entry and roots at `src/`. `tsconfig.json` roots at `src/index.ts` only and outputs to `dist/`.

## Architecture

### Core classes

**`src/lib/SlideMenu.ts`** — main class (~850 lines). Orchestrates everything: DOM construction, navigation state, animation, fold behaviour, keyboard/focus management. Also contains module-level side effects: a global `document` click dispatcher that routes `data-action` buttons to menu instances, `window.SlideMenu = SlideMenu`, and `window.dispatchEvent(new Event('sm.ready'))`.

**`src/lib/Slide.ts`** — represents one `<ul>` submenu panel. Constructed by `SlideMenu.initSlides()` for every `<a>` that has a sibling `<ul>`. Handles its own activation state, tabbing (via `inert`), back-link injection, and navigator button injection. Stores a back-reference on the DOM node (`menuElem._slide`).

**`src/lib/SlideMenuOptions.ts`** — options interface, enums (`Action`, `MenuPosition`), and the `CLASSES` / `NAMESPACE` constants that drive all CSS class names.

**`src/lib/utils/dom.ts`** — small DOM helpers: `trapFocus`, `focusFirstTabAbleElemIn`, `parentsOne`, `validateQuery`, `alignTop`.

### Slide graph

On init, `SlideMenu` walks all `<a>` elements and creates a `Slide` for each that has a sibling `<ul>`. The root `<ul>` also gets a `Slide`. All slides are appended into `.slide-menu__slider__wrapper` (or the `.slide-menu__foldable__wrapper` for foldable slides). The graph is parent-linked: `Slide.parent` points to the containing slide, resolved at construction time via `anchorElem.closest('ul')._slide`.

### Navigation model

`navigateTo(target)` is the single entry point for all navigation. It:

1. Resolves `target` to a `Slide` via `findNextMenu`
2. Determines direction (forward/back) by comparing parent chains
3. Calls `activateMenus`, `setTabbing`, `setSlideLevel`, `updateMenuTitle`
4. Schedules a post-animation timeout (stored as `navigateTimeoutId`) to focus the first element and deactivate the previous slide

Navigation depth is tracked as a CSS variable `--smdm-sm-menu-level` set on the menu element, which drives the `translateX` of `.slide-menu__slider__wrapper` via a calc chain in SCSS.

### Foldable submenus

Slides whose anchor has class `slide-menu__item--has-foldable-submenu` are `isFoldable = true`. When `window.innerWidth >= options.minWidthFold`, `canFold()` returns true and foldable slides are moved into `.slide-menu__foldable__wrapper` (rendered side-by-side) rather than the slider. A `ResizeObserver` on `document.body` triggers `openFold`/`closeFold` at the breakpoint. Fold state affects `setTabbing`, `activateMenus`, `setSlideLevel`, and `updateMenuTitle` throughout.

### CSS variables

Instance-specific variables (`--smdm-sm-menu-width`, `--smdm-sm-min-width-fold`, `--smdm-sm-transition-duration`, `--smdm-sm-menu-level`) are set on the `.slide-menu` element directly so multiple instances on one page don't conflict. The `:root` block in SCSS provides fallback defaults for user-overridable theme vars only.

The derived calc vars (`--smdm-sm-calc-menu-width`, `--smdm-sm-calc-slide-width`, `--smdm-sm-calc-wrapper-translation`) are declared inside `.slide-menu {}` in SCSS — not `:root` — so Chrome recomputes them per-instance using each element's own inline-style values. Declaring them in `:root` would cause `var()` references inside the formula to capture `:root`'s values at declaration time, breaking per-instance isolation.

### Data-action dispatch

The module-level click listener handles all `[data-action]` buttons. Valid actions are defined in the `ALLOWED_ACTIONS` set. `data-target` on the button identifies which menu instance to control (falls back to closest ancestor `.slide-menu`). `data-arg` passes an optional argument to the method.

### Accessibility

- `inert` attribute controls tabbing — slides are marked inert when not active/visible
- Focus is trapped inside the open menu via `trapFocus` in the menu's keydown handler
- WCAG: `<a role="button">` elements respond to Space via a keydown handler
- `aria-expanded` is maintained on anchors or navigator buttons depending on mode
- Controls with `slide-menu--hidden-on-root-level` / `slide-menu--invisible-on-root-level` have `tabindex="-1"` injected at root level
