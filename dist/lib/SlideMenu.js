import { Slide } from './Slide.js';
import { Action, MenuPosition, CLASSES, NAMESPACE } from './SlideMenuOptions.js';
import { parentsOne, trapFocus } from './utils/dom.js';
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
export class SlideMenu {
    constructor(elem, options) {
        var _a, _b, _c, _d;
        this.lastFocusedElement = null;
        this.isOpen = false;
        this.isAnimating = false;
        this.lastAction = null;
        this.slides = [];
        this.menuTitleDefaultText = 'Menu';
        if (elem === null) {
            throw new Error('Argument `elem` must be a valid HTML node');
        }
        // (Create a new object for every instance)
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.menuElem = elem;
        this.options.id = this.menuElem.id ? this.menuElem.id : 'smdm-slide-menu-' + counter;
        counter++;
        this.menuElem.id = this.options.id;
        this.menuElem.classList.add(NAMESPACE);
        this.menuElem.classList.add(this.options.position);
        this.menuElem.role = 'navigation';
        // Save this instance in menu to DOM node
        this.menuElem._slideMenu = this;
        // Set CSS Base Variables based on configuration options
        document.documentElement.style.setProperty('--smdm-sm-menu-width', `${this.options.menuWidth}px`);
        document.documentElement.style.setProperty('--smdm-sm-min-width-fold', `${this.options.minWidthFold}px`);
        document.documentElement.style.setProperty('--smdm-sm-transition-duration', `${this.options.transitionDuration}ms`);
        document.documentElement.style.setProperty('--smdm-sm-menu-level', '0');
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
        this.initMenu();
        this.initSlides();
        this.initEventHandlers();
        // Enable Menu
        this.menuElem.style.display = 'flex';
        // Set the default open target and activate it
        this.activeSubmenu = this.slides[0].activate();
        this.navigateTo((_d = this.defaultOpenTarget) !== null && _d !== void 0 ? _d : this.slides[0], false);
        this.menuElem.setAttribute('inert', 'true');
        this.slides.forEach((menu) => {
            menu.disableTabbing();
        });
        // Send event that menu is initialized
        this.triggerEvent(Action.Initialize);
    }
    get defaultOpenTarget() {
        var _a, _b, _c, _d;
        const defaultTargetSelector = (_d = (_c = (_b = (_a = this.menuElem.dataset.openDefault) !== null && _a !== void 0 ? _a : this.menuElem.dataset.defaultTarget) !== null && _b !== void 0 ? _b : this.menuElem.dataset.openTarget) !== null && _c !== void 0 ? _c : this.menuElem.dataset.defaultOpenTarget) !== null && _d !== void 0 ? _d : 'smdm-sm-no-default-provided';
        return this.getTargetSlideByIdentifier(defaultTargetSelector);
    }
    get isFoldOpen() {
        return this.menuElem.classList.contains(CLASSES.foldOpen);
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
            this.isOpen ? this.close(animate) : this.show(animate);
            return;
        }
        if (show) {
            offset = 0;
            this.lastFocusedElement = document.activeElement;
            // Can mess with animation - set focus after animation is done
            setTimeout(() => {
                var _a;
                (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.focusFirstElem();
            }, this.options.transitionDuration);
        }
        else {
            offset = this.options.position === MenuPosition.Left ? '-100%' : '100%';
            // Deactivate all menus and hide fold
            // Timeout to not mess with animation because of setting the focus
            setTimeout(() => {
                var _a;
                this.slides.forEach((menu) => !menu.isActive && menu.deactivate());
                // Refocus last focused element before opening menu
                // @ts-expect-error // possibly has no focus() function
                (_a = this.lastFocusedElement) === null || _a === void 0 ? void 0 : _a.focus();
                this.menuElem.classList.remove(CLASSES.foldOpen);
            }, this.options.transitionDuration);
        }
        this.isOpen = !!show;
        this.moveElem(this.menuElem, offset);
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
        const target = this.options.dynamicOpenDefault
            ? this.getTargetSlideDynamically()
            : this.defaultOpenTarget;
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
        (_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.classList.add(CLASSES.open);
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
        (_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.classList.remove(CLASSES.open);
    }
    /**
     * Navigate one menu hierarchy back if possible
     */
    back(closeFold = false) {
        var _a, _b, _c, _d, _e, _f;
        const rootSlide = this.slides[0];
        let nextMenu = (_b = (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.parent) !== null && _b !== void 0 ? _b : rootSlide;
        if (closeFold) {
            this.activeSubmenu = (_d = (_c = this.activeSubmenu) === null || _c === void 0 ? void 0 : _c.getClosestUnfoldableSlide()) !== null && _d !== void 0 ? _d : rootSlide;
            nextMenu = (_f = (_e = this.activeSubmenu) === null || _e === void 0 ? void 0 : _e.parent) !== null && _f !== void 0 ? _f : rootSlide;
            this.closeFold();
        }
        // Event is triggered in navigate()
        this.navigateTo(nextMenu);
    }
    closeFold() {
        this.slides.forEach((menu) => {
            menu.appendTo(this.sliderWrapperElem);
        });
        this.menuElem.classList.remove(CLASSES.foldOpen);
    }
    openFold() {
        this.slides.forEach((menu) => {
            if (menu.isFoldable) {
                menu.appendTo(this.foldableWrapperElem);
            }
        });
        this.menuElem.classList.add(CLASSES.foldOpen);
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
        this.setBodyTagSlideLevel(level);
        this.setActiveSubmenu(nextMenu);
        setTimeout(() => {
            if (runInForeground) {
                // Wait for anmiation to finish to focus next link in nav otherwise focus messes with slide animation
                nextMenu.focusFirstElem();
            }
            if (isNavigatingBack) {
                // Wait for anmiation to finish to deactivate previous otherwise width of container messes with slide animation
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
    setActiveSubmenu(nextMenu) {
        this.activeSubmenu = nextMenu;
    }
    setBodyTagSlideLevel(level) {
        var _a;
        (_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.setAttribute('data-slide-menu-level', level.toString());
    }
    setTabbing(nextMenu, firstUnfoldableParent, previousMenu, parents) {
        if (this.isOpen) {
            this.menuElem.removeAttribute('inert');
        }
        if (nextMenu.canFold()) {
            this.openFold();
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
            // close fold
            this.closeFold();
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
        document.documentElement.style.setProperty('--smdm-sm-menu-level', `${level}`);
        return level;
    }
    updateMenuTitle(nextMenu, firstUnfoldableParent) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this.menuTitle) {
            let anchorText = (_b = (_a = nextMenu === null || nextMenu === void 0 ? void 0 : nextMenu.anchorElem) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : this.menuTitleDefaultText;
            const navigatorTextAfter = (_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.navigationButtons) !== null && _d !== void 0 ? _d : '';
            const navigatorTextBefore = (_f = (_e = this.options) === null || _e === void 0 ? void 0 : _e.submenuLinkBefore) !== null && _f !== void 0 ? _f : '';
            if (nextMenu.canFold() && firstUnfoldableParent) {
                anchorText = (_h = (_g = firstUnfoldableParent.anchorElem) === null || _g === void 0 ? void 0 : _g.textContent) !== null && _h !== void 0 ? _h : anchorText;
            }
            if (navigatorTextAfter && typeof navigatorTextAfter === 'string') {
                anchorText = anchorText.replace(navigatorTextAfter, '');
            }
            if (navigatorTextBefore && typeof navigatorTextBefore === 'string') {
                anchorText = anchorText.replace(navigatorTextBefore, '');
            }
            this.menuTitle.innerText = anchorText.trim();
        }
    }
    /**
     *
     * @param targetMenuIdHrefOrSelector a selector or Slide ID or Slug of Href
     * @returns
     */
    getTargetSlideByIdentifier(targetMenuIdAnchorHrefOrSelector) {
        // search from bottom to top
        const sortedByTreeDepth = this.slides.slice().sort((a, b) => {
            const depthA = a.ref.split('/').length;
            const depthB = b.ref.split('/').length;
            if (depthB !== depthA) {
                return depthB - depthA;
            }
            return b.ref.length - a.ref.length;
        });
        return sortedByTreeDepth.find((menu) => menu.matches(targetMenuIdAnchorHrefOrSelector));
    }
    /**
     * Set up all event handlers
     */
    initEventHandlers() {
        // Handler for end of CSS transition
        this.menuElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));
        this.sliderElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));
        // Hide menu on click outside menu
        if (this.options.closeOnClickOutside) {
            document.addEventListener('click', (event) => {
                var _a;
                if (this.isOpen &&
                    !this.isAnimating &&
                    // @ts-expect-error // Event Target will always be Element
                    !this.menuElem.contains(event.target) &&
                    // @ts-expect-error // Event Target will always be Element
                    !((_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.' + CLASSES.control))) {
                    this.close();
                }
            });
        }
        this.initKeybindings();
    }
    onTransitionEnd(event) {
        // Ensure the transitionEnd event was fired by the correct element
        // (elements inside the menu might use CSS transitions as well)
        if (event.target !== this.menuElem &&
            event.target !== this.sliderElem &&
            event.target !== this.foldableWrapperElem &&
            event.target !== this.sliderWrapperElem) {
            return;
        }
        this.isAnimating = false;
        if (this.lastAction) {
            this.triggerEvent(this.lastAction, true);
            this.lastAction = null;
        }
    }
    initKeybindings() {
        document.addEventListener('keydown', (event) => {
            const elem = document.activeElement;
            switch (event.key) {
                case this.options.keyClose:
                    event.preventDefault();
                    this.close();
                    break;
                case this.options.keyOpen:
                    event.preventDefault();
                    this.show();
                    break;
                case 'Enter':
                    // @ts-expect-error // simulate click event
                    if (elem === null || elem === void 0 ? void 0 : elem.classList.contains(CLASSES.navigator))
                        elem.click();
                    break;
            }
        });
    }
    /**
     * Trigger a custom event to support callbacks
     */
    triggerEvent(action, afterAnimation = false) {
        this.lastAction = action;
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
     * Start the slide animation (the CSS transition)
     */
    moveElem(elem, offset, unit = '%') {
        setTimeout(() => {
            // Add percentage sign
            if (!offset.toString().includes(unit)) {
                offset += unit;
            }
            const newTranslateX = `translateX(${offset})`;
            if (elem.style.transform !== newTranslateX) {
                this.isAnimating = true;
                elem.style.transform = newTranslateX;
            }
        }, 0);
    }
    /**
     * Initialize the menu
     */
    initMenu() {
        this.runWithoutAnimation(() => {
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
        this.menuElem.classList.add(this.options.position);
        const rootMenu = this.menuElem.querySelector('ul');
        if (rootMenu) {
            this.slides.push(new Slide(rootMenu, this.options));
        }
        this.menuElem.addEventListener('keydown', (event) => {
            var _a, _b;
            // WCAG - if anchors are used for navigation make them usable with space
            if (event.key === ' ' &&
                event.target instanceof HTMLAnchorElement &&
                event.target.role === 'button') {
                event.preventDefault();
                event.target.click();
            }
            // WCAG - trap focus in menu
            const firstControl = this.menuElem.querySelector(`.${CLASSES.controls} .${CLASSES.control}:not([disabled]):not([tabindex="-1"])`);
            trapFocus(event, (_b = (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.menuElem) !== null && _b !== void 0 ? _b : this.menuElem, firstControl);
        });
        const resizeObserver = new ResizeObserver((entries) => {
            var _a, _b, _c, _d, _e, _f, _g;
            if (entries.length === 0) {
                return;
            }
            const bodyContentWidth = entries[0].contentRect.width;
            if (bodyContentWidth < this.options.minWidthFold && this.isFoldOpen) {
                this.closeFold();
                const parents = (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.getAllParents();
                const firstUnfoldableParent = parents === null || parents === void 0 ? void 0 : parents.find((p) => !p.canFold());
                this.setTabbing((_b = this.activeSubmenu) !== null && _b !== void 0 ? _b : this.slides[0], firstUnfoldableParent, this.activeSubmenu, parents !== null && parents !== void 0 ? parents : []);
                this.setSlideLevel((_c = this.activeSubmenu) !== null && _c !== void 0 ? _c : this.slides[0]);
                this.setTabbing((_d = this.activeSubmenu) !== null && _d !== void 0 ? _d : this.slides[0], undefined, undefined, []);
            }
            if (bodyContentWidth > this.options.minWidthFold && !this.isFoldOpen) {
                this.openFold();
                const parents = (_e = this.activeSubmenu) === null || _e === void 0 ? void 0 : _e.getAllParents();
                const firstUnfoldableParent = parents === null || parents === void 0 ? void 0 : parents.find((p) => !p.canFold());
                this.setTabbing((_f = this.activeSubmenu) !== null && _f !== void 0 ? _f : this.slides[0], firstUnfoldableParent, this.activeSubmenu, parents !== null && parents !== void 0 ? parents : []);
                this.setSlideLevel((_g = this.activeSubmenu) !== null && _g !== void 0 ? _g : this.slides[0]);
            }
        });
        resizeObserver.observe(document.body);
    }
    /**
     * Pause the CSS transitions, to apply CSS changes directly without an animation
     */
    runWithoutAnimation(action) {
        const transitionElems = [this.menuElem, this.sliderElem];
        transitionElems.forEach((elem) => (elem.style.transition = 'none'));
        action();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.menuElem.offsetHeight; // Trigger a reflow, flushing the CSS changes
        transitionElems.forEach((elem) => elem.style.removeProperty('transition'));
        this.isAnimating = false;
    }
    /**
     * Enhance the markup of menu items which contain a submenu and move them into the slider
     */
    initSlides() {
        this.menuElem.querySelectorAll('a').forEach((anchor, index) => {
            if (anchor.parentElement === null) {
                return;
            }
            const submenu = anchor.parentElement.querySelector('ul');
            if (!submenu) {
                return;
            }
            const menuSlide = new Slide(submenu, this.options, anchor);
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
        : (_b = document.getElementById(target)) !== null && _b !== void 0 ? _b : document.querySelector(target); // assumes #id
    if (!menu) {
        throw new Error(`Unable to find menu ${target}`);
    }
    const slideMenuInstance = menu._slideMenu;
    // Always prevent opening of links if not onlyNavigateDecorator
    if (slideMenuInstance && !slideMenuInstance.onlyNavigateDecorator) {
        event.preventDefault();
    }
    // Only prevent opening of links when clicking the decorator when onlyNavigateDecorator
    // if (slideMenuInstance && slideMenuInstance.onlyNavigateDecorator) {
    //   event.preventDefault();
    // }
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
    // console.log(slideMenuInstance, methodName, arg);
    // @ts-expect-error // make functions dynamically accessible from outside context
    if (slideMenuInstance && methodName && typeof slideMenuInstance[methodName] === 'function') {
        // @ts-expect-error // make functions dynamically accessible from outside context
        arg ? slideMenuInstance[methodName](arg) : slideMenuInstance[methodName]();
    }
});
// @ts-expect-error // Expose SlideMenu to the global namespace
window.SlideMenu = SlideMenu;
// send global event when SlideMenu is ready and available in global namespace
window.dispatchEvent(new Event('sm.ready'));
