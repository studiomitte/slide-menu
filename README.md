# Slide Menu

> ℹ️ This project is a fork from https://github.com/grubersjoe/slide-menu. See **[ Original Demo](https://grubersjoe.github.io/slide-menu)**

*A library agnostic multilevel page menu with a smooth slide effect based on CSS transitions and various options. Allows foldable submenu structures for desktop views.*

Support: All current browsers and IE11+ (if using `dist/slide-menu.ie.js`).

## Install
```sh
npm install smdm-slide-menu
``` 

Now import `dist/slide-menu.js` and `dist/slide-menu.css` in your bundler or build system of choice or use a 1998 `<script>` and `<link>` tag. Afterwards `SlideMenu` will be available in the global namespace (`window.SlideMenu`).

To keep the bundle size small (17 kB vs. 22 kB) Internet Explorer 11 is not supported out of the box. If you need to support Internet Explorer 11 use `dist/slide-menu.ie.js` instead. 


## Usage
All you need is the traditional CSS menu HTML markup and a wrapper with the class `slide-menu`. Menus can be nested endlessly to create the desired hierarchy. If you wish to programmatically control the menu, you should also set an ID to be able to use the API (see below).

**Example**

```html
<nav class="slide-menu" id="example-menu">
  <ul>
    <li>
      <a href="/">Home</a>
      <ul>
        <li><a href="#">Submenu entry 1</a></li>
        <li><a href="#">Submenu entry 2</a></li>
        <li><a href="#">Submenu entry 3</a></li>
      </ul>
    </li>
    <li>
      <a href="/blog">Blog</a>
    </li>
    <li>
      <a href="/about">About</a>
    </li>
  </ul>
</nav>
```

Create the menu then like this:

```javascript
const initSlideMenu = () => {
  const menuElement = document.getElementById('example-menu');
  const menu = new SlideMenu(menuElement);
};

if(window.SlideMenu) {
  initSlideMenu()
} else {
  window.addEventListener("sm.ready", initSlideMenu);
}
```
 
## Options

The `SlideMenu()` constructor takes an optional second parameter to pass in various options:
  
Option | Description | Valid values | Default
--- | --- | --- | ---
`backLinkAfter` | HTML to append to back link in submenus | HTML code |  `''`
`backLinkBefore` | HTML to prepend to back link in submenus | HTML code |  `''`
`keyClose` | Key used to close the menu | [Any valid KeyboardEvent key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) | `Escape`
`keyOpen` | Key used to open the menu | [Any valid KeyboardEvent key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) | `undefined`
`position` | Position of the menu | `'left'` or `'right'` | `'right'`
`showBackLink` | Add a link to navigate back in submenus (first entry) | *boolean* | `true`
`submenuLinkBefore` | HTML to prepend to links with a submenu | HTML code |  `''`
`submenuLinkAfter` | HTML to append to links with a submenu | HTML code |  `''`
`closeOnClickOutside` | Menu closes when clicked outside menu  element | *boolean* | `false`
`onlyNavigateDecorator` | Prevents navigation when clicking the link directly, triggers menu slide navigation only when clicking the link decorator elements  | *boolean* | `false`
`menuWidth` | Width of the menu slider (without fold) | *number* | `320`
`minWidthFold` | Minimum window width in pixel for fold menu to be shown as fold not as slide | *number* | `640`
`transitionDuration` | Duration of slide animation in milliseconds | *number* | `300`
`dynamicOpenTarget` | Dynamically determine the default menu that will be opened based on current ``location.pathname`` or ``location.hash`` (especially useful for SPAs) | *boolean* | `false`
`debug` | Shows verbose logs / warnings | *boolean* | `false`

Example:
 
```javascript
const initSlideMenu = () => {
  const menu = new SlideMenu(document.getElementById('example-menu'),{
      showBackLink: false,
      submenuLinkAfter: ' <strong>⇒</strong>'
  });
};
 ```
 
## API

You can call the API in two different ways:

