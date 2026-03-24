import { Slide } from './Slide.js';
import { SlideMenuOptions } from './SlideMenuOptions.js';
export interface MenuHTMLElement extends HTMLElement {
    _slideMenu: SlideMenu;
}
export declare class SlideMenu {
    private activeSubmenu;
    private lastFocusedElement;
    private isOpen;
    private isAnimating;
    private lastAction;
    private readonly slides;
    private readonly sortedSlides;
    private readonly options;
    private readonly menuTitleDefaultText;
    private readonly menuElem;
    private readonly sliderElem;
    private readonly menuTitle;
    private readonly sliderWrapperElem;
    private readonly foldableWrapperElem;
    private resizeObserver;
    private readonly boundOnTransitionEnd;
    private outsideClickHandler;
    private keydownHandler;
    private menuKeydownHandler;
    private visibilityTimeoutId;
    private navigateTimeoutId;
    constructor(elem?: HTMLElement | null, options?: Partial<SlideMenuOptions>);
    private get defaultOpenTarget();
    private get rootSlide();
    get isFoldOpen(): boolean;
    /**
     * Clean up all event listeners, observers, and pending timeouts
     */
    destroy(): void;
    debugLog(...args: any[]): void;
    /**
     * Toggle the menu
     */
    toggleVisibility(show?: boolean, animate?: boolean): void;
    /**
     * Get menu that has current path or hash as anchor element or within the menu
     * @returns
     */
    private getTargetSlideDynamically;
    open(animate?: boolean): void;
    toggle(animate?: boolean): void;
    /**
     * Shows the menu, adds `slide-menu--open` class to body
     */
    show(animate?: boolean): void;
    /**
     * Hide / Close the menu, removes `slide-menu--open` class from body
     */
    close(animate?: boolean): void;
    /**
     * Navigate one menu hierarchy back if possible
     */
    back(closeFold?: boolean): void;
    private closeFold;
    private openFold;
    /**
     * Navigate to a specific submenu of link on any level (useful to open the correct hierarchy directly), if no submenu is found opens the submenu of link directly
     */
    navigateTo(target: HTMLElement | Slide | string, runInForeground?: boolean): void;
    private setBodyTagSlideLevel;
    private setTabbing;
    private activateMenus;
    private findNextMenu;
    private hideControlsIfOnRootLevel;
    private setSlideLevel;
    private updateMenuTitle;
    /**
     * @param targetMenuIdAnchorHrefOrSelector a selector or Slide ID or Slug of Href
     */
    private getTargetSlideByIdentifier;
    /**
     * Set up all event handlers
     */
    private initEventHandlers;
    private onTransitionEnd;
    private initKeybindings;
    /**
     * Trigger a custom event to support callbacks
     */
    private triggerEvent;
    markSelectedItem(anchor: Element): void;
    /**
     * Start the slide animation (the CSS transition)
     */
    private moveElem;
    /**
     * Initialize the menu
     */
    private initMenu;
    /**
     * Pause the CSS transitions, to apply CSS changes directly without an animation
     */
    private runWithoutAnimation;
    /**
     * Enhance the markup of menu items which contain a submenu and move them into the slider
     */
    private initSlides;
    get onlyNavigateDecorator(): boolean;
}
