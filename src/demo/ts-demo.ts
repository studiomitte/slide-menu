import {SlideMenu} from "../../dist/index";

const menuLeftElem = document.getElementById('test-menu-left');

const menuLeft = new SlideMenu(menuLeftElem, {
  position: 'left',
  keyClose: 'Escape',
  showBackLink: false,
  submenuLinkAfter: '>',
  backLinkBefore: '<',
  closeOnClickOutside: true,
  onlyNavigateDecorator: false,
  minWidthFold: 768,
  menuWidth: 440,
});

if (window.innerWidth > 767) {
  menuLeft.open(false);
}
