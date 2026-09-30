import { CLASSES } from './SlideMenuOptions.js';
import { trapFocus } from './utils/dom.js';
import type { Slide } from './Slide.js';

export interface KeyboardControllerOptions {
  keyClose: string;
  keyOpen: string;
}

export interface KeyboardControllerCallbacks {
  close(): void;
  show(): void;
  getActiveSubmenu(): Slide | undefined;
  getMenuElem(): HTMLElement;
}

/**
 * Manages all keyboard interaction concerns:
 * - Document-level open/close shortcut keys
 * - WCAG: space-key activation for anchor[role="button"] elements
 * - Focus trap within the open menu
 */
export class KeyboardController {
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;
  private menuKeydownHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(
    private readonly options: KeyboardControllerOptions,
    private readonly callbacks: KeyboardControllerCallbacks,
  ) {}

  /**
   * Attach both keydown listeners. Call once after the menu DOM is ready.
   */
  init(): void {
    this.initDocumentKeybindings();
    this.initMenuKeybindings();
  }

  /**
   * Remove all attached keydown listeners. Call from SlideMenu.destroy().
   */
  destroy(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.menuKeydownHandler) {
      this.callbacks.getMenuElem().removeEventListener('keydown', this.menuKeydownHandler);
      this.menuKeydownHandler = null;
    }
  }

  private initDocumentKeybindings(): void {
    this.keydownHandler = (event: KeyboardEvent) => {
      const elem = document.activeElement;

      switch (event.key) {
        case this.options.keyClose:
          event.preventDefault();
          this.callbacks.close();
          break;
        case this.options.keyOpen:
          event.preventDefault();
          this.callbacks.show();
          break;
        case 'Enter':
          if (elem?.classList.contains(CLASSES.navigator)) (elem as HTMLElement).click();
          break;
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
  }

  private initMenuKeybindings(): void {
    const menuElem = this.callbacks.getMenuElem();

    this.menuKeydownHandler = (event: KeyboardEvent) => {
      // WCAG — anchor[role="button"] elements must respond to Space
      if (
        event.key === ' ' &&
        event.target instanceof HTMLAnchorElement &&
        event.target.role === 'button'
      ) {
        event.preventDefault();
        event.target.click();
      }

      // WCAG — trap focus inside the open menu. The scope is the whole menu, not the active
      // slide: controls and custom content (e.g. a footer) live outside the slide lists.
      // Inactive slides are `inert`, so they drop out of the tab cycle by themselves.
      trapFocus(event, menuElem);
    };

    menuElem.addEventListener('keydown', this.menuKeydownHandler);
  }
}
