import { SlideMenuOptions } from './SlideMenuOptions.js';
export interface SlideHTMLElement extends HTMLElement {
    _slide: Slide;
}
export declare class Slide {
    readonly menuElem: SlideHTMLElement;
    readonly options: SlideMenuOptions;
    readonly anchorElem?: HTMLAnchorElement | undefined;
    readonly id: string;
    readonly isFoldable: boolean;
    readonly parentMenuElem?: SlideHTMLElement;
    readonly name: string;
    parent?: Slide;
    private active;
    get isActive(): boolean;
    constructor(menuElem: SlideHTMLElement, options: SlideMenuOptions, anchorElem?: HTMLAnchorElement | undefined);
    private addBackLink;
    private addLinkDecorator;
    deactivate(): this;
    activate(): this;
    enableTabbing(): void;
    disableTabbing(): void;
    appendTo(elem: HTMLElement): this;
    postionTop(number: number): this;
    getClosestNotFoldableSlide(): Slide | undefined;
    /**
     *
     * @returns
     */
    getAllParents(): Slide[];
    /**
     * Focus the first tabbable element in the menu
     * ⚠️ ATTENTION - setting the focus can mess with animations! Always set focus after animation is done
     */
    focusFirstElem(): void;
    canFold(): boolean;
    matches(idHrefOrSelector: string): boolean;
    contains(elem: HTMLElement): boolean;
    focus(): void;
}