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

  private readonly menuElem: MenuHTMLElement;
  private readonly sliderElem: HTMLElement;
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

    this.initMenu();
    this.initSlides();
    this.initEventHandlers();

    this.menuElem.style.display = 'flex';

    // Save this instance in menu to DOM node
    this.menuElem._slideMenu = this;
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

      // Deactivae all menus and hide fold
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
   * Show the menu
   */
  public show(animate: boolean = true): void {
    this.triggerEvent(Action.Open);
    this.toggleVisibility(true, animate);
  }

  /**
   * Hide / Close the menu
   */
  public close(animate: boolean = true): void {
    this.triggerEvent(Action.Close);
    this.toggleVisibility(false, animate);
  }

  /**
   * Navigate one menu hierarchy back if possible
   */
  public back(closeFold: boolean = false): void {
    let nextMenu = this.activeSubmenu?.parent ?? this.slides[0];
    if (closeFold) {
      this.closeFold();
      nextMenu = this.activeSubmenu?.getClosestNotFoldableSlide()?.parent ?? this.slides[0];
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
  public navigateTo(target: HTMLElement | MenuSlide | string): void {
    this.triggerEvent(Action.NavigateTo);

    let nextMenu: MenuSlide;

    // Open Menu if still closed
    if (!this.isOpen) {
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

    // @ts-expect-error // can be used befor access -> can be undefined
    if (!nextMenu) {
      throw new Error('No valid next slide fund');
    }

    const previousMenu = this.activeSubmenu;
    const parents = nextMenu.getAllParents();
    const firstUnfoldableMenu = parents.find((p) => !p.canFold());

    const currentlyVisibleMenus = [nextMenu, ...parents];
    const currentlyVisibleIds = currentlyVisibleMenus.map((menu) => menu?.id);

    const isNavigatingBack = previousMenu
      ?.getAllParents()
      .map((menu) => menu.id)
      .includes(nextMenu.id);

    if (nextMenu.canFold()) {
      this.openFold();
      firstUnfoldableMenu?.getAllParents().forEach((menu) => {
        menu.disableTabbing();
      });
    } else if (previousMenu?.canFold() && !nextMenu.canFold()) {
      this.closeFold();
      parents.forEach((menu) => {
        menu.disableTabbing();
      });
    }

    // Disable all previous acitve menus not active now
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

    console.log(previousMenu, previousMenu?.isActive, previousMenu?.menuElem.classList.toString());

    currentlyVisibleMenus.forEach((menu) => {
      if (!menu?.isActive) {
        menu?.activate();
      }
    });

    nextMenu.enableTabbing();

    const level = this.getSlideLevel();
    const navDecrement = !nextMenu.canFold() ? Number(isNavigatingBack) : 0;
    const factor = Math.max(1, level) - 1 - navDecrement;
    const menuWidth = this.options.menuWidth;
    const offset = - menuWidth * factor;

    this.moveElem(this.sliderWrapperElem, offset, 'px');

    this.activeSubmenu = nextMenu;

    // Wait for anmiation to finish to focus next link in nav otherwise focus messes with slide animation
    setTimeout(() => {
      nextMenu.focusFirstElem();
      if (isNavigatingBack) {
        previousMenu?.deactivate();
      }
    }, this.options.transitionDuration);
  }

  private getSlideLevel(): number {
    return Array.from(this.sliderWrapperElem.querySelectorAll('.' + CLASSES.active)).length;
  }

  /**
   *
   * @param targetMenuIdHrefOrSelector a selector or Slide ID or Slug of Href
   * @returns
   */
  private getTargetMenuFromIdentifier(
    targetMenuIdAnchorHrefOrSelector: string,
  ): MenuSlide | undefined {
    return this.slides.find((menu) => menu.matches(targetMenuIdAnchorHrefOrSelector));
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
    if (event.target !== this.menuElem && event.target !== this.sliderElem) {
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
          if(elem?.classList.contains(CLASSES.decorator)) elem.click();
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

      elem.style.transform = `translateX(${offset})`;
      this.isAnimating = true;
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

    const firstControl = this.menuElem.querySelector(
      `.${CLASSES.controls}  .${CLASSES.control}`,
    ) as HTMLElement | undefined;

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
}

// Link control buttons with the API
document.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  const canControlMenu = (elem: Element): boolean => {
    return elem.classList.contains(CLASSES.control) || elem.classList.contains(CLASSES.hasSubMenu) || elem.classList.contains(CLASSES.decorator);
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
      : document.getElementById(target); // assumes #id

  if (!menu) {
    throw new Error(`Unable to find menu ${target}`);
  }

  const instance = (menu as MenuHTMLElement)._slideMenu;
  // if(btn.classList.contains(CLASSES.hasSubMenu)) {
  //   instance.markSelectedItem(btn);
  // }
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
