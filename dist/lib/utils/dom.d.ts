export declare function wrapElement(elem: HTMLElement, wrapper: HTMLElement): HTMLElement;
export declare function unwrapElement(elem: HTMLElement): void;
export declare function parents(elem: Node | null, selector: string, limit?: number): HTMLElement[];
export declare function parentsOne(elem: Node, selector: string): HTMLElement | null;
export declare function getDistanceFromTop(element: Element): number;
export declare const TAB_ABLE_SELECTOR = "a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type=\"text\"]:not([disabled]), input[type=\"radio\"]:not([disabled]), input[type=\"checkbox\"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex=\"-1\"]):not([disabled])";
export declare function focusFirstTabAbleElemIn(elem: HTMLElement | null | undefined): void;
export declare function trapFocus(event: KeyboardEvent, targetElement: HTMLElement, firstElement?: HTMLElement, lastElement?: HTMLElement): void;
export declare function alignTop(elem: HTMLElement): void;
export declare function validateQuery(str: string): boolean;
