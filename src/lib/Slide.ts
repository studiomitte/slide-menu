import { SlideMenuOptions, Action, CLASSES } from './SlideMenuOptions.js';
import { focusFirstTabAbleElemIn, validateQuery } from './utils/dom.js';

let number = 0;

export class Slide {
  public readonly id: string;
  public readonly isFoldable: boolean = false;
  public readonly parentMenuElem?: HTMLElement;
  public readonly name: string;
  public readonly ref: string;

  public navigatorElem?: HTMLElement;
  public parent?: Slide;
  private active: boolean = false;

  public get isActive(): boolean {
    return this.active;
  }

  /**
   * Construction phase: establishes identity and relationships only — no DOM writes except
   * setting the element's id (needed for aria-controls wiring in mount()).
   * Call mount() afterwards to apply all DOM decoration.
   */
  constructor(
    public readonly menuElem: HTMLElement,
    public readonly options: SlideMenuOptions,
    public readonly anchorElem?: HTMLAnchorElement,
    slidesByElem?: WeakMap<HTMLElement, Slide>,
  ) {
    this.id = menuElem.id ? menuElem.id : 'smdm-' + number;
    menuElem.id = this.id;
    number++;

    this.name = this.anchorElem?.textContent ?? '';
    this.ref = anchorElem ? anchorElem.href.replace(window.location.origin, '') : '/';
    this.parentMenuElem = anchorElem?.parentElement?.closest('ul') ?? undefined;
    this.parent = this.parentMenuElem ? slidesByElem?.get(this.parentMenuElem) : undefined;
    this.isFoldable = !!anchorElem?.classList.contains(CLASSES.hasFoldableSubmenu);
  }

  /**
   * DOM decoration phase: adds CSS classes, injects back-link and navigator button elements,
   * and sets data-action attributes. Called by SlideMenu after registering the slide in its
   * WeakMap so that sibling/child mounts can look up the correct parent instance.
   */
  public mount(): this {
    const { anchorElem, menuElem, options } = this;

    if (anchorElem) {
      anchorElem.classList.add(CLASSES.hasSubMenu);

      if (!options.navigationButtons) {
        anchorElem.dataset.action = Action.NavigateTo;
        anchorElem.dataset.arg = this.id;
        anchorElem.role = 'button';
        anchorElem.setAttribute('aria-controls', this.id);
        anchorElem.setAttribute('aria-expanded', 'false');
      }
    }

    menuElem.classList.add(CLASSES.submenu);
    menuElem.dataset.smdmId = this.id;
    menuElem.querySelectorAll('li').forEach((link) => {
      link.classList.add(CLASSES.listItem);
    });
    menuElem.querySelectorAll('a').forEach((link) => {
      link.classList.add(CLASSES.item);
    });

    if (this.isFoldable) {
      menuElem.classList.add(CLASSES.foldableSubmenu);
    }

    if (options.showBackLink) {
      this.addBackLink(options);
    }

    this.addNavigatorButton(options);

    return this;
  }

  private addBackLink(
    options: { backLinkBefore?: string; backLinkAfter?: string } = this.options,
  ): HTMLElement {
    const anchorText = this.anchorElem?.textContent ?? '';

    const backLink = document.createElement('a');
    backLink.innerHTML =
      (options.backLinkBefore ?? '') + anchorText + (options.backLinkAfter ?? '');
    backLink.classList.add(CLASSES.backlink, CLASSES.control, CLASSES.item);
    backLink.dataset.action = Action.Back;
    backLink.setAttribute('href', '#');

    const backLinkLi = document.createElement('li');
    backLinkLi.appendChild(backLink);

    this.menuElem.insertBefore(backLinkLi, this.menuElem.firstChild);

    return backLink;
  }

