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

5. Slide Constructor Does Too Much (untestable) ✅

The constructor simultaneously assigns identity, adds CSS classes, injects back-link <li> elements, inserts navigator buttons, and
monkey-patches the DOM node (menuElem.\_slide = this). Testing any Slide logic requires a full live DOM subtree as a side effect.

Fix: Separate into construction (identity/relationships) and a mount() phase (DOM decoration). Replace menuElem.\_slide with a
WeakMap<HTMLElement, Slide> on the SlideMenu level to eliminate the circular reference.

---

6. Fold Feature Entanglement (change amplification) ✅

The responsive "fold" behavior is spread across 7+ locations: multiple branches in navigateTo, setTabbing, activateMenus,
setSlideLevel, updateMenuTitle, and the ResizeObserver. Fold state is inferred from a CSS class check rather than an authoritative
boolean. Any change to fold logic requires touching all of them.

Fix: Extract a FoldController with a narrow interface (open(), close(), isOpen). If no foldable items exist, use a no-op
implementation — eliminating all fold branches from the navigation logic.

---

7. God Class Decomposition (after 1–4 are fixed) ✅

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

---

Analysis: SlideMenu Class
Context: Deep review of SlideMenu and its collaborators after the God Class Decomposition (item 7) was applied. Goal: identify remaining correctness issues, design problems, API gaps, and quality improvements.

---

Findings
Patterns Observed:

- Callback-injection for controllers (AnimationController, KeyboardController) — good decoupling, but inconsistently applied (FoldController gets raw DOM elements instead)
- setTimeout-as-animation-sync — used in two places with the same transitionDuration value, but for different purposes (visibility vs. navigation) — race-prone
- DOM-read for state (setSlideLevel queries .active/.current elements) vs. in-memory state (Slide.active boolean) — mixed authority
- Linear parent-chain walk (getAllParents()) called multiple times per navigation from different callsites with no caching
- Module-level mutable state (counter, initialized) — global singletons that make multi-instance setups and test resets fragile

---

Issues Identified
🔴 Critical

1. elem parameter accepts undefined but the guard only checks null — new SlideMenu(undefined) silently passes (SlideMenu.ts:63–66)
   if (elem === null) { throw ... }
   this.menuElem = elem as MenuHTMLElement; // elem could be undefined here
   If undefined is passed the guard is skipped and this.menuElem is set to undefined, which causes a cascade of runtime errors with no useful message. The guard should be if (!elem).

---

2. show() / close() call triggerEvent() before toggleVisibility(), but toggleVisibility() calls animation.setLastAction() via triggerEvent() again inside the post-animation path — lastAction gets double-set (SlideMenu.ts:311–330)
   public show(): void {
   this.triggerEvent(Action.Open); // sets lastAction = Open on AnimationController
   this.toggleVisibility(true, ...); // … moveElem fires, transitionend fires → triggers Open-after
   }
   triggerEvent writes this.animation.setLastAction(action) every time. Because show() fires the event and then toggleVisibility immediately moves the element, whatever lastAction was set by the pre-animation event is the one used for the -after event — which happens to be correct only coincidentally. If the order ever changes, the wrong -after event fires. The lastAction on AnimationController should be set only when the animation is about to start (in moveElem), not in the general event dispatcher.

---

3. navigateTo timeout races with visibilityTimeoutId — both share transitionDuration as the delay (SlideMenu.ts:250–264, 393–411)
   Both toggleVisibility (focus-after-open) and navigateTo (focus-after-navigate) fire at transitionDuration ms. If navigateTo is called immediately after open() (which happens in open() itself), the two timeouts expire at roughly the same time and both call focusFirstElem(). The second focus-call can steal focus from wherever the first correctly placed it. The visibilityTimeoutId timeout inside the show path should be cancelled whenever navigateTo fires its own focus logic.

---

🟡 Warning 4. setSlideLevel reads the DOM to count active slides instead of using the in-memory slide list (SlideMenu.ts:527–535)
const activeNum = Array.from(
this.sliderWrapperElem.querySelectorAll(`.${CLASSES.active}, .${CLASSES.current}`)
).length;
this.slides already has slide.isActive — a plain this.slides.filter(s => s.isActive && !s.isFoldable).length would be correct, faster, and not depend on DOM query timing (DOM class mutations happen synchronously but this is called before the deactivation timeout fires). The DOM query currently counts slides that are about to be deactivated because the deactivation happens in the post-animation timeout, creating an off-by-one when navigating backwards.

---

5. initMenu() adds this.options.position to classList twice (SlideMenu.ts:80, 634)
   // constructor:
   this.menuElem.classList.add(this.options.position); // line 80
   // initMenu():
   this.menuElem.classList.add(this.options.position); // line 634
   The second classList.add is a no-op because the class is already present, but it signals that the responsibility split between constructor and initMenu is unclear.

---

6. defaultOpenTarget is a get accessor that runs a DOM lookup every time it's read (SlideMenu.ts:179–187)
   It's read in the constructor (navigateTo) and again in open(). Both calls read the same four dataset properties and call getTargetSlideByIdentifier. Since neither the DOM attributes nor the slide list change after construction, this should be computed once and cached.

---

7. hideControlsIfOnRootLevel queries document (global scope) not this.menuElem (SlideMenu.ts:512–524)
   document.querySelectorAll(`.${CLASSES.control}.${CLASSES.hiddenOnRoot}, ...`)
   With multiple menu instances on the same page this will affect controls belonging to all menus. The query should be scoped to a closest shared container, or controls should be registered per-instance.

---