* Reuse the reference to the `SlideMenu` instance: 
    ```javascript
    const menu = new SlideMenu(document.getElementById('example-menu'));
  
    // ... later
    menu.close();
    ```
* The `SlideMenu` instance is also added as property of the menu DOM element. So if you need to control an existing menu without a reference to it, you can fetch it any time this way:

    ```javascript
    const menu = document.getElementById('example-menu')._slideMenu;
    menu.open();
    ```

### Methods

* `close(animate = true)` - Close the menu
* `back(closeFold = false)` - Navigate on level back if possible. Additionally closes fold
* `navigateTo(target)`
    Open the menu level which contains specified menu element. `target` can either be a `document.querySelector` compatible string selector or the the DOM element (inside the menu). The first found element (if any) will be used.
* `show(animate = true)` - Shows the menu if closed
* `open(animate = true)` - Opens the menu if closed an potentially navigates to target
  * If attribute `data-open-target="..."` is provided in the root menu element the menu will navigate to that target per default. Target must be a `document.querySelector` compatible string
  * If option ``dynamicOpenTarget`` is true opens submenu matching the currently active slug or hash in the browser URL (e.g. if you are on the page `https://example.com/about` slide menu will try to open the submenu of the item `<a href="/about">About</a>` or open the submenu containing it)
* `toggle(animate = true)` - Toggle the menu (if defined opens the `data-open-target="..."` / `dynamicOpenTarget` by default)

### Events

As soon as the `SlideMenu` class can be used globally the event `sm.ready` is fired.

`SlideMenu` emits events for all kind of actions, which trigger as soon as the action is method is called. Plus, all events have  also an `<event>-after` equivalent, which is fired after the step is complete (completely animated).

* `sm.back[-after]` fires immediately when navigating backwards in the menu hierarchy or after the animation is complete respectively. 
* `sm.close[-after]` fires immediately when the `close()` method is called or after the animation is complete respectively. 
* `sm.forward[-after]`fires immediately when navigating forward in the menu hierarchy or after the animation is complete respectively. 
* `sm.navigate[-after]`fires immediately when calling the `navigateTo()` method or after the animation is complete respectively. 
* `sm.open[-after]` fires immediately when the `open()` method is called or after the animation is complete respectively.
* `sm.init` fires when the slide menu object is finished initializing.

Make sure to add the event listener to the HTML element, which contains the menu, since the events for this specific menu are dispatched there:

```javascript
window.addEventListener("sm.ready", function () {
  const menuElement = document.getElementById('example-menu');
  const menu = new SlideMenu(menuElement);

  // Attach the event listener to the *DOM element*, not the SlideMenu instance
  menuElement.addEventListener('sm.open', function () {
    console.log('The menu opens');
  });

  menuElement.addEventListener('sm.open-after', function () {
    console.log('The menu has opened');
  });
});
```

### Define default submenu

To open a specific submenu with the `open` or `toggle` action you can give the slide menu element the attribute `data-open-target` and pass the slug or a selector for the desired target submenu item. Example:

```html
<nav class="slide-menu" id="example-menu" data-open-target="/submenu">
  <ul>
    <li>
      <a href="/blog">Blog</a>
    </li>
    <li>
      <a href="/submenu">Submenu</a>
      <ul>
        <!-- this submenu wil be opened as default -->
        <li><a href="#">Submenu entry 1</a></li>
        <li><a href="#">Submenu entry 2</a></li>
        <li><a href="#">Submenu entry 3</a></li>
      </ul>
    </li>
    <li>
      <a href="/about">About</a>
    </li>
  </ul>
</nav>
```

### Control buttons
 
Buttons to control the menu can be created easily. Add the class `slide-menu__control` to anchors or buttons and set the `data` attributes `target` to the ID of the desired menu and `action` to the API method:

```html
<button type="button" class="slide-menu__control" data-target="example-menu" data-action="open">Open</button>
<button type="button" class="slide-menu__control" data-target="example-menu" data-action="back">Back</button>
```

