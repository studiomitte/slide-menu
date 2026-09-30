export function wrapElement(elem, wrapper) {
    if (elem.parentElement === null) {
        throw Error('`elem` has no parentElement');
    }
    elem.parentElement.insertBefore(wrapper, elem);
    wrapper.appendChild(elem);
    return elem;
}
export function unwrapElement(elem) {
    const parent = elem.parentElement;
    if (parent === null) {
        throw Error('`elem` has no parentElement');
    }
    while (elem.firstChild) {
        parent.insertBefore(elem.firstChild, elem);
    }
    parent.removeChild(elem);
}
export function parents(elem, selector, limit) {
    const matched = [];
    while (elem &&
        elem.parentElement !== null &&
        (limit === undefined ? true : matched.length < limit)) {
        if (elem instanceof HTMLElement && elem.matches(selector)) {
            matched.push(elem);
        }
        elem = elem.parentElement;
    }
    return matched;
}
export function parentsOne(elem, selector) {
    const matches = parents(elem, selector, 1);
    return matches.length ? matches[0] : null;
}
export function getDistanceFromTop(element) {
    if (!element) {
        throw new Error('Element is not defined');
    }
    const rect = element.getBoundingClientRect();
    const distance = rect.top;
    return distance;
}
export const TAB_ABLE_SELECTOR = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
export function focusFirstTabAbleElemIn(elem) {
    var _a;
    const firstTabbaleElem = Array.from((_a = elem === null || elem === void 0 ? void 0 : elem.querySelectorAll(TAB_ABLE_SELECTOR)) !== null && _a !== void 0 ? _a : []).find((elem) => {
        return isVisible(elem);
    });
    // @ts-expect-error // possibly undefined element
    firstTabbaleElem === null || firstTabbaleElem === void 0 ? void 0 : firstTabbaleElem.focus();
}
function isVisible(element) {
    var _a;
    // @ts-expect-error // stop checking when reaching document
    for (let el = element; el && el !== document; el = el.parentNode) {
        // If current element has display property 'none', return false
        // @ts-expect-error // accessing style of Element
        if (((_a = el.style) === null || _a === void 0 ? void 0 : _a.display) === 'none' || getComputedStyle(el).display === 'none') {
            return false;
        }
    }
    return true;
}
/**
 * Stricter than `isVisible`: also false for `visibility: hidden` and for content clipped away by a
 * collapsed ancestor. Content that slides open or shut (height animated from/to 0 with
 * `overflow: hidden`) is still `display: block` while it moves, but cannot take focus visibly.
 */
function isRendered(element) {
    for (let el = element; el; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.display === 'none') {
            return false;
        }
        // `visibility` is inherited, so the computed value of the element itself is enough
        if (el === element && style.visibility === 'hidden') {
            return false;
        }
        // Inline and `display: contents` boxes have no client size and do not clip
        const hasBox = style.display !== 'inline' && style.display !== 'contents';
        if (el !== element && hasBox) {
            const clipsY = style.overflowY !== 'visible' && el.clientHeight === 0;
            const clipsX = style.overflowX !== 'visible' && el.clientWidth === 0;
            if (clipsX || clipsY) {
                return false;
            }
        }
    }
    return true;
}
/**
 * All elements in `root` that can take focus right now. The list is built on every call, so
 * content that appears later (for example a footer menu that slides open) is included.
 * Skips elements inside an `inert` ancestor (inactive slides) and elements that are not rendered.
 */
export function getTabbableElements(root) {
    return Array.from(root.querySelectorAll(TAB_ABLE_SELECTOR)).filter((elem) => !elem.closest('[inert]') && isRendered(elem));
}
export function trapFocus(event, targetElement, firstElement, lastElement) {
    if (event.key !== 'Tab') {
        return;
    }
    const focusableElements = getTabbableElements(targetElement);
    const firstFocusableElement = firstElement !== null && firstElement !== void 0 ? firstElement : focusableElements[0];
    const lastFocusableElement = lastElement !== null && lastElement !== void 0 ? lastElement : focusableElements[focusableElements.length - 1];
    if (!firstFocusableElement || !lastFocusableElement) {
        return;
    }
    if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
        }
    }
    else if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        event.preventDefault();
    }
}
export function alignTop(elem) {
    const dy = getDistanceFromTop(elem);
    if (dy > 0) {
        elem.style.top = `-${dy}px`;
    }
}
export function validateQuery(str) {
    try {
        document.querySelector(str);
        return true;
    }
    catch (e) {
        return false;
    }
}
