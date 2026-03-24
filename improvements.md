---
1. Module-Level Side Effects (blocks testing, breaks SSR) ✅

Three bare statements execute the moment the module is imported:
- document.addEventListener('click', ...) — the global action dispatcher, unremovable
- window.SlideMenu = SlideMenu
- window.dispatchEvent(new Event('sm.ready')) — fires before any instance exists

Fix: Wrap all three in an explicit initSlideMenuGlobal() export. A bare module import should have zero side effects. This is also
the prerequisite for any unit testing.

---

2. No Destroy / Cleanup (memory leaks) ✅

- The ResizeObserver reference is immediately lost after construction — can never be disconnected
- document.addEventListener('keydown') uses an anonymous arrow, making it impossible to remove
- Multiple menus accumulate keydown listeners permanently
- setTimeout IDs are never saved → stale animation callbacks pile up on rapid interaction

Fix: Store all observer/listener/timeout references as instance fields; add a destroy() method.

---

3. CSS Variables Written on document.documentElement (multi-instance bug) ✅

--smdm-sm-menu-width, --smdm-sm-min-width-fold, --smdm-sm-transition-duration, and --smdm-sm-menu-level are all set on :root. A
second SlideMenu instance silently overwrites the first's values.

Fix: Set them on this.menuElem instead. Adjust the SCSS selectors accordingly.

---

4. Action Enum Does Double Duty (type-safety gap) ✅

The same enum drives both internal custom event names (sm.navigate) and HTML data-action attribute values
(data-action="navigateTo"). The global click handler does open-ended dynamic dispatch: slideMenuInstance[methodName]() — any string
in data-action is resolved as a method call with no allowlist.

Fix: Split into SlideMenuEvent (internal pub/sub) and a narrowly typed DataAction = 'open' | 'close' | 'toggle' | 'navigateTo' |
'back' for the HTML API. Add an explicit allowlist in the dispatcher.

---

5. Slide Constructor Does Too Much (untestable)

The constructor simultaneously assigns identity, adds CSS classes, injects back-link <li> elements, inserts navigator buttons, and
monkey-patches the DOM node (menuElem.\_slide = this). Testing any Slide logic requires a full live DOM subtree as a side effect.

Fix: Separate into construction (identity/relationships) and a mount() phase (DOM decoration). Replace menuElem.\_slide with a
WeakMap<HTMLElement, Slide> on the SlideMenu level to eliminate the circular reference.

---

6. Fold Feature Entanglement (change amplification)

The responsive "fold" behavior is spread across 7+ locations: multiple branches in navigateTo, setTabbing, activateMenus,
setSlideLevel, updateMenuTitle, and the ResizeObserver. Fold state is inferred from a CSS class check rather than an authoritative
boolean. Any change to fold logic requires touching all of them.

Fix: Extract a FoldController with a narrow interface (open(), close(), isOpen). If no foldable items exist, use a no-op
implementation — eliminating all fold branches from the navigation logic.

---

7. God Class Decomposition (after 1–4 are fixed)

SlideMenu handles 8 distinct responsibilities in 830 lines. Natural extraction points:

- AnimationController — moveElem, runWithoutAnimation, isAnimating, onTransitionEnd, timeout management
- FoldController — (see #6)
- KeyboardController — initKeybindings, space-key handler, focus trap

SlideMenu becomes an orchestrator. Each controller can be unit-tested in isolation.

---

8. Minor Issues

- Direction enum (Backward/Forward) is exported publicly but referenced nowhere in source — either wire it in or remove it
- Two module-level counters (counter in SlideMenu, number in Slide) are mutable module state; consider crypto.randomUUID() or a
  shared ID generator with a test-reset escape hatch

---

Priority order: 1 → 2 → 3 → 4 → 5 → 6 → 7. Items 1–4 are narrow, incremental changesets. Items 5–7 benefit from having test
coverage first — which is why #1 (unblocking unit tests) is the highest-leverage starting point.
