var E=(n=>(n.Left="left",n.Right="right",n))(E||{}),c=(n=>(n.Back="back",n.Close="close",n.Forward="forward",n.Navigate="navigate",n.NavigateTo="navigateTo",n.Open="open",n))(c||{});const d="slide-menu",r={active:`${d}__submenu--active`,backlink:`${d}__backlink`,control:`${d}__control`,controls:`${d}__controls`,decorator:`${d}__decorator`,slider:`${d}__slider`,item:`${d}__item`,submenu:`${d}__submenu`,sliderWrapper:`${d}__slider__wrapper`,foldableWrapper:`${d}__foldable__wrapper`,hasSubMenu:`${d}__item--has-submenu`,activeItem:`${d}__item--active`,hasFoldableSubmenu:`${d}__item--has-foldable-submenu`,foldableSubmenu:`${d}__submenu--foldable`,foldableSubmenuAlignTop:`${d}__submenu--foldable-align-top`,foldOpen:`${d}--fold-open`,slideIn:`${d}--slide-in`,slideOut:`${d}--slide-out`,left:`${d}--left`,right:`${d}--right`};function A(n,t,e){const i=[];for(;n&&n.parentElement!==null&&i.length<e;)n instanceof HTMLElement&&n.matches(t)&&i.push(n),n=n.parentElement;return i}function S(n,t){const e=A(n,t,1);return e.length?e[0]:null}const b='a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';function F(n){var t;(t=n==null?void 0:n.querySelector(b))==null||t.focus()}function _(n,t,e,i){const a=t.querySelectorAll(b),l=e??a[0],s=a[a.length-1];(n.key==="Tab"||n.keyCode===9)&&(n.shiftKey?document.activeElement===l&&(s.focus(),n.preventDefault()):document.activeElement===s&&(l.focus(),n.preventDefault()))}let g=0;class f{constructor(t,e,i){var a,l,s;this.menuElem=t,this.options=e,this.anchorElem=i,this.isFoldable=!1,this.active=!1,this.id="smdm-"+g,g++,this.name=((a=this.anchorElem)==null?void 0:a.textContent)??"",this.parentMenuElem=((l=i==null?void 0:i.parentElement)==null?void 0:l.closest("ul"))??void 0,this.parent=(s=this.parentMenuElem)==null?void 0:s._slide,i&&(i==null||i.classList.add(r.hasSubMenu),this.options.onlyNavigateDecorator||(i.dataset.action=c.NavigateTo,i.dataset.target=this.options.id,i.dataset.arg=this.id)),t.classList.add(r.submenu),t.dataset.smdmId=this.id,t.querySelectorAll("a").forEach(h=>{h.classList.add(r.item)}),this.isFoldable=!!(i!=null&&i.classList.contains(r.hasFoldableSubmenu)),this.isFoldable&&t.classList.add(r.foldableSubmenu),e.showBackLink&&this.addBackLink(e),this.addLinkDecorator(e),t._slide=this}get isActive(){return this.active}addBackLink(t=this.options){var l;const e=((l=this.anchorElem)==null?void 0:l.textContent)??"",i=document.createElement("a");i.innerHTML=(t.backLinkBefore??"")+e+(t.backLinkAfter??""),i.classList.add(r.backlink,r.control,r.item),i.dataset.action=c.Back,i.setAttribute("href","#");const a=document.createElement("li");return a.appendChild(i),this.menuElem.insertBefore(a,this.menuElem.firstChild),i}addLinkDecorator(t){var i,a,l;const e="span";if(t.submenuLinkBefore){const s=document.createElement(e);s.classList.add(r.decorator),s.innerHTML=t.submenuLinkBefore,s.dataset.action=c.NavigateTo,s.dataset.target=this.options.id,s.dataset.arg=this.id,this.options.onlyNavigateDecorator&&s.setAttribute("tabindex","0"),(a=this.anchorElem)==null||a.insertBefore(s,(i=this.anchorElem)==null?void 0:i.firstChild)}if(t.submenuLinkAfter){const s=document.createElement(e);s.classList.add(r.decorator),s.innerHTML=t.submenuLinkAfter,s.dataset.action=c.NavigateTo,s.dataset.target=this.options.id,s.dataset.arg=this.id,this.options.onlyNavigateDecorator&&s.setAttribute("tabindex","0"),(l=this.anchorElem)==null||l.appendChild(s)}return this.anchorElem}deactivate(){return this.active=!1,this.menuElem.classList.remove(r.active),this}activate(){return this.active=!0,this.menuElem.classList.add(r.active),this}enableTabbing(){var t;(t=this.menuElem)==null||t.querySelectorAll('[tabindex="-1"]').forEach(e=>{e.setAttribute("tabindex","0")})}disableTabbing(){this.menuElem.querySelectorAll(b).forEach(t=>{t.setAttribute("tabindex","-1")})}appendTo(t){return t.appendChild(this.menuElem),this}postionTop(t){return this.menuElem.style.top=t+"px",this}getClosestNotFoldableSlide(){return this.isFoldable?this.getAllParents().find(t=>!t.isFoldable):this}getAllParents(){const t=[];let e=this.parent;for(;e;)t.push(e),e=e==null?void 0:e.parent;return t}focusFirstElem(){F(this.menuElem)}canFold(){return this.isFoldable&&window.innerWidth>=this.options.minWidthFold}matches(t){var e,i,a;return this.id===t||this.menuElem.id===t||((e=this.anchorElem)==null?void 0:e.id)===t||((i=this.anchorElem)==null?void 0:i.href)===t||((a=this.anchorElem)==null?void 0:a.matches(t))||this.menuElem.matches(t)}contains(t){return this.anchorElem===t||this.menuElem.contains(t)}focus(){this.focusFirstElem()}}const w={backLinkAfter:"",backLinkBefore:"",showBackLink:!0,keyClose:"Escape",keyOpen:"",position:"right",submenuLinkAfter:"",submenuLinkBefore:"",closeOnClickOutside:!1,onlyNavigateDecorator:!1,menuWidth:320,minWidthFold:640,transitionDuration:300,dynamicOpenTarget:!1,id:""};let v=0;class ${constructor(t,e){if(this.lastFocusedElement=null,this.isOpen=!1,this.isAnimating=!1,this.lastAction=null,this.slides=[],t===null)throw new Error("Argument `elem` must be a valid HTML node");for(this.options=Object.assign({},w,e),this.menuElem=t,this.options.id=this.menuElem.id??"smdm-slide-menu-"+v,v++,this.menuElem.id=this.options.id,document.documentElement.style.setProperty("--smdm-sm-menu-width",`${this.options.menuWidth}px`),document.documentElement.style.setProperty("--smdm-sm-min-width-fold",`${this.options.minWidthFold}px`),document.documentElement.style.setProperty("--smdm-sm-transition-duration",`${this.options.transitionDuration}ms`),this.sliderElem=document.createElement("div"),this.sliderElem.classList.add(r.slider);this.menuElem.firstChild;)this.sliderElem.appendChild(this.menuElem.firstChild);this.menuElem.appendChild(this.sliderElem),this.sliderWrapperElem=document.createElement("div"),this.sliderWrapperElem.classList.add(r.sliderWrapper),this.sliderElem.appendChild(this.sliderWrapperElem),this.foldableWrapperElem=document.createElement("div"),this.foldableWrapperElem.classList.add(r.foldableWrapper),this.sliderElem.after(this.foldableWrapperElem),this.initMenu(),this.initSlides(),this.initEventHandlers(),this.menuElem.style.display="flex",this.menuElem._slideMenu=this}toggleVisibility(t,e=!0){var a;let i;if(t===void 0){this.isOpen?this.close(e):this.show(e);return}t?(i=0,this.lastFocusedElement=document.activeElement,(a=this.activeSubmenu)==null||a.focusFirstElem()):(i=this.options.position===E.Left?"-100%":"100%",setTimeout(()=>{var l;this.slides.forEach(s=>!s.isActive&&s.deactivate()),(l=this.lastFocusedElement)==null||l.focus(),this.menuElem.classList.remove(r.foldOpen)},this.options.transitionDuration)),this.isOpen=!!t,this.moveElem(this.menuElem,i)}toggle(t=!0){if(this.isOpen){this.close(t);return}this.open(t)}show(t=!0){this.triggerEvent(c.Open),this.toggleVisibility(!0,t)}close(t=!0){this.triggerEvent(c.Close),this.toggleVisibility(!1,t)}back(t=!1){var a,l,s;const e=this.slides[0];let i=((a=this.activeSubmenu)==null?void 0:a.parent)??e;t&&(this.activeSubmenu=((l=this.activeSubmenu)==null?void 0:l.getClosestNotFoldableSlide())??e,i=((s=this.activeSubmenu)==null?void 0:s.parent)??e,this.closeFold()),this.navigateTo(i)}closeFold(){this.slides.forEach(t=>{t.appendTo(this.sliderWrapperElem)}),this.menuElem.classList.remove(r.foldOpen)}openFold(){this.slides.forEach(t=>{t.isFoldable&&t.appendTo(this.foldableWrapperElem)}),this.menuElem.classList.add(r.foldOpen)}navigateTo(t){let e;if(this.isOpen||this.show(),typeof t=="string"){const o=this.getTargetMenuFromIdentifier(t);if(o instanceof f)e=o;else throw new Error("Invalid parameter `target`. A valid query selector is required.")}if(t instanceof HTMLElement){const o=this.slides.find(T=>T.contains(t));if(o instanceof f)e=o;else throw new Error("Invalid parameter `target`. Not found in slide menu")}if(t instanceof f&&(e=t),!e)throw new Error("No valid next slide fund");const i=this.activeSubmenu,a=e.getAllParents(),l=a.find(o=>!o.canFold()),s=[e,...a],h=s.map(o=>o==null?void 0:o.id),u=i==null?void 0:i.getAllParents().map(o=>o.id).includes(e.id),p=e==null?void 0:e.getAllParents().map(o=>o.id).includes((i==null?void 0:i.id)??"");this.triggerEvent(c.Navigate),u?this.triggerEvent(c.Back):p?this.triggerEvent(c.Forward):this.triggerEvent(c.NavigateTo),e.canFold()?(this.openFold(),e.getAllParents().forEach(o=>{o.canFold()&&o.enableTabbing()}),l==null||l.getAllParents().forEach(o=>{o.disableTabbing()})):i!=null&&i.canFold()&&!e.canFold()&&(this.closeFold(),a.forEach(o=>{o.disableTabbing()})),this.slides.forEach(o=>{if(!h.includes(o.id)){if(u&&o.id===(i==null?void 0:i.id))return;o.deactivate(),o.disableTabbing()}}),s.forEach(o=>{o!=null&&o.isActive||o==null||o.activate()}),e.enableTabbing();const m=this.getSlideLevel(),k=e.canFold()?0:Number(u),L=Math.max(1,m)-1-k,y=-this.options.menuWidth*L;this.moveElem(this.sliderWrapperElem,y,"px"),this.activeSubmenu=e,setTimeout(()=>{e.focusFirstElem(),u&&(i==null||i.deactivate())},this.options.transitionDuration)}getSlideLevel(){return Array.from(this.sliderWrapperElem.querySelectorAll("."+r.active)).length}getTargetMenuFromIdentifier(t){return this.slides.find(e=>e.matches(t))}getTargetMenuDynamically(){const t=location.pathname,e=location.hash,i=this.slides.find(l=>l.matches(e));return this.slides.find(l=>l.matches(t))??i}open(t=!0){const e=this.options.dynamicOpenTarget?this.getTargetMenuDynamically():this.defaultOpenTarget;e&&this.navigateTo(e),this.show(t)}initEventHandlers(){this.menuElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.sliderElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.options.closeOnClickOutside&&document.addEventListener("click",t=>{var e;this.isOpen&&!this.isAnimating&&!this.menuElem.contains(t.target)&&!((e=t.target)!=null&&e.closest("."+r.control))&&this.close()}),this.initKeybindings()}onTransitionEnd(t){t.target!==this.menuElem&&t.target!==this.sliderElem&&t.target!==this.foldableWrapperElem&&t.target!==this.sliderWrapperElem||(this.isAnimating=!1,this.lastAction&&(this.triggerEvent(this.lastAction,!0),this.lastAction=null))}initKeybindings(){document.addEventListener("keydown",t=>{const e=document.activeElement;switch(t.key){case this.options.keyClose:t.preventDefault(),this.close();break;case this.options.keyOpen:t.preventDefault(),this.show();break;case"Enter":e!=null&&e.classList.contains(r.decorator)&&e.click();break}})}triggerEvent(t,e=!1){this.lastAction=t;const i=`sm.${t}${e?"-after":""}`,a=new CustomEvent(i);this.menuElem.dispatchEvent(a)}markSelectedItem(t){this.menuElem.querySelectorAll("."+r.activeItem).forEach(e=>{e.classList.remove(r.activeItem)}),t.classList.add(r.activeItem)}moveElem(t,e,i="%"){setTimeout(()=>{e.toString().includes(i)||(e+=i);const a=`translateX(${e})`;t.style.transform!==a&&(this.isAnimating=!0,t.style.transform=a)},0)}initMenu(){this.runWithoutAnimation(()=>{switch(this.options.position){case E.Left:Object.assign(this.menuElem.style,{left:0,right:"auto",transform:"translateX(-100%)"});break;default:Object.assign(this.menuElem.style,{left:"auto",right:0});break}}),this.menuElem.classList.add(this.options.position);const t=this.menuElem.querySelector("ul");t&&this.slides.push(new f(t,this.options));const e=this.menuElem.querySelector(`.${r.controls} .${r.control}`);this.menuElem.addEventListener("keydown",i=>{var l,s;(((l=this.activeSubmenu)==null?void 0:l.getClosestNotFoldableSlide())??this.slides[0])&&_(i,((s=this.activeSubmenu)==null?void 0:s.menuElem)??this.menuElem,e)})}runWithoutAnimation(t){const e=[this.menuElem,this.sliderElem];e.forEach(i=>i.style.transition="none"),t(),this.menuElem.offsetHeight,e.forEach(i=>i.style.removeProperty("transition")),this.isAnimating=!1}initSlides(){var e;this.menuElem.querySelectorAll("a").forEach((i,a)=>{if(i.parentElement===null)return;const l=i.parentElement.querySelector("ul");if(!l)return;const s=new f(l,this.options,i);this.slides.push(s)}),this.slides.forEach(i=>{i.appendTo(this.sliderWrapperElem)});const t=this.menuElem.dataset.openTarget??"smdm-sm-no-default-provided";this.defaultOpenTarget=this.getTargetMenuFromIdentifier(t),this.activeSubmenu=((e=this.defaultOpenTarget)==null?void 0:e.activate())??this.slides[0].activate()}}document.addEventListener("click",n=>{if(!(n.target instanceof HTMLElement))return;const t=m=>m.classList.contains(r.control)||m.classList.contains(r.hasSubMenu)||m.classList.contains(r.decorator),e=t(n.target)?n.target:n.target.closest(`.${r.control}, .${r.hasSubMenu}, .${r.decorator}`);if(!e||!t(e))return;n.preventDefault();const i=e.getAttribute("data-target"),a=!i||i==="this"?S(e,`.${d}`):document.getElementById(i);if(!a)throw new Error(`Unable to find menu ${i}`);const l=a._slideMenu,s=e.getAttribute("data-action"),h=e.getAttribute("data-arg"),u={false:!1,true:!0,null:null,undefined:void 0},p=Object.keys(u).includes((h==null?void 0:h.toString())??"")?u[h]:h;l&&s&&typeof l[s]=="function"&&(p?l[s](p):l[s]())});window.SlideMenu=$;
