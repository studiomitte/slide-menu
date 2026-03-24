import { Slide } from './Slide.js';
import { CLASSES } from './SlideMenuOptions.js';

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
export class ActiveFoldController implements FoldController {
  private _isOpen = false;

  constructor(
    private readonly slides: Slide[],
    private readonly sliderWrapperElem: HTMLElement,
    private readonly foldableWrapperElem: HTMLElement,
    private readonly menuElem: HTMLElement,
  ) {}

  get isOpen(): boolean {
    return this._isOpen;
  }

  open(): void {
    this.slides.forEach((slide) => {
      if (slide.isFoldable) {
        slide.appendTo(this.foldableWrapperElem);
      }
    });
    this.menuElem.classList.add(CLASSES.foldOpen);
    this._isOpen = true;
  }

  close(): void {
    this.slides.forEach((slide) => {
      slide.appendTo(this.sliderWrapperElem);
    });
    this.menuElem.classList.remove(CLASSES.foldOpen);
    this._isOpen = false;
  }
}

/**
 * Drop-in replacement used when the menu has no foldable items.
 * All operations are no-ops, eliminating fold branches from navigation logic at runtime.
 */
export class NoopFoldController implements FoldController {
  readonly isOpen = false;
  open(): void {}
  close(): void {}
}
