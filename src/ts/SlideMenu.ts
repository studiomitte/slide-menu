import '../styles/slide-menu.scss';
import { MenuSlide, SlideHTMLElement } from './MenuSlide';
import { Action, SlideMenuOptions, MenuPosition, CLASSES, NAMESPACE } from './SlideMenuOptions';

import { parentsOne, trapFocus } from './utils/dom';

interface MenuHTMLElement extends HTMLElement {
  _slideMenu: SlideMenu;
}

const DEFAULT_OPTIONS = {
  backLinkAfter: '',
  backLinkBefore: '',
  showBackLink: true,
  keyClose: 'Escape',
  keyOpen: '',
  position: 'right',
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
  private activeSubmenu: MenuSlide | undefined;
  private lastFocusedElement: Element | null = null;
  private isOpen: boolean = false;
  private isAnimating: boolean = false;
  private lastAction: Action | null = null;
  private defaultOpenTarget: MenuSlide | undefined;

  private readonly slides: MenuSlide[] = [];

  private readonly options: SlideMenuOptions;

  private readonly menuTitleDefaultText: string = 'Menu';

  private readonly menuElem: MenuHTMLElement;
  private readonly sliderElem: HTMLElement;
  private readonly menuTitle: HTMLElement | null;
  private readonly sliderWrapperElem: HTMLElement;
  private readonly foldableWrapperElem: HTMLElement;

  public constructor(elem: HTMLElement, options?: Partial<SlideMenuOptions>) {
    if (elem === null) {
      throw new Error('Argument `elem` must be a valid HTML node');
    }

    // (Create a new object for every instance)
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.menuElem = elem as MenuHTMLElement;
    this.options.id = this.menuElem.id ?? 'smdm-slide-menu-' + counter;
    counter++;
    this.menuElem.id = this.options.id;

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

    this.menuTitle = this.menuElem.querySelector(`.${CLASSES.title}`) as HTMLElement;
    this.menuTitleDefaultText = this.menuTitle?.textContent?.trim() ?? this.menuTitleDefaultText;

    if (
      this.options.onlyNavigateDecorator &&
      (!this.options.submenuLinkAfter || !this.options.submenuLinkBefore)
    ) {
      this.debugLog(
        'Make sure to provide navigation decorators manually! Otherwise `onlyNavigateDecorator` only works with `submenuLinkAfter` and `submenuLinkBefore` options!',
      );
    }

    this.initMenu();
    this.initSlides();
    this.initEventHandlers();

    this.menuElem.style.display = 'flex';

    // Save this instance in menu to DOM node
    this.menuElem._slideMenu = this;

    // send event that menu is ready
    this.triggerEvent(Action.Initialize);

    if (this.defaultOpenTarget) {
      this.navigateTo(this.defaultOpenTarget ?? this.slides[0], false);
    }
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
      this.activeSubmenu?.focusFirstElem();
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

    document.querySelector('body')?.classList.remove(CLASSES.open);
  }

  /**
   * Navigate one menu hierarchy back if possible
   */
  public back(closeFold: boolean = false): void {
    const rootSlide = this.slides[0];
    let nextMenu = this.activeSubmenu?.parent ?? rootSlide;
    if (closeFold) {
      this.activeSubmenu = this.activeSubmenu?.getClosestNotFoldableSlide() ?? rootSlide;
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
  public navigateTo(
    target: HTMLElement | MenuSlide | string,
    runInForeground: boolean = true,
  ): void {
    let nextMenu: MenuSlide;

    // Open Menu if still closed
    if (runInForeground && !this.isOpen) {
      this.show();
    }

    if (typeof target === 'string') {
      const menu = this.getTargetMenuFromIdentifier(target);
      if (menu instanceof MenuSlide) {
        nextMenu = menu;
      } else {
        throw new Error('Invalid parameter `target`. A valid query selector is required.');
      }
    }

    if (target instanceof HTMLElement) {
      const menu = this.slides.find((menu) => menu.contains(target as HTMLElement));
      if (menu instanceof MenuSlide) {
        nextMenu = menu;
      } else {
        throw new Error('Invalid parameter `target`. Not found in slide menu');
      }
    }

    if (target instanceof MenuSlide) {
      nextMenu = target;
    }

    // @ts-expect-error // used before access -> can be undefined
    if (!nextMenu) {
      throw new Error('No valid next slide fund');
    }

    const previousMenu = this.activeSubmenu;
    const parents = nextMenu.getAllParents();
    const firstUnfoldableParent = parents.find((p) => !p.canFold());

    this.updateMenuTitle(nextMenu, firstUnfoldableParent);

    const currentlyVisibleMenus = [nextMenu, ...parents];
    const currentlyVisibleIds = currentlyVisibleMenus.map((menu) => menu?.id);

    const isNavigatingBack = previousMenu
      ?.getAllParents()
      .map((menu) => menu.id)
      .includes(nextMenu.id);

    const isNavigatingForward = nextMenu
      ?.getAllParents()
      .map((menu) => menu.id)
      .includes(previousMenu?.id ?? '');

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

    if (nextMenu.canFold()) {
      this.openFold();

      // Enable Tabbing for foldable Parents
      nextMenu.getAllParents().forEach((menu) => {
        if (menu.canFold()) {
          menu.enableTabbing();
        }
      });

      // disable Tabbing for invisible unfoldable parents
      firstUnfoldableParent?.getAllParents().forEach((menu) => {
        menu.disableTabbing();
      });
    } else if (previousMenu?.canFold() && !nextMenu.canFold()) {
      // close fold and disable tabbing for all parents
      this.closeFold();
      parents.forEach((menu) => {
        menu.disableTabbing();
      });
    }

    // Disable all previous active menus not active now
    this.slides.forEach((slide) => {
      if (!currentlyVisibleIds.includes(slide.id)) {
        // When navigating backwards deactivate (hide) previous after transition to not mess with animation
        if (isNavigatingBack && slide.id === previousMenu?.id) {
          return;
        }

        slide.deactivate();
        slide.disableTabbing();
      }
    });

    currentlyVisibleMenus.forEach((menu) => {
      if (!menu?.isActive) {
        menu?.activate();
      }
    });

    nextMenu.enableTabbing();

    const level = this.getSlideLevel(nextMenu, isNavigatingBack);
    const menuWidth = this.options.menuWidth;
    const offset = -menuWidth * level;

    this.moveElem(this.sliderWrapperElem, offset, 'px');

    this.activeSubmenu = nextMenu;

    document.querySelector('body')?.setAttribute('data-slide-menu-level', level.toString());

    // Wait for anmiation to finish to focus next link in nav otherwise focus messes with slide animation
    setTimeout(() => {
      if (runInForeground) {
        nextMenu.focusFirstElem();
      }

      if (isNavigatingBack) {
        previousMenu?.deactivate();
      }
    }, this.options.transitionDuration);
  }

  private getSlideLevel(nextMenu: MenuSlide, isNavigatingBack?: boolean): number {
    const activeNum = Array.from(
      this.sliderWrapperElem.querySelectorAll('.' + CLASSES.active),
    ).length;
    const navDecrement = !nextMenu.canFold() ? Number(isNavigatingBack) : 0;
    return Math.max(1, activeNum) - 1 - navDecrement;
  }

  private updateMenuTitle(nextMenu: MenuSlide, firstUnfoldableParent?: MenuSlide): void {
    if (this.menuTitle) {
      let anchorText = nextMenu?.anchorElem?.textContent ?? this.menuTitleDefaultText;
      const decoratorTextAfter = this.options?.submenuLinkAfter ?? '';
      const decoratorTextBefore = this.options?.submenuLinkBefore ?? '';

      if (nextMenu.canFold() && firstUnfoldableParent) {
        anchorText = firstUnfoldableParent.anchorElem?.textContent ?? anchorText;
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
  private getTargetMenuFromIdentifier(
    targetMenuIdAnchorHrefOrSelector: string,
  ): MenuSlide | undefined {
    return (
      this.slides.find((menu) => menu.matches(targetMenuIdAnchorHrefOrSelector)) ??
      this.slides.find((menu) => menu.menuElem.querySelector(targetMenuIdAnchorHrefOrSelector))
    );
  }

  private getTargetMenuDynamically(): MenuSlide | undefined {
    const currentPath = location.pathname;
    const currentHash = location.hash;
    const currentHashItem = this.slides.find((menu) => menu.matches(currentHash));
    const currentPathItem = this.slides.find((menu) => menu.matches(currentPath));
    return currentPathItem ?? currentHashItem;
  }

  public open(animate: boolean = true): void {
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
          if (elem?.classList.contains(CLASSES.decorator)) elem.click();
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

    const rootMenu = this.menuElem.querySelector('ul') as SlideHTMLElement | null;
    if (rootMenu) {
      this.slides.push(new MenuSlide(rootMenu, this.options));
    }

    const firstControl = this.menuElem.querySelector(`.${CLASSES.controls} .${CLASSES.control}`) as
      | HTMLElement
      | undefined;

    this.menuElem.addEventListener('keydown', (event) => {
      const openedRootMenu = this.activeSubmenu?.getClosestNotFoldableSlide() ?? this.slides[0];
      if (openedRootMenu) {
        trapFocus(event, this.activeSubmenu?.menuElem ?? this.menuElem, firstControl);
      }
    });
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
   * Enhance the markup of menu items which contain a submenu
   */
  private initSlides(): void {
    this.menuElem.querySelectorAll('a').forEach((anchor: HTMLAnchorElement, index: number) => {
      if (anchor.parentElement === null) {
        return;
      }

      const submenu = anchor.parentElement.querySelector('ul') as SlideHTMLElement | null;

      if (!submenu) {
        return;
      }

      const menuSlide = new MenuSlide(submenu, this.options, anchor);
      this.slides.push(menuSlide);
    });

    this.slides.forEach((menuSlide) => {
      menuSlide.appendTo(this.sliderWrapperElem);
    });

    const defaultTargetSelector = this.menuElem.dataset.openTarget ?? 'smdm-sm-no-default-provided';
    this.defaultOpenTarget = this.getTargetMenuFromIdentifier(defaultTargetSelector);

    this.activeSubmenu = this.defaultOpenTarget?.activate() ?? this.slides[0].activate();
  }

  get onlyNavigateDecorator(): boolean {
    return this.options.onlyNavigateDecorator;
  }
}

// Link control buttons with the API
document.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  const canControlMenu = (elem: Element): boolean => {
    return (
      elem.classList.contains(CLASSES.control) ||
      elem.classList.contains(CLASSES.hasSubMenu) ||
      elem.classList.contains(CLASSES.decorator)
    );
  };

  const btn = canControlMenu(event.target)
    ? event.target
    : event.target.closest(`.${CLASSES.control}, .${CLASSES.hasSubMenu}, .${CLASSES.decorator}`);
  if (!btn || !canControlMenu(btn)) {
    return;
  }

  const target = btn.getAttribute('data-target');
  const menu =
    !target || target === 'this'
      ? parentsOne(btn, `.${NAMESPACE}`)
      : document.getElementById(target) ?? document.querySelector(target); // assumes #id

  if (!menu) {
    throw new Error(`Unable to find menu ${target}`);
  }

  const instance = (menu as MenuHTMLElement)._slideMenu;

  // if(btn.classList.contains(CLASSES.hasSubMenu)) {
  //   instance.markSelectedItem(btn);
  // }

  // Always prevent opening of links if not onlyNavigateDecorator
  if (instance && !instance.onlyNavigateDecorator) {
    event.preventDefault();
  }

  // Only prevent opening of links when clicking the decorator when onlyNavigateDecorator
  if (instance && instance.onlyNavigateDecorator && event.target.matches(`.${CLASSES.decorator}`)) {
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
  const arg = Object.keys(dataArgMapping).includes(dataArg?.toString() ?? '')
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

// send global event when SlideMenu is ready
window.dispatchEvent(new Event('sm.ready'));
