function logEvent(id, event) {
    const events = document.getElementById('events');
    const li = document.createElement('li');
    const time = parseInt(event.timeStamp);

    li.appendChild(document.createTextNode(id + ': ' + time + ' - ' + event.type));
    events.appendChild(li);
}

document.addEventListener('DOMContentLoaded', function () {
    const menuLeftElem = document.getElementById('test-menu-left');
    const menuRightElem = document.getElementById('test-menu-right');

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

    allEvents.forEach(eventName => {
        menuLeftElem.addEventListener(eventName, event => logEvent('Menu left', event));
        menuRightElem.addEventListener(eventName, event => logEvent('Menu right', event));
    });

    const menuLeft = new SlideMenu(menuLeftElem, {
        position: 'left',
        submenuLinkAfter: ' ⮞',
        backLinkBefore: '⮜ ',
    });

    const menuRight = new SlideMenu(menuRightElem, {
        keyClose: 'Escape',
        submenuLinkAfter: '<span style="margin-left: 1em; font-size: 85%;">⮞</span>',
        backLinkBefore: '<span style="margin-right: 1em; font-size: 85%;">⮜</span>',
    });

    if (window.innerWidth > 767) {
        menuRight.open(false);
    }
});