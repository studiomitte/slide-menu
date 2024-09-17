import { Slide } from './Slide';
import { Action, MenuPosition, CLASSES, NAMESPACE } from './SlideMenuOptions';
import { parentsOne, trapFocus } from './utils/dom';
const DEFAULT_OPTIONS = {
    backLinkAfter: '',
    backLinkBefore: '',
    showBackLink: true,
    keyClose: 'Escape',
    keyOpen: '',
    position: MenuPosition.Right,
    submenuLinkAfter: '',
    submenuLinkBefore: '',
    closeOnClickOutside: false,
    onlyNavigateDecorator: false,
    menuWidth: 320, // px
    minWidthFold: 640, // px
    transitionDuration: 300, // ms
    dynamicOpenTarget: false,
    debug: false,
    id: '',
};
let counter = 0;
export class SlideMenu {
    constructor(elem, options) {
        var _a, _b, _c, _d, _e;
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
        this.options.id = (_a = this.menuElem.id) !== null && _a !== void 0 ? _a : 'smdm-slide-menu-' + counter;
        counter++;
        this.menuElem.id = this.options.id;
        this.menuElem.classList.add(NAMESPACE);
        this.menuElem.classList.add(this.options.position);
        // Save this instance in menu to DOM node
        this.menuElem._slideMenu = this;
        // Set CSS Base Variables based on configuration options
        document.documentElement.style.setProperty('--smdm-sm-menu-width', `${this.options.menuWidth}px`);
        document.documentElement.style.setProperty('--smdm-sm-min-width-fold', `${this.options.minWidthFold}px`);
        document.documentElement.style.setProperty('--smdm-sm-transition-duration', `${this.options.transitionDuration}ms`);
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
        this.menuTitleDefaultText = (_d = (_c = (_b = this.menuTitle) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : this.menuTitleDefaultText;
        if (this.options.onlyNavigateDecorator &&
            (!this.options.submenuLinkAfter || !this.options.submenuLinkBefore)) {
            this.debugLog('Make sure to provide navigation decorators manually! Otherwise `onlyNavigateDecorator` only works with `submenuLinkAfter` and `submenuLinkBefore` options!');
        }
        this.initMenu();
        this.initSlides();
        this.initEventHandlers();
        // Enable Menu
        this.menuElem.style.display = 'flex';
        // Send event that menu is initialized
        this.triggerEvent(Action.Initialize);
        // Set the default open target and activate it
        this.activeSubmenu = this.slides[0].activate();
        this.navigateTo((_e = this.defaultOpenTarget) !== null && _e !== void 0 ? _e : this.slides[0], false);
    }
    get defaultOpenTarget() {
        var _a;
        const defaultTargetSelector = (_a = this.menuElem.dataset.openTarget) !== null && _a !== void 0 ? _a : 'smdm-sm-no-default-provided';
        return this.getTargetMenuFromIdentifier(defaultTargetSelector);
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
            this.activeSubmenu = (_d = (_c = this.activeSubmenu) === null || _c === void 0 ? void 0 : _c.getClosestNotFoldableSlide()) !== null && _d !== void 0 ? _d : rootSlide;
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
        var _a;
        // Open Menu if still closed
        if (runInForeground && !this.isOpen) {
            this.show();
        }
        const nextMenu = this.findNextMenu(target);
        const previousMenu = this.activeSubmenu;
        const parents = nextMenu.getAllParents();
        const firstUnfoldableParent = parents.find((p) => !p.canFold());
        const isNavigatingBack = previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.getAllParents().map((menu) => menu.id).includes(nextMenu.id);
        const isNavigatingForward = nextMenu === null || nextMenu === void 0 ? void 0 : nextMenu.getAllParents().map((menu) => menu.id).includes((_a = previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.id) !== null && _a !== void 0 ? _a : '');
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
        this.setTabbingForFold(nextMenu, firstUnfoldableParent, previousMenu, parents);
        const currentlyVisibleMenus = [nextMenu, ...parents];
        this.activateVisibleMenus(currentlyVisibleMenus, isNavigatingBack, previousMenu, nextMenu);
        const level = this.getSlideLevel(nextMenu, isNavigatingBack);
        const menuWidth = this.options.menuWidth;
        const offset = -menuWidth * level;
        this.moveElem(this.sliderWrapperElem, offset, 'px');
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
        }, this.options.transitionDuration);
    }
    setActiveSubmenu(nextMenu) {
        this.activeSubmenu = nextMenu;
    }
    setBodyTagSlideLevel(level) {
        var _a;
        (_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.setAttribute('data-slide-menu-level', level.toString());
    }
    setTabbingForFold(nextMenu, firstUnfoldableParent, previousMenu, parents) {
        if (nextMenu.canFold()) {
            this.openFold();
            // Enable Tabbing for foldable Parents
            nextMenu.getAllParents().forEach((menu) => {
                if (menu.canFold()) {
                    menu.enableTabbing();
                }
            });
            // disable Tabbing for invisible unfoldable parents
            firstUnfoldableParent === null || firstUnfoldableParent === void 0 ? void 0 : firstUnfoldableParent.getAllParents().forEach((menu) => {
                menu.disableTabbing();
            });
        }
        else if ((previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.canFold()) && !nextMenu.canFold()) {
            // close fold and disable tabbing for all parents
            this.closeFold();
            parents.forEach((menu) => {
                menu.disableTabbing();
            });
        }
        else if (!(previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.canFold()) && !nextMenu.canFold()) {
            parents.forEach((menu) => {
                menu.disableTabbing();
            });
        }
    }
    activateVisibleMenus(currentlyVisibleMenus, isNavigatingBack, previousMenu, nextMenu) {
        const currentlyVisibleIds = currentlyVisibleMenus.map((menu) => menu === null || menu === void 0 ? void 0 : menu.id);
        // Disable all previous active menus not active now
        this.slides.forEach((slide) => {
            if (!currentlyVisibleIds.includes(slide.id)) {
                // When navigating backwards deactivate (hide) previous after transition to not mess with animation
                if (isNavigatingBack && slide.id === (previousMenu === null || previousMenu === void 0 ? void 0 : previousMenu.id)) {
                    return;
                }
                slide.deactivate();
                slide.disableTabbing();
            }
        });
        // Activate all visible menus
        currentlyVisibleMenus.forEach((menu) => {
            if (!(menu === null || menu === void 0 ? void 0 : menu.isActive)) {
                menu === null || menu === void 0 ? void 0 : menu.activate();
            }
        });
        nextMenu.enableTabbing();
    }
    findNextMenu(target) {
        if (typeof target === 'string') {
            const menu = this.getTargetMenuFromIdentifier(target);
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
    getSlideLevel(nextMenu, isNavigatingBack) {
        const activeNum = Array.from(this.sliderWrapperElem.querySelectorAll('.' + CLASSES.active)).length;
        const navDecrement = !nextMenu.canFold() ? Number(isNavigatingBack) : 0;
        return Math.max(1, activeNum) - 1 - navDecrement;
    }
    updateMenuTitle(nextMenu, firstUnfoldableParent) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this.menuTitle) {
            let anchorText = (_b = (_a = nextMenu === null || nextMenu === void 0 ? void 0 : nextMenu.anchorElem) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : this.menuTitleDefaultText;
            const decoratorTextAfter = (_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.submenuLinkAfter) !== null && _d !== void 0 ? _d : '';
            const decoratorTextBefore = (_f = (_e = this.options) === null || _e === void 0 ? void 0 : _e.submenuLinkBefore) !== null && _f !== void 0 ? _f : '';
            if (nextMenu.canFold() && firstUnfoldableParent) {
                anchorText = (_h = (_g = firstUnfoldableParent.anchorElem) === null || _g === void 0 ? void 0 : _g.textContent) !== null && _h !== void 0 ? _h : anchorText;
            }
            if (decoratorTextAfter) {
                anchorText = anchorText.replace(decoratorTextAfter, '');
            }
            if (decoratorTextBefore) {
                anchorText = anchorText.replace(decoratorTextBefore, '');
            }
            this.menuTitle.innerText = anchorText.trim();
        }
    }
    /**
     *
     * @param targetMenuIdHrefOrSelector a selector or Slide ID or Slug of Href
     * @returns
     */
    getTargetMenuFromIdentifier(targetMenuIdAnchorHrefOrSelector) {
        var _a;
        return ((_a = this.slides.find((menu) => menu.matches(targetMenuIdAnchorHrefOrSelector))) !== null && _a !== void 0 ? _a : this.slides.find((menu) => menu.menuElem.querySelector(targetMenuIdAnchorHrefOrSelector)));
    }
    getTargetMenuDynamically() {
        const currentPath = location.pathname;
        const currentHash = location.hash;
        const currentHashItem = this.slides.find((menu) => menu.matches(currentHash));
        const currentPathItem = this.slides.find((menu) => menu.matches(currentPath));
        return currentPathItem !== null && currentPathItem !== void 0 ? currentPathItem : currentHashItem;
    }
    open(animate = true) {
        const target = this.options.dynamicOpenTarget
            ? this.getTargetMenuDynamically()
            : this.defaultOpenTarget;
        if (target) {
            this.navigateTo(target);
        }
        this.show(animate);
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
                    if (elem === null || elem === void 0 ? void 0 : elem.classList.contains(CLASSES.decorator))
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
            const firstControl = this.menuElem.querySelector(`.${CLASSES.controls} .${CLASSES.control}:not([disabled]):not([tabindex="-1"])`);
            trapFocus(event, (_b = (_a = this.activeSubmenu) === null || _a === void 0 ? void 0 : _a.menuElem) !== null && _b !== void 0 ? _b : this.menuElem, firstControl);
        });
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
     * Enhance the markup of menu items which contain a submenu
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
        return this.options.onlyNavigateDecorator;
    }
}
// Link control buttons with the API
document.addEventListener('click', (event) => {
    var _a, _b, _c;
    const canControlMenu = (elem) => {
        if (!elem) {
            return false;
        }
        return (elem.classList.contains(CLASSES.control) ||
            elem.classList.contains(CLASSES.hasSubMenu) ||
            elem.classList.contains(CLASSES.decorator));
    };
    const btn = canControlMenu(event.target)
        ? event.target
        : // @ts-expect-error target is Element | null | undefined
            (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest(`.${CLASSES.decorator}[data-action], .${CLASSES.control}[data-action], .${CLASSES.hasSubMenu}[data-action]`);
    if (!btn || !canControlMenu(btn)) {
        return;
    }
    const target = btn.getAttribute('data-target');
    const menu = !target || target === 'this'
        ? parentsOne(btn, `.${NAMESPACE}`)
        : (_b = document.getElementById(target)) !== null && _b !== void 0 ? _b : document.querySelector(target); // assumes #id
    if (!menu) {
        throw new Error(`Unable to find menu ${target}`);
    }
    const instance = menu._slideMenu;
    // if(btn.classList.contains(CLASSES.hasSubMenu)) {
    //   instance.markSelectedItem(btn);
    // }
    // Always prevent opening of links if not onlyNavigateDecorator
    if (instance && !instance.onlyNavigateDecorator) {
        event.preventDefault();
    }
    // Only prevent opening of links when clicking the decorator when onlyNavigateDecorator
    if (instance && instance.onlyNavigateDecorator && btn.matches(`.${CLASSES.decorator}`)) {
        event.preventDefault();
    }
    const method = btn.getAttribute('data-action');
    const dataArg = btn.getAttribute('data-arg');
    const dataArgMapping = {
        false: false,
        true: true,
        null: null,
        undefined,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const arg = Object.keys(dataArgMapping).includes((_c = dataArg === null || dataArg === void 0 ? void 0 : dataArg.toString()) !== null && _c !== void 0 ? _c : '')
        ? // @ts-expect-error // user input can be undefined
            dataArgMapping[dataArg]
        : dataArg;
    // @ts-expect-error // make functions accessible from outside context
    if (instance && method && typeof instance[method] === 'function') {
        // @ts-expect-error // make functions accessible from outside context
        arg ? instance[method](arg) : instance[method]();
    }
});
// @ts-expect-error // Expose SlideMenu to the global namespace
window.SlideMenu = SlideMenu;
// send global event when SlideMenu is ready and available in global namespace
window.dispatchEvent(new Event('sm.ready'));
