/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import '../styles/slide-menu.scss';

import { getDistanceFromTop, parents, parentsOne, wrapElement } from './utils/dom';

interface MenuHTMLElement extends HTMLElement {
  _slideMenu: SlideMenu;
}

interface SlideMenuOptions {
  backLinkBefore: string;
  backLinkAfter: string;
  keyOpen: string;
  keyClose: string;
  position: MenuPosition;
  showBackLink: boolean;
  submenuLinkBefore: string;
  submenuLinkAfter: string;
  closeOnClickOutside: boolean;
  onlyNavigateDecorator: boolean;
  minWidthFold: number;
  transitionDuration: number;
  alignFoldTop: boolean;
  dynamicOpenDefault: boolean;
}

enum Direction {
  Backward = -1,
  Forward = 1,
}

enum MenuPosition {
  Left = 'left',
  Right = 'right',
}

enum Action {
  Back = 'back',
  Close = 'close',
  Forward = 'forward',
  Navigate = 'navigate',
  Open = 'open',
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
  minWidthFold: 640, // px
  transitionDuration: 300, // ms
  alignFoldTop: false,
  dynamicOpenDefault: false,
};

class SlideMenu {
  public static readonly NAMESPACE = 'slide-menu';
  public static readonly CLASS_NAMES = {
    active: `${SlideMenu.NAMESPACE}__submenu--active`,
    backlink: `${SlideMenu.NAMESPACE}__backlink`,
    control: `${SlideMenu.NAMESPACE}__control`,
    decorator: `${SlideMenu.NAMESPACE}__decorator`,
    wrapper: `${SlideMenu.NAMESPACE}__slider`,
    item: `${SlideMenu.NAMESPACE}__item`,
    submenu: `${SlideMenu.NAMESPACE}__submenu`,
    hasSubMenu: `${SlideMenu.NAMESPACE}__item--has-submenu`,
    activeItem: `${SlideMenu.NAMESPACE}__item--active`,
    hasFoldableSubmenu: `${SlideMenu.NAMESPACE}__item--has-foldable-submenu`,
    foldableSubmenu: `${SlideMenu.NAMESPACE}__submenu--foldable`,
    foldableSubmenuAlignTop: `${SlideMenu.NAMESPACE}__submenu--foldable-align-top`,
    foldOpen: `${SlideMenu.NAMESPACE}--fold-open`,
  };

  private level: number = 0;
  private foldLevel: number = 0;
  private activeSubmenu: HTMLElement | undefined | null = null;
  private lastFocusedElement: Element | null = null;
  private isOpen: boolean = false;
  private isAnimating: boolean = false;
  private lastAction: Action | null = null;
  private defaultOpenTarget: HTMLElement | null = null;

  private readonly options: SlideMenuOptions;

  private readonly menuElem: MenuHTMLElement;
  private readonly wrapperElem: HTMLElement;

  public constructor(elem: HTMLElement, options?: Partial<SlideMenuOptions>) {
    if (elem === null) {
      throw new Error('Argument `elem` must be a valid HTML node');
    }

    // (Create a new object for every instance)
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.menuElem = elem as MenuHTMLElement;

    // Add wrapper (for the slide effect)
    this.wrapperElem = document.createElement('div');
    this.wrapperElem.classList.add(SlideMenu.CLASS_NAMES.wrapper);

    const firstUl = this.menuElem.querySelector('ul');
    if (firstUl) {
      wrapElement(firstUl, this.wrapperElem);
    }

    this.initMenu();
    this.initSubmenus();
    this.initEventHandlers();

    // Save this instance in menu DOM node
    this.menuElem._slideMenu = this;
  }

  /**
   * Toggle the menu
   */
  public toggle(show?: boolean, animate: boolean = true): void {
    let offset;

    if (show === undefined) {
      this.isOpen ? this.close(animate) : this.show(animate);
      return;
    } else if (show) {
      offset = 0;

      this.lastFocusedElement = document.activeElement;

      this.focusFirstElemInSubmenu(this.activeSubmenu);
    } else {
      offset = this.options.position === MenuPosition.Left ? '-100%' : '100%';

      // Deaktivate all submenus & fold
      this.menuElem
        .querySelectorAll('.' + SlideMenu.CLASS_NAMES.foldableSubmenu)
        .forEach((foldable) => {
          foldable.classList.remove(SlideMenu.CLASS_NAMES.active);
        });
      this.menuElem.classList.remove(SlideMenu.CLASS_NAMES.foldOpen);
      this.foldLevel = 0;

      // Refocus last focused element before opening menu
      // @ts-ignore
      this.lastFocusedElement?.focus();
    }

    this.isOpen = show;

    if (animate) {
      this.moveSlider(this.menuElem, offset);
    } else {
      const action = this.moveSlider.bind(this, this.menuElem, offset);
      this.runWithoutAnimation(action);
    }
  }

