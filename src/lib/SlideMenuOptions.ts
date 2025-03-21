export interface SlideMenuOptions {
  backLinkBefore: string;
  backLinkAfter: string;
  keyOpen: string;
  keyClose: string;
  position: MenuPosition | 'left' | 'right';
  showBackLink: boolean;
  submenuLinkBefore: string | boolean;
  navigationButtons: string | boolean;
  navigationButtonsLabel: string;
  closeOnClickOutside: boolean;
  menuWidth: number;
  minWidthFold: number;
  transitionDuration: number;
  dynamicOpenDefault: boolean;
  debug: boolean;
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
  Initialize = 'init',
}

export const NAMESPACE = 'slide-menu';
export const CLASSES = {
  active: `${NAMESPACE}__submenu--active`,
  current: `${NAMESPACE}__submenu--current`,
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
