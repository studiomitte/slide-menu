import { Slide } from './Slide.js';
export interface FoldController {
    readonly isOpen: boolean;
    open(): void;
    close(): void;
}
/**
 * Manages the foldable submenu panel: moves slides between the slider wrapper and the
 * foldable wrapper, and toggles the CSS class that drives the side-by-side layout.
 * Owns the authoritative `isOpen` boolean so callers never need to infer state from the DOM.
 */
export declare class ActiveFoldController implements FoldController {
    private readonly slides;
    private readonly sliderWrapperElem;
    private readonly foldableWrapperElem;
    private readonly menuElem;
    private _isOpen;
    constructor(slides: Slide[], sliderWrapperElem: HTMLElement, foldableWrapperElem: HTMLElement, menuElem: HTMLElement);
    get isOpen(): boolean;
    open(): void;
    close(): void;
}
/**
 * Drop-in replacement used when the menu has no foldable items.
 * All operations are no-ops, eliminating fold branches from navigation logic at runtime.
 */
export declare class NoopFoldController implements FoldController {
    readonly isOpen = false;
    open(): void;
    close(): void;
}