  private addNavigatorButton(options: SlideMenuOptions): void {
    if (!options.navigationButtons) {
      return;
    }

    const existingNavigator = Array.from(this.anchorElem?.parentElement?.children ?? []).find(
      (elem) => elem.classList.contains(CLASSES.navigator),
    ) as HTMLElement | undefined;
    const navigatorTag = 'button';
    const navigator = (existingNavigator ?? document.createElement(navigatorTag)) as HTMLElement;

    navigator.classList.add(CLASSES.navigator);
    navigator.dataset.action = navigator.dataset?.action ?? Action.NavigateTo;
    navigator.dataset.arg = navigator.dataset?.arg ?? this.id;
    navigator.setAttribute('aria-controls', this.id);
    navigator.setAttribute('aria-expanded', 'false');
    navigator.setAttribute('tabindex', '0');
    navigator.title = navigator.title
      ? navigator.title
      : options.navigationButtonsLabel + ': ' + this.name;

    if (navigator.tagName !== 'BUTTON') {
      navigator.role = 'button';
    }

    if (typeof options.navigationButtons === 'string' && !navigator.innerHTML.trim()) {
      navigator.innerHTML = options.navigationButtons;
    } else if (!navigator.getAttribute('aria-label')) {
      navigator.setAttribute('aria-label', options.navigationButtonsLabel + ': ' + this.name);
    }

    this.anchorElem?.insertAdjacentElement('afterend', navigator);

    this.navigatorElem = navigator;
  }

  public deactivate(): this {
    this.active = false;
    this.menuElem.classList.remove(CLASSES.active);
    this.menuElem.classList.remove(CLASSES.current);
    if (this.options.navigationButtons) {
      this.navigatorElem?.setAttribute('aria-expanded', 'false');
    } else {
      this.anchorElem?.setAttribute('aria-expanded', 'false');
    }
    return this;
  }

  public activate(): this {
    this.active = true;
    this.menuElem.classList.add(CLASSES.active);
    this.menuElem.classList.add(CLASSES.current);
    if (this.options.navigationButtons) {
      this.navigatorElem?.setAttribute('aria-expanded', 'true');
    } else {
      this.anchorElem?.setAttribute('aria-expanded', 'true');
    }
    return this;
  }

  public setInvisible(): this {
    if (this.isActive) {
      this.menuElem.classList.add(CLASSES.active);
    }
    this.menuElem.classList.remove(CLASSES.current);
    return this;
  }

  public enableTabbing(): void {
    this.menuElem.removeAttribute('inert');
  }

  public disableTabbing(): void {
    this.menuElem.setAttribute('inert', 'true');
  }

  public appendTo(elem: HTMLElement): this {
    elem.appendChild(this.menuElem);
    return this;
  }

  public getClosestUnfoldableSlide(): Slide | undefined {
    return this.isFoldable ? this.getAllParents().find((p) => !p.isFoldable) : this;
  }

  public getAllFoldableParents(): Slide[] {
    return this.isFoldable ? this.getAllParents().filter((p) => p.isFoldable) : [];
  }

  public getFirstUnfoldableParent(): Slide | undefined {
    return this.getAllParents().find((p) => !p.canFold());
  }

  public hasParent(possibleParentMenu: Slide | undefined): boolean {
    return this.getAllParents().some((p) => p.id === possibleParentMenu?.id);
  }

  public getAllParents(): Slide[] {
    const parents: Slide[] = [];

    let parent: Slide | undefined = this.parent;

    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }

    return parents;
  }

  /**
   * Focus the first tabbable element in the menu
   * ⚠️ ATTENTION - setting the focus can mess with animations! Always set focus after animation is done
   */
  public focusFirstElem(): void {
    focusFirstTabAbleElemIn(this.menuElem);
  }

  public canFold(): boolean {
    return this.isFoldable && window.innerWidth >= this.options.minWidthFold;
  }

  public matches(idHrefOrSelector: string): boolean {
    const validSelector = validateQuery(idHrefOrSelector.trim());

    return !!(
      this.id === idHrefOrSelector ||
      this.menuElem.id === idHrefOrSelector ||
      this.anchorElem?.id === idHrefOrSelector.replace('#', '') ||
      idHrefOrSelector.replace(window.location.origin, '').startsWith(this.ref) ||
      (validSelector &&
        this.menuElem.querySelector(idHrefOrSelector.trim() + `:not(.${CLASSES.hasSubMenu})`))
    );
  }

  public contains(elem: HTMLElement): boolean {
    return this.anchorElem === elem || this.menuElem.contains(elem);
  }
}
