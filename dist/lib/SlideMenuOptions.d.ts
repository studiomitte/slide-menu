export interface SlideMenuOptions {
    backLinkBefore: string;
    backLinkAfter: string;
    keyOpen: string;
    keyClose: string;
    position: MenuPosition | 'left' | 'right';
    showBackLink: boolean;
    submenuLinkBefore: string;
    submenuLinkAfter: string;
    closeOnClickOutside: boolean;
    onlyNavigateDecorator: boolean;
    menuWidth: number;
    minWidthFold: number;
    transitionDuration: number;
    dynamicOpenTarget: boolean;
    debug: boolean;
    id: string;
}
export declare enum Direction {
    Backward = -1,
    Forward = 1
}
export declare enum MenuPosition {
    Left = "left",
    Right = "right"
}
export declare enum Action {
    Back = "back",
    Close = "close",
    Forward = "forward",
    Navigate = "navigate",
    NavigateTo = "navigateTo",
    Open = "open",
    Initialize = "init"
}
export declare const NAMESPACE = "slide-menu";
export declare const CLASSES: {
    active: string;
    backlink: string;
    control: string;
    controls: string;
    decorator: string;
    slider: string;
    item: string;
    submenu: string;
    sliderWrapper: string;
    foldableWrapper: string;
    hasSubMenu: string;
    activeItem: string;
    hasFoldableSubmenu: string;
    foldableSubmenu: string;
    foldableSubmenuAlignTop: string;
    foldOpen: string;
    slideIn: string;
    slideOut: string;
    open: string;
    left: string;
    right: string;
    title: string;
    hiddenOnRoot: string;
    invisibleOnRoot: string;
};