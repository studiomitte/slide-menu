function logEvent(id, event) {
  const time = parseInt(event.timeStamp);
  console.log(id + ': ' + time + ' - ' + event.type);
}

document.addEventListener('DOMContentLoaded', function () {
  const menuLeftElem = document.getElementById('test-menu-left');

  const allEvents = [
    'sm.back',
    'sm.back-after',
    'sm.close',
    'sm.close-after',
    'sm.forward',
    'sm.forward-after',
    'sm.navigate',
    'sm.navigate-after',
    'sm.open',
    'sm.open-after',
  ];

  allEvents.forEach((eventName) => {
    menuLeftElem.addEventListener(eventName, (event) => logEvent('Menu left', event));
  });

  const menuLeft = new SlideMenu(menuLeftElem, {
    position: 'left',
    submenuLinkAfter: ' ⮞',
    backLinkBefore: '⮜ ',
    keyClose: 'Escape',
    showBackLink: false,
    closeOnClickOutside: true,
    onlyNavigateDecorator: false,
    alignFoldTop: false,
  });

  if (window.innerWidth > 767) {
    menuLeft.open(false);
  }
});
