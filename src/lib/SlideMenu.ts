import { Slide, SlideHTMLElement } from './Slide.js';
import { Action, SlideMenuOptions, MenuPosition, CLASSES, NAMESPACE } from './SlideMenuOptions.js';
import { parentsOne, trapFocus } from './utils/dom.js';

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

export class SlideMenu {
  private activeSubmenu: Slide | undefined;
  private lastFocusedElement: Element | null = null;
  private isOpen: boolean = false;
  private isAnimating: boolean = false;
  private lastAction: Action | null = null;

  private readonly slides: Slide[] = [];

  private readonly options: SlideMenuOptions;

  private readonly menuTitleDefaultText: string = 'Menu';

  private readonly menuElem: MenuHTMLElement;
  private readonly sliderElem: HTMLElement;
  private readonly menuTitle: HTMLElement | null;
  private readonly sliderWrapperElem: HTMLElement;
  private readonly foldableWrapperElem: HTMLElement;

  public constructor(elem?: HTMLElement | null, options?: Partial<SlideMenuOptions>) {
    if (elem === null) {
      throw new Error('Argument `elem` must be a valid HTML node');
    }

    // (Create a new object for every instance)
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.menuElem = elem as MenuHTMLElement;
    this.options.id = this.menuElem.id ? this.menuElem.id : 'smdm-slide-menu-' + counter;
    counter++;
    this.menuElem.id = this.options.id;
    this.menuElem.classList.add(NAMESPACE);
    this.menuElem.classList.add(this.options.position);
    this.menuElem.role = 'navigation';

    // Save this instance in menu to DOM node
    this.menuElem._slideMenu = this;

    // Set CSS Base Variables based on configuration options
    document.documentElement.style.setProperty(
      '--smdm-sm-menu-width',
      `${this.options.menuWidth}px`,
    );
    document.documentElement.style.setProperty(
      '--smdm-sm-min-width-fold',
      `${this.options.minWidthFold}px`,
    );
    document.documentElement.style.setProperty(
      '--smdm-sm-transition-duration',
      `${this.options.transitionDuration}ms`,
    );
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
    this.menuTitle = this.menuElem.querySelector(`.${CLASSES.title}`) as HTMLElement;
    this.menuTitleDefaultText = this.menuTitle?.textContent?.trim() ?? this.menuTitleDefaultText;

    this.initMenu();
    this.initSlides();
    this.initEventHandlers();

    // Enable Menu
    this.menuElem.style.display = 'flex';

    // Set the default open target and activate it
    this.activeSubmenu = this.slides[0].activate();
    this.navigateTo(this.defaultOpenTarget ?? this.slides[0], false);

    this.menuElem.setAttribute('inert', 'true');
    this.slides.forEach((menu) => {
      menu.disableTabbing();
    });

    // Send event that menu is initialized
    this.triggerEvent(Action.Initialize);
  }

  private get defaultOpenTarget(): Slide | undefined {
    const defaultTargetSelector =
      this.menuElem.dataset.openDefault ??
      this.menuElem.dataset.defaultTarget ??
      this.menuElem.dataset.openTarget ??
      this.menuElem.dataset.defaultOpenTarget ??
      'smdm-sm-no-default-provided';
    return this.getTargetSlideByIdentifier(defaultTargetSelector);
  }

  public get isFoldOpen(): boolean {
    return this.menuElem.classList.contains(CLASSES.foldOpen);
  }

  public debugLog(...args: any[]): void {
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
      this.isOpen ? this.close(animate) : this.show(animate);
      return;
    }

