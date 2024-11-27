var p=(o=>(o.Left="left",o.Right="right",o))(p||{}),h=(o=>(o.Back="back",o.Close="close",o.Forward="forward",o.Navigate="navigate",o.NavigateTo="navigateTo",o.Open="open",o.Initialize="init",o))(h||{});const d="slide-menu",l={active:`${d}__submenu--active`,backlink:`${d}__backlink`,control:`${d}__control`,controls:`${d}__controls`,decorator:`${d}__decorator`,slider:`${d}__slider`,item:`${d}__item`,submenu:`${d}__submenu`,sliderWrapper:`${d}__slider__wrapper`,foldableWrapper:`${d}__foldable__wrapper`,hasSubMenu:`${d}__item--has-submenu`,activeItem:`${d}__item--active`,hasFoldableSubmenu:`${d}__item--has-foldable-submenu`,foldableSubmenu:`${d}__submenu--foldable`,foldableSubmenuAlignTop:`${d}__submenu--foldable-align-top`,foldOpen:`${d}--fold-open`,slideIn:`${d}--slide-in`,slideOut:`${d}--slide-out`,open:`${d}--open`,left:`${d}--left`,right:`${d}--right`,title:`${d}__title`,hiddenOnRoot:`${d}--hidden-on-root-level`,invisibleOnRoot:`${d}--invisible-on-root-level`};function y(o,t,e){const i=[];for(;o&&o.parentElement!==null&&i.length<e;)o instanceof HTMLElement&&o.matches(t)&&i.push(o),o=o.parentElement;return i}function T(o,t){const e=y(o,t,1);return e.length?e[0]:null}const g='a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';function L(o){const t=Array.from((o==null?void 0:o.querySelectorAll(g))??[]).find(e=>S(e));t==null||t.focus()}function S(o){var t;for(let e=o;e&&e!==document;e=e.parentNode)if(((t=e.style)==null?void 0:t.display)==="none"||getComputedStyle(e).display==="none")return!1;return!0}function k(o,t,e,i){const s=t.querySelectorAll(g),n=e??s[0],a=s[s.length-1];(o.key==="Tab"||o.keyCode===9)&&(o.shiftKey?document.activeElement===n&&(a.focus(),o.preventDefault()):document.activeElement===a&&(n.focus(),o.preventDefault()))}function A(o){try{return document.querySelector(o),!0}catch{return!1}}let E=0;class b{constructor(t,e,i){var s,n,a;this.menuElem=t,this.options=e,this.anchorElem=i,this.isFoldable=!1,this.active=!1,this.id="smdm-"+E,E++,this.name=((s=this.anchorElem)==null?void 0:s.textContent)??"",this.parentMenuElem=((n=i==null?void 0:i.parentElement)==null?void 0:n.closest("ul"))??void 0,this.parent=(a=this.parentMenuElem)==null?void 0:a._slide,i&&(i==null||i.classList.add(l.hasSubMenu),this.options.onlyNavigateDecorator||(i.dataset.action=h.NavigateTo,i.dataset.target=this.options.id,i.dataset.arg=this.id)),t.classList.add(l.submenu),t.dataset.smdmId=this.id,t.querySelectorAll("a").forEach(r=>{r.classList.add(l.item)}),this.isFoldable=!!(i!=null&&i.classList.contains(l.hasFoldableSubmenu)),this.isFoldable&&t.classList.add(l.foldableSubmenu),e.showBackLink&&this.addBackLink(e),this.addLinkDecorator(e),t._slide=this}get isActive(){return this.active}addBackLink(t=this.options){var n;const e=((n=this.anchorElem)==null?void 0:n.textContent)??"",i=document.createElement("a");i.innerHTML=(t.backLinkBefore??"")+e+(t.backLinkAfter??""),i.classList.add(l.backlink,l.control,l.item),i.dataset.action=h.Back,i.setAttribute("href","#");const s=document.createElement("li");return s.appendChild(i),this.menuElem.insertBefore(s,this.menuElem.firstChild),i}addLinkDecorator(t){var i,s,n;const e="span";if(t.submenuLinkBefore){const a=document.createElement(e);a.classList.add(l.decorator),a.innerHTML=t.submenuLinkBefore,a.dataset.action=h.NavigateTo,a.dataset.target=this.options.id,a.dataset.arg=this.id,this.options.onlyNavigateDecorator&&a.setAttribute("tabindex","0"),(s=this.anchorElem)==null||s.insertBefore(a,(i=this.anchorElem)==null?void 0:i.firstChild)}if(t.submenuLinkAfter){const a=document.createElement(e);a.classList.add(l.decorator),a.innerHTML=t.submenuLinkAfter,a.dataset.action=h.NavigateTo,a.dataset.target=this.options.id,a.dataset.arg=this.id,this.options.onlyNavigateDecorator&&a.setAttribute("tabindex","0"),(n=this.anchorElem)==null||n.appendChild(a)}return this.anchorElem}deactivate(){return this.active=!1,this.menuElem.classList.remove(l.active),this}activate(){return this.active=!0,this.menuElem.classList.add(l.active),this}enableTabbing(){var t;(t=this.menuElem)==null||t.querySelectorAll('[tabindex="-1"]').forEach(e=>{e.setAttribute("tabindex","0")})}disableTabbing(){this.menuElem.querySelectorAll(g).forEach(t=>{t.setAttribute("tabindex","-1")})}appendTo(t){return t.appendChild(this.menuElem),this}postionTop(t){return this.menuElem.style.top=t+"px",this}getClosestNotFoldableSlide(){return this.isFoldable?this.getAllParents().find(t=>!t.isFoldable):this}getAllParents(){const t=[];let e=this.parent;for(;e;)t.push(e),e=e==null?void 0:e.parent;return t}focusFirstElem(){L(this.menuElem)}canFold(){return this.isFoldable&&window.innerWidth>=this.options.minWidthFold}matches(t){var n,a,r;const e=A(t),i=window.location.origin,s=`[id="${t.replace("#","")}"], [href="${t}"], [href="${i+t}"], [href="${i}/${t}"]`;return!!(this.id===t||this.menuElem.id===t||((n=this.anchorElem)==null?void 0:n.id)===t.replace("#","")||((a=this.anchorElem)==null?void 0:a.href)===t||(r=this.menuElem)!=null&&r.querySelector(s)||e&&this.menuElem.querySelector(t))}contains(t){return this.anchorElem===t||this.menuElem.contains(t)}focus(){this.focusFirstElem()}}const F={backLinkAfter:"",backLinkBefore:"",showBackLink:!0,keyClose:"Escape",keyOpen:"",position:p.Right,submenuLinkAfter:"",submenuLinkBefore:"",closeOnClickOutside:!1,onlyNavigateDecorator:!1,menuWidth:320,minWidthFold:640,transitionDuration:300,dynamicOpenTarget:!1,debug:!1,id:""};let v=0;class ${constructor(t,e){var i,s;if(this.lastFocusedElement=null,this.isOpen=!1,this.isAnimating=!1,this.lastAction=null,this.slides=[],this.menuTitleDefaultText="Menu",t===null)throw new Error("Argument `elem` must be a valid HTML node");for(this.options=Object.assign({},F,e),this.menuElem=t,this.options.id=this.menuElem.id??"smdm-slide-menu-"+v,v++,this.menuElem.id=this.options.id,this.menuElem.classList.add(d),this.menuElem.classList.add(this.options.position),this.menuElem._slideMenu=this,document.documentElement.style.setProperty("--smdm-sm-menu-width",`${this.options.menuWidth}px`),document.documentElement.style.setProperty("--smdm-sm-min-width-fold",`${this.options.minWidthFold}px`),document.documentElement.style.setProperty("--smdm-sm-transition-duration",`${this.options.transitionDuration}ms`),document.documentElement.style.setProperty("--smdm-sm-menu-level","0"),this.sliderElem=document.createElement("div"),this.sliderElem.classList.add(l.slider);this.menuElem.firstChild;)this.sliderElem.appendChild(this.menuElem.firstChild);this.menuElem.appendChild(this.sliderElem),this.sliderWrapperElem=document.createElement("div"),this.sliderWrapperElem.classList.add(l.sliderWrapper),this.sliderElem.appendChild(this.sliderWrapperElem),this.foldableWrapperElem=document.createElement("div"),this.foldableWrapperElem.classList.add(l.foldableWrapper),this.sliderElem.after(this.foldableWrapperElem),this.menuTitle=this.menuElem.querySelector(`.${l.title}`),this.menuTitleDefaultText=((s=(i=this.menuTitle)==null?void 0:i.textContent)==null?void 0:s.trim())??this.menuTitleDefaultText,this.options.onlyNavigateDecorator&&(!this.options.submenuLinkAfter||!this.options.submenuLinkBefore)&&this.debugLog("Make sure to provide navigation decorators manually! Otherwise `onlyNavigateDecorator` only works with `submenuLinkAfter` and `submenuLinkBefore` options!"),this.initMenu(),this.initSlides(),this.initEventHandlers(),this.menuElem.style.display="flex",this.activeSubmenu=this.slides[0].activate(),this.navigateTo(this.defaultOpenTarget??this.slides[0],!1),this.slides.forEach(n=>{n.disableTabbing()}),this.triggerEvent(h.Initialize)}get defaultOpenTarget(){const t=this.menuElem.dataset.openTarget??"smdm-sm-no-default-provided";return this.getTargetSlideByIdentifier(t)}get isFoldOpen(){return this.menuElem.classList.contains(l.foldOpen)}debugLog(...t){this.options.debug&&console.log(...t)}toggleVisibility(t,e=!0){let i;if(t===void 0){this.isOpen?this.close(e):this.show(e);return}t?(i=0,this.lastFocusedElement=document.activeElement,setTimeout(()=>{var s;(s=this.activeSubmenu)==null||s.focusFirstElem()},this.options.transitionDuration)):(i=this.options.position===p.Left?"-100%":"100%",setTimeout(()=>{var s;this.slides.forEach(n=>!n.isActive&&n.deactivate()),(s=this.lastFocusedElement)==null||s.focus(),this.menuElem.classList.remove(l.foldOpen)},this.options.transitionDuration)),this.isOpen=!!t,this.moveElem(this.menuElem,i)}toggle(t=!0){if(this.isOpen){this.close(t);return}this.open(t)}show(t=!0){var e;this.triggerEvent(h.Open),this.toggleVisibility(!0,t),(e=document.querySelector("body"))==null||e.classList.add(l.open)}close(t=!0){var e;this.triggerEvent(h.Close),this.toggleVisibility(!1,t),this.slides.forEach(i=>{i.disableTabbing()}),(e=document.querySelector("body"))==null||e.classList.remove(l.open)}back(t=!1){var s,n,a;const e=this.slides[0];let i=((s=this.activeSubmenu)==null?void 0:s.parent)??e;t&&(this.activeSubmenu=((n=this.activeSubmenu)==null?void 0:n.getClosestNotFoldableSlide())??e,i=((a=this.activeSubmenu)==null?void 0:a.parent)??e,this.closeFold()),this.navigateTo(i)}closeFold(){this.slides.forEach(t=>{t.appendTo(this.sliderWrapperElem)}),this.menuElem.classList.remove(l.foldOpen)}openFold(){this.slides.forEach(t=>{t.isFoldable&&t.appendTo(this.foldableWrapperElem)}),this.menuElem.classList.add(l.foldOpen)}navigateTo(t,e=!0){e&&!this.isOpen&&this.show();const i=this.findNextMenu(t),s=this.activeSubmenu,n=i.getAllParents(),a=n.find(m=>!m.canFold()),r=s==null?void 0:s.getAllParents().map(m=>m.id).includes(i.id),c=i==null?void 0:i.getAllParents().map(m=>m.id).includes((s==null?void 0:s.id)??"");e&&(this.triggerEvent(h.Navigate),r?this.triggerEvent(h.Back):c?this.triggerEvent(h.Forward):this.triggerEvent(h.NavigateTo)),this.updateMenuTitle(i,a),this.setTabbing(i,a,s,n);const u=[i,...n];this.activateVisibleMenus(u,r,s,i);const f=this.setSlideLevel(i,r);this.hideControlsIfOnRootLevel(f),this.setBodyTagSlideLevel(f),this.setActiveSubmenu(i),setTimeout(()=>{e&&i.focusFirstElem(),r&&(s==null||s.deactivate())},this.options.transitionDuration)}setActiveSubmenu(t){this.activeSubmenu=t}setBodyTagSlideLevel(t){var e;(e=document.querySelector("body"))==null||e.setAttribute("data-slide-menu-level",t.toString())}setTabbing(t,e,i,s){if(t.canFold()){this.openFold(),t.getAllParents().forEach(n=>{n.canFold()&&n.enableTabbing()}),e==null||e.enableTabbing(),e==null||e.getAllParents().forEach(n=>{n.disableTabbing()});return}i!=null&&i.canFold()&&!t.canFold()&&this.closeFold(),s.forEach(n=>{n.disableTabbing()}),t.enableTabbing()}activateVisibleMenus(t,e,i,s){const n=t.map(a=>a==null?void 0:a.id);this.slides.forEach(a=>{if(!n.includes(a.id)){if(e&&a.id===(i==null?void 0:i.id))return;a.deactivate(),a.disableTabbing()}}),t.forEach(a=>{a!=null&&a.isActive||a==null||a.activate()}),s.enableTabbing()}findNextMenu(t){if(typeof t=="string"){const e=this.getTargetSlideByIdentifier(t);if(e instanceof b)return e;throw new Error("Invalid parameter `target`. A valid query selector is required.")}if(t instanceof HTMLElement){const e=this.slides.find(i=>i.contains(t));if(e instanceof b)return e;throw new Error("Invalid parameter `target`. Not found in slide menu")}if(t instanceof b)return t;throw new Error("No valid next slide fund")}hideControlsIfOnRootLevel(t){const e=document.querySelectorAll(`.${l.control}.${l.hiddenOnRoot}, .${l.control}.${l.invisibleOnRoot}`);t===0?e.forEach(i=>{i.setAttribute("tabindex","-1")}):e.forEach(i=>{i.removeAttribute("tabindex")})}setSlideLevel(t,e=!1){const i=Array.from(this.sliderWrapperElem.querySelectorAll("."+l.active)).length,s=t!=null&&t.canFold()?0:Number(e),n=Math.max(1,i)-1-s;return this.setBodyTagSlideLevel(n),document.documentElement.style.setProperty("--smdm-sm-menu-level",`${n}`),n}updateMenuTitle(t,e){var i,s,n,a;if(this.menuTitle){let r=((i=t==null?void 0:t.anchorElem)==null?void 0:i.textContent)??this.menuTitleDefaultText;const c=((s=this.options)==null?void 0:s.submenuLinkAfter)??"",u=((n=this.options)==null?void 0:n.submenuLinkBefore)??"";t.canFold()&&e&&(r=((a=e.anchorElem)==null?void 0:a.textContent)??r),c&&(r=r.replace(c,"")),u&&(r=r.replace(u,"")),this.menuTitle.innerText=r.trim()}}getTargetSlideByIdentifier(t){return this.slides.slice().reverse().find(i=>i.matches(t))}getTargetSlideDynamically(){const t=location.pathname,e=location.hash,i=this.slides.find(n=>n.matches(e));return this.slides.find(n=>n.matches(t))??i}open(t=!0){const e=this.options.dynamicOpenTarget?this.getTargetSlideDynamically():this.defaultOpenTarget;e&&this.navigateTo(e),this.show(t)}initEventHandlers(){this.menuElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.sliderElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.options.closeOnClickOutside&&document.addEventListener("click",t=>{var e;this.isOpen&&!this.isAnimating&&!this.menuElem.contains(t.target)&&!((e=t.target)!=null&&e.closest("."+l.control))&&this.close()}),this.initKeybindings()}onTransitionEnd(t){t.target!==this.menuElem&&t.target!==this.sliderElem&&t.target!==this.foldableWrapperElem&&t.target!==this.sliderWrapperElem||(this.isAnimating=!1,this.lastAction&&(this.triggerEvent(this.lastAction,!0),this.lastAction=null))}initKeybindings(){document.addEventListener("keydown",t=>{const e=document.activeElement;switch(t.key){case this.options.keyClose:t.preventDefault(),this.close();break;case this.options.keyOpen:t.preventDefault(),this.show();break;case"Enter":e!=null&&e.classList.contains(l.decorator)&&e.click();break}})}triggerEvent(t,e=!1){this.lastAction=t;const i=`sm.${t}${e?"-after":""}`,s=new CustomEvent(i);this.menuElem.dispatchEvent(s)}markSelectedItem(t){this.menuElem.querySelectorAll("."+l.activeItem).forEach(e=>{e.classList.remove(l.activeItem)}),t.classList.add(l.activeItem)}moveElem(t,e,i="%"){setTimeout(()=>{e.toString().includes(i)||(e+=i);const s=`translateX(${e})`;t.style.transform!==s&&(this.isAnimating=!0,t.style.transform=s)},0)}initMenu(){this.runWithoutAnimation(()=>{switch(this.options.position){case p.Left:Object.assign(this.menuElem.style,{left:0,right:"auto",transform:"translateX(-100%)"});break;default:Object.assign(this.menuElem.style,{left:"auto",right:0});break}}),this.menuElem.classList.add(this.options.position);const t=this.menuElem.querySelector("ul");t&&this.slides.push(new b(t,this.options)),this.menuElem.addEventListener("keydown",i=>{var n;const s=this.menuElem.querySelector(`.${l.controls} .${l.control}:not([disabled]):not([tabindex="-1"])`);k(i,((n=this.activeSubmenu)==null?void 0:n.menuElem)??this.menuElem,s)}),new ResizeObserver(i=>{var n,a;if(i.length===0)return;const s=i[0].contentRect.width;if(s<this.options.minWidthFold&&this.isFoldOpen){this.closeFold();const r=(n=this.activeSubmenu)==null?void 0:n.getAllParents(),c=r==null?void 0:r.find(u=>!u.canFold());this.setTabbing(this.activeSubmenu??this.slides[0],c,this.activeSubmenu,r??[]),this.setSlideLevel(this.activeSubmenu??this.slides[0]),this.setTabbing(this.activeSubmenu??this.slides[0],void 0,void 0,[])}if(s>this.options.minWidthFold&&!this.isFoldOpen){this.openFold();const r=(a=this.activeSubmenu)==null?void 0:a.getAllParents(),c=r==null?void 0:r.find(u=>!u.canFold());this.setTabbing(this.activeSubmenu??this.slides[0],c,this.activeSubmenu,r??[]),this.setSlideLevel(this.activeSubmenu??this.slides[0])}}).observe(document.body)}runWithoutAnimation(t){const e=[this.menuElem,this.sliderElem];e.forEach(i=>i.style.transition="none"),t(),this.menuElem.offsetHeight,e.forEach(i=>i.style.removeProperty("transition")),this.isAnimating=!1}initSlides(){this.menuElem.querySelectorAll("a").forEach((t,e)=>{if(t.parentElement===null)return;const i=t.parentElement.querySelector("ul");if(!i)return;const s=new b(i,this.options,t);this.slides.push(s)}),this.slides.forEach(t=>{t.appendTo(this.sliderWrapperElem)})}get onlyNavigateDecorator(){return this.options.onlyNavigateDecorator}}document.addEventListener("click",o=>{var f;const t=m=>m?m.classList.contains(l.control)||m.classList.contains(l.hasSubMenu)||m.classList.contains(l.decorator):!1,e=t(o.target)?o.target:(f=o.target)==null?void 0:f.closest(`.${l.decorator}[data-action], .${l.control}[data-action], .${l.hasSubMenu}[data-action]`);if(!e||!t(e))return;const i=e.getAttribute("data-target"),s=!i||i==="this"?T(e,`.${d}`):document.getElementById(i)??document.querySelector(i);if(!s)throw new Error(`Unable to find menu ${i}`);const n=s._slideMenu;n&&!n.onlyNavigateDecorator&&o.preventDefault(),n&&n.onlyNavigateDecorator&&e.matches(`.${l.decorator}`)&&o.preventDefault();const a=e.getAttribute("data-action"),r=e.getAttribute("data-arg"),c={false:!1,true:!0,null:null,undefined:void 0},u=Object.keys(c).includes((r==null?void 0:r.toString())??"")?c[r]:r;n&&a&&typeof n[a]=="function"&&(u?n[a](u):n[a]())});window.SlideMenu=$;window.dispatchEvent(new Event("sm.ready"));
