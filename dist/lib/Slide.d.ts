import { SlideMenuOptions } from './SlideMenuOptions.js';
export declare class Slide {
    readonly menuElem: HTMLElement;
    readonly options: SlideMenuOptions;
    readonly anchorElem?: HTMLAnchorElement | undefined;
    readonly id: string;
    readonly isFoldable: boolean;
    readonly parentMenuElem?: HTMLElement;
    readonly name: string;
    readonly ref: string;
    navigatorElem?: HTMLElement;
    parent?: Slide;
    private active;
    get isActive(): boolean;
    /**
     * Construction phase: establishes identity and relationships only — no DOM writes except
     * setting the element's id (needed for aria-controls wiring in mount()).
     * Call mount() afterwards to apply all DOM decoration.
     */
    constructor(menuElem: HTMLElement, options: SlideMenuOptions, anchorElem?: HTMLAnchorElement | undefined, slidesByElem?: WeakMap<HTMLElement, Slide>);
    /**
     * DOM decoration phase: adds CSS classes, injects back-link and navigator button elements,
     * and sets data-action attributes. Called by SlideMenu after registering the slide in its
     * WeakMap so that sibling/child mounts can look up the correct parent instance.
     */
    mount(): this;
    private addBackLink;
    private addNavigatorButton;
    deactivate(): this;
    activate(): this;
    setInvisible(): this;
    enableTabbing(): void;
    disableTabbing(): void;
    appendTo(elem: HTMLElement): this;
    getClosestUnfoldableSlide(): Slide | undefined;
    getAllFoldableParents(): Slide[];
    getFirstUnfoldableParent(): Slide | undefined;
    hasParent(possibleParentMenu: Slide | undefined): boolean;
    getAllParents(): Slide[];
    /**
     * Focus the first tabbable element in the menu
     * ⚠️ ATTENTION - setting the focus can mess with animations! Always set focus after animation is done
     */
    focusFirstElem(): void;
    canFold(): boolean;
    matches(idHrefOrSelector: string): boolean;
    contains(elem: HTMLElement): boolean;
}
