function logEvent(id, event) {
  const time = parseInt(event.timeStamp);
  console.log(id + ': ' + time + ' - ' + event.type);
}

const config = () => {
  console.log('SlideMenu is ready!');

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
    'sm.navigateTo',
    'sm.navigateTo-after',
    'sm.open',
    'sm.open-after',
    'sm.init',
  ];

  allEvents.forEach((eventName) => {
    menuLeftElem.addEventListener(eventName, (event) => logEvent('Menu left', event));
  });

  const menuLeft = new SlideMenu(menuLeftElem, {
    position: 'right',
    keyClose: 'Escape',
    showBackLink: false,
    navigationButtons: false, 
    closeOnClickOutside: true,
    dynamicOpenDefault: false,
  });

  if (window.innerWidth > 767) {
    menuLeft.open(false);
  }
};

if (window.SlideMenu) {
  config();
} else {
  window.addEventListener('sm.ready', config);
}
