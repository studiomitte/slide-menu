var E = ((o) => ((o.Left = 'left'), (o.Right = 'right'), o))(E || {}),
  c = ((o) => (
    (o.Back = 'back'),
    (o.Close = 'close'),
    (o.Forward = 'forward'),
    (o.Navigate = 'navigate'),
    (o.NavigateTo = 'navigateTo'),
    (o.Open = 'open'),
    (o.Initialize = 'init'),
    o
  ))(c || {});
const r = 'slide-menu',
  l = {
    active: `${r}__submenu--active`,
    backlink: `${r}__backlink`,
    control: `${r}__control`,
    controls: `${r}__controls`,
    decorator: `${r}__decorator`,
    slider: `${r}__slider`,
    item: `${r}__item`,
    submenu: `${r}__submenu`,
    sliderWrapper: `${r}__slider__wrapper`,
    foldableWrapper: `${r}__foldable__wrapper`,
    hasSubMenu: `${r}__item--has-submenu`,
    activeItem: `${r}__item--active`,
    hasFoldableSubmenu: `${r}__item--has-foldable-submenu`,
    foldableSubmenu: `${r}__submenu--foldable`,
    foldableSubmenuAlignTop: `${r}__submenu--foldable-align-top`,
    foldOpen: `${r}--fold-open`,
    slideIn: `${r}--slide-in`,
    slideOut: `${r}--slide-out`,
    open: `${r}--open`,
    left: `${r}--left`,
    right: `${r}--right`,
    title: `${r}__title`,
    hiddenOnRoot: `${r}--hidden-on-root-level`,
    invisibleOnRoot: `${r}--invisible-on-root-level`,
  };
function L(o, t, e) {
  const i = [];
  for (; o && o.parentElement !== null && i.length < e; )
    o instanceof HTMLElement && o.matches(t) && i.push(o), (o = o.parentElement);
  return i;
}
function k(o, t) {
  const e = L(o, t, 1);
  return e.length ? e[0] : null;
}
const g =
  'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
