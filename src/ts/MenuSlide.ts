/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { SlideMenuOptions, Action, CLASSES } from './SlideMenuOptions';
import { TAB_ABLE_SELECTOR, focusFirstTabAbleElemIn } from './utils/dom';

let number = 0;

export interface SlideHTMLElement extends HTMLElement {
    _slide: MenuSlide;
}

export class MenuSlide {

    public readonly id: string;
    public readonly isFoldable: boolean = false;
    public readonly parentMenuElem?: SlideHTMLElement;
    public readonly name: string;

    public parent?: MenuSlide;
    private active: boolean = false;

    public get isActive(): boolean {
        return this.active;
    }

    constructor(
        public readonly menuElem: SlideHTMLElement,
        public readonly options: SlideMenuOptions,
        public readonly anchorElem?: HTMLAnchorElement,
    ) {
        this.id = 'smdm-' + number;
        number++;

        this.name = this.anchorElem?.textContent ?? '';
        this.parentMenuElem = (anchorElem?.parentElement?.closest('ul') ?? undefined) as SlideHTMLElement | undefined;
        this.parent = this.parentMenuElem?._slide;

        if (anchorElem) {
            anchorElem?.classList.add(CLASSES.hasSubMenu);
            anchorElem.dataset.action = Action.NavigateTo;
            anchorElem.dataset.target = this.options.id;
            anchorElem.dataset.arg = this.id;
        }

        menuElem.classList.add(CLASSES.submenu);
        menuElem.dataset.smdmId = this.id;
        menuElem.querySelectorAll('a').forEach(link => {
            link.classList.add(CLASSES.item)
        });

        this.isFoldable = !!anchorElem?.classList.contains(CLASSES.hasFoldableSubmenu);
        if (this.isFoldable) {
            menuElem.classList.add(CLASSES.foldableSubmenu);
        }

        if (options.showBackLink) {
            this.addBackLink(options);
        }

        this.addLinkDecorator(options);

        menuElem._slide = this;
    }

    private addBackLink(options: { backLinkBefore?: string, backLinkAfter?: string } = this.options): HTMLElement {
        const anchorText = this.anchorElem?.textContent ?? '';

        const backLink = document.createElement('a');
        backLink.innerHTML = (options.backLinkBefore ?? '') + anchorText + (options.backLinkAfter ?? '');
        backLink.classList.add(
            CLASSES.backlink,
            CLASSES.control,
            CLASSES.item,
        );
        backLink.dataset.action = Action.Back;
        backLink.setAttribute('href', '#');

        const backLinkLi = document.createElement('li');
        backLinkLi.appendChild(backLink);

        this.menuElem.insertBefore(backLinkLi, this.menuElem.firstChild);

        return backLink;
    }

    // Add `before` and `after` text
    private addLinkDecorator(options: { submenuLinkBefore?: string, submenuLinkAfter?: string, onlyNavigateDecorator?: boolean } = this.options): HTMLAnchorElement | undefined {
        const decoratorTag = 'span';

        if (options.submenuLinkBefore) {
            const linkBeforeElem = document.createElement(decoratorTag);

            linkBeforeElem.classList.add(CLASSES.decorator);
            linkBeforeElem.innerHTML = options.submenuLinkBefore;
            linkBeforeElem.dataset.action = Action.NavigateTo;
            linkBeforeElem.dataset.target = this.options.id;
            linkBeforeElem.dataset.arg = this.id;

            this.anchorElem?.insertBefore(linkBeforeElem, this.anchorElem?.firstChild);
        }

        if (options.submenuLinkAfter) {
            const linkAfterElem = document.createElement(decoratorTag);

            linkAfterElem.classList.add(CLASSES.decorator);
            linkAfterElem.innerHTML = options.submenuLinkAfter;
            linkAfterElem.dataset.action = Action.NavigateTo;
            linkAfterElem.dataset.target = this.options.id;
            linkAfterElem.dataset.arg = this.id;

            this.anchorElem?.appendChild(linkAfterElem);
        }

        return this.anchorElem;
    }

    public deactivate(): this {
        this.active = false;
        this.menuElem.classList.remove(CLASSES.active);
        return this;
    }

    public activate(): this {
        this.active = true;
        this.menuElem.classList.add(CLASSES.active);
        return this;
    }

    public enableTabbing(): void {
        this.menuElem?.querySelectorAll('[tabindex="-1"]').forEach(elem => {
            elem.setAttribute('tabindex', '0');
        });
    }

    public disableTabbing(): void {
        this.menuElem.querySelectorAll(TAB_ABLE_SELECTOR).forEach(elem => {
            elem.setAttribute('tabindex', '-1');
        });
    }

    public appendTo(elem: HTMLElement): this {
        elem.appendChild(this.menuElem);
        return this;
    }

    public postionTop(number: number): this {
        this.menuElem.style.top = number + 'px';
        return this;
    }

    public getClosestNotFoldableSlide(): MenuSlide | undefined {
        return this.getAllParents().find(p => !p.isFoldable);
    }

    /**
     * 
     * @returns 
     */
    public getAllParents(): MenuSlide[] {
        const parents: MenuSlide[] = [];

        let parent: MenuSlide | undefined = this.parent;

        while (parent) {
            parents.push(parent);
            parent = parent?.parent;
        }

        return parents;
    }

    public focusFirstElem(): void {
        focusFirstTabAbleElemIn(this.menuElem);
    }

    public canFold(): boolean {
        return this.isFoldable && window.innerWidth >= this.options.minWidthFold;
    }

    public matches(idHrefOrSelector: string): boolean {
        return this.id === idHrefOrSelector ||
            this.menuElem.id === idHrefOrSelector ||
            this.anchorElem?.id === idHrefOrSelector ||
            this.anchorElem?.href === idHrefOrSelector ||
            this.anchorElem?.matches(idHrefOrSelector) ||
            this.menuElem.matches(idHrefOrSelector);
    }

    public contains(elem: HTMLElement): boolean {
        return this.anchorElem === elem || this.menuElem.contains(elem);
    }

    public focus(): void {
        this.focusFirstElem();
    }
}