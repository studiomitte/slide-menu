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
export declare class KeyboardController {
    private readonly options;
    private readonly callbacks;
    private keydownHandler;
    private menuKeydownHandler;
    constructor(options: KeyboardControllerOptions, callbacks: KeyboardControllerCallbacks);
    /**
     * Attach both keydown listeners. Call once after the menu DOM is ready.
     */
    init(): void;
    /**
     * Remove all attached keydown listeners. Call from SlideMenu.destroy().
     */
    destroy(): void;
    private initDocumentKeybindings;
    private initMenuKeybindings;
}
