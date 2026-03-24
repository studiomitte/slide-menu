import { Slide } from './Slide.js';
import { FoldController, ActiveFoldController, NoopFoldController } from './FoldController.js';
import { AnimationController } from './AnimationController.js';
import { KeyboardController } from './KeyboardController.js';
import { Action, SlideMenuOptions, MenuPosition, CLASSES, NAMESPACE } from './SlideMenuOptions.js';
import { parentsOne } from './utils/dom.js';

export interface MenuHTMLElement extends HTMLElement {
  _slideMenu: SlideMenu;
}

const DEFAULT_OPTIONS: SlideMenuOptions = {
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
  private activeSubmenu: Slide | undefined;
  private lastFocusedElement: Element | null = null;
  private isOpen: boolean = false;

  private readonly slides: Slide[] = [];
  private readonly sortedSlides: Slide[] = [];
  private readonly slidesByElem = new WeakMap<HTMLElement, Slide>();
  private readonly fold: FoldController;
  private readonly animation: AnimationController;
  private readonly keyboard: KeyboardController;

  private readonly options: SlideMenuOptions;

  private readonly menuTitleDefaultText: string = 'Menu';
  private readonly cachedDefaultOpenTarget: Slide | undefined = undefined;

  private readonly menuElem: MenuHTMLElement;
  private readonly sliderElem: HTMLElement;
  private readonly menuTitle: HTMLElement | null;
  private readonly sliderWrapperElem: HTMLElement;
  private readonly foldableWrapperElem: HTMLElement;

  // Stored references for cleanup
  private resizeObserver: ResizeObserver | null = null;
  private outsideClickHandler: ((event: MouseEvent) => void) | null = null;
  private visibilityTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private navigateTimeoutId: ReturnType<typeof setTimeout> | undefined;

  public constructor(elem?: HTMLElement | null, options?: Partial<SlideMenuOptions>) {
    if (!elem) {
      throw new Error('Argument `elem` must be a valid HTML node');
    }

    // (Create a new object for every instance)
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.menuElem = elem as MenuHTMLElement;
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
    this.menuElem.style.setProperty(
      '--smdm-sm-transition-duration',
      `${this.options.transitionDuration}ms`,
    );
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
    this.menuTitle = this.menuElem.querySelector(`.${CLASSES.title}`) as HTMLElement;
    this.menuTitleDefaultText = this.menuTitle?.textContent?.trim() ?? this.menuTitleDefaultText;

    // Wire up AnimationController early — initMenu() uses runWithoutAnimation
    this.animation = new AnimationController(
      this.menuElem,
      this.sliderElem,
      this.foldableWrapperElem,
      this.sliderWrapperElem,
      (action, afterAnimation) => this.triggerEvent(action, afterAnimation),
    );

    this.initMenu();

    if (this.slides.length === 0) {
      throw new Error('SlideMenu: no <ul> found inside the menu element. A root <ul> is required.');
    }

    this.initSlides();

    const hasFoldable = this.slides.some((s) => s.isFoldable);
    this.fold = hasFoldable
      ? new ActiveFoldController(
          this.slides,
          this.sliderWrapperElem,
          this.foldableWrapperElem,
          this.menuElem,
        )
      : new NoopFoldController();

    this.sortedSlides = this.slides.slice().sort((a, b) => {
      const depthA = a.ref.split('/').length;
      const depthB = b.ref.split('/').length;
      if (depthB !== depthA) return depthB - depthA;
      return b.ref.length - a.ref.length;
    });

    // Cache the default open target once — resolving it requires sortedSlides to be ready
    this.cachedDefaultOpenTarget = this.resolveDefaultOpenTarget();

    // Wire up KeyboardController
    this.keyboard = new KeyboardController(
      { keyClose: this.options.keyClose, keyOpen: this.options.keyOpen },
      {
        close: () => this.close(),
        show: () => this.show(),
        getActiveSubmenu: () => this.activeSubmenu,
        getMenuElem: () => this.menuElem,
      },
    );

    this.initEventHandlers();

    // Enable Menu
    this.menuElem.style.display = 'flex';

    // Set the default open target and activate it
    this.activeSubmenu = this.rootSlide.activate();
    this.navigateTo(this.cachedDefaultOpenTarget ?? this.rootSlide, false);

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

  private resolveDefaultOpenTarget(): Slide | undefined {
    const defaultTargetSelector =
      this.menuElem.dataset.openDefault ??
      this.menuElem.dataset.defaultTarget ??
      this.menuElem.dataset.openTarget ??
      this.menuElem.dataset.defaultOpenTarget;
    if (!defaultTargetSelector) return undefined;
    return this.getTargetSlideByIdentifier(defaultTargetSelector);
  }

  private get rootSlide(): Slide {
    return this.slides[0];
  }

  public get isFoldOpen(): boolean {
    return this.fold.isOpen;
  }

  /**
   * Clean up all event listeners, observers, and pending timeouts
   */
  public destroy(): void {
    clearTimeout(this.visibilityTimeoutId);
    clearTimeout(this.navigateTimeoutId);

    this.animation.destroy();
    this.keyboard.destroy();

    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
    }

    this.resizeObserver?.disconnect();

    this.menuElem.removeAttribute('inert');
    document.body?.classList.remove(CLASSES.open);
    document.body?.removeAttribute('data-slide-menu-level');

    delete (this.menuElem as Partial<MenuHTMLElement>)._slideMenu;
  }

  private debugLog(...args: any[]): void {
    if (this.options.debug) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      console.log(...args);
    }
  }

  /**
   * Toggle the menu
   */
  public toggleVisibility(show?: boolean, animate: boolean = true): void {
    let offset;

    if (show === undefined) {
      if (this.isOpen) {
        this.close(animate);
      } else {
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
        this.activeSubmenu?.focusFirstElem();
      }, this.options.transitionDuration);
    } else {
      offset = this.options.position === MenuPosition.Left ? '-100%' : '100%';

      // Deactivate all menus and hide fold
      // Timeout to not mess with animation because of setting the focus
      this.visibilityTimeoutId = setTimeout(() => {
        this.slides.forEach((menu) => !menu.isActive && menu.deactivate());
        // Refocus last focused element before opening menu
        // @ts-expect-error // possibly has no focus() function
        this.lastFocusedElement?.focus();
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
  private getTargetSlideDynamically(): Slide | undefined {
    const currentPath = location.pathname;
    const currentHash = location.hash;
    const currentHashItem = this.slides.find((menu) => menu.matches(currentHash));
    const currentPathItem = this.slides.find((menu) => menu.matches(currentPath));
    return currentPathItem ?? currentHashItem;
  }

  public open(animate: boolean = true): void {
    const target =
      (this.options.dynamicOpenDefault
        ? this.getTargetSlideDynamically()
        : this.cachedDefaultOpenTarget) ?? this.activeSubmenu;

    this.menuElem.removeAttribute('inert');

    if (target) {
      this.navigateTo(target);
    }

    this.show(animate);
  }

  public toggle(animate: boolean = true): void {
    if (this.isOpen) {
      this.close(animate);
      return;
    }

    this.open(animate);
  }

  /**
   * Shows the menu, adds `slide-menu--open` class to body
   */
  public show(animate: boolean = true): void {
    this.triggerEvent(Action.Open);
    this.toggleVisibility(true, animate);

    document.body?.classList.add(CLASSES.open);
  }

  /**
   * Hide / Close the menu, removes `slide-menu--open` class from body
   */
  public close(animate: boolean = true): void {
    this.triggerEvent(Action.Close);
    this.toggleVisibility(false, animate);

    this.menuElem.setAttribute('inert', 'true');
    this.slides.forEach((menu) => {
      menu.disableTabbing();
    });

    document.body?.classList.remove(CLASSES.open);
  }

  /**
   * Navigate one menu hierarchy back if possible
   */
  public back(closeFold: boolean = false): void {
    let nextMenu = this.activeSubmenu?.parent ?? this.rootSlide;
    if (closeFold) {
      this.activeSubmenu = this.activeSubmenu?.getClosestUnfoldableSlide() ?? this.rootSlide;
      nextMenu = this.activeSubmenu?.parent ?? this.rootSlide;
      this.fold.close();
    }

    // Event is triggered in navigate()
    this.navigateTo(nextMenu);
  }

  /**
   * Navigate to a specific submenu of link on any level (useful to open the correct hierarchy directly), if no submenu is found opens the submenu of link directly
   */
  public navigateTo(target: HTMLElement | Slide | string, runInForeground: boolean = true): void {
    // Open Menu if still closed
    if (runInForeground && !this.isOpen) {
      this.show();
    }

    const nextMenu: Slide = this.findNextMenu(target);
    const previousMenu = this.activeSubmenu;
    const parents = nextMenu.getAllParents();
    const firstUnfoldableParent = nextMenu.getFirstUnfoldableParent();
    const visibleSlides = new Set([nextMenu, ...nextMenu.getAllFoldableParents()]);
    if (firstUnfoldableParent) {
      visibleSlides.add(firstUnfoldableParent);
    }

    const isNavigatingBack = previousMenu?.hasParent(nextMenu);
    const isNavigatingForward = nextMenu?.hasParent(previousMenu);

    if (runInForeground) {
      this.triggerEvent(Action.Navigate);
      if (isNavigatingBack) {
        this.triggerEvent(Action.Back);
      } else if (isNavigatingForward) {
        this.triggerEvent(Action.Forward);
      } else {
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
        previousMenu?.deactivate();
      }

      // hide all non visible menu elements to prevent screen reader confusion
      this.slides.forEach((slide: Slide) => {
        if (slide.isActive && !visibleSlides.has(slide)) {
          slide.setInvisible();
        }
      });
    }, this.options.transitionDuration);
  }

  private setBodyTagSlideLevel(level: number): void {
    document.body?.setAttribute('data-slide-menu-level', level.toString());
  }

  private setTabbing(
    nextMenu: Slide,
    firstUnfoldableParent: Slide | undefined,
    previousMenu: Slide | undefined,
    parents: Slide[],
  ): void {
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

      firstUnfoldableParent?.enableTabbing();

      // disable Tabbing for invisible unfoldable parents
      firstUnfoldableParent?.getAllParents().forEach((menu) => {
        menu.disableTabbing();
      });

      return;
    }

    if (previousMenu?.canFold() && !nextMenu.canFold()) {
      this.fold.close();
    }

    parents.forEach((menu) => {
      menu.disableTabbing();
    });
    nextMenu.enableTabbing();
  }

  private activateMenus(
    currentlyActiveMenus: Slide[],
    isNavigatingBack: boolean | undefined,
    previousMenu: Slide | undefined,
    nextMenu: Slide,
  ): void {
    const currentlyActiveIds = currentlyActiveMenus.map((menu) => menu?.id);
    // Disable all previous active menus not active now
    this.slides.forEach((slide) => {
      if (!currentlyActiveIds.includes(slide.id)) {
        // When navigating backwards deactivate (hide) previous after transition to not mess with animation
        if (isNavigatingBack && slide.id === previousMenu?.id) {
          return;
        }

        slide.deactivate();
        slide.disableTabbing();
      }
    });

    // Activate menus
    currentlyActiveMenus.forEach((menu) => {
      menu?.activate();
    });
    nextMenu.enableTabbing();
  }

  private findNextMenu(target: string | HTMLElement | Slide): Slide {
    if (typeof target === 'string') {
      const menu = this.getTargetSlideByIdentifier(target);
      if (menu instanceof Slide) {
        return menu;
      } else {
        throw new Error('Invalid parameter `target`. A valid query selector is required.');
      }
    }

    if (target instanceof HTMLElement) {
      const menu = this.slides.find((menu) => menu.contains(target as HTMLElement));
      if (menu instanceof Slide) {
        return menu;
      } else {
        throw new Error('Invalid parameter `target`. Not found in slide menu');
      }
    }

    if (target instanceof Slide) {
      return target;
    } else {
      throw new Error('No valid next slide fund');
    }
  }

  private hideControlsIfOnRootLevel(level: number): void {
    const controlsToHideIfOnRootLevel = document.querySelectorAll(
      `.${CLASSES.control}.${CLASSES.hiddenOnRoot}, .${CLASSES.control}.${CLASSES.invisibleOnRoot}`,
    );

    if (level === 0) {
      controlsToHideIfOnRootLevel.forEach((elem) => {
        elem.setAttribute('tabindex', '-1');
      });
    } else {
      controlsToHideIfOnRootLevel.forEach((elem) => {
        elem.removeAttribute('tabindex');
      });
    }
  }

  private setSlideLevel(nextMenu?: Slide, isNavigatingBack: boolean = false): number {
    const activeNum = Array.from(
      this.sliderWrapperElem.querySelectorAll(`.${CLASSES.active}, .${CLASSES.current}`),
    ).length;
    const navDecrement = !nextMenu?.canFold() ? Number(isNavigatingBack) : 0;
    const level = Math.max(1, activeNum) - 1 - navDecrement;
    this.setBodyTagSlideLevel(level);
    this.menuElem.style.setProperty('--smdm-sm-menu-level', `${level}`);
    return level;
  }

  private updateMenuTitle(nextMenu: Slide, firstUnfoldableParent?: Slide): void {
    if (this.menuTitle) {
      let anchorText = nextMenu?.anchorElem?.textContent ?? this.menuTitleDefaultText;
      const navigatorTextAfter = this.options.navigationButtons ?? '';
      const navigatorTextBefore = this.options.submenuLinkBefore ?? '';

      if (nextMenu.canFold() && firstUnfoldableParent) {
        anchorText = firstUnfoldableParent.anchorElem?.textContent ?? anchorText;
      }

      if (navigatorTextAfter && typeof navigatorTextAfter === 'string') {
        anchorText = anchorText.replace(navigatorTextAfter, '');
      }
      if (navigatorTextBefore && typeof navigatorTextBefore === 'string') {
        anchorText = anchorText.replace(navigatorTextBefore, '');
      }

      if (this.menuTitle.tagName === 'A') {
        (this.menuTitle as HTMLAnchorElement).href = nextMenu.ref;
      }

      this.menuTitle.innerText = anchorText.trim();
    }
  }

  /**
   * @param targetMenuIdAnchorHrefOrSelector a selector or Slide ID or Slug of Href
   */
  private getTargetSlideByIdentifier(targetMenuIdAnchorHrefOrSelector: string): Slide | undefined {
    return this.sortedSlides.find((menu) => menu.matches(targetMenuIdAnchorHrefOrSelector));
  }

  /**
   * Set up all event handlers
   */
  private initEventHandlers(): void {
    // Hide menu on click outside menu
    if (this.options.closeOnClickOutside) {
      this.outsideClickHandler = (event: MouseEvent) => {
        if (
          this.isOpen &&
          !this.animation.isAnimating &&
          !this.menuElem.contains(event.target as Node) &&
          !(event.target as Element)?.closest('.' + CLASSES.control)
        ) {
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
  private triggerEvent(action: Action, afterAnimation: boolean = false): void {
    const name = `sm.${action}${afterAnimation ? '-after' : ''}`;
    const event = new CustomEvent(name);

    this.menuElem.dispatchEvent(event);
  }

  public markSelectedItem(anchor: Element): void {
    this.menuElem.querySelectorAll('.' + CLASSES.activeItem).forEach((elem) => {
      elem.classList.remove(CLASSES.activeItem);
    });
    anchor.classList.add(CLASSES.activeItem);
  }

  /**
   * Initialize the menu
   */
  private initMenu(): void {
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

    const rootMenu = this.menuElem.querySelector('ul') as HTMLElement | null;
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
  private initResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) {
        return;
      }

      const bodyContentWidth = entries[0].contentRect.width;

      if (bodyContentWidth < this.options.minWidthFold && this.fold.isOpen) {
        this.fold.close();
        const parents = this.activeSubmenu?.getAllParents();
        const firstUnfoldableParent = parents?.find((p) => !p.canFold());
        this.setTabbing(
          this.activeSubmenu ?? this.rootSlide,
          firstUnfoldableParent,
          this.activeSubmenu,
          parents ?? [],
        );
        this.setSlideLevel(this.activeSubmenu ?? this.rootSlide);
      }

      if (bodyContentWidth > this.options.minWidthFold && !this.fold.isOpen) {
        this.fold.open();
        const parents = this.activeSubmenu?.getAllParents();
        const firstUnfoldableParent = parents?.find((p) => !p.canFold());
        this.setTabbing(
          this.activeSubmenu ?? this.rootSlide,
          firstUnfoldableParent,
          this.activeSubmenu,
          parents ?? [],
        );
        this.setSlideLevel(this.activeSubmenu ?? this.rootSlide);
      }
    });
    this.resizeObserver.observe(document.body);
  }

  /**
   * Enhance the markup of menu items which contain a submenu and move them into the slider
   */
  private initSlides(): void {
    this.menuElem.querySelectorAll('a').forEach((anchor: HTMLAnchorElement) => {
      if (anchor.parentElement === null) {
        return;
      }

      const submenu = anchor.parentElement.querySelector('ul') as HTMLElement | null;

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

  get onlyNavigateDecorator(): boolean {
    return !!this.options.navigationButtons;
  }
}

// Public methods callable via data-action attributes
const ALLOWED_ACTIONS: ReadonlySet<string> = new Set([
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

function initSlideMenuGlobal(): void {
  // Link control buttons with the API
  document.addEventListener('click', (event) => {
    const canControlMenu = (elem: Element | undefined | null): boolean => {
      if (!elem) {
        return false;
      }
      return (
        elem.classList.contains(CLASSES.control) ||
        elem.classList.contains(CLASSES.hasSubMenu) ||
        elem.classList.contains(CLASSES.navigator)
      );
    };

    const btn = canControlMenu(event.target as Element)
      ? event.target
      : // @ts-expect-error target is Element | null | undefined
        event.target?.closest(
          `.${CLASSES.navigator}[data-action], .${CLASSES.control}[data-action], .${CLASSES.hasSubMenu}[data-action]`,
        );
    if (!btn || !canControlMenu(btn as Element)) {
      return;
    }

    // Find Slide-Menu that should be controlled
    const target = btn.getAttribute('data-target');
    const menu =
      !target || target === 'this'
        ? parentsOne(btn as Node, `.${NAMESPACE}`)
        : (document.getElementById(target as string) ?? document.querySelector(target)); // assumes #id

    if (!menu) {
      throw new Error(`Unable to find menu ${target}`);
    }

    const slideMenuInstance = (menu as MenuHTMLElement)._slideMenu;

    // Always prevent opening of links if not onlyNavigateDecorator
    if (slideMenuInstance && !slideMenuInstance.onlyNavigateDecorator) {
      event.preventDefault();
    }

    const methodName = (btn as Element).getAttribute('data-action');
    const dataArg = btn.getAttribute('data-arg') ?? btn.href;

    const dataArgMapping = {
      false: false,
      true: true,
      null: null,
      undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const arg = Object.keys(dataArgMapping).includes(dataArg?.toString() ?? '')
      ? // @ts-expect-error // user input can be undefined
        dataArgMapping[dataArg]
      : dataArg;

    if (slideMenuInstance && methodName && ALLOWED_ACTIONS.has(methodName)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = slideMenuInstance as Record<string, any>;
      if (typeof instance[methodName] === 'function') {
        if (arg) {
          instance[methodName](arg);
        } else {
          instance[methodName]();
        }
      }
    }
  });
}
