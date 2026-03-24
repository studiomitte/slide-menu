/**
 * Manages all CSS-transition animation concerns:
 * - Moving elements via translateX
 * - Suppressing transitions for instant DOM updates
 * - Tracking the in-flight animation state
 * - Resolving transitionend events to post-animation callbacks
 */
export class AnimationController {
    constructor(menuElem, sliderElem, foldableWrapperElem, sliderWrapperElem, triggerEvent) {
        this.menuElem = menuElem;
        this.sliderElem = sliderElem;
        this.foldableWrapperElem = foldableWrapperElem;
        this.sliderWrapperElem = sliderWrapperElem;
        this.triggerEvent = triggerEvent;
        this._isAnimating = false;
        this.lastAction = null;
        this.boundOnTransitionEnd = this.onTransitionEnd.bind(this);
        this.menuElem.addEventListener('transitionend', this.boundOnTransitionEnd);
        this.sliderElem.addEventListener('transitionend', this.boundOnTransitionEnd);
    }
    get isAnimating() {
        return this._isAnimating;
    }
    /**
     * Start the slide animation (the CSS transition) for `elem` by applying a translateX.
     * Records `action` as the last action so `onTransitionEnd` can fire the `-after` event.
     * The inner setTimeout flushes current style recalculations before triggering the transition.
     */
    moveElem(elem, offset, unit = '%', action) {
        if (action !== undefined) {
            this.lastAction = action;
        }
        setTimeout(() => {
            if (!offset.toString().includes(unit)) {
                offset += unit;
            }
            const newTranslateX = `translateX(${offset})`;
            if (elem.style.transform !== newTranslateX) {
                this._isAnimating = true;
                elem.style.transform = newTranslateX;
            }
        }, 0);
    }
    /**
     * Pause CSS transitions, execute `action` synchronously (no animation), then restore.
     * Forces a reflow between disable and re-enable to flush the CSS changes.
     */
    runWithoutAnimation(action) {
        const transitionElems = [this.menuElem, this.sliderElem];
        transitionElems.forEach((elem) => (elem.style.transition = 'none'));
        action();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.menuElem.offsetHeight; // Trigger a reflow, flushing the CSS changes
        transitionElems.forEach((elem) => elem.style.removeProperty('transition'));
        this._isAnimating = false;
    }
    /**
     * Record the current action so it can be re-dispatched as an `-after` event
     * once the CSS transition ends.
     */
    setLastAction(action) {
        this.lastAction = action;
    }
    /**
     * Remove the transitionend listeners. Call this from SlideMenu.destroy().
     */
    destroy() {
        this.menuElem.removeEventListener('transitionend', this.boundOnTransitionEnd);
        this.sliderElem.removeEventListener('transitionend', this.boundOnTransitionEnd);
    }
    onTransitionEnd(event) {
        // Ignore events bubbling up from nested elements that use their own CSS transitions.
        if (event.target !== this.menuElem &&
            event.target !== this.sliderElem &&
            event.target !== this.foldableWrapperElem &&
            event.target !== this.sliderWrapperElem) {
            return;
        }
        this._isAnimating = false;
        if (this.lastAction) {
            this.triggerEvent(this.lastAction, true);
            this.lastAction = null;
        }
    }
}
