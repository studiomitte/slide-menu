export function wrapElement(elem: HTMLElement, wrapper: HTMLElement): HTMLElement {
  if (elem.parentElement === null) {
    throw Error('`elem` has no parentElement');
  }

  elem.parentElement.insertBefore(wrapper, elem);
  wrapper.appendChild(elem);

  return elem;
}

export function unwrapElement(elem: HTMLElement): void {
  const parent = elem.parentElement;

  if (parent === null) {
    throw Error('`elem` has no parentElement');
  }

  while (elem.firstChild) {
    parent.insertBefore(elem.firstChild, elem);
  }
  parent.removeChild(elem);
}

export function parents(elem: Node | null, selector: string, limit?: number): HTMLElement[] {
  const matched: HTMLElement[] = [];

  while (
    elem &&
    elem.parentElement !== null &&
    (limit === undefined ? true : matched.length < limit)
  ) {
    if (elem instanceof HTMLElement && elem.matches(selector)) {
      matched.push(elem);
    }

    elem = elem.parentElement;
  }

  return matched;
}

export function parentsOne(elem: Node, selector: string): HTMLElement | null {
  const matches = parents(elem, selector, 1);

  return matches.length ? matches[0] : null;
}

export function getDistanceFromTop(element: Element) {
  if (!element) {
    throw new Error('Element is not defined');
  }
  const rect = element.getBoundingClientRect();
  const distance = rect.top;
  return distance;
}

export const TAB_ABLE_SELECTOR =
  'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

export function focusFirstTabAbleElemIn(elem: HTMLElement | null | undefined): void {
  const firstTabbaleElem = Array.from(elem?.querySelectorAll(TAB_ABLE_SELECTOR) ?? []).find(
    (elem) => {
      return isVisible(elem);
    },
  );
  // @ts-expect-error // possibly undefined element
  firstTabbaleElem?.focus();
}

function isVisible(element: Element) {
  // @ts-expect-error // stop checking when reaching document
  for (let el = element; el && el !== document; el = el.parentNode) {
    // If current element has display property 'none', return false
    // @ts-expect-error // accessing style of Element
    if (el.style?.display === 'none' || getComputedStyle(el).display === 'none') {
      return false;
    }
  }
  return true;
}

export function trapFocus(
  event: KeyboardEvent,
  targetElement: HTMLElement,
  firstElement?: HTMLElement,
  lastElement?: HTMLElement,
) {
  const focusableElements = targetElement.querySelectorAll(TAB_ABLE_SELECTOR);
  const firstFocusableElement = firstElement ?? focusableElements[0];
  const lastFocusableElement = lastElement ?? focusableElements[focusableElements.length - 1];

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
  } /* tab */ else {
    if (document.activeElement === lastFocusableElement) {
      // @ts-ignore
      firstFocusableElement.focus();
      event.preventDefault();
    }
  }
}

export function alignTop(elem: HTMLElement): void {
  const dy = getDistanceFromTop(elem);
  if (dy > 0) {
    elem.style.top = `-${dy}px`;
  }
}
