import { Slide } from './Slide.js';
import { ActiveFoldController, NoopFoldController } from './FoldController.js';
import { AnimationController } from './AnimationController.js';
import { KeyboardController } from './KeyboardController.js';
import { Action, MenuPosition, CLASSES, NAMESPACE } from './SlideMenuOptions.js';
import { parentsOne } from './utils/dom.js';
const DEFAULT_OPTIONS = {
    backLinkAfter: '',
    backLinkBefore: '',
    showBackLink: true,
    keyClose: 'Escape',
    keyOpen: '',
    position: MenuPosition.Right,
    submenuLinkBefore: '',
    closeOnClickOutside: false,
    navigationButtonsLabel: 'Open submenu ',
    navigationButtons: false,
    menuWidth: 320, // px
    minWidthFold: 640, // px
    transitionDuration: 300, // ms
    dynamicOpenDefault: false,
    debug: false,
    id: '',
};
let counter = 0;
let initialized = false;
export class SlideMenu {
    constructor(elem, options) {
        var _a, _b, _c, _d;
        this.lastFocusedElement = null;
        this.isOpen = false;
        this.slides = [];
        this.sortedSlides = [];
        this.slidesByElem = new WeakMap();
        this.menuTitleDefaultText = 'Menu';
        this.cachedDefaultOpenTarget = undefined;
        // Stored references for cleanup
        this.resizeObserver = null;
        this.outsideClickHandler = null;
        if (!elem) {
            throw new Error('Argument `elem` must be a valid HTML node');
        }
        // (Create a new object for every instance)
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.menuElem = elem;
        this.options.id = this.menuElem.id ? this.menuElem.id : 'smdm-slide-menu-' + counter;
        counter++;
        if (!initialized) {
            initialized = true;
            initSlideMenuGlobal();
        }
        this.menuElem.id = this.options.id;
        this.menuElem.classList.add(NAMESPACE);
        this.menuElem.classList.add(this.options.position);
        this.menuElem.role = 'navigation';
        // Save this instance in menu to DOM node
        this.menuElem._slideMenu = this;
        // Set instance-specific CSS variables on the menu element (width, duration).
        this.menuElem.style.setProperty('--smdm-sm-menu-width', `${this.options.menuWidth}px`);
        this.menuElem.style.setProperty('--smdm-sm-min-width-fold', `${this.options.minWidthFold}px`);
        this.menuElem.style.setProperty('--smdm-sm-transition-duration', `${this.options.transitionDuration}ms`);
        this.menuElem.style.setProperty('--smdm-sm-menu-level', '0');
        // Add slider container
        this.sliderElem = document.createElement('div');
        this.sliderElem.classList.add(CLASSES.slider);
        while (this.menuElem.firstChild) {
            this.sliderElem.appendChild(this.menuElem.firstChild);
        }
        this.menuElem.appendChild(this.sliderElem);
        // Add slider wrapper (for the slide effect)
        this.sliderWrapperElem = document.createElement('div');
        this.sliderWrapperElem.classList.add(CLASSES.sliderWrapper);
        this.sliderElem.appendChild(this.sliderWrapperElem);
        // Add foldable wrapper
        this.foldableWrapperElem = document.createElement('div');
        this.foldableWrapperElem.classList.add(CLASSES.foldableWrapper);
        this.sliderElem.after(this.foldableWrapperElem);
        // Extract menu title
        this.menuTitle = this.menuElem.querySelector(`.${CLASSES.title}`);
        this.menuTitleDefaultText = (_c = (_b = (_a = this.menuTitle) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : this.menuTitleDefaultText;
        // Wire up AnimationController early — initMenu() uses runWithoutAnimation
        this.animation = new AnimationController(this.menuElem, this.sliderElem, this.foldableWrapperElem, this.sliderWrapperElem, (action, afterAnimation) => this.triggerEvent(action, afterAnimation));
        this.initMenu();
        if (this.slides.length === 0) {
            throw new Error('SlideMenu: no <ul> found inside the menu element. A root <ul> is required.');
        }
        this.initSlides();
        const hasFoldable = this.slides.some((s) => s.isFoldable);
        this.fold = hasFoldable
            ? new ActiveFoldController(this.slides, this.sliderWrapperElem, this.foldableWrapperElem, this.menuElem)
            : new NoopFoldController();
        this.sortedSlides = this.slides.slice().sort((a, b) => {
            const depthA = a.ref.split('/').length;
            const depthB = b.ref.split('/').length;
            if (depthB !== depthA)
                return depthB - depthA;
            return b.ref.length - a.ref.length;
        });
        // Cache the default open target once — resolving it requires sortedSlides to be ready
        this.cachedDefaultOpenTarget = this.resolveDefaultOpenTarget();
        // Wire up KeyboardController
        this.keyboard = new KeyboardController({ keyClose: this.options.keyClose, keyOpen: this.options.keyOpen }, {
            close: () => this.close(),
            show: () => this.show(),
            getActiveSubmenu: () => this.activeSubmenu,
            getMenuElem: () => this.menuElem,
        });
        this.initEventHandlers();
        // Enable Menu
        this.menuElem.style.display = 'flex';
        // Set the default open target and activate it
        this.activeSubmenu = this.rootSlide.activate();
        this.navigateTo((_d = this.cachedDefaultOpenTarget) !== null && _d !== void 0 ? _d : this.rootSlide, false);
        // Start observing viewport changes only after activeSubmenu is initialised,
        // because the ResizeObserver callback fires synchronously on the first observe() call.
        if (hasFoldable) {
            this.initResizeObserver();
        }
        this.menuElem.setAttribute('inert', 'true');
        this.slides.forEach((menu) => {
            menu.disableTabbing();
        });
        // Send event that menu is initialized
        this.triggerEvent(Action.Initialize);
    }
    resolveDefaultOpenTarget() {
        var _a, _b, _c;
        const defaultTargetSelector = (_c = (_b = (_a = this.menuElem.dataset.openDefault) !== null && _a !== void 0 ? _a : this.menuElem.dataset.defaultTarget) !== null && _b !== void 0 ? _b : this.menuElem.dataset.openTarget) !== null && _c !== void 0 ? _c : this.menuElem.dataset.defaultOpenTarget;
        if (!defaultTargetSelector)
            return undefined;
        return this.getTargetSlideByIdentifier(defaultTargetSelector);
    }
    get rootSlide() {
        return this.slides[0];
    }
    get isFoldOpen() {
        return this.fold.isOpen;
    }
    /**
     * Clean up all event listeners, observers, and pending timeouts
     */
    destroy() {
        var _a, _b, _c;
        clearTimeout(this.visibilityTimeoutId);
        clearTimeout(this.navigateTimeoutId);
        this.animation.destroy();
        this.keyboard.destroy();
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
        }
        (_a = this.resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.menuElem.removeAttribute('inert');
        (_b = document.body) === null || _b === void 0 ? void 0 : _b.classList.remove(CLASSES.open);
        (_c = document.body) === null || _c === void 0 ? void 0 : _c.removeAttribute('data-slide-menu-level');
        delete this.menuElem._slideMenu;
    }
    debugLog(...args) {
        if (this.options.debug) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            console.log(...args);
        }
    }
    /**
     * Toggle the menu
     */
    toggleVisibility(show, animate = true) {
        let offset;
        if (show === undefined) {
            if (this.isOpen) {
                this.close(animate);
            }
            else {
                this.show(animate);
            }
            return;
        }
        clearTimeout(this.visibilityTimeoutId);
        if (show) {
            offset = 0;
            this.lastFocusedElement = document.activeElement;
            // Can mess with animation - set focus after animation is done
            this.visibilityTimeoutId = setTimeout(() => {
                var _a;
                (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.focusFirstElem();
            }, this.options.transitionDuration);
        }
        else {
            offset = this.options.position === MenuPosition.Left ? '-100%' : '100%';
            // Deactivate all menus and hide fold
            // Timeout to not mess with animation because of setting the focus
            this.visibilityTimeoutId = setTimeout(() => {
                var _a;
                this.slides.forEach((menu) => !menu.isActive && menu.deactivate());
                // Refocus last focused element before opening menu
                // @ts-expect-error // possibly has no focus() function
                (_a = this.lastFocusedElement) === null || _a === void 0 ? void 0 : _a.focus();
                this.fold.close();
            }, this.options.transitionDuration);
        }
        this.isOpen = !!show;
        this.animation.moveElem(this.menuElem, offset, '%', show ? Action.Open : Action.Close);
    }
    /**
     * Get menu that has current path or hash as anchor element or within the menu
     * @returns
     */
    getTargetSlideDynamically() {
        const currentPath = location.pathname;
        const currentHash = location.hash;
        const currentHashItem = this.slides.find((menu) => menu.matches(currentHash));
        const currentPathItem = this.slides.find((menu) => menu.matches(currentPath));
        return currentPathItem !== null && currentPathItem !== void 0 ? currentPathItem : currentHashItem;
    }
    open(animate = true) {
        var _a;
        const target = (_a = (this.options.dynamicOpenDefault
            ? this.getTargetSlideDynamically()
            : this.cachedDefaultOpenTarget)) !== null && _a !== void 0 ? _a : this.activeSubmenu;
        this.menuElem.removeAttribute('inert');
        if (target) {
            this.navigateTo(target);
        }
        this.show(animate);
    }
    toggle(animate = true) {
        if (this.isOpen) {
            this.close(animate);
            return;
        }
        this.open(animate);
    }
    /**
     * Shows the menu, adds `slide-menu--open` class to body
     */
    show(animate = true) {
        var _a;
        this.triggerEvent(Action.Open);
        this.toggleVisibility(true, animate);
        (_a = document.body) === null || _a === void 0 ? void 0 : _a.classList.add(CLASSES.open);
    }
    /**
     * Hide / Close the menu, removes `slide-menu--open` class from body
     */
    close(animate = true) {
        var _a;
        this.triggerEvent(Action.Close);
        this.toggleVisibility(false, animate);
        this.menuElem.setAttribute('inert', 'true');
        this.slides.forEach((menu) => {
            menu.disableTabbing();
        });
        (_a = document.body) === null || _a === void 0 ? void 0 : _a.classList.remove(CLASSES.open);
    }
    /**
     * Navigate one menu hierarchy back if possible
     */
    back(closeFold = false) {
        var _a, _b, _c, _d, _e, _f;
        let nextMenu = (_b = (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.parent) !== null && _b !== void 0 ? _b : this.rootSlide;
        if (closeFold) {
            this.activeSubmenu = (_d = (_c = this.activeSubmenu) === null || _c === void 0 ? void 0 : _c.getClosestUnfoldableSlide()) !== null && _d !== void 0 ? _d : this.rootSlide;
            nextMenu = (_f = (_e = this.activeSubmenu) === null || _e === void 0 ? void 0 : _e.parent) !== null && _f !== void 0 ? _f : this.rootSlide;
            this.fold.close();
        }
        // Event is triggered in navigate()
        this.navigateTo(nextMenu);
    }
    /**
     * Navigate to a specific submenu of link on any level (useful to open the correct hierarchy directly), if no submenu is found opens the submenu of link directly
     */
    navigateTo(target, runInForeground = true) {
        // Open Menu if still closed
        if (runInForeground && !this.isOpen) {
            this.show();
        }
        const nextMenu = this.findNextMenu(target);
        const previousMenu = this.activeSubmenu;
        const parents = nextMenu.getAllParents();
        const firstUnfoldableParent = nextMenu.getFirstUnfoldableParent();
        const visibleSlides = new Set([nextMenu, ...nextMenu.getAllFoldableParents()]);
        if (firstUnfoldableParent) {
            visibleSlides.add(firstUnfoldableParent);
        }
        const isNavigatingBack = previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.hasParent(nextMenu);
        const isNavigatingForward = nextMenu === null || nextMenu === void 0 ? void 0 : nextMenu.hasParent(previousMenu);
        if (runInForeground) {
            this.triggerEvent(Action.Navigate);
            if (isNavigatingBack) {
                this.triggerEvent(Action.Back);
            }
            else if (isNavigatingForward) {
                this.triggerEvent(Action.Forward);
            }
            else {
                this.triggerEvent(Action.NavigateTo);
            }
        }
        this.updateMenuTitle(nextMenu, firstUnfoldableParent);
        this.setTabbing(nextMenu, firstUnfoldableParent, previousMenu, parents);
        // all parents need to be active to calculate slider width and level
        const nextActiveMenus = [nextMenu, ...parents];
        this.activateMenus(nextActiveMenus, isNavigatingBack, previousMenu, nextMenu);
        const level = this.setSlideLevel(nextMenu, isNavigatingBack);
        this.hideControlsIfOnRootLevel(level);
        this.activeSubmenu = nextMenu;
        clearTimeout(this.navigateTimeoutId);
        this.navigateTimeoutId = setTimeout(() => {
            if (runInForeground) {
                // Wait for animation to finish to focus next link in nav otherwise focus messes with slide animation
                nextMenu.focusFirstElem();
            }
            if (isNavigatingBack) {
                // Wait for animation to finish to deactivate previous otherwise width of container messes with slide animation
                previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.deactivate();
            }
            // hide all non visible menu elements to prevent screen reader confusion
            this.slides.forEach((slide) => {
                if (slide.isActive && !visibleSlides.has(slide)) {
                    slide.setInvisible();
                }
            });
        }, this.options.transitionDuration);
    }
    setBodyTagSlideLevel(level) {
        var _a;
        (_a = document.body) === null || _a === void 0 ? void 0 : _a.setAttribute('data-slide-menu-level', level.toString());
    }
    setTabbing(nextMenu, firstUnfoldableParent, previousMenu, parents) {
        if (this.isOpen) {
            this.menuElem.removeAttribute('inert');
        }
        if (nextMenu.canFold()) {
            this.fold.open();
            // Enable Tabbing for foldable Parents
            nextMenu.getAllParents().forEach((menu) => {
                if (menu.canFold()) {
                    menu.enableTabbing();
                }
            });
            firstUnfoldableParent === null || firstUnfoldableParent === void 0 ? void 0 : firstUnfoldableParent.enableTabbing();
            // disable Tabbing for invisible unfoldable parents
            firstUnfoldableParent === null || firstUnfoldableParent === void 0 ? void 0 : firstUnfoldableParent.getAllParents().forEach((menu) => {
                menu.disableTabbing();
            });
            return;
        }
        if ((previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.canFold()) && !nextMenu.canFold()) {
            this.fold.close();
        }
        parents.forEach((menu) => {
            menu.disableTabbing();
        });
        nextMenu.enableTabbing();
    }
    activateMenus(currentlyActiveMenus, isNavigatingBack, previousMenu, nextMenu) {
        const currentlyActiveIds = currentlyActiveMenus.map((menu) => menu === null || menu === void 0 ? void 0 : menu.id);
        // Disable all previous active menus not active now
        this.slides.forEach((slide) => {
            if (!currentlyActiveIds.includes(slide.id)) {
                // When navigating backwards deactivate (hide) previous after transition to not mess with animation
                if (isNavigatingBack && slide.id === (previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.id)) {
                    return;
                }
                slide.deactivate();
                slide.disableTabbing();
            }
        });
        // Activate menus
        currentlyActiveMenus.forEach((menu) => {
            menu === null || menu === void 0 ? void 0 : menu.activate();
        });
        nextMenu.enableTabbing();
    }
    findNextMenu(target) {
        if (typeof target === 'string') {
            const menu = this.getTargetSlideByIdentifier(target);
            if (menu instanceof Slide) {
                return menu;
            }
            else {
                throw new Error('Invalid parameter `target`. A valid query selector is required.');
            }
        }
        if (target instanceof HTMLElement) {
            const menu = this.slides.find((menu) => menu.contains(target));
            if (menu instanceof Slide) {
                return menu;
            }
            else {
                throw new Error('Invalid parameter `target`. Not found in slide menu');
            }
        }
        if (target instanceof Slide) {
            return target;
        }
        else {
            throw new Error('No valid next slide fund');
        }
    }
    hideControlsIfOnRootLevel(level) {
        const controlsToHideIfOnRootLevel = document.querySelectorAll(`.${CLASSES.control}.${CLASSES.hiddenOnRoot}, .${CLASSES.control}.${CLASSES.invisibleOnRoot}`);
        if (level === 0) {
            controlsToHideIfOnRootLevel.forEach((elem) => {
                elem.setAttribute('tabindex', '-1');
            });
        }
        else {
            controlsToHideIfOnRootLevel.forEach((elem) => {
                elem.removeAttribute('tabindex');
            });
        }
    }
    setSlideLevel(nextMenu, isNavigatingBack = false) {
        const activeNum = Array.from(this.sliderWrapperElem.querySelectorAll(`.${CLASSES.active}, .${CLASSES.current}`)).length;
        const navDecrement = !(nextMenu === null || nextMenu === void 0 ? void 0 : nextMenu.canFold()) ? Number(isNavigatingBack) : 0;
        const level = Math.max(1, activeNum) - 1 - navDecrement;
        this.setBodyTagSlideLevel(level);
        this.menuElem.style.setProperty('--smdm-sm-menu-level', `${level}`);
        return level;
    }
    updateMenuTitle(nextMenu, firstUnfoldableParent) {
        var _a, _b, _c, _d, _e, _f;
        if (this.menuTitle) {
            let anchorText = (_b = (_a = nextMenu === null || nextMenu === void 0 ? void 0 : nextMenu.anchorElem) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : this.menuTitleDefaultText;
            const navigatorTextAfter = (_c = this.options.navigationButtons) !== null && _c !== void 0 ? _c : '';
            const navigatorTextBefore = (_d = this.options.submenuLinkBefore) !== null && _d !== void 0 ? _d : '';
            if (nextMenu.canFold() && firstUnfoldableParent) {
                anchorText = (_f = (_e = firstUnfoldableParent.anchorElem) === null || _e === void 0 ? void 0 : _e.textContent) !== null && _f !== void 0 ? _f : anchorText;
            }
            if (navigatorTextAfter && typeof navigatorTextAfter === 'string') {
                anchorText = anchorText.replace(navigatorTextAfter, '');
            }
            if (navigatorTextBefore && typeof navigatorTextBefore === 'string') {
                anchorText = anchorText.replace(navigatorTextBefore, '');
            }
            if (this.menuTitle.tagName === 'A') {
                this.menuTitle.href = nextMenu.ref;
            }
            this.menuTitle.innerText = anchorText.trim();
        }
    }
    /**
     * @param targetMenuIdAnchorHrefOrSelector a selector or Slide ID or Slug of Href
     */
    getTargetSlideByIdentifier(targetMenuIdAnchorHrefOrSelector) {
        return this.sortedSlides.find((menu) => menu.matches(targetMenuIdAnchorHrefOrSelector));
    }
    /**
     * Set up all event handlers
     */
    initEventHandlers() {
        // Hide menu on click outside menu
        if (this.options.closeOnClickOutside) {
            this.outsideClickHandler = (event) => {
                var _a;
                if (this.isOpen &&
                    !this.animation.isAnimating &&
                    !this.menuElem.contains(event.target) &&
                    !((_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.' + CLASSES.control))) {
                    this.close();
                }
            };
            document.addEventListener('click', this.outsideClickHandler);
        }
        this.keyboard.init();
    }
    /**
     * Trigger a custom event to support callbacks
     */
    triggerEvent(action, afterAnimation = false) {
        const name = `sm.${action}${afterAnimation ? '-after' : ''}`;
        const event = new CustomEvent(name);
        this.menuElem.dispatchEvent(event);
    }
    markSelectedItem(anchor) {
        this.menuElem.querySelectorAll('.' + CLASSES.activeItem).forEach((elem) => {
            elem.classList.remove(CLASSES.activeItem);
        });
        anchor.classList.add(CLASSES.activeItem);
    }
    /**
     * Initialize the menu
     */
    initMenu() {
        this.animation.runWithoutAnimation(() => {
            switch (this.options.position) {
                case MenuPosition.Left:
                    Object.assign(this.menuElem.style, {
                        left: 0,
                        right: 'auto',
                        transform: 'translateX(-100%)',
                    });
                    break;
                default:
                    Object.assign(this.menuElem.style, {
                        left: 'auto',
                        right: 0,
                    });
                    break;
            }
        });
        const rootMenu = this.menuElem.querySelector('ul');
        if (rootMenu) {
            const rootSlide = new Slide(rootMenu, this.options, undefined, this.slidesByElem);
            this.slidesByElem.set(rootSlide.menuElem, rootSlide);
            rootSlide.mount();
            this.slides.push(rootSlide);
        }
    }
    /**
     * Set up the ResizeObserver that opens/closes the fold at the minWidthFold breakpoint.
     * Only called when the menu actually has foldable items.
     */
    initResizeObserver() {
        this.resizeObserver = new ResizeObserver((entries) => {
            var _a, _b, _c, _d, _e, _f;
            if (entries.length === 0) {
                return;
            }
            const bodyContentWidth = entries[0].contentRect.width;
            if (bodyContentWidth < this.options.minWidthFold && this.fold.isOpen) {
                this.fold.close();
                const parents = (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.getAllParents();
                const firstUnfoldableParent = parents === null || parents === void 0 ? void 0 : parents.find((p) => !p.canFold());
                this.setTabbing((_b = this.activeSubmenu) !== null && _b !== void 0 ? _b : this.rootSlide, firstUnfoldableParent, this.activeSubmenu, parents !== null && parents !== void 0 ? parents : []);
                this.setSlideLevel((_c = this.activeSubmenu) !== null && _c !== void 0 ? _c : this.rootSlide);
            }
            if (bodyContentWidth > this.options.minWidthFold && !this.fold.isOpen) {
                this.fold.open();
                const parents = (_d = this.activeSubmenu) === null || _d === void 0 ? void 0 : _d.getAllParents();
                const firstUnfoldableParent = parents === null || parents === void 0 ? void 0 : parents.find((p) => !p.canFold());
                this.setTabbing((_e = this.activeSubmenu) !== null && _e !== void 0 ? _e : this.rootSlide, firstUnfoldableParent, this.activeSubmenu, parents !== null && parents !== void 0 ? parents : []);
                this.setSlideLevel((_f = this.activeSubmenu) !== null && _f !== void 0 ? _f : this.rootSlide);
            }
        });
        this.resizeObserver.observe(document.body);
    }
    /**
     * Enhance the markup of menu items which contain a submenu and move them into the slider
     */
    initSlides() {
        this.menuElem.querySelectorAll('a').forEach((anchor) => {
            if (anchor.parentElement === null) {
                return;
            }
            const submenu = anchor.parentElement.querySelector('ul');
            if (!submenu) {
                return;
            }
            const menuSlide = new Slide(submenu, this.options, anchor, this.slidesByElem);
            this.slidesByElem.set(menuSlide.menuElem, menuSlide);
            menuSlide.mount();
            this.slides.push(menuSlide);
        });
        this.slides.forEach((menuSlide) => {
            menuSlide.appendTo(this.sliderWrapperElem);
        });
    }
    get onlyNavigateDecorator() {
        return !!this.options.navigationButtons;
    }
}
// Public methods callable via data-action attributes
const ALLOWED_ACTIONS = new Set([
    'open',
    'close',
    'toggle',
    'show',
    'back',
    'navigateTo',
    'markSelectedItem',
]);
// Expose SlideMenu to the global namespace and signal readiness immediately on module load,
// so that user code listening for 'sm.ready' can run before any instance is created.
// @ts-expect-error // Expose SlideMenu to the global namespace
window.SlideMenu = SlideMenu;
window.dispatchEvent(new Event('sm.ready'));
function initSlideMenuGlobal() {
    // Link control buttons with the API
    document.addEventListener('click', (event) => {
        var _a, _b, _c, _d;
        const canControlMenu = (elem) => {
            if (!elem) {
                return false;
            }
            return (elem.classList.contains(CLASSES.control) ||
                elem.classList.contains(CLASSES.hasSubMenu) ||
                elem.classList.contains(CLASSES.navigator));
        };
        const btn = canControlMenu(event.target)
            ? event.target
            : // @ts-expect-error target is Element | null | undefined
                (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest(`.${CLASSES.navigator}[data-action], .${CLASSES.control}[data-action], .${CLASSES.hasSubMenu}[data-action]`);
        if (!btn || !canControlMenu(btn)) {
            return;
        }
        // Find Slide-Menu that should be controlled
        const target = btn.getAttribute('data-target');
        const menu = !target || target === 'this'
            ? parentsOne(btn, `.${NAMESPACE}`)
            : ((_b = document.getElementById(target)) !== null && _b !== void 0 ? _b : document.querySelector(target)); // assumes #id
        if (!menu) {
            throw new Error(`Unable to find menu ${target}`);
        }
        const slideMenuInstance = menu._slideMenu;
        // Always prevent opening of links if not onlyNavigateDecorator
        if (slideMenuInstance && !slideMenuInstance.onlyNavigateDecorator) {
            event.preventDefault();
        }
        const methodName = btn.getAttribute('data-action');
        const dataArg = (_c = btn.getAttribute('data-arg')) !== null && _c !== void 0 ? _c : btn.href;
        const dataArgMapping = {
            false: false,
            true: true,
            null: null,
            undefined,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const arg = Object.keys(dataArgMapping).includes((_d = dataArg === null || dataArg === void 0 ? void 0 : dataArg.toString()) !== null && _d !== void 0 ? _d : '')
            ? // @ts-expect-error // user input can be undefined
                dataArgMapping[dataArg]
            : dataArg;
        if (slideMenuInstance && methodName && ALLOWED_ACTIONS.has(methodName)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instance = slideMenuInstance;
            if (typeof instance[methodName] === 'function') {
                if (arg) {
                    instance[methodName](arg);
                }
                else {
                    instance[methodName]();
                }
            }
        }
    });
}