  /**
   * Show the menu
   */
  public show(animate: boolean = true): void {
    this.triggerEvent(Action.Open);
    this.toggle(true, animate);
  }

  /**
   * Hide / Close the menu
   */
  public close(animate: boolean = true): void {
    this.triggerEvent(Action.Close);
    this.toggle(false, animate);
  }

  /**
   * Navigate one menu hierarchy back if possible
   */
  public back(closeFold: boolean = false): void {
    if (closeFold) {
      this.closeFold();
    }

    // Event is triggered in navigate()
    this.navigate(Direction.Backward);
  }

  private closeFold(): void {
    this.menuElem.querySelectorAll(`.${SlideMenu.CLASS_NAMES.foldableSubmenu}.${SlideMenu.CLASS_NAMES.active}`).forEach(openFoldable => {
      openFoldable.classList.remove(SlideMenu.CLASS_NAMES.active);
    })
    this.foldLevel = 0;
    this.menuElem.classList.remove(SlideMenu.CLASS_NAMES.foldOpen);
  }

  /**
   * Navigate to a specific link on any level (useful to open the correct hierarchy directly)
   */
  public navigateTo(target: HTMLElement | string): void {
    this.triggerEvent(Action.Navigate);

    // Open Menu if still closed
    if (!this.isOpen) {
      this.show();
    }

    if (typeof target === 'string') {
      const elem = document.querySelector(target);
      if (elem instanceof HTMLElement) {
        target = elem;
      } else {
        throw new Error('Invalid parameter `target`. A valid query selector is required.');
      }
    }

    // Hide other active menus
    const activeMenus = Array.from(
      this.wrapperElem.querySelectorAll(`.${SlideMenu.CLASS_NAMES.active}`),
    ) as HTMLElement[];
    activeMenus.forEach((activeElem) => {
      activeElem.classList.remove(SlideMenu.CLASS_NAMES.active);
    });

    const parentUl = parents(target, 'ul');
    const level = parentUl.length - 1;

    this.activeSubmenu = this.getParentSubmenuOfAnchor(target);
    this.setTabIndex(this.activeSubmenu, false);

    // Trigger the animation only if currently on different level
    if (level >= 0 && level !== this.level) {
      this.level = level;
      this.moveSlider(this.wrapperElem, -this.level * 100);
    }

    parentUl.forEach((ul: HTMLElement) => {
      ul.classList.add(SlideMenu.CLASS_NAMES.active);
    });

    // Wait for anmiation to finish to focus next link in nav otherwise focus messes with slide animation
    setTimeout(() => {
      target?.focus();
    }, this.options.transitionDuration);
  }

  public open(animate: boolean = true): void {
    if (this.options.dynamicOpenDefault) {
      const currentPath = location.pathname;
      const currentHash = location.hash;
      const currentHashItem = Array.from(this.menuElem.querySelectorAll('a')).find((item) =>
        item.href.includes(currentHash),
      );
      const currentPathItem = Array.from(this.menuElem.querySelectorAll('a')).find((item) =>
        item.href.includes(currentPath),
      );
      const currentMenuItem = currentPathItem ?? currentHashItem;
      const target = this.getNextSubmenu(currentMenuItem)?.querySelector('a') ?? currentMenuItem;

      if (target) {
        this.navigateTo(target);
        return;
      }
    }

    if (this.defaultOpenTarget) {
      const target =
        this.getNextSubmenu(this.defaultOpenTarget)?.querySelector('a') ??
        (this.defaultOpenTarget as HTMLElement);
      this.navigateTo(target);
      return;
    }

    this.show(animate);
  }

