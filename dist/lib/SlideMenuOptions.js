export var Direction;
(function (Direction) {
    Direction[Direction["Backward"] = -1] = "Backward";
    Direction[Direction["Forward"] = 1] = "Forward";
})(Direction || (Direction = {}));
export var MenuPosition;
(function (MenuPosition) {
    MenuPosition["Left"] = "left";
    MenuPosition["Right"] = "right";
})(MenuPosition || (MenuPosition = {}));
export var Action;
(function (Action) {
    Action["Back"] = "back";
    Action["Close"] = "close";
    Action["Forward"] = "forward";
    Action["Navigate"] = "navigate";
    Action["NavigateTo"] = "navigateTo";
    Action["Open"] = "open";
    Action["Initialize"] = "init";
})(Action || (Action = {}));
export const NAMESPACE = 'slide-menu';
export const CLASSES = {
    active: `${NAMESPACE}__submenu--active`,
    backlink: `${NAMESPACE}__backlink`,
    control: `${NAMESPACE}__control`,
    controls: `${NAMESPACE}__controls`,
    decorator: `${NAMESPACE}__decorator`,
    navigator: `${NAMESPACE}__navigator`,
    slider: `${NAMESPACE}__slider`,
    item: `${NAMESPACE}__item`,
    listItem: `${NAMESPACE}__listitem`,
    submenu: `${NAMESPACE}__submenu`,
    sliderWrapper: `${NAMESPACE}__slider__wrapper`,
    foldableWrapper: `${NAMESPACE}__foldable__wrapper`,
    hasSubMenu: `${NAMESPACE}__item--has-submenu`,
    activeItem: `${NAMESPACE}__item--active`,
    hasFoldableSubmenu: `${NAMESPACE}__item--has-foldable-submenu`,
    foldableSubmenu: `${NAMESPACE}__submenu--foldable`,
    foldableSubmenuAlignTop: `${NAMESPACE}__submenu--foldable-align-top`,
    foldOpen: `${NAMESPACE}--fold-open`,
    slideIn: `${NAMESPACE}--slide-in`,
    slideOut: `${NAMESPACE}--slide-out`,
    open: `${NAMESPACE}--open`,
    left: `${NAMESPACE}--left`,
    right: `${NAMESPACE}--right`,
    title: `${NAMESPACE}__title`,
    hiddenOnRoot: `${NAMESPACE}--hidden-on-root-level`,
    invisibleOnRoot: `${NAMESPACE}--invisible-on-root-level`,
};