function A(o) {
  const t = Array.from((o == null ? void 0 : o.querySelectorAll(g)) ?? []).find((e) => S(e));
  t == null || t.focus();
}
function S(o) {
  var t;
  for (let e = o; e && e !== document; e = e.parentNode)
    if (
      ((t = e.style) == null ? void 0 : t.display) === 'none' ||
      getComputedStyle(e).display === 'none'
    )
      return !1;
  return !0;
}
function F(o, t, e, i) {
  const s = t.querySelectorAll(g),
    a = e ?? s[0],
    n = s[s.length - 1];
  (o.key === 'Tab' || o.keyCode === 9) &&
    (o.shiftKey
      ? document.activeElement === a && (n.focus(), o.preventDefault())
      : document.activeElement === n && (a.focus(), o.preventDefault()));
}
let v = 0;
class p {
  constructor(t, e, i) {
    var s, a, n;
    (this.menuElem = t),
      (this.options = e),
      (this.anchorElem = i),
      (this.isFoldable = !1),
      (this.active = !1),
      (this.id = 'smdm-' + v),
      v++,
      (this.name = ((s = this.anchorElem) == null ? void 0 : s.textContent) ?? ''),
      (this.parentMenuElem =
        ((a = i == null ? void 0 : i.parentElement) == null ? void 0 : a.closest('ul')) ?? void 0),
      (this.parent = (n = this.parentMenuElem) == null ? void 0 : n._slide),
      i &&
        (i == null || i.classList.add(l.hasSubMenu),
        this.options.onlyNavigateDecorator ||
          ((i.dataset.action = c.NavigateTo),
          (i.dataset.target = this.options.id),
          (i.dataset.arg = this.id))),
      t.classList.add(l.submenu),
      (t.dataset.smdmId = this.id),
      t.querySelectorAll('a').forEach((d) => {
        d.classList.add(l.item);
      }),
      (this.isFoldable = !!(i != null && i.classList.contains(l.hasFoldableSubmenu))),
      this.isFoldable && t.classList.add(l.foldableSubmenu),
      e.showBackLink && this.addBackLink(e),
      this.addLinkDecorator(e),
      (t._slide = this);
  }
  get isActive() {
    return this.active;
  }
  addBackLink(t = this.options) {
    var a;
    const e = ((a = this.anchorElem) == null ? void 0 : a.textContent) ?? '',
      i = document.createElement('a');
    (i.innerHTML = (t.backLinkBefore ?? '') + e + (t.backLinkAfter ?? '')),
      i.classList.add(l.backlink, l.control, l.item),
      (i.dataset.action = c.Back),
      i.setAttribute('href', '#');
    const s = document.createElement('li');
    return s.appendChild(i), this.menuElem.insertBefore(s, this.menuElem.firstChild), i;
  }
  addLinkDecorator(t) {
    var i, s, a;
    const e = 'span';
    if (t.submenuLinkBefore) {
      const n = document.createElement(e);
      n.classList.add(l.decorator),
        (n.innerHTML = t.submenuLinkBefore),
        (n.dataset.action = c.NavigateTo),
        (n.dataset.target = this.options.id),
        (n.dataset.arg = this.id),
        this.options.onlyNavigateDecorator && n.setAttribute('tabindex', '0'),
        (s = this.anchorElem) == null ||
          s.insertBefore(n, (i = this.anchorElem) == null ? void 0 : i.firstChild);
    }
    if (t.submenuLinkAfter) {
      const n = document.createElement(e);
      n.classList.add(l.decorator),
        (n.innerHTML = t.submenuLinkAfter),
        (n.dataset.action = c.NavigateTo),
        (n.dataset.target = this.options.id),
        (n.dataset.arg = this.id),
        this.options.onlyNavigateDecorator && n.setAttribute('tabindex', '0'),
        (a = this.anchorElem) == null || a.appendChild(n);
    }
    return this.anchorElem;
  }
  deactivate() {
    return (this.active = !1), this.menuElem.classList.remove(l.active), this;
  }
  activate() {
    return (this.active = !0), this.menuElem.classList.add(l.active), this;
  }
  enableTabbing() {
    var t;
    (t = this.menuElem) == null ||
      t.querySelectorAll('[tabindex="-1"]').forEach((e) => {
        e.setAttribute('tabindex', '0');
      });
  }
  disableTabbing() {
    this.menuElem.querySelectorAll(g).forEach((t) => {
      t.setAttribute('tabindex', '-1');
    });
  }
  appendTo(t) {
    return t.appendChild(this.menuElem), this;
  }
  postionTop(t) {
    return (this.menuElem.style.top = t + 'px'), this;
  }
  getClosestNotFoldableSlide() {
    return this.isFoldable ? this.getAllParents().find((t) => !t.isFoldable) : this;
  }
  getAllParents() {
    const t = [];
    let e = this.parent;
    for (; e; ) t.push(e), (e = e == null ? void 0 : e.parent);
    return t;
  }
  focusFirstElem() {
    A(this.menuElem);
  }
  canFold() {
    return this.isFoldable && window.innerWidth >= this.options.minWidthFold;
  }
  matches(t) {
    var e, i, s;
    return (
      this.id === t ||
      this.menuElem.id === t ||
      ((e = this.anchorElem) == null ? void 0 : e.id) === t ||
      ((i = this.anchorElem) == null ? void 0 : i.href) === t ||
      ((s = this.anchorElem) == null ? void 0 : s.matches(t)) ||
      this.menuElem.matches(t)
    );
  }
  contains(t) {
    return this.anchorElem === t || this.menuElem.contains(t);
  }
  focus() {
    this.focusFirstElem();
  }
}
const _ = {
  backLinkAfter: '',
  backLinkBefore: '',
  showBackLink: !0,
  keyClose: 'Escape',
  keyOpen: '',
  position: E.Right,
  submenuLinkAfter: '',
  submenuLinkBefore: '',
  closeOnClickOutside: !1,
  onlyNavigateDecorator: !1,
  menuWidth: 320,
  minWidthFold: 640,
  transitionDuration: 300,
  dynamicOpenTarget: !1,
  debug: !1,
  id: '',
};
let y = 0;
class w {
  constructor(t, e) {
    var i, s;
    if (
      ((this.lastFocusedElement = null),
      (this.isOpen = !1),
      (this.isAnimating = !1),
      (this.lastAction = null),
      (this.slides = []),
      (this.menuTitleDefaultText = 'Menu'),
      t === null)
    )
      throw new Error('Argument `elem` must be a valid HTML node');
    for (
      this.options = Object.assign({}, _, e),
        this.menuElem = t,
        this.options.id = this.menuElem.id ?? 'smdm-slide-menu-' + y,
        y++,
        this.menuElem.id = this.options.id,
        this.menuElem.classList.add(r),
        this.menuElem.classList.add(this.options.position),
        this.menuElem._slideMenu = this,
        document.documentElement.style.setProperty(
          '--smdm-sm-menu-width',
          `${this.options.menuWidth}px`,
        ),
        document.documentElement.style.setProperty(
          '--smdm-sm-min-width-fold',
          `${this.options.minWidthFold}px`,
        ),
        document.documentElement.style.setProperty(
          '--smdm-sm-transition-duration',
          `${this.options.transitionDuration}ms`,
        ),
        this.sliderElem = document.createElement('div'),
        this.sliderElem.classList.add(l.slider);
      this.menuElem.firstChild;

    )
      this.sliderElem.appendChild(this.menuElem.firstChild);
    this.menuElem.appendChild(this.sliderElem),
      (this.sliderWrapperElem = document.createElement('div')),
      this.sliderWrapperElem.classList.add(l.sliderWrapper),
      this.sliderElem.appendChild(this.sliderWrapperElem),
      (this.foldableWrapperElem = document.createElement('div')),
      this.foldableWrapperElem.classList.add(l.foldableWrapper),
      this.sliderElem.after(this.foldableWrapperElem),
      (this.menuTitle = this.menuElem.querySelector(`.${l.title}`)),
      (this.menuTitleDefaultText =
        ((s = (i = this.menuTitle) == null ? void 0 : i.textContent) == null ? void 0 : s.trim()) ??
        this.menuTitleDefaultText),
      this.options.onlyNavigateDecorator &&
        (!this.options.submenuLinkAfter || !this.options.submenuLinkBefore) &&
        this.debugLog(
          'Make sure to provide navigation decorators manually! Otherwise `onlyNavigateDecorator` only works with `submenuLinkAfter` and `submenuLinkBefore` options!',
        ),
      this.initMenu(),
      this.initSlides(),
      this.initEventHandlers(),
      (this.menuElem.style.display = 'flex'),
      this.triggerEvent(c.Initialize),
      (this.activeSubmenu = this.slides[0].activate()),
      this.navigateTo(this.defaultOpenTarget ?? this.slides[0], !1);
  }
  get defaultOpenTarget() {
    const t = this.menuElem.dataset.openTarget ?? 'smdm-sm-no-default-provided';
    return this.getTargetMenuFromIdentifier(t);
  }
  debugLog(...t) {
    this.options.debug && console.log(...t);
  }
  toggleVisibility(t, e = !0) {
    let i;
    if (t === void 0) {
      this.isOpen ? this.close(e) : this.show(e);
      return;
    }
    t
      ? ((i = 0),
        (this.lastFocusedElement = document.activeElement),
        setTimeout(() => {
          var s;
          (s = this.activeSubmenu) == null || s.focusFirstElem();
        }, this.options.transitionDuration))
      : ((i = this.options.position === E.Left ? '-100%' : '100%'),
        setTimeout(() => {
          var s;
          this.slides.forEach((a) => !a.isActive && a.deactivate()),
            (s = this.lastFocusedElement) == null || s.focus(),
            this.menuElem.classList.remove(l.foldOpen);
        }, this.options.transitionDuration)),
      (this.isOpen = !!t),
      this.moveElem(this.menuElem, i);
  }
  toggle(t = !0) {
    if (this.isOpen) {
      this.close(t);
      return;
    }
    this.open(t);
  }
  show(t = !0) {
    var e;
    this.triggerEvent(c.Open),
      this.toggleVisibility(!0, t),
      (e = document.querySelector('body')) == null || e.classList.add(l.open);
  }
  close(t = !0) {
    var e;
    this.triggerEvent(c.Close),
      this.toggleVisibility(!1, t),
      (e = document.querySelector('body')) == null || e.classList.remove(l.open);
  }
  back(t = !1) {
    var s, a, n;
    const e = this.slides[0];
    let i = ((s = this.activeSubmenu) == null ? void 0 : s.parent) ?? e;
    t &&
      ((this.activeSubmenu =
        ((a = this.activeSubmenu) == null ? void 0 : a.getClosestNotFoldableSlide()) ?? e),
      (i = ((n = this.activeSubmenu) == null ? void 0 : n.parent) ?? e),
      this.closeFold()),
      this.navigateTo(i);
  }
  closeFold() {
    this.slides.forEach((t) => {
      t.appendTo(this.sliderWrapperElem);
    }),
      this.menuElem.classList.remove(l.foldOpen);
  }
  openFold() {
    this.slides.forEach((t) => {
      t.isFoldable && t.appendTo(this.foldableWrapperElem);
    }),
      this.menuElem.classList.add(l.foldOpen);
  }
  navigateTo(t, e = !0) {
    e && !this.isOpen && this.show();
    const i = this.findNextMenu(t),
      s = this.activeSubmenu,
      a = i.getAllParents(),
      n = a.find((b) => !b.canFold()),
      d =
        s == null
          ? void 0
          : s
              .getAllParents()
              .map((b) => b.id)
              .includes(i.id),
      h =
        i == null
          ? void 0
          : i
              .getAllParents()
              .map((b) => b.id)
              .includes((s == null ? void 0 : s.id) ?? '');
    e &&
      (this.triggerEvent(c.Navigate),
      d
        ? this.triggerEvent(c.Back)
        : h
          ? this.triggerEvent(c.Forward)
          : this.triggerEvent(c.NavigateTo)),
      this.updateMenuTitle(i, n),
      this.setTabbingForFold(i, n, s, a);
    const u = [i, ...a];
    this.activateVisibleMenus(u, d, s, i);
    const m = this.getSlideLevel(i, d),
      T = -this.options.menuWidth * m;
    this.moveElem(this.sliderWrapperElem, T, 'px'),
      this.hideControlsIfOnRootLevel(m),
      this.setBodyTagSlideLevel(m),
      this.setActiveSubmenu(i),
      setTimeout(() => {
        e && i.focusFirstElem(), d && (s == null || s.deactivate());
      }, this.options.transitionDuration);
  }
  setActiveSubmenu(t) {
    this.activeSubmenu = t;
  }
  setBodyTagSlideLevel(t) {
    var e;
    (e = document.querySelector('body')) == null ||
      e.setAttribute('data-slide-menu-level', t.toString());
  }
  setTabbingForFold(t, e, i, s) {
    t.canFold()
      ? (this.openFold(),
        t.getAllParents().forEach((a) => {
          a.canFold() && a.enableTabbing();
        }),
        e == null ||
          e.getAllParents().forEach((a) => {
            a.disableTabbing();
          }))
      : i != null && i.canFold() && !t.canFold()
        ? (this.closeFold(),
          s.forEach((a) => {
            a.disableTabbing();
          }))
        : !(i != null && i.canFold()) &&
          !t.canFold() &&
          s.forEach((a) => {
            a.disableTabbing();
          });
  }
  activateVisibleMenus(t, e, i, s) {
    const a = t.map((n) => (n == null ? void 0 : n.id));
    this.slides.forEach((n) => {
      if (!a.includes(n.id)) {
        if (e && n.id === (i == null ? void 0 : i.id)) return;
        n.deactivate(), n.disableTabbing();
      }
    }),
      t.forEach((n) => {
        (n != null && n.isActive) || n == null || n.activate();
      }),
      s.enableTabbing();
  }
  findNextMenu(t) {
    if (typeof t == 'string') {
      const e = this.getTargetMenuFromIdentifier(t);
      if (e instanceof p) return e;
      throw new Error('Invalid parameter `target`. A valid query selector is required.');
    }
    if (t instanceof HTMLElement) {
      const e = this.slides.find((i) => i.contains(t));
      if (e instanceof p) return e;
      throw new Error('Invalid parameter `target`. Not found in slide menu');
    }
    if (t instanceof p) return t;
    throw new Error('No valid next slide fund');
  }
  hideControlsIfOnRootLevel(t) {
    const e = document.querySelectorAll(
      `.${l.control}.${l.hiddenOnRoot}, .${l.control}.${l.invisibleOnRoot}`,
    );
    t === 0
      ? e.forEach((i) => {
          i.setAttribute('tabindex', '-1');
        })
      : e.forEach((i) => {
          i.removeAttribute('tabindex');
        });
  }
  getSlideLevel(t, e) {
    const i = Array.from(this.sliderWrapperElem.querySelectorAll('.' + l.active)).length,
      s = t.canFold() ? 0 : Number(e);
    return Math.max(1, i) - 1 - s;
  }
  updateMenuTitle(t, e) {
    var i, s, a, n;
    if (this.menuTitle) {
      let d =
        ((i = t == null ? void 0 : t.anchorElem) == null ? void 0 : i.textContent) ??
        this.menuTitleDefaultText;
      const h = ((s = this.options) == null ? void 0 : s.submenuLinkAfter) ?? '',
        u = ((a = this.options) == null ? void 0 : a.submenuLinkBefore) ?? '';
      t.canFold() && e && (d = ((n = e.anchorElem) == null ? void 0 : n.textContent) ?? d),
        h && (d = d.replace(h, '')),
        u && (d = d.replace(u, '')),
        (this.menuTitle.innerText = d.trim());
    }
  }
  getTargetMenuFromIdentifier(t) {
    return (
      this.slides.find((e) => e.matches(t)) ?? this.slides.find((e) => e.menuElem.querySelector(t))
    );
  }
  getTargetMenuDynamically() {
    const t = location.pathname,
      e = location.hash,
      i = this.slides.find((a) => a.matches(e));
    return this.slides.find((a) => a.matches(t)) ?? i;
  }
  open(t = !0) {
    const e = this.options.dynamicOpenTarget
      ? this.getTargetMenuDynamically()
      : this.defaultOpenTarget;
    e && this.navigateTo(e), this.show(t);
  }
  initEventHandlers() {
    this.menuElem.addEventListener('transitionend', this.onTransitionEnd.bind(this)),
      this.sliderElem.addEventListener('transitionend', this.onTransitionEnd.bind(this)),
      this.options.closeOnClickOutside &&
        document.addEventListener('click', (t) => {
          var e;
          this.isOpen &&
            !this.isAnimating &&
            !this.menuElem.contains(t.target) &&
            !((e = t.target) != null && e.closest('.' + l.control)) &&
            this.close();
        }),
      this.initKeybindings();
  }
  onTransitionEnd(t) {
    (t.target !== this.menuElem &&
      t.target !== this.sliderElem &&
      t.target !== this.foldableWrapperElem &&
      t.target !== this.sliderWrapperElem) ||
      ((this.isAnimating = !1),
      this.lastAction && (this.triggerEvent(this.lastAction, !0), (this.lastAction = null)));
  }
  initKeybindings() {
    document.addEventListener('keydown', (t) => {
      const e = document.activeElement;
      switch (t.key) {
        case this.options.keyClose:
          t.preventDefault(), this.close();
          break;
        case this.options.keyOpen:
          t.preventDefault(), this.show();
          break;
        case 'Enter':
          e != null && e.classList.contains(l.decorator) && e.click();
          break;
      }
    });
  }
  triggerEvent(t, e = !1) {
    this.lastAction = t;
    const i = `sm.${t}${e ? '-after' : ''}`,
      s = new CustomEvent(i);
    this.menuElem.dispatchEvent(s);
  }
  markSelectedItem(t) {
    this.menuElem.querySelectorAll('.' + l.activeItem).forEach((e) => {
      e.classList.remove(l.activeItem);
    }),
      t.classList.add(l.activeItem);
  }
  moveElem(t, e, i = '%') {
    setTimeout(() => {
      e.toString().includes(i) || (e += i);
      const s = `translateX(${e})`;
      t.style.transform !== s && ((this.isAnimating = !0), (t.style.transform = s));
    }, 0);
  }
  initMenu() {
    this.runWithoutAnimation(() => {
      switch (this.options.position) {
        case E.Left:
          Object.assign(this.menuElem.style, {
            left: 0,
            right: 'auto',
            transform: 'translateX(-100%)',
          });
          break;
        default:
          Object.assign(this.menuElem.style, { left: 'auto', right: 0 });
          break;
      }
    }),
      this.menuElem.classList.add(this.options.position);
    const t = this.menuElem.querySelector('ul');
    t && this.slides.push(new p(t, this.options)),
      this.menuElem.addEventListener('keydown', (e) => {
        var s;
        const i = this.menuElem.querySelector(
          `.${l.controls} .${l.control}:not([disabled]):not([tabindex="-1"])`,
        );
        F(e, ((s = this.activeSubmenu) == null ? void 0 : s.menuElem) ?? this.menuElem, i);
      });
  }
  runWithoutAnimation(t) {
    const e = [this.menuElem, this.sliderElem];
    e.forEach((i) => (i.style.transition = 'none')),
      t(),
      this.menuElem.offsetHeight,
      e.forEach((i) => i.style.removeProperty('transition')),
      (this.isAnimating = !1);
  }
  initSlides() {
    this.menuElem.querySelectorAll('a').forEach((t, e) => {
      if (t.parentElement === null) return;
      const i = t.parentElement.querySelector('ul');
      if (!i) return;
      const s = new p(i, this.options, t);
      this.slides.push(s);
    }),
      this.slides.forEach((t) => {
        t.appendTo(this.sliderWrapperElem);
      });
  }
  get onlyNavigateDecorator() {
    return this.options.onlyNavigateDecorator;
  }
}
document.addEventListener('click', (o) => {
  var m;
  const t = (f) =>
      f
        ? f.classList.contains(l.control) ||
          f.classList.contains(l.hasSubMenu) ||
          f.classList.contains(l.decorator)
        : !1,
    e = t(o.target)
      ? o.target
      : (m = o.target) == null
        ? void 0
        : m.closest(
            `.${l.decorator}[data-action], .${l.control}[data-action], .${l.hasSubMenu}[data-action]`,
          );
  if (!e || !t(e)) return;
  const i = e.getAttribute('data-target'),
    s =
      !i || i === 'this' ? k(e, `.${r}`) : document.getElementById(i) ?? document.querySelector(i);
  if (!s) throw new Error(`Unable to find menu ${i}`);
  const a = s._slideMenu;
  a && !a.onlyNavigateDecorator && o.preventDefault(),
    a && a.onlyNavigateDecorator && e.matches(`.${l.decorator}`) && o.preventDefault();
  const n = e.getAttribute('data-action'),
    d = e.getAttribute('data-arg'),
    h = { false: !1, true: !0, null: null, undefined: void 0 },
    u = Object.keys(h).includes((d == null ? void 0 : d.toString()) ?? '') ? h[d] : d;
  a && n && typeof a[n] == 'function' && (u ? a[n](u) : a[n]());
});
window.SlideMenu = w;
window.dispatchEvent(new Event('sm.ready'));