*Inside* the menu container the attribute `data-target` can be omitted or set to to the string `this` to control *this* menu.

```html
<a class="slide-menu-control" data-target="example-menu" data-action="close">Close this menu</a>
<a class="slide-menu-control" data-target="this" data-action="close">Close this menu</a>
<a class="slide-menu-control" data-action="close">Close this menu</a>
```

### Foldable Submenus

Foldable submenus can be created using the class `slide-menu__item--has-foldable-submenu` on the item that precedes the submenu.

```html
<a class="slide-menu__item--has-foldable-submenu" href="#"><span>Foldable</span></a>
<ul>
  ...foldable submenu items go here...
</ul>
```

Foldable Submenus will only fold open to the left/right side if the window width is bigger than the configured `minWidthFold`.

### Additonal Content Within the Menu

Any arbitrary additonal content (e.g. search input fields, detail info,...) can be inserted anywhere in the menu structure. The class `slide-menu--additional-content` provides standard padding like it is used for the menu ítems. Example:

```html
<nav class="slide-menu" id="test-menu-left">
  <div class="controls">
    ...
  </div>
  <div class="slide-menu--additional-content">
    <img src="https://studiomitte.com/build/images/logo/logo-white.svg" alt="Studiomitte Logo">
    <p>Some detail text</p>
  </div>
  <ul>
    ...
  </ul>
</nav>
```

#### Close Menu Links in the End of Submenus

To add Links for closing the menu in the end of Submenus for convenient keyboard navigation you can add additional navigation items in the HTML with `class="slide-menu__control"` and a ``data-action="close"`` like the following example:

```html
<ul>
  <li>...Menu item 1...</li>
  <li>...Menu item 2...</li>
  <li><a href="#" data-action="close" class="slide-menu__control">X Close</a></li>
</ul>
```

#### Manually created Backlinks in Submenus

If you want to insert backlinks manually like in the following example use the attribute `data-action="back"` on them. Additonally, use the attribute `data-arg="close-fold"` on the backlink, if you intend to close all the currently open foldable submenus.

```html
<ul>
  <li><a href="#" data-action="back" class="slide-menu__control">🔙 Backlink</a></li>
  <li>...Menu item 1...</li>
  <li>...Menu item 2...</li>
</ul>
```

> 💡 Backlinks can also be generated automatically with the option `showBackLink` and the contents `backLinkAfter` / `backLinkBefore`.

### Styling the Menu

Basic Styling is provided by `slide-menu`. To adjust it to your theme select the elements by the classes slide menu applies to the elements.

The following default CSS variables can be overwritten as needed:

```css
:root {
  --smdm-sm-transition-easing: ease-in-out;
  --smdm-sm-color-bg: rgb(10 10 9);
  --smdm-sm-color-text: rgb(238 237 235);
  --smdm-sm-color-active: rgb(32 31 29);
  --smdm-sm-color-hover: rgb(20 20 19);
  --smdm-sm-color-controls: rgb(20 20 19);
  --smdm-sm-control-content-back: '◄';
  --smdm-sm-control-content-close: '✕';
  --smdm-sm-item-padding: 0.9rem 1.5rem;
}
```

## Development

```sh
# if using with ddev first do
ddev start
ddev ssh -s frontend
# then open https://slide-menu.frontend.ddev.site:9999/

# for development run
npm install
npm run watch

# for testing
ddev ssh -s cypress
cypress run
```

### Build
Create a production build for release:

```sh
# outside of ddev container
npm run build
# or
npm run pre-version # includes linting & checks
```

### Publish Package Release
https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages

```sh
npm login

npm run pre-version
# commit changes

npm run version-patch # increments & commits patch version number
# or
npm run version-minor # increments & commits minor version number


npm run post-version
```

#### Testing Package - Install locally

Test package in a project and install it locally:

```sh
npm install path/to/my-package
```

#### Testing Package - Install through NPM

Install package through npm package registry:

```sh
npm install smdm-slide-menu@latest
```