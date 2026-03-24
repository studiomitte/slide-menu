import { Action } from './SlideMenuOptions.js';
type TriggerEventFn = (action: Action, afterAnimation?: boolean) => void;
/**
 * Manages all CSS-transition animation concerns:
 * - Moving elements via translateX
 * - Suppressing transitions for instant DOM updates
 * - Tracking the in-flight animation state
 * - Resolving transitionend events to post-animation callbacks
 */
export declare class AnimationController {
    private readonly menuElem;
    private readonly sliderElem;
    private readonly foldableWrapperElem;
    private readonly sliderWrapperElem;
    private readonly triggerEvent;
    private _isAnimating;
    private lastAction;
    private readonly boundOnTransitionEnd;
    constructor(menuElem: HTMLElement, sliderElem: HTMLElement, foldableWrapperElem: HTMLElement, sliderWrapperElem: HTMLElement, triggerEvent: TriggerEventFn);
    get isAnimating(): boolean;
    /**
     * Start the slide animation (the CSS transition) for `elem` by applying a translateX.
     * Records `action` as the last action so `onTransitionEnd` can fire the `-after` event.
     * The inner setTimeout flushes current style recalculations before triggering the transition.
     */
    moveElem(elem: HTMLElement, offset: string | number, unit?: string, action?: Action): void;
    /**
     * Pause CSS transitions, execute `action` synchronously (no animation), then restore.
     * Forces a reflow between disable and re-enable to flush the CSS changes.
     */
    runWithoutAnimation(action: () => void): void;
    /**
     * Record the current action so it can be re-dispatched as an `-after` event
     * once the CSS transition ends.
     */
    setLastAction(action: Action): void;
    /**
     * Remove the transitionend listeners. Call this from SlideMenu.destroy().
     */
    destroy(): void;
    private onTransitionEnd;
}
export {};
