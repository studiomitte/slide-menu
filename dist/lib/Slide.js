import { Action, CLASSES } from './SlideMenuOptions.js';
import { TAB_ABLE_SELECTOR, focusFirstTabAbleElemIn, validateQuery } from './utils/dom.js';
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
        this.ref = '/';
        this.id = menuElem.id ? menuElem.id : 'smdm-' + number;
        menuElem.id = this.id;
        number++;
        this.name = (_b = (_a = this.anchorElem) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : '';
        this.parentMenuElem = ((_d = (_c = anchorElem === null || anchorElem === void 0 ? void 0 : anchorElem.parentElement) === null || _c === void 0 ? void 0 : _c.closest('ul')) !== null && _d !== void 0 ? _d : undefined);
        this.parent = (_e = this.parentMenuElem) === null || _e === void 0 ? void 0 : _e._slide;
        if (anchorElem) {
            anchorElem === null || anchorElem === void 0 ? void 0 : anchorElem.classList.add(CLASSES.hasSubMenu);
            this.ref = anchorElem.href.replace(window.location.origin, '');
            if (!this.options.navigationButtons) {
                anchorElem.dataset.action = Action.NavigateTo;
                anchorElem.dataset.arg = this.id;
                anchorElem.role = 'button';
                anchorElem.setAttribute('aria-controls', this.id);
                anchorElem.setAttribute('aria-expanded', 'false');
            }
        }
        menuElem.classList.add(CLASSES.submenu);
        // menuElem.role = 'menu';
        menuElem.dataset.smdmId = this.id;
        menuElem.querySelectorAll('li').forEach((link) => {
            link.classList.add(CLASSES.listItem);
        });
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
        this.addNavigatorButton(options);
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
    addNavigatorButton(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!options.navigationButtons) {
            return;
        }
        const existingNavigator = Array.from((_c = (_b = (_a = this.anchorElem) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children) !== null && _c !== void 0 ? _c : []).find((elem) => elem.classList.contains(CLASSES.navigator));
        const navigatorTag = 'button';
        const navigator = (existingNavigator !== null && existingNavigator !== void 0 ? existingNavigator : document.createElement(navigatorTag));
        navigator.classList.add(CLASSES.navigator);
        navigator.dataset.action = (_e = (_d = navigator.dataset) === null || _d === void 0 ? void 0 : _d.action) !== null && _e !== void 0 ? _e : Action.NavigateTo;
        navigator.dataset.arg = (_g = (_f = navigator.dataset) === null || _f === void 0 ? void 0 : _f.arg) !== null && _g !== void 0 ? _g : this.id;
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
        }
        else if (!navigator.getAttribute('aria-label')) {
            navigator.setAttribute('aria-label', options.navigationButtonsLabel + ': ' + this.name);
        }
        (_h = this.anchorElem) === null || _h === void 0 ? void 0 : _h.insertAdjacentElement('afterend', navigator);
        this.navigatorElem = navigator;
    }
    deactivate() {
        var _a, _b;
        this.active = false;
        this.menuElem.classList.remove(CLASSES.active);
        if (this.options.navigationButtons) {
            (_a = this.navigatorElem) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-expanded', 'false');
        }
        else {
            (_b = this.anchorElem) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-expanded', 'false');
        }
        return this;
    }
    activate() {
        var _a, _b;
        this.active = true;
        this.menuElem.classList.add(CLASSES.active);
        this.menuElem.removeAttribute('hidden');
        if (this.options.navigationButtons) {
            (_a = this.navigatorElem) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-expanded', 'true');
        }
        else {
            (_b = this.anchorElem) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-expanded', 'true');
        }
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
    getClosestNotFoldableSlide() {
        return this.isFoldable ? this.getAllParents().find((p) => !p.isFoldable) : this;
    }
    getAllFoldableParents() {
        return this.isFoldable ? this.getAllParents().filter((p) => p.isFoldable) : [];
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
        var _a;
        const validSelector = validateQuery(idHrefOrSelector.trim());
        return !!(this.id === idHrefOrSelector ||
            this.menuElem.id === idHrefOrSelector ||
            ((_a = this.anchorElem) === null || _a === void 0 ? void 0 : _a.id) === idHrefOrSelector.replace('#', '') ||
            idHrefOrSelector.replace(window.location.origin, '').startsWith(this.ref) ||
            (validSelector &&
                this.menuElem.querySelector(idHrefOrSelector.trim() + `:not(.${CLASSES.hasSubMenu})`)));
    }
    contains(elem) {
        return this.anchorElem === elem || this.menuElem.contains(elem);
    }
    focus() {
        this.focusFirstElem();
    }
}