8. lastAction is stored on both SlideMenu (this.lastAction) and AnimationController (this.lastAction) with no clear authority (SlideMenu.ts:38, AnimationController.ts:14)
   SlideMenu.lastAction is set in triggerEvent but never read after that. AnimationController.lastAction is set via setLastAction() and used in onTransitionEnd. The field on SlideMenu is dead state — it can be removed.

---

9. FoldController close branch re-appends all slides (including non-foldable ones) to sliderWrapperElem (FoldController.ts:39–45)
   close(): void {
   this.slides.forEach((slide) => {
   slide.appendTo(this.sliderWrapperElem); // ALL slides, not just foldable
   });
   This silently re-appends already-correctly-placed non-foldable slides on every close(). Appending an existing child is a no-op in the DOM but it is needless work and confusing. Only foldable slides should be moved back.

---

10. open() calls navigateTo(target) which calls show() internally when !this.isOpen, but open() also calls show() unconditionally afterwards (SlideMenu.ts:284–297)
    public open(): void {
    …
    if (target) {
    this.navigateTo(target); // this calls show() if !isOpen
    }
    this.show(animate); // always calls show() again
    }
    show() is idempotent in practice (it just re-adds the class and re-triggers the event), but it fires Action.Open twice and triggers two animate.moveElem calls. The navigateTo call inside open should pass runInForeground: false to avoid the automatic show(), or the guard in navigateTo should be removed and open() should own the full open sequence.

---

11. toggleVisibility(show?: boolean) — the undefined branch delegates to close(animate)/show(animate) which re-enter toggleVisibility(false/true) — the animate param is forwarded but unused in that path (SlideMenu.ts:230–240)
    The undefined-branch of toggleVisibility calls this.close(animate) / this.show(animate), which in turn call this.toggleVisibility(false/true, animate) — effectively a re-entrant call with animate forwarded. The outer toggleVisibility(undefined, animate) call never reaches the section that actually uses animate. The animate parameter's effect is only felt in the recursive inner call. This is confusing; toggle(animate) should call close(animate) / open(animate) directly rather than going through toggleVisibility.

---

12. initSlideMenuGlobal() is guarded by the module-level initialized flag, but the global click handler and window.SlideMenu assignment are at module scope with no guard (SlideMenu.ts:730–732)
    window.SlideMenu = SlideMenu; // no guard
    window.dispatchEvent(new Event('sm.ready')); // no guard
    These two statements run on every import. In a bundler that tree-shakes or deduplicates modules this is fine, but in a test environment that re-requires the module they fire multiple times. The initialized guard that protects initSlideMenuGlobal doesn't protect these two statements.

---

13. Slide.canFold() reads window.innerWidth directly — not injectable (Slide.ts:223–225)
    canFold(): boolean {
    return this.isFoldable && window.innerWidth >= this.options.minWidthFold;
    }
    window.innerWidth is not mockable without jsdom tricks. Moving the viewport width check to the ResizeObserver callback in SlideMenu (which already has it) and passing the result down to slides would make this testable.

---

🔵 Suggestion 14. getAllParents() is called up to 5 times per navigation (navigateTo + setTabbing)
navigateTo calls nextMenu.getAllParents() (line 359), then getAllFoldableParents() (which calls it again), then getFirstUnfoldableParent() (again), then setTabbing calls nextMenu.getAllParents() again. Each call allocates a new array and walks the chain. Compute once per navigation call and pass it down.

---

15. Action enum value Navigate ('navigate') fires on every navigation but is not documented in the README — it is a distinct event from NavigateTo ('navigateTo') and Back ('back') (SlideMenu.ts:369–378)
    Every navigation fires both sm.navigate and one of sm.navigateTo / sm.back / sm.forward. The general sm.navigate event is useful but its relationship with the specific direction events is not explained. Worth documenting.

---

16. Direction enum is exported but unused (SlideMenuOptions.ts:20–23)
    Referenced in improvements.md item 8. It has been in the codebase since the original and is still dead code today.

---

17. debugLog is public and accepts ...any[] (SlideMenu.ts:220–224)
    As a public API method it pollutes the instance interface. It is only useful internally. Making it private (or removing the method entirely in favour of inline if (this.options.debug) console.log(...)) keeps the public API surface clean.

---

18. Slide.options is public readonly (Slide.ts:29)
    The entire SlideMenuOptions object is accessible on every Slide instance. Options are only consumed by canFold(), mount(), and the aria/back-link methods. Passing only the specific values needed (e.g. minWidthFold, showBackLink, etc.) instead of the full options bag would reduce coupling and make slides easier to construct in unit tests.

---

Recommendations

# Finding

1 undefined guard
2 Double setLastAction
3 Timeout race (focus)
4 DOM query for level
5 Duplicate classList.add
6 defaultOpenTarget re-computed
7 hideControlsIfOnRootLevel global scope
8 Dead lastAction field
9 FoldController.close re-appends all
10 Double show() in open()
11 toggleVisibility re-entrancy
12 Unguarded module-level side effects
13 window.innerWidth in Slide
14 Redundant getAllParents calls
15 Direction dead export
16 debugLog public
17 Slide.options full bag

---

### Trade-offs

- **Items 1, 5, 8, 15, 16** — zero risk, zero trade-off, purely additive correctness/cleanliness
- **Items 3, 4, 10, 11** — behavioural changes that need test coverage for the race/double-fire scenarios; the existing Cypress suite covers the visible outcome but not timing-sensitive edge cases
- **Item 13** — making `canFold` accept injected width is a clean-cut improvement but changes the `Slide` interface, which is public API (exported in `index.ts`)
- **Item 17** — narrowing `Slide` constructor options is a breaking change for any downstream consumers who construct `Slide` directly; could be done with an adapter type

---
