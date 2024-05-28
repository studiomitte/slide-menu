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

export const tabableSelector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function getFocusableElements() {
  return Array.from(document.querySelectorAll(tabableSelector)).filter(el => !el.hasAttribute('disabled'));
}

export function focusNext() {
  const focusableElements = getFocusableElements();
  const activeElement = document.activeElement;
  // @ts-ignore
  const currentIndex = focusableElements.indexOf(activeElement);

  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    // @ts-ignore
    focusableElements[nextIndex].focus();
  } else {
    // @ts-ignore
    focusableElements[0].focus();
  }
}

export function focusPrevious() {
  const focusableElements = getFocusableElements();
  const activeElement = document.activeElement;
  // @ts-ignore
  const currentIndex = focusableElements.indexOf(activeElement);

  if (currentIndex !== -1) {
    const previousIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    // @ts-ignore
    focusableElements[previousIndex].focus();
  } else {
    // @ts-ignore
    focusableElements[focusableElements.length - 1].focus();
  }
}

export function getDistanceFromTop(element: Element) {
  if (!element) {
    throw new Error('Element is not defined');
  }
  const rect = element.getBoundingClientRect();
  const distance = rect.top;
  return distance;
}
