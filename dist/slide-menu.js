function A(l,e){if(l.parentElement===null)throw Error("`elem` has no parentElement");return l.parentElement.insertBefore(e,l),e.appendChild(l),l}function f(l,e,t){const n=[];for(;l&&l.parentElement!==null&&(t===void 0||n.length<t);)l instanceof HTMLElement&&l.matches(e)&&n.push(l),l=l.parentElement;return n}function S(l,e){const t=f(l,e,1);return t.length?t[0]:null}function p(l){if(!l)throw new Error("Element is not defined");return l.getBoundingClientRect().top}const h='a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';function v(l){var e;(e=l==null?void 0:l.querySelector(h))==null||e.focus()}function L(l,e,t,n){const s=e.querySelectorAll(h),o=t??s[0],a=s[s.length-1];(l.key==="Tab"||l.keyCode===9)&&(l.shiftKey?document.activeElement===o&&(a.focus(),l.preventDefault()):document.activeElement===a&&(o.focus(),l.preventDefault()))}const g={backLinkAfter:"",backLinkBefore:"",showBackLink:!0,keyClose:"Escape",keyOpen:"",position:"right",submenuLinkAfter:"",submenuLinkBefore:"",closeOnClickOutside:!1,onlyNavigateDecorator:!1,minWidthFold:640,transitionDuration:300,alignFoldTop:!1,dynamicOpenTarget:!1},i=class i{constructor(e,t){if(this.level=0,this.foldLevel=0,this.activeSubmenu=null,this.lastFocusedElement=null,this.isOpen=!1,this.isAnimating=!1,this.lastAction=null,this.defaultOpenTarget=null,e===null)throw new Error("Argument `elem` must be a valid HTML node");this.options=Object.assign({},g,t),this.menuElem=e,this.wrapperElem=document.createElement("div"),this.wrapperElem.classList.add(i.CLASSES.wrapper);const n=this.menuElem.querySelector("ul");n&&(n.classList.add(i.CLASSES.submenuWrapper),A(n,this.wrapperElem)),this.initMenu(),this.initSubmenus(),this.initEventHandlers(),this.menuElem._slideMenu=this}toggleVisibility(e,t=!0){var s;let n;if(e===void 0){this.isOpen?this.close(t):this.show(t);return}else e?(n=0,this.lastFocusedElement=document.activeElement,this.focusFirstElemInSubmenu(this.activeSubmenu)):(n=this.options.position==="left"?"-100%":"100%",setTimeout(()=>{this.menuElem.querySelectorAll("."+i.CLASSES.foldableSubmenu).forEach(o=>{o.classList.remove(i.CLASSES.active)})},this.options.transitionDuration),this.menuElem.classList.remove(i.CLASSES.foldOpen),this.foldLevel=0,(s=this.lastFocusedElement)==null||s.focus());if(this.isOpen=e,t)this.moveSlider(this.menuElem,n);else{const o=this.moveSlider.bind(this,this.menuElem,n);this.runWithoutAnimation(o)}}toggle(e=!0){if(this.isOpen){this.close(e);return}this.open(e)}show(e=!0){this.triggerEvent("open"),this.toggleVisibility(!0,e)}close(e=!0){this.triggerEvent("close"),this.toggleVisibility(!1,e)}back(e=!1){e&&this.closeFold(),this.navigate(-1)}closeFold(){this.menuElem.querySelectorAll(`.${i.CLASSES.foldableSubmenu}.${i.CLASSES.active}`).forEach(e=>{e.classList.remove(i.CLASSES.active)}),this.foldLevel=0,this.menuElem.classList.remove(i.CLASSES.foldOpen)}navigateTo(e){var o;if(this.triggerEvent("navigate"),this.isOpen||this.show(),typeof e=="string"){const a=document.querySelector(e);if(a instanceof HTMLElement)e=a;else throw new Error("Invalid parameter `target`. A valid query selector is required.")}e=((o=this.getNextSubmenu(e))==null?void 0:o.querySelector("a"))??e,Array.from(this.wrapperElem.querySelectorAll(`.${i.CLASSES.active}`)).forEach(a=>{a.classList.remove(i.CLASSES.active)});const n=f(e,"ul"),s=n.length-1;this.activeSubmenu=this.getParentSubmenuOfAnchor(e),this.setTabIndex(this.activeSubmenu,!1),s>=0&&s!==this.level&&(this.level=s,this.moveSlider(this.wrapperElem,-this.level*100)),n.forEach(a=>{a.classList.add(i.CLASSES.active)}),setTimeout(()=>{e==null||e.focus()},this.options.transitionDuration)}open(e=!0){if(this.options.dynamicOpenTarget){const t=location.pathname,n=location.hash,s=Array.from(this.menuElem.querySelectorAll("a")).find(u=>u.href.includes(n)),a=Array.from(this.menuElem.querySelectorAll("a")).find(u=>u.href.includes(t))??s;if(a){this.navigateTo(a);return}}if(this.defaultOpenTarget){this.navigateTo(this.defaultOpenTarget);return}this.show(e)}initEventHandlers(){if(this.options.onlyNavigateDecorator){const e=Array.from(this.menuElem.querySelectorAll("."+i.CLASSES.decorator)),t=n=>{var a;const s=n.target,o=(a=s==null?void 0:s.parentElement)!=null&&a.matches("a")?s==null?void 0:s.parentElement:S(s==null?void 0:s.parentElement,"a");o&&!s.dataset.action&&this.navigate(1,o)};e.forEach(n=>{n.addEventListener("click",t),n.addEventListener("keydown",s=>{s.key==="Enter"&&t(s)})})}else Array.from(this.menuElem.querySelectorAll("."+i.CLASSES.hasSubMenu)).forEach(t=>{t.addEventListener("click",n=>{const s=n.target,o=s.matches("a")?s:S(s,"a");o&&!s.dataset.action&&this.navigate(1,o)})});this.menuElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.wrapperElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.options.closeOnClickOutside&&document.addEventListener("click",e=>{var t;this.isOpen&&!this.isAnimating&&!this.menuElem.contains(e.target)&&!((t=e.target)!=null&&t.closest("."+i.CLASSES.control))&&this.close()}),this.initKeybindings(),this.initSubmenuVisibility()}onTransitionEnd(e){e.target!==this.menuElem&&e.target!==this.wrapperElem||(this.isAnimating=!1,this.lastAction&&(this.triggerEvent(this.lastAction,!0),this.lastAction=null))}initKeybindings(){document.addEventListener("keydown",e=>{switch(e.key){case this.options.keyClose:this.close();break;case this.options.keyOpen:this.show();break;default:return}e.preventDefault()})}initSubmenuVisibility(){this.menuElem.addEventListener("sm.back-after",()=>{const e=`.${i.CLASSES.active} `.repeat(this.level+1),t=this.menuElem.querySelector(`ul ${e}`);t&&t.classList.remove(i.CLASSES.active)})}triggerEvent(e,t=!1){this.lastAction=e;const n=`sm.${e}${t?"-after":""}`,s=new CustomEvent(n);this.menuElem.dispatchEvent(s)}navigate(e=1,t){var r,m,d;if(this.isAnimating||e===-1&&this.level===0)return;const n=(this.level+e)*-100,s=window.innerWidth>=this.options.minWidthFold&&((t==null?void 0:t.classList.contains(i.CLASSES.hasFoldableSubmenu))??this.foldLevel>0);this.menuElem.classList.remove(i.CLASSES.foldOpen);const o=this.getNextSubmenu(t),a=this.getPreviousSubmenu(this.activeSubmenu);t&&o&&e===1?(this.markSelectedItem(t),s?((r=this.activeSubmenu)!=null&&r.classList.contains(i.CLASSES.foldableSubmenu)&&this.activeSubmenu!==this.getPreviousSubmenu(o)&&((m=this.activeSubmenu)==null||m.classList.remove(i.CLASSES.active),this.foldLevel--),this.positionFoldableSubmenu(o)):o.style.left="100%",this.activeSubmenu=o):a&&e===-1&&(this.activeSubmenu=a),this.setTabIndex(this.activeSubmenu,s),(d=this.activeSubmenu)==null||d.classList.add(i.CLASSES.active);const u=e===1?"forward":"back";this.triggerEvent(u),s?(this.foldLevel+=e,this.foldLevel>0&&this.menuElem.classList.add(i.CLASSES.foldOpen)):(this.level+=e,this.moveSlider(this.wrapperElem,n)),setTimeout(()=>{var E;this.focusFirstElemInSubmenu(this.activeSubmenu),(E=this.activeSubmenu)==null||E.querySelectorAll("."+i.CLASSES.active).forEach(b=>{b.classList.remove(i.CLASSES.active)})},this.options.transitionDuration)}getParentSubmenuOfAnchor(e){return e.closest("ul")}getPreviousSubmenu(e){var t;return(t=e==null?void 0:e.parentElement)==null?void 0:t.closest("ul")}getNextSubmenu(e){var t;return(t=e==null?void 0:e.parentElement)==null?void 0:t.querySelector("ul")}getClosestNotFoldableMenu(e){return e==null?void 0:e.closest(`ul:not(.${i.CLASSES.foldableSubmenu})`)}markSelectedItem(e){this.menuElem.querySelectorAll("."+i.CLASSES.activeItem).forEach(t=>{t.classList.remove(i.CLASSES.activeItem)}),e.classList.add(i.CLASSES.activeItem)}setTabIndex(e,t){var s;console.log(t),(s=this.wrapperElem)==null||s.querySelectorAll(h).forEach(o=>{o.setAttribute("tabindex","-1")});const n=t?this.getClosestNotFoldableMenu(e):this.activeSubmenu;n&&n.querySelectorAll(h).forEach(o=>{o.setAttribute("tabindex","0")})}focusFirstElemInSubmenu(e){v(e)}positionFoldableSubmenu(e){e.style.left=this.options.position==="left"?"100%":"-100%";const t=p(e);this.options.alignFoldTop&&t>0&&(e.style.top=`-${t}px`,e.classList.add(i.CLASSES.foldableSubmenuAlignTop))}moveSlider(e,t){t.toString().includes("%")||(t+="%"),e.style.transform=`translateX(${t})`,this.isAnimating=!0}initMenu(){this.runWithoutAnimation(()=>{switch(this.options.position){case"left":Object.assign(this.menuElem.style,{left:0,right:"auto",transform:"translateX(-100%)"});break;default:Object.assign(this.menuElem.style,{left:"auto",right:0});break}}),this.menuElem.style.display="block",this.menuElem.querySelectorAll("a").forEach(n=>{n.classList.add(i.CLASSES.item),n.setAttribute("tabindex","0")});const e=this.menuElem.dataset.openTarget??"smdm-sm-no-default-provided";this.defaultOpenTarget=this.menuElem.querySelector(`a[href="${e}"]`)??this.menuElem.querySelector(e);const t=this.menuElem.querySelector(`.${i.CLASSES.controls}  .${i.CLASSES.control}`);this.menuElem.addEventListener("keydown",n=>{console.log(this.activeSubmenu,t);const s=this.foldLevel>0?this.getClosestNotFoldableMenu(this.activeSubmenu):this.activeSubmenu;s&&L(n,s,t)})}runWithoutAnimation(e){const t=[this.menuElem,this.wrapperElem];t.forEach(n=>n.style.transition="none"),e(),this.menuElem.offsetHeight,t.forEach(n=>n.style.removeProperty("transition")),this.isAnimating=!1}initSubmenus(){this.menuElem.querySelectorAll("a").forEach(e=>{var o;if(e.parentElement===null)return;const t=e.parentElement.querySelector("ul");if(!t)return;const n=e.textContent;if(this.addLinkDecorators(e),e.classList.add(i.CLASSES.hasSubMenu),t.classList.add(i.CLASSES.submenu),e.classList.contains(i.CLASSES.hasFoldableSubmenu)&&t.classList.add(i.CLASSES.foldableSubmenu),this.options.onlyNavigateDecorator?(o=e.querySelector("."+i.CLASSES.decorator))==null||o.addEventListener("click",a=>{a.preventDefault()}):e.addEventListener("click",a=>{a.preventDefault()}),this.options.showBackLink){const{backLinkBefore:a,backLinkAfter:u}=this.options,r=document.createElement("a");r.innerHTML=a+n+u,r.classList.add(i.CLASSES.backlink,i.CLASSES.control,i.CLASSES.item),r.setAttribute("data-action","back"),r.setAttribute("tabindex","0"),r.setAttribute("href","#");const m=document.createElement("li");m.appendChild(r),t.insertBefore(m,t.firstChild)}}),this.activeSubmenu=this.menuElem.querySelector("ul")}addLinkDecorators(e){const{submenuLinkBefore:t,submenuLinkAfter:n}=this.options;if(t){const s=document.createElement("span");s.classList.add(i.CLASSES.decorator),s.innerHTML=t,this.options.onlyNavigateDecorator&&s.setAttribute("tabindex","0"),e.insertBefore(s,e.firstChild)}if(n){const s=document.createElement("span");s.classList.add(i.CLASSES.decorator),s.innerHTML=n,this.options.onlyNavigateDecorator&&s.setAttribute("tabindex","0"),e.appendChild(s)}return e}};i.NAMESPACE="slide-menu",i.CLASSES={active:`${i.NAMESPACE}__submenu--active`,backlink:`${i.NAMESPACE}__backlink`,control:`${i.NAMESPACE}__control`,controls:`${i.NAMESPACE}__controls`,decorator:`${i.NAMESPACE}__decorator`,wrapper:`${i.NAMESPACE}__slider`,item:`${i.NAMESPACE}__item`,submenu:`${i.NAMESPACE}__submenu`,submenuWrapper:`${i.NAMESPACE}__submenu__wrapper`,hasSubMenu:`${i.NAMESPACE}__item--has-submenu`,activeItem:`${i.NAMESPACE}__item--active`,hasFoldableSubmenu:`${i.NAMESPACE}__item--has-foldable-submenu`,foldableSubmenu:`${i.NAMESPACE}__submenu--foldable`,foldableSubmenuAlignTop:`${i.NAMESPACE}__submenu--foldable-align-top`,foldOpen:`${i.NAMESPACE}--fold-open`};let c=i;document.addEventListener("click",l=>{if(!(l.target instanceof HTMLElement))return;const e=l.target.className.includes(c.CLASSES.control)?l.target:S(l.target,`.${c.CLASSES.control}`);if(!e||!e.className.includes(c.CLASSES.control))return;const t=e.getAttribute("data-target"),n=!t||t==="this"?S(e,`.${c.NAMESPACE}`):document.getElementById(t);if(!n)throw new Error(`Unable to find menu ${t}`);const s=n._slideMenu,o=e.getAttribute("data-action"),a=e.getAttribute("data-arg"),u={false:!1,true:!0,null:null,undefined:void 0},r=Object.keys(u).includes((a==null?void 0:a.toString())??"")?u[a]:a;s&&o&&typeof s[o]=="function"&&(r?s[o](r):s[o]())});window.SlideMenu=c;