  /**
   * Set up all event handlers
   */
  private initEventHandlers(): void {
    if (this.options.onlyNavigateDecorator) {
      // Navigate Using Decorators
      const anchors = Array.from(
        this.menuElem.querySelectorAll('.' + SlideMenu.CLASS_NAMES.decorator),
      );

      const navigationHandler = (event: Event): void => {
        const target = event.target as HTMLElement;
        const targetAnchor = target?.parentElement?.matches('a')
        ? target?.parentElement
        // @ts-ignore
          : parentsOne(target?.parentElement, 'a');
        if (targetAnchor && !target.dataset.action) {
          this.navigate(Direction.Forward, targetAnchor);
        }
      };

      anchors.forEach((anchor: Element) => {
        anchor.addEventListener('click', navigationHandler);
        // @ts-ignore
        anchor.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            navigationHandler(event);
          }
        });
      });
    } else {
      // Ordinary links inside the menu
      const anchors = Array.from(
        this.menuElem.querySelectorAll('.' + SlideMenu.CLASS_NAMES.hasSubMenu),
      );
      anchors.forEach((anchor: Element) => {
        anchor.addEventListener('click', (event) => {
          const target = event.target as HTMLElement;
          const targetAnchor = target.matches('a') ? target : parentsOne(target, 'a');

          if (targetAnchor && !target.dataset.action) {
            this.navigate(Direction.Forward, targetAnchor);
          }
        });
      });
    }

    // Handler for end of CSS transition
    this.menuElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));
    this.wrapperElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));

    // Hide menu on click outside menu
    if (this.options.closeOnClickOutside) {
      document.addEventListener('click', (event) => {
        // @ts-ignore
        if (this.isOpen && !this.isAnimating && !this.menuElem.contains(event.target)) {
          this.close();
        }
      });
    }

    this.initKeybindings();
    this.initSubmenuVisibility();
  }

  private onTransitionEnd(event: Event): void {
    // Ensure the transitionEnd event was fired by the correct element
    // (elements inside the menu might use CSS transitions as well)
    if (event.target !== this.menuElem && event.target !== this.wrapperElem) {
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
      switch (event.key) {
        case this.options.keyClose:
          this.close();
          break;
        case this.options.keyOpen:
          this.show();
          break;
        default:
          return;
      }

      event.preventDefault();
    });
  }

  private initSubmenuVisibility(): void {
    // Hide the lastly shown menu when navigating back (important for navigateTo)
    this.menuElem.addEventListener('sm.back-after', () => {
      const lastActiveSelector = `.${SlideMenu.CLASS_NAMES.active} `.repeat(this.level + 1);
      const lastActiveUl = this.menuElem.querySelector(
        `ul ${lastActiveSelector}`,
      ) as HTMLUListElement;

      if (lastActiveUl) {
        lastActiveUl.classList.remove(SlideMenu.CLASS_NAMES.active);
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

  /**
   * Navigate the menu - that is slide it one step left or right
   */
  private navigate(dir: Direction = Direction.Forward, anchor?: HTMLElement): void {
    if (this.isAnimating || (dir === Direction.Backward && this.level === 0)) {
      return;
    }

    const offset = (this.level + dir) * -100;
    const isFoldableSubmenu =
      window.innerWidth >= this.options.minWidthFold &&
      (anchor?.classList.contains(SlideMenu.CLASS_NAMES.hasFoldableSubmenu) ??
        (Direction.Backward && this.foldLevel > 0));

    this.menuElem.classList.remove(SlideMenu.CLASS_NAMES.foldOpen);

    const nextMenu = this.getNextSubmenu(anchor);
    const previousMenu = this.getPreviousSubmenu(this.activeSubmenu);

    if (anchor && nextMenu && dir === Direction.Forward) {
      this.markSelectedItem(anchor);
      
      if (isFoldableSubmenu) {

        // Hide previous foldable if it is not the parent menu
        if (
          this.activeSubmenu?.classList.contains(SlideMenu.CLASS_NAMES.foldableSubmenu) && 
          this.activeSubmenu !== this.getPreviousSubmenu(nextMenu)
        ) {
          this.activeSubmenu?.classList.remove(SlideMenu.CLASS_NAMES.active);
          this.foldLevel--;
        }
        
        this.positionFoldableSubmenu(nextMenu);
      } else {
        nextMenu.style.left = '100%';
      }
      this.activeSubmenu = nextMenu;
    } else if (previousMenu && dir === Direction.Backward) {
      this.activeSubmenu = previousMenu;
    }

    this.setTabIndex(this.activeSubmenu, isFoldableSubmenu);
    this.activeSubmenu?.classList.add(SlideMenu.CLASS_NAMES.active);

    const action = dir === Direction.Forward ? Action.Forward : Action.Back;
    this.triggerEvent(action);

    if (!isFoldableSubmenu) {
      this.level += dir;
      this.moveSlider(this.wrapperElem, offset);
    } else {
      this.foldLevel += dir;

      console.log(this.foldLevel);

      if (this.foldLevel > 0) {
        this.menuElem.classList.add(SlideMenu.CLASS_NAMES.foldOpen);
      }
    }

    // Wait for anmiation to finish to focus next link in nav otherwise focus messes with slide animation
    setTimeout(() => {
      this.focusFirstElemInSubmenu(this.activeSubmenu);
      this.activeSubmenu?.querySelectorAll('.' + SlideMenu.CLASS_NAMES.active).forEach((elem) => {
        elem.classList.remove(SlideMenu.CLASS_NAMES.active);
      });
    }, this.options.transitionDuration);
  }

  private getParentSubmenuOfAnchor(anchor: HTMLElement): HTMLElement | null {
    return anchor.closest('ul');
  }

  private getPreviousSubmenu(
    activeSubmenu: HTMLElement | null | undefined,
  ): HTMLElement | null | undefined {
    return activeSubmenu?.parentElement?.closest('ul');
  }

  private getNextSubmenu(anchor: HTMLElement | undefined): HTMLElement | null | undefined {
    return anchor?.parentElement?.querySelector('ul');
  }

  private markSelectedItem(anchor: HTMLElement): void {
    this.menuElem.querySelectorAll('.' + SlideMenu.CLASS_NAMES.activeItem).forEach((elem) => {
      elem.classList.remove(SlideMenu.CLASS_NAMES.activeItem);
    });
    anchor.classList.add(SlideMenu.CLASS_NAMES.activeItem);
  }

  private setTabIndex(
    currentActiveMenu: HTMLElement | undefined | null,
    isFoldableSubmenu: boolean,
  ): void {
    const selectorNavigateable = `a, .${SlideMenu.CLASS_NAMES.decorator}[tabindex]`;

    if (!isFoldableSubmenu && currentActiveMenu) {
      const previousMenu = this.getPreviousSubmenu(currentActiveMenu);

      previousMenu?.querySelectorAll(selectorNavigateable).forEach((link) => {
        link.setAttribute('tabindex', '-1');
      });
    }

    currentActiveMenu?.querySelectorAll(selectorNavigateable).forEach((link) => {
      link.setAttribute('tabindex', '0');
    });
  }

  private focusFirstElemInSubmenu(submenu: HTMLElement | null | undefined): void {
    const tabableLink = 'a[href][tabindex]:not([tabindex="-1"])';
    // @ts-ignore
    submenu?.querySelector(tabableLink)?.focus();
  }

  private positionFoldableSubmenu(ul: HTMLElement): void {
    ul.style.left = this.options.position === MenuPosition.Left ? '100%' : '-100%';

    const dy = getDistanceFromTop(ul);
    if (this.options.alignFoldTop && dy > 0) {
      ul.style.top = `-${dy}px`;
      ul.classList.add(SlideMenu.CLASS_NAMES.foldableSubmenuAlignTop);
    }
  }

  /**
   * Start the slide animation (the CSS transition)
   */
  private moveSlider(elem: HTMLElement, offset: string | number): void {
    // Add percentage sign
    if (!offset.toString().includes('%')) {
      offset += '%';
    }

    elem.style.transform = `translateX(${offset})`;
    this.isAnimating = true;
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

    this.menuElem.style.display = 'block';
    this.menuElem.querySelectorAll('a').forEach((link) => {
      link.classList.add(SlideMenu.CLASS_NAMES.item);
      link.setAttribute('tabindex', '0');
    });

    const defaultTargetSelector = this.menuElem.dataset.openTarget ?? 'smdm-sm-no-default-provided';
    this.defaultOpenTarget =
      this.menuElem.querySelector(`a[href="${defaultTargetSelector}"]`) ??
      this.menuElem.querySelector(defaultTargetSelector);
  }

  /**
   * Pause the CSS transitions, to apply CSS changes directly without an animation
   */
  private runWithoutAnimation(action: () => void): void {
    const transitionElems = [this.menuElem, this.wrapperElem];
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
  private initSubmenus(): void {
    this.menuElem.querySelectorAll('a').forEach((anchor: HTMLAnchorElement) => {
      if (anchor.parentElement === null) {
        return;
      }

      const submenu = anchor.parentElement.querySelector('ul');

      if (!submenu) {
        return;
      }

      const anchorText = anchor.textContent;
      this.addLinkDecorators(anchor);

      anchor.classList.add(SlideMenu.CLASS_NAMES.hasSubMenu);
      submenu.classList.add(SlideMenu.CLASS_NAMES.submenu);
      const isFoldableSubmenu = anchor.classList.contains(SlideMenu.CLASS_NAMES.hasFoldableSubmenu);
      if (isFoldableSubmenu) {
        submenu.classList.add(SlideMenu.CLASS_NAMES.foldableSubmenu);
      }

      if (this.options.onlyNavigateDecorator) {
        // Prevent default only on Decorator
        anchor
          .querySelector('.' + SlideMenu.CLASS_NAMES.decorator)
          ?.addEventListener('click', (event) => {
            event.preventDefault();
          });
      } else {
        // Prevent default behaviour (use link just to navigate)
        anchor.addEventListener('click', (event) => {
          event.preventDefault();
        });
      }

      // Add back links
      if (this.options.showBackLink) {
        const { backLinkBefore, backLinkAfter } = this.options;

        const backLink = document.createElement('a');
        backLink.innerHTML = backLinkBefore + anchorText + backLinkAfter;
        backLink.classList.add(
          SlideMenu.CLASS_NAMES.backlink,
          SlideMenu.CLASS_NAMES.control,
          SlideMenu.CLASS_NAMES.item,
        );
        backLink.setAttribute('data-action', Action.Back);
        backLink.setAttribute('tabindex', '0');
        backLink.setAttribute('href', '#');

        const backLinkLi = document.createElement('li');
        backLinkLi.appendChild(backLink);

        submenu.insertBefore(backLinkLi, submenu.firstChild);
      }
    });

    this.activeSubmenu = this.menuElem.querySelector('ul');
  }

  // Add `before` and `after` text
  private addLinkDecorators(anchor: HTMLAnchorElement): HTMLAnchorElement {
    const { submenuLinkBefore, submenuLinkAfter } = this.options;

    if (submenuLinkBefore) {
      const linkBeforeElem = document.createElement('span');
      linkBeforeElem.classList.add(SlideMenu.CLASS_NAMES.decorator);
      linkBeforeElem.innerHTML = submenuLinkBefore;

      if (this.options.onlyNavigateDecorator) {
        linkBeforeElem.setAttribute('tabindex', '0');
      }

      anchor.insertBefore(linkBeforeElem, anchor.firstChild);
    }

    if (submenuLinkAfter) {
      const linkAfterElem = document.createElement('span');
      linkAfterElem.classList.add(SlideMenu.CLASS_NAMES.decorator);
      linkAfterElem.innerHTML = submenuLinkAfter;

      if (this.options.onlyNavigateDecorator) {
        linkAfterElem.setAttribute('tabindex', '0');
      }

      anchor.appendChild(linkAfterElem);
    }

    return anchor;
  }
}

// Link control buttons with the API
document.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  const btn = event.target.className.includes(SlideMenu.CLASS_NAMES.control)
    ? event.target
    : parentsOne(event.target, `.${SlideMenu.CLASS_NAMES.control}`);

  if (!btn || !btn.className.includes(SlideMenu.CLASS_NAMES.control)) {
    return;
  }

  const target = btn.getAttribute('data-target');
  const menu =
    !target || target === 'this'
      ? parentsOne(btn, `.${SlideMenu.NAMESPACE}`)
      : document.getElementById(target); // assumes #id

  if (!menu) {
    throw new Error(`Unable to find menu ${target}`);
  }

  const instance = (menu as MenuHTMLElement)._slideMenu;
  const method = btn.getAttribute('data-action');
  const arg = btn.getAttribute('data-arg');

  // @ts-ignore
  if (instance && method && typeof instance[method] === 'function') {
    // @ts-ignore
    arg ? instance[method](arg) : instance[method]();
  }
});

// Expose SlideMenu to the global namespace
// @ts-ignore
window.SlideMenu = SlideMenu;