    if (show) {
      offset = 0;

      this.lastFocusedElement = document.activeElement;

      // Can mess with animation - set focus after animation is done
      setTimeout(() => {
        this.activeSubmenu?.focusFirstElem();
      }, this.options.transitionDuration);
    } else {
      offset = this.options.position === MenuPosition.Left ? '-100%' : '100%';

      // Deactivate all menus and hide fold
      // Timeout to not mess with animation because of setting the focus
      setTimeout(() => {
        this.slides.forEach((menu) => !menu.isActive && menu.deactivate());
        // Refocus last focused element before opening menu
        // @ts-expect-error // possibly has no focus() function
        this.lastFocusedElement?.focus();
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
  private getTargetSlideDynamically(): Slide | undefined {
    const currentPath = location.pathname;
    const currentHash = location.hash;
    const currentHashItem = this.slides.find((menu) => menu.matches(currentHash));
    const currentPathItem = this.slides.find((menu) => menu.matches(currentPath));
    return currentPathItem ?? currentHashItem;
  }

  public open(animate: boolean = true): void {
    const target = this.options.dynamicOpenDefault
      ? this.getTargetSlideDynamically()
      : this.defaultOpenTarget;

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

    document.querySelector('body')?.classList.add(CLASSES.open);
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

    document.querySelector('body')?.classList.remove(CLASSES.open);
  }

  /**
   * Navigate one menu hierarchy back if possible
   */
  public back(closeFold: boolean = false): void {
    const rootSlide = this.slides[0];
    let nextMenu = this.activeSubmenu?.parent ?? rootSlide;
    if (closeFold) {
      this.activeSubmenu = this.activeSubmenu?.getClosestUnfoldableSlide() ?? rootSlide;
      nextMenu = this.activeSubmenu?.parent ?? rootSlide;
      this.closeFold();
    }

    // Event is triggered in navigate()
    this.navigateTo(nextMenu);
  }

  private closeFold(): void {
    this.slides.forEach((menu) => {
      menu.appendTo(this.sliderWrapperElem);
    });
    this.menuElem.classList.remove(CLASSES.foldOpen);
  }

  private openFold(): void {
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
    this.setBodyTagSlideLevel(level);
    this.setActiveSubmenu(nextMenu);

    setTimeout(() => {
      if (runInForeground) {
        // Wait for anmiation to finish to focus next link in nav otherwise focus messes with slide animation
        nextMenu.focusFirstElem();
      }

      if (isNavigatingBack) {
        // Wait for anmiation to finish to deactivate previous otherwise width of container messes with slide animation
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

  private setActiveSubmenu(nextMenu: Slide): void {
    this.activeSubmenu = nextMenu;
  }

  private setBodyTagSlideLevel(level: number): void {
    document.querySelector('body')?.setAttribute('data-slide-menu-level', level.toString());
  }

  private setTabbing(
    nextMenu: Slide,
    firstUnfoldableParent: Slide | undefined,
    previousMenu: Slide | undefined,
    parents: Slide[],
  ): void {
    this.menuElem.removeAttribute('inert');

    if (nextMenu.canFold()) {
      this.openFold();

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
      // close fold
      this.closeFold();
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
    document.documentElement.style.setProperty('--smdm-sm-menu-level', `${level}`);
    return level;
  }

  private updateMenuTitle(nextMenu: Slide, firstUnfoldableParent?: Slide): void {
    if (this.menuTitle) {
      let anchorText = nextMenu?.anchorElem?.textContent ?? this.menuTitleDefaultText;
      const navigatorTextAfter = this.options?.navigationButtons ?? '';
      const navigatorTextBefore = this.options?.submenuLinkBefore ?? '';

      if (nextMenu.canFold() && firstUnfoldableParent) {
        anchorText = firstUnfoldableParent.anchorElem?.textContent ?? anchorText;
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
  private getTargetSlideByIdentifier(targetMenuIdAnchorHrefOrSelector: string): Slide | undefined {
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
  private initEventHandlers(): void {
    // Handler for end of CSS transition
    this.menuElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));
    this.sliderElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));

    // Hide menu on click outside menu
    if (this.options.closeOnClickOutside) {
      document.addEventListener('click', (event) => {
        if (
          this.isOpen &&
          !this.isAnimating &&
          // @ts-expect-error // Event Target will always be Element
          !this.menuElem.contains(event.target) &&
          // @ts-expect-error // Event Target will always be Element
          !event.target?.closest('.' + CLASSES.control)
        ) {
          this.close();
        }
      });
    }

    this.initKeybindings();
  }

  private onTransitionEnd(event: Event): void {
    // Ensure the transitionEnd event was fired by the correct element
    // (elements inside the menu might use CSS transitions as well)
    if (
      event.target !== this.menuElem &&
      event.target !== this.sliderElem &&
      event.target !== this.foldableWrapperElem &&
      event.target !== this.sliderWrapperElem
    ) {
      return;
    }

    this.isAnimating = false;

    if (this.lastAction) {
      this.triggerEvent(this.lastAction, true);
      this.lastAction = null;
    }
  }

  private initKeybindings(): void {
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
          if (elem?.classList.contains(CLASSES.navigator)) elem.click();
          break;
      }
    });
  }

  /**
   * Trigger a custom event to support callbacks
   */
  private triggerEvent(action: Action, afterAnimation: boolean = false): void {
    this.lastAction = action;

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
   * Start the slide animation (the CSS transition)
   */
  private moveElem(elem: HTMLElement, offset: string | number, unit: string = '%'): void {
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
  private initMenu(): void {
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

    const rootMenu = this.menuElem.querySelector('ul') as unknown as SlideHTMLElement | null;
    if (rootMenu) {
      this.slides.push(new Slide(rootMenu, this.options));
    }

    this.menuElem.addEventListener('keydown', (event) => {
      // WCAG - if anchors are used for navigation make them usable with space
      if (
        event.key === ' ' &&
        event.target instanceof HTMLAnchorElement &&
        event.target.role === 'button'
      ) {
        event.preventDefault();
        event.target.click();
      }

      // WCAG - trap focus in menu
      const firstControl = this.menuElem.querySelector(
        `.${CLASSES.controls} .${CLASSES.control}:not([disabled]):not([tabindex="-1"])`,
      ) as HTMLElement | undefined;
      trapFocus(event, this.activeSubmenu?.menuElem ?? this.menuElem, firstControl);
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) {
        return;
      }

      const bodyContentWidth = entries[0].contentRect.width;

      if (bodyContentWidth < this.options.minWidthFold && this.isFoldOpen) {
        this.closeFold();
        const parents = this.activeSubmenu?.getAllParents();
        const firstUnfoldableParent = parents?.find((p) => !p.canFold());
        this.setTabbing(
          this.activeSubmenu ?? this.slides[0],
          firstUnfoldableParent,
          this.activeSubmenu,
          parents ?? [],
        );
        this.setSlideLevel(this.activeSubmenu ?? this.slides[0]);
        this.setTabbing(this.activeSubmenu ?? this.slides[0], undefined, undefined, []);
      }

      if (bodyContentWidth > this.options.minWidthFold && !this.isFoldOpen) {
        this.openFold();
        const parents = this.activeSubmenu?.getAllParents();
        const firstUnfoldableParent = parents?.find((p) => !p.canFold());
        this.setTabbing(
          this.activeSubmenu ?? this.slides[0],
          firstUnfoldableParent,
          this.activeSubmenu,
          parents ?? [],
        );
        this.setSlideLevel(this.activeSubmenu ?? this.slides[0]);
      }
    });
    resizeObserver.observe(document.body);
  }

  /**
   * Pause the CSS transitions, to apply CSS changes directly without an animation
   */
  private runWithoutAnimation(action: () => void): void {
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
  private initSlides(): void {
    this.menuElem.querySelectorAll('a').forEach((anchor: HTMLAnchorElement, index: number) => {
      if (anchor.parentElement === null) {
        return;
      }

      const submenu = anchor.parentElement.querySelector(
        'ul',
      ) as unknown as SlideHTMLElement | null;

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

  get onlyNavigateDecorator(): boolean {
    return !!this.options.navigationButtons;
  }
}

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
      : document.getElementById(target as string) ?? document.querySelector(target); // assumes #id

  if (!menu) {
    throw new Error(`Unable to find menu ${target}`);
  }

  const slideMenuInstance = (menu as MenuHTMLElement)._slideMenu;

  // Always prevent opening of links if not onlyNavigateDecorator
  if (slideMenuInstance && !slideMenuInstance.onlyNavigateDecorator) {
    event.preventDefault();
  }

  // Only prevent opening of links when clicking the decorator when onlyNavigateDecorator
  // if (slideMenuInstance && slideMenuInstance.onlyNavigateDecorator) {
  //   event.preventDefault();
  // }

  const methodName = btn.getAttribute('data-action');
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
