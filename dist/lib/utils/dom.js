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
export function trapFocus(event, targetElement, firstElement, lastElement) {
    const focusableElements = targetElement.querySelectorAll(TAB_ABLE_SELECTOR);
    const firstFocusableElement = firstElement !== null && firstElement !== void 0 ? firstElement : focusableElements[0];
    const lastFocusableElement = lastElement !== null && lastElement !== void 0 ? lastElement : focusableElements[focusableElements.length - 1];
    const KEYCODE_TAB = 9;
    const isTabPressed = event.key === 'Tab' || event.keyCode === KEYCODE_TAB;
    if (!isTabPressed) {
        return;
    }
    if (event.shiftKey) {
        /* shift + tab */ if (document.activeElement === firstFocusableElement) {
            // @ts-ignore
            lastFocusableElement.focus();
            event.preventDefault();
        }
    } /* tab */
    else {
        if (document.activeElement === lastFocusableElement) {
            // @ts-ignore
            firstFocusableElement.focus();
            event.preventDefault();
        }
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
