var g=(l=>(l.Left="left",l.Right="right",l))(g||{}),u=(l=>(l.Back="back",l.Close="close",l.Forward="forward",l.Navigate="navigate",l.NavigateTo="navigateTo",l.Open="open",l.Initialize="init",l))(u||{});const d="slide-menu",a={active:`${d}__submenu--active`,current:`${d}__submenu--current`,backlink:`${d}__backlink`,control:`${d}__control`,controls:`${d}__controls`,decorator:`${d}__decorator`,navigator:`${d}__navigator`,slider:`${d}__slider`,item:`${d}__item`,listItem:`${d}__listitem`,submenu:`${d}__submenu`,sliderWrapper:`${d}__slider__wrapper`,foldableWrapper:`${d}__foldable__wrapper`,hasSubMenu:`${d}__item--has-submenu`,activeItem:`${d}__item--active`,hasFoldableSubmenu:`${d}__item--has-foldable-submenu`,foldableSubmenu:`${d}__submenu--foldable`,foldableSubmenuAlignTop:`${d}__submenu--foldable-align-top`,foldOpen:`${d}--fold-open`,slideIn:`${d}--slide-in`,slideOut:`${d}--slide-out`,open:`${d}--open`,left:`${d}--left`,right:`${d}--right`,title:`${d}__title`,hiddenOnRoot:`${d}--hidden-on-root-level`,invisibleOnRoot:`${d}--invisible-on-root-level`};function T(l,t,e){const i=[];for(;l&&l.parentElement!==null&&i.length<e;)l instanceof HTMLElement&&l.matches(t)&&i.push(l),l=l.parentElement;return i}function L(l,t){const e=T(l,t,1);return e.length?e[0]:null}const y='a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';function S(l){const t=Array.from((l==null?void 0:l.querySelectorAll(y))??[]).find(e=>A(e));t==null||t.focus()}function A(l){var t;for(let e=l;e&&e!==document;e=e.parentNode)if(((t=e.style)==null?void 0:t.display)==="none"||getComputedStyle(e).display==="none")return!1;return!0}function k(l,t,e,i){const s=t.querySelectorAll(y),n=e??s[0],o=s[s.length-1];(l.key==="Tab"||l.keyCode===9)&&(l.shiftKey?document.activeElement===n&&(o.focus(),l.preventDefault()):document.activeElement===o&&(n.focus(),l.preventDefault()))}function F(l){try{return document.querySelector(l),!0}catch{return!1}}let E=0;class b{constructor(t,e,i){var s,n,o;this.menuElem=t,this.options=e,this.anchorElem=i,this.isFoldable=!1,this.active=!1,this.visible=!1,this.ref="/",this.id=t.id?t.id:"smdm-"+E,t.id=this.id,E++,this.name=((s=this.anchorElem)==null?void 0:s.textContent)??"",this.parentMenuElem=((n=i==null?void 0:i.parentElement)==null?void 0:n.closest("ul"))??void 0,this.parent=(o=this.parentMenuElem)==null?void 0:o._slide,i&&(i==null||i.classList.add(a.hasSubMenu),this.ref=i.href.replace(window.location.origin,""),this.options.navigationButtons||(i.dataset.action=u.NavigateTo,i.dataset.arg=this.id,i.role="button",i.setAttribute("aria-controls",this.id),i.setAttribute("aria-expanded","false"))),t.classList.add(a.submenu),t.dataset.smdmId=this.id,t.querySelectorAll("li").forEach(r=>{r.classList.add(a.listItem)}),t.querySelectorAll("a").forEach(r=>{r.classList.add(a.item)}),this.isFoldable=!!(i!=null&&i.classList.contains(a.hasFoldableSubmenu)),this.isFoldable&&t.classList.add(a.foldableSubmenu),e.showBackLink&&this.addBackLink(e),this.addNavigatorButton(e),t._slide=this}get isActive(){return this.active}addBackLink(t=this.options){var n;const e=((n=this.anchorElem)==null?void 0:n.textContent)??"",i=document.createElement("a");i.innerHTML=(t.backLinkBefore??"")+e+(t.backLinkAfter??""),i.classList.add(a.backlink,a.control,a.item),i.dataset.action=u.Back,i.setAttribute("href","#");const s=document.createElement("li");return s.appendChild(i),this.menuElem.insertBefore(s,this.menuElem.firstChild),i}addNavigatorButton(t){var n,o,r,h,c;if(!t.navigationButtons)return;const s=Array.from(((o=(n=this.anchorElem)==null?void 0:n.parentElement)==null?void 0:o.children)??[]).find(f=>f.classList.contains(a.navigator))??document.createElement("button");s.classList.add(a.navigator),s.dataset.action=((r=s.dataset)==null?void 0:r.action)??u.NavigateTo,s.dataset.arg=((h=s.dataset)==null?void 0:h.arg)??this.id,s.setAttribute("aria-controls",this.id),s.setAttribute("aria-expanded","false"),s.setAttribute("tabindex","0"),s.title=s.title?s.title:t.navigationButtonsLabel+": "+this.name,s.tagName!=="BUTTON"&&(s.role="button"),typeof t.navigationButtons=="string"&&!s.innerHTML.trim()?s.innerHTML=t.navigationButtons:s.getAttribute("aria-label")||s.setAttribute("aria-label",t.navigationButtonsLabel+": "+this.name),(c=this.anchorElem)==null||c.insertAdjacentElement("afterend",s),this.navigatorElem=s}deactivate(){var t,e;return this.active=!1,this.menuElem.classList.remove(a.active),this.menuElem.classList.remove(a.current),this.options.navigationButtons?(t=this.navigatorElem)==null||t.setAttribute("aria-expanded","false"):(e=this.anchorElem)==null||e.setAttribute("aria-expanded","false"),this}activate(){var t,e;return this.active=!0,this.visible=!0,this.menuElem.classList.add(a.active),this.menuElem.classList.add(a.current),this.options.navigationButtons?(t=this.navigatorElem)==null||t.setAttribute("aria-expanded","true"):(e=this.anchorElem)==null||e.setAttribute("aria-expanded","true"),this}setInvisible(){return this.visible=!1,this.isActive&&this.menuElem.classList.add(a.active),this.menuElem.classList.remove(a.current),this}enableTabbing(){this.menuElem.removeAttribute("inert")}disableTabbing(){this.menuElem.setAttribute("inert","true")}appendTo(t){return t.appendChild(this.menuElem),this}getClosestUnfoldableSlide(){return this.isFoldable?this.getAllParents().find(t=>!t.isFoldable):this}getAllFoldableParents(){return this.isFoldable?this.getAllParents().filter(t=>t.isFoldable):[]}getFirstUnfoldableParent(){return this.getAllParents().find(t=>!t.canFold())}hasParent(t){return this.getAllParents().some(e=>e.id===(t==null?void 0:t.id))}getAllParents(){const t=[];let e=this.parent;for(;e;)t.push(e),e=e==null?void 0:e.parent;return t}focusFirstElem(){S(this.menuElem)}canFold(){return this.isFoldable&&window.innerWidth>=this.options.minWidthFold}matches(t){var i;const e=F(t.trim());return!!(this.id===t||this.menuElem.id===t||((i=this.anchorElem)==null?void 0:i.id)===t.replace("#","")||t.replace(window.location.origin,"").startsWith(this.ref)||e&&this.menuElem.querySelector(t.trim()+`:not(.${a.hasSubMenu})`))}contains(t){return this.anchorElem===t||this.menuElem.contains(t)}focus(){this.focusFirstElem()}}const _={backLinkAfter:"",backLinkBefore:"",showBackLink:!0,keyClose:"Escape",keyOpen:"",position:g.Right,submenuLinkBefore:"",closeOnClickOutside:!1,navigationButtonsLabel:"Open submenu ",navigationButtons:!1,menuWidth:320,minWidthFold:640,transitionDuration:300,dynamicOpenDefault:!1,debug:!1,id:""};let v=0;class ${constructor(t,e){var i,s;if(this.lastFocusedElement=null,this.isOpen=!1,this.isAnimating=!1,this.lastAction=null,this.slides=[],this.menuTitleDefaultText="Menu",t===null)throw new Error("Argument `elem` must be a valid HTML node");for(this.options=Object.assign({},_,e),this.menuElem=t,this.options.id=this.menuElem.id?this.menuElem.id:"smdm-slide-menu-"+v,v++,this.menuElem.id=this.options.id,this.menuElem.classList.add(d),this.menuElem.classList.add(this.options.position),this.menuElem.role="navigation",this.menuElem._slideMenu=this,document.documentElement.style.setProperty("--smdm-sm-menu-width",`${this.options.menuWidth}px`),document.documentElement.style.setProperty("--smdm-sm-min-width-fold",`${this.options.minWidthFold}px`),document.documentElement.style.setProperty("--smdm-sm-transition-duration",`${this.options.transitionDuration}ms`),document.documentElement.style.setProperty("--smdm-sm-menu-level","0"),this.sliderElem=document.createElement("div"),this.sliderElem.classList.add(a.slider);this.menuElem.firstChild;)this.sliderElem.appendChild(this.menuElem.firstChild);this.menuElem.appendChild(this.sliderElem),this.sliderWrapperElem=document.createElement("div"),this.sliderWrapperElem.classList.add(a.sliderWrapper),this.sliderElem.appendChild(this.sliderWrapperElem),this.foldableWrapperElem=document.createElement("div"),this.foldableWrapperElem.classList.add(a.foldableWrapper),this.sliderElem.after(this.foldableWrapperElem),this.menuTitle=this.menuElem.querySelector(`.${a.title}`),this.menuTitleDefaultText=((s=(i=this.menuTitle)==null?void 0:i.textContent)==null?void 0:s.trim())??this.menuTitleDefaultText,this.initMenu(),this.initSlides(),this.initEventHandlers(),this.menuElem.style.display="flex",this.activeSubmenu=this.slides[0].activate(),this.navigateTo(this.defaultOpenTarget??this.slides[0],!1),this.menuElem.setAttribute("inert","true"),this.slides.forEach(n=>{n.disableTabbing()}),this.triggerEvent(u.Initialize)}get defaultOpenTarget(){const t=this.menuElem.dataset.openDefault??this.menuElem.dataset.defaultTarget??this.menuElem.dataset.openTarget??this.menuElem.dataset.defaultOpenTarget??"smdm-sm-no-default-provided";return this.getTargetSlideByIdentifier(t)}get isFoldOpen(){return this.menuElem.classList.contains(a.foldOpen)}debugLog(...t){this.options.debug&&console.log(...t)}toggleVisibility(t,e=!0){let i;if(t===void 0){this.isOpen?this.close(e):this.show(e);return}t?(i=0,this.lastFocusedElement=document.activeElement,setTimeout(()=>{var s;(s=this.activeSubmenu)==null||s.focusFirstElem()},this.options.transitionDuration)):(i=this.options.position===g.Left?"-100%":"100%",setTimeout(()=>{var s;this.slides.forEach(n=>!n.isActive&&n.deactivate()),(s=this.lastFocusedElement)==null||s.focus(),this.menuElem.classList.remove(a.foldOpen)},this.options.transitionDuration)),this.isOpen=!!t,this.moveElem(this.menuElem,i)}getTargetSlideDynamically(){const t=location.pathname,e=location.hash,i=this.slides.find(n=>n.matches(e));return this.slides.find(n=>n.matches(t))??i}open(t=!0){const e=(this.options.dynamicOpenDefault?this.getTargetSlideDynamically():this.defaultOpenTarget)??this.activeSubmenu;this.menuElem.removeAttribute("inert"),e&&this.navigateTo(e),this.show(t)}toggle(t=!0){if(this.isOpen){this.close(t);return}this.open(t)}show(t=!0){var e;this.triggerEvent(u.Open),this.toggleVisibility(!0,t),(e=document.querySelector("body"))==null||e.classList.add(a.open)}close(t=!0){var e;this.triggerEvent(u.Close),this.toggleVisibility(!1,t),this.menuElem.setAttribute("inert","true"),this.slides.forEach(i=>{i.disableTabbing()}),(e=document.querySelector("body"))==null||e.classList.remove(a.open)}back(t=!1){var s,n,o;const e=this.slides[0];let i=((s=this.activeSubmenu)==null?void 0:s.parent)??e;t&&(this.activeSubmenu=((n=this.activeSubmenu)==null?void 0:n.getClosestUnfoldableSlide())??e,i=((o=this.activeSubmenu)==null?void 0:o.parent)??e,this.closeFold()),this.navigateTo(i)}closeFold(){this.slides.forEach(t=>{t.appendTo(this.sliderWrapperElem)}),this.menuElem.classList.remove(a.foldOpen)}openFold(){this.slides.forEach(t=>{t.isFoldable&&t.appendTo(this.foldableWrapperElem)}),this.menuElem.classList.add(a.foldOpen)}navigateTo(t,e=!0){e&&!this.isOpen&&this.show();const i=this.findNextMenu(t),s=this.activeSubmenu,n=i.getAllParents(),o=i.getFirstUnfoldableParent(),r=new Set([i,...i.getAllFoldableParents()]);o&&r.add(o);const h=s==null?void 0:s.hasParent(i),c=i==null?void 0:i.hasParent(s);e&&(this.triggerEvent(u.Navigate),h?this.triggerEvent(u.Back):c?this.triggerEvent(u.Forward):this.triggerEvent(u.NavigateTo)),this.updateMenuTitle(i,o),this.setTabbing(i,o,s,n);const f=[i,...n];this.activateMenus(f,h,s,i);const m=this.setSlideLevel(i,h);this.hideControlsIfOnRootLevel(m),this.setBodyTagSlideLevel(m),this.setActiveSubmenu(i),setTimeout(()=>{e&&i.focusFirstElem(),h&&(s==null||s.deactivate()),this.slides.forEach(p=>{p.isActive&&!r.has(p)&&p.setInvisible()})},this.options.transitionDuration)}setActiveSubmenu(t){this.activeSubmenu=t}setBodyTagSlideLevel(t){var e;(e=document.querySelector("body"))==null||e.setAttribute("data-slide-menu-level",t.toString())}setTabbing(t,e,i,s){if(this.isOpen&&this.menuElem.removeAttribute("inert"),t.canFold()){this.openFold(),t.getAllParents().forEach(n=>{n.canFold()&&n.enableTabbing()}),e==null||e.enableTabbing(),e==null||e.getAllParents().forEach(n=>{n.disableTabbing()});return}i!=null&&i.canFold()&&!t.canFold()&&this.closeFold(),s.forEach(n=>{n.disableTabbing()}),t.enableTabbing()}activateMenus(t,e,i,s){const n=t.map(o=>o==null?void 0:o.id);this.slides.forEach(o=>{if(!n.includes(o.id)){if(e&&o.id===(i==null?void 0:i.id))return;o.deactivate(),o.disableTabbing()}}),t.forEach(o=>{o==null||o.activate()}),s.enableTabbing()}findNextMenu(t){if(typeof t=="string"){const e=this.getTargetSlideByIdentifier(t);if(e instanceof b)return e;throw new Error("Invalid parameter `target`. A valid query selector is required.")}if(t instanceof HTMLElement){const e=this.slides.find(i=>i.contains(t));if(e instanceof b)return e;throw new Error("Invalid parameter `target`. Not found in slide menu")}if(t instanceof b)return t;throw new Error("No valid next slide fund")}hideControlsIfOnRootLevel(t){const e=document.querySelectorAll(`.${a.control}.${a.hiddenOnRoot}, .${a.control}.${a.invisibleOnRoot}`);t===0?e.forEach(i=>{i.setAttribute("tabindex","-1")}):e.forEach(i=>{i.removeAttribute("tabindex")})}setSlideLevel(t,e=!1){const i=Array.from(this.sliderWrapperElem.querySelectorAll(`.${a.active}, .${a.current}`)).length,s=t!=null&&t.canFold()?0:Number(e),n=Math.max(1,i)-1-s;return this.setBodyTagSlideLevel(n),document.documentElement.style.setProperty("--smdm-sm-menu-level",`${n}`),n}updateMenuTitle(t,e){var i,s,n,o;if(this.menuTitle){let r=((i=t==null?void 0:t.anchorElem)==null?void 0:i.textContent)??this.menuTitleDefaultText;const h=((s=this.options)==null?void 0:s.navigationButtons)??"",c=((n=this.options)==null?void 0:n.submenuLinkBefore)??"";t.canFold()&&e&&(r=((o=e.anchorElem)==null?void 0:o.textContent)??r),h&&typeof h=="string"&&(r=r.replace(h,"")),c&&typeof c=="string"&&(r=r.replace(c,"")),this.menuTitle.innerText=r.trim()}}getTargetSlideByIdentifier(t){return this.slides.slice().sort((i,s)=>{const n=i.ref.split("/").length,o=s.ref.split("/").length;return o!==n?o-n:s.ref.length-i.ref.length}).find(i=>i.matches(t))}initEventHandlers(){this.menuElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.sliderElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.options.closeOnClickOutside&&document.addEventListener("click",t=>{var e;this.isOpen&&!this.isAnimating&&!this.menuElem.contains(t.target)&&!((e=t.target)!=null&&e.closest("."+a.control))&&this.close()}),this.initKeybindings()}onTransitionEnd(t){t.target!==this.menuElem&&t.target!==this.sliderElem&&t.target!==this.foldableWrapperElem&&t.target!==this.sliderWrapperElem||(this.isAnimating=!1,this.lastAction&&(this.triggerEvent(this.lastAction,!0),this.lastAction=null))}initKeybindings(){document.addEventListener("keydown",t=>{const e=document.activeElement;switch(t.key){case this.options.keyClose:t.preventDefault(),this.close();break;case this.options.keyOpen:t.preventDefault(),this.show();break;case"Enter":e!=null&&e.classList.contains(a.navigator)&&e.click();break}})}triggerEvent(t,e=!1){this.lastAction=t;const i=`sm.${t}${e?"-after":""}`,s=new CustomEvent(i);this.menuElem.dispatchEvent(s)}markSelectedItem(t){this.menuElem.querySelectorAll("."+a.activeItem).forEach(e=>{e.classList.remove(a.activeItem)}),t.classList.add(a.activeItem)}moveElem(t,e,i="%"){setTimeout(()=>{e.toString().includes(i)||(e+=i);const s=`translateX(${e})`;t.style.transform!==s&&(this.isAnimating=!0,t.style.transform=s)},0)}initMenu(){this.runWithoutAnimation(()=>{switch(this.options.position){case g.Left:Object.assign(this.menuElem.style,{left:0,right:"auto",transform:"translateX(-100%)"});break;default:Object.assign(this.menuElem.style,{left:"auto",right:0});break}}),this.menuElem.classList.add(this.options.position);const t=this.menuElem.querySelector("ul");t&&this.slides.push(new b(t,this.options)),this.menuElem.addEventListener("keydown",i=>{var n;i.key===" "&&i.target instanceof HTMLAnchorElement&&i.target.role==="button"&&(i.preventDefault(),i.target.click());const s=this.menuElem.querySelector(`.${a.controls} .${a.control}:not([disabled]):not([tabindex="-1"])`);k(i,((n=this.activeSubmenu)==null?void 0:n.menuElem)??this.menuElem,s)}),new ResizeObserver(i=>{var n,o;if(i.length===0)return;const s=i[0].contentRect.width;if(s<this.options.minWidthFold&&this.isFoldOpen){this.closeFold();const r=(n=this.activeSubmenu)==null?void 0:n.getAllParents(),h=r==null?void 0:r.find(c=>!c.canFold());this.setTabbing(this.activeSubmenu??this.slides[0],h,this.activeSubmenu,r??[]),this.setSlideLevel(this.activeSubmenu??this.slides[0]),this.setTabbing(this.activeSubmenu??this.slides[0],void 0,void 0,[])}if(s>this.options.minWidthFold&&!this.isFoldOpen){this.openFold();const r=(o=this.activeSubmenu)==null?void 0:o.getAllParents(),h=r==null?void 0:r.find(c=>!c.canFold());this.setTabbing(this.activeSubmenu??this.slides[0],h,this.activeSubmenu,r??[]),this.setSlideLevel(this.activeSubmenu??this.slides[0])}}).observe(document.body)}runWithoutAnimation(t){const e=[this.menuElem,this.sliderElem];e.forEach(i=>i.style.transition="none"),t(),this.menuElem.offsetHeight,e.forEach(i=>i.style.removeProperty("transition")),this.isAnimating=!1}initSlides(){this.menuElem.querySelectorAll("a").forEach((t,e)=>{if(t.parentElement===null)return;const i=t.parentElement.querySelector("ul");if(!i)return;const s=new b(i,this.options,t);this.slides.push(s)}),this.slides.forEach(t=>{t.appendTo(this.sliderWrapperElem)})}get onlyNavigateDecorator(){return!!this.options.navigationButtons}}document.addEventListener("click",l=>{var f;const t=m=>m?m.classList.contains(a.control)||m.classList.contains(a.hasSubMenu)||m.classList.contains(a.navigator):!1,e=t(l.target)?l.target:(f=l.target)==null?void 0:f.closest(`.${a.navigator}[data-action], .${a.control}[data-action], .${a.hasSubMenu}[data-action]`);if(!e||!t(e))return;const i=e.getAttribute("data-target"),s=!i||i==="this"?L(e,`.${d}`):document.getElementById(i)??document.querySelector(i);if(!s)throw new Error(`Unable to find menu ${i}`);const n=s._slideMenu;n&&!n.onlyNavigateDecorator&&l.preventDefault();const o=e.getAttribute("data-action"),r=e.getAttribute("data-arg")??e.href,h={false:!1,true:!0,null:null,undefined:void 0},c=Object.keys(h).includes((r==null?void 0:r.toString())??"")?h[r]:r;n&&o&&typeof n[o]=="function"&&(c?n[o](c):n[o]())});window.SlideMenu=$;window.dispatchEvent(new Event("sm.ready"));
