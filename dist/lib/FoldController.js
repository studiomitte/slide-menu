import { CLASSES } from './SlideMenuOptions.js';
/**
 * Manages the foldable submenu panel: moves slides between the slider wrapper and the
 * foldable wrapper, and toggles the CSS class that drives the side-by-side layout.
 * Owns the authoritative `isOpen` boolean so callers never need to infer state from the DOM.
 */
export class ActiveFoldController {
    constructor(slides, sliderWrapperElem, foldableWrapperElem, menuElem) {
        this.slides = slides;
        this.sliderWrapperElem = sliderWrapperElem;
        this.foldableWrapperElem = foldableWrapperElem;
        this.menuElem = menuElem;
        this._isOpen = false;
    }
    get isOpen() {
        return this._isOpen;
    }
    open() {
        this.slides.forEach((slide) => {
            if (slide.isFoldable) {
                slide.appendTo(this.foldableWrapperElem);
            }
        });
        this.menuElem.classList.add(CLASSES.foldOpen);
        this._isOpen = true;
    }
    close() {
        this.slides.forEach((slide) => {
            if (slide.isFoldable) {
                slide.appendTo(this.sliderWrapperElem);
            }
        });
        this.menuElem.classList.remove(CLASSES.foldOpen);
        this._isOpen = false;
    }
}
/**
 * Drop-in replacement used when the menu has no foldable items.
 * All operations are no-ops, eliminating fold branches from navigation logic at runtime.
 */
export class NoopFoldController {
    constructor() {
        this.isOpen = false;
    }
    open() { }
    close() { }
}
