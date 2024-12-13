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

  const arrowHtml = (styles = '') =>
    `<svg style="${styles}" enable-background="new 0 0 32 32" height="24px" version="1.1" viewBox="0 0 32 32" width="24px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path fill="#ffffff" clip-rule="evenodd" d="M21.698,15.286l-9.002-8.999  c-0.395-0.394-1.035-0.394-1.431,0c-0.395,0.394-0.395,1.034,0,1.428L19.553,16l-8.287,8.285c-0.395,0.394-0.395,1.034,0,1.429  c0.395,0.394,1.036,0.394,1.431,0l9.002-8.999C22.088,16.325,22.088,15.675,21.698,15.286z" fill-rule="evenodd" id="Chevron_Right"/><g/><g/><g/><g/><g/><g/></svg>`;

  const menuLeft = new SlideMenu(menuLeftElem, {
    position: 'left',
    navigationButtons: arrowHtml(),
    backLinkBefore: arrowHtml('transform: rotate(180deg)'),
    keyClose: 'Escape',
    showBackLink: false,
    closeOnClickOutside: true,
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
