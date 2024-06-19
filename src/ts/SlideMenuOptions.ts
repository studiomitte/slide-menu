export interface SlideMenuOptions {
  backLinkBefore: string;
  backLinkAfter: string;
  keyOpen: string;
  keyClose: string;
  position: MenuPosition;
  showBackLink: boolean;
  submenuLinkBefore: string;
  submenuLinkAfter: string;
  closeOnClickOutside: boolean;
  onlyNavigateDecorator: boolean;
  menuWidth: number;
  minWidthFold: number;
  transitionDuration: number;
  dynamicOpenTarget: boolean;
  id: string;
}

export enum Direction {
  Backward = -1,
  Forward = 1,
}

export enum MenuPosition {
  Left = 'left',
  Right = 'right',
}

export enum Action {
  Back = 'back',
  Close = 'close',
  Forward = 'forward',
  Navigate = 'navigate',
  NavigateTo = 'navigateTo',
  Open = 'open',
}

export const NAMESPACE = 'slide-menu';
export const CLASSES = {
  active: `${NAMESPACE}__submenu--active`,
  backlink: `${NAMESPACE}__backlink`,
  control: `${NAMESPACE}__control`,
  controls: `${NAMESPACE}__controls`,
  decorator: `${NAMESPACE}__decorator`,
  slider: `${NAMESPACE}__slider`,
  item: `${NAMESPACE}__item`,
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
  left: `${NAMESPACE}--left`,
  right: `${NAMESPACE}--right`,
};
