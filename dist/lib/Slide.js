import { Action, CLASSES } from './SlideMenuOptions';
import { TAB_ABLE_SELECTOR, focusFirstTabAbleElemIn } from './utils/dom';
let number = 0;
export class Slide {
    get isActive() {
        return this.active;
    }
    constructor(menuElem, options, anchorElem) {
        var _a, _b, _c, _d, _e;
        this.menuElem = menuElem;
        this.options = options;
        this.anchorElem = anchorElem;
        this.isFoldable = false;
        this.active = false;
        this.id = 'smdm-' + number;
        number++;
        this.name = (_b = (_a = this.anchorElem) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : '';
        this.parentMenuElem = ((_d = (_c = anchorElem === null || anchorElem === void 0 ? void 0 : anchorElem.parentElement) === null || _c === void 0 ? void 0 : _c.closest('ul')) !== null && _d !== void 0 ? _d : undefined);
        this.parent = (_e = this.parentMenuElem) === null || _e === void 0 ? void 0 : _e._slide;
        if (anchorElem) {
            anchorElem === null || anchorElem === void 0 ? void 0 : anchorElem.classList.add(CLASSES.hasSubMenu);
            if (!this.options.onlyNavigateDecorator) {
                anchorElem.dataset.action = Action.NavigateTo;
                anchorElem.dataset.target = this.options.id;
                anchorElem.dataset.arg = this.id;
            }
        }
        menuElem.classList.add(CLASSES.submenu);
        menuElem.dataset.smdmId = this.id;
        menuElem.querySelectorAll('a').forEach((link) => {
            link.classList.add(CLASSES.item);
        });
        this.isFoldable = !!(anchorElem === null || anchorElem === void 0 ? void 0 : anchorElem.classList.contains(CLASSES.hasFoldableSubmenu));
        if (this.isFoldable) {
            menuElem.classList.add(CLASSES.foldableSubmenu);
        }
        if (options.showBackLink) {
            this.addBackLink(options);
        }
        this.addLinkDecorator(options);
        menuElem._slide = this;
    }
    addBackLink(options = this.options) {
        var _a, _b, _c, _d;
        const anchorText = (_b = (_a = this.anchorElem) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : '';
        const backLink = document.createElement('a');
        backLink.innerHTML =
            ((_c = options.backLinkBefore) !== null && _c !== void 0 ? _c : '') + anchorText + ((_d = options.backLinkAfter) !== null && _d !== void 0 ? _d : '');
        backLink.classList.add(CLASSES.backlink, CLASSES.control, CLASSES.item);
        backLink.dataset.action = Action.Back;
        backLink.setAttribute('href', '#');
        const backLinkLi = document.createElement('li');
        backLinkLi.appendChild(backLink);
        this.menuElem.insertBefore(backLinkLi, this.menuElem.firstChild);
        return backLink;
    }
    // Add `before` and `after` text
    addLinkDecorator(options) {
        var _a, _b, _c;
        const decoratorTag = 'span';
        if (options.submenuLinkBefore) {
            const linkBeforeElem = document.createElement(decoratorTag);
            linkBeforeElem.classList.add(CLASSES.decorator);
            linkBeforeElem.innerHTML = options.submenuLinkBefore;
            linkBeforeElem.dataset.action = Action.NavigateTo;
            linkBeforeElem.dataset.target = this.options.id;
            linkBeforeElem.dataset.arg = this.id;
            if (this.options.onlyNavigateDecorator) {
                linkBeforeElem.setAttribute('tabindex', '0');
            }
            (_a = this.anchorElem) === null || _a === void 0 ? void 0 : _a.insertBefore(linkBeforeElem, (_b = this.anchorElem) === null || _b === void 0 ? void 0 : _b.firstChild);
        }
        if (options.submenuLinkAfter) {
            const linkAfterElem = document.createElement(decoratorTag);
            linkAfterElem.classList.add(CLASSES.decorator);
            linkAfterElem.innerHTML = options.submenuLinkAfter;
            linkAfterElem.dataset.action = Action.NavigateTo;
            linkAfterElem.dataset.target = this.options.id;
            linkAfterElem.dataset.arg = this.id;
            if (this.options.onlyNavigateDecorator) {
                linkAfterElem.setAttribute('tabindex', '0');
            }
            (_c = this.anchorElem) === null || _c === void 0 ? void 0 : _c.appendChild(linkAfterElem);
        }
        return this.anchorElem;
    }
    deactivate() {
        this.active = false;
        this.menuElem.classList.remove(CLASSES.active);
        return this;
    }
    activate() {
        this.active = true;
        this.menuElem.classList.add(CLASSES.active);
        return this;
    }
    enableTabbing() {
        var _a;
        (_a = this.menuElem) === null || _a === void 0 ? void 0 : _a.querySelectorAll('[tabindex="-1"]').forEach((elem) => {
            elem.setAttribute('tabindex', '0');
        });
    }
    disableTabbing() {
        this.menuElem.querySelectorAll(TAB_ABLE_SELECTOR).forEach((elem) => {
            elem.setAttribute('tabindex', '-1');
        });
    }
    appendTo(elem) {
        elem.appendChild(this.menuElem);
        return this;
    }
    postionTop(number) {
        this.menuElem.style.top = number + 'px';
        return this;
    }
    getClosestNotFoldableSlide() {
        return !this.isFoldable ? this : this.getAllParents().find((p) => !p.isFoldable);
    }
    /**
     *
     * @returns
     */
    getAllParents() {
        const parents = [];
        let parent = this.parent;
        while (parent) {
            parents.push(parent);
            parent = parent === null || parent === void 0 ? void 0 : parent.parent;
        }
        return parents;
    }
    /**
     * Focus the first tabbable element in the menu
     * ⚠️ ATTENTION - setting the focus can mess with animations! Always set focus after animation is done
     */
    focusFirstElem() {
        focusFirstTabAbleElemIn(this.menuElem);
    }
    canFold() {
        return this.isFoldable && window.innerWidth >= this.options.minWidthFold;
    }
    matches(idHrefOrSelector) {
        var _a, _b, _c;
        return (this.id === idHrefOrSelector ||
            this.menuElem.id === idHrefOrSelector ||
            ((_a = this.anchorElem) === null || _a === void 0 ? void 0 : _a.id) === idHrefOrSelector ||
            ((_b = this.anchorElem) === null || _b === void 0 ? void 0 : _b.href) === idHrefOrSelector ||
            ((_c = this.anchorElem) === null || _c === void 0 ? void 0 : _c.matches(idHrefOrSelector)) ||
            this.menuElem.matches(idHrefOrSelector));
    }
    contains(elem) {
        return this.anchorElem === elem || this.menuElem.contains(elem);
    }
    focus() {
        this.focusFirstElem();
    }
}
