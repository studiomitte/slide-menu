function A(a,e){if(a.parentElement===null)throw Error("`elem` has no parentElement");return a.parentElement.insertBefore(e,a),e.appendChild(a),a}function E(a,e,t){const n=[];for(;a&&a.parentElement!==null&&(t===void 0||n.length<t);)a instanceof HTMLElement&&a.matches(e)&&n.push(a),a=a.parentElement;return n}function h(a,e){const t=E(a,e,1);return t.length?t[0]:null}function b(a){if(!a)throw new Error("Element is not defined");return a.getBoundingClientRect().top}const L={backLinkAfter:"",backLinkBefore:"",showBackLink:!0,keyClose:"Escape",keyOpen:"",position:"right",submenuLinkAfter:"",submenuLinkBefore:"",closeOnClickOutside:!1,onlyNavigateDecorator:!1,minWidthFold:640,transitionDuration:300,alignFoldTop:!1,dynamicOpenDefault:!1},i=class i{constructor(e,t){if(this.level=0,this.foldLevel=0,this.activeSubmenu=null,this.lastFocusedElement=null,this.isOpen=!1,this.isAnimating=!1,this.lastAction=null,this.defaultOpenTarget=null,e===null)throw new Error("Argument `elem` must be a valid HTML node");this.options=Object.assign({},L,t),this.menuElem=e,this.wrapperElem=document.createElement("div"),this.wrapperElem.classList.add(i.CLASS_NAMES.wrapper);const n=this.menuElem.querySelector("ul");n&&A(n,this.wrapperElem),this.initMenu(),this.initSubmenus(),this.initEventHandlers(),this.menuElem._slideMenu=this}toggle(e,t=!0){var s;let n;if(e===void 0){this.isOpen?this.close(t):this.show(t);return}else e?(n=0,this.lastFocusedElement=document.activeElement,this.focusFirstElemInSubmenu(this.activeSubmenu)):(n=this.options.position==="left"?"-100%":"100%",this.menuElem.querySelectorAll("."+i.CLASS_NAMES.foldableSubmenu).forEach(l=>{l.classList.remove(i.CLASS_NAMES.active)}),this.menuElem.classList.remove(i.CLASS_NAMES.foldOpen),this.foldLevel=0,(s=this.lastFocusedElement)==null||s.focus());if(this.isOpen=e,t)this.moveSlider(this.menuElem,n);else{const l=this.moveSlider.bind(this,this.menuElem,n);this.runWithoutAnimation(l)}}show(e=!0){this.triggerEvent("open"),this.toggle(!0,e)}close(e=!0){this.triggerEvent("close"),this.toggle(!1,e)}back(e=!1){e&&this.closeFold(),this.navigate(-1)}closeFold(){this.menuElem.querySelectorAll(`.${i.CLASS_NAMES.foldableSubmenu}.${i.CLASS_NAMES.active}`).forEach(e=>{e.classList.remove(i.CLASS_NAMES.active)}),this.foldLevel=0,this.menuElem.classList.remove(i.CLASS_NAMES.foldOpen)}navigateTo(e){var l;if(this.triggerEvent("navigate"),this.isOpen||this.show(),typeof e=="string"){const o=document.querySelector(e);if(o instanceof HTMLElement)e=o;else throw new Error("Invalid parameter `target`. A valid query selector is required.")}e=((l=this.getNextSubmenu(e))==null?void 0:l.querySelector("a"))??e,Array.from(this.wrapperElem.querySelectorAll(`.${i.CLASS_NAMES.active}`)).forEach(o=>{o.classList.remove(i.CLASS_NAMES.active)});const n=E(e,"ul"),s=n.length-1;this.activeSubmenu=this.getParentSubmenuOfAnchor(e),this.setTabIndex(this.activeSubmenu,!1),s>=0&&s!==this.level&&(this.level=s,this.moveSlider(this.wrapperElem,-this.level*100)),n.forEach(o=>{o.classList.add(i.CLASS_NAMES.active)}),setTimeout(()=>{e==null||e.focus()},this.options.transitionDuration)}open(e=!0){if(this.options.dynamicOpenDefault){const t=location.pathname,n=location.hash,s=Array.from(this.menuElem.querySelectorAll("a")).find(u=>u.href.includes(n)),o=Array.from(this.menuElem.querySelectorAll("a")).find(u=>u.href.includes(t))??s;if(o){this.navigateTo(o);return}}if(this.defaultOpenTarget){this.navigateTo(this.defaultOpenTarget);return}this.show(e)}initEventHandlers(){if(this.options.onlyNavigateDecorator){const e=Array.from(this.menuElem.querySelectorAll("."+i.CLASS_NAMES.decorator)),t=n=>{var o;const s=n.target,l=(o=s==null?void 0:s.parentElement)!=null&&o.matches("a")?s==null?void 0:s.parentElement:h(s==null?void 0:s.parentElement,"a");l&&!s.dataset.action&&this.navigate(1,l)};e.forEach(n=>{n.addEventListener("click",t),n.addEventListener("keydown",s=>{s.key==="Enter"&&t(s)})})}else Array.from(this.menuElem.querySelectorAll("."+i.CLASS_NAMES.hasSubMenu)).forEach(t=>{t.addEventListener("click",n=>{const s=n.target,l=s.matches("a")?s:h(s,"a");l&&!s.dataset.action&&this.navigate(1,l)})});this.menuElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.wrapperElem.addEventListener("transitionend",this.onTransitionEnd.bind(this)),this.options.closeOnClickOutside&&document.addEventListener("click",e=>{var t,n;this.isOpen&&!this.isAnimating&&!this.menuElem.contains(e.target)&&!((n=(t=e.target)==null?void 0:t.classList)!=null&&n.contains(i.CLASS_NAMES.control))&&this.close()}),this.initKeybindings(),this.initSubmenuVisibility()}onTransitionEnd(e){e.target!==this.menuElem&&e.target!==this.wrapperElem||(this.isAnimating=!1,this.lastAction&&(this.triggerEvent(this.lastAction,!0),this.lastAction=null))}initKeybindings(){document.addEventListener("keydown",e=>{switch(e.key){case this.options.keyClose:this.close();break;case this.options.keyOpen:this.show();break;default:return}e.preventDefault()})}initSubmenuVisibility(){this.menuElem.addEventListener("sm.back-after",()=>{const e=`.${i.CLASS_NAMES.active} `.repeat(this.level+1),t=this.menuElem.querySelector(`ul ${e}`);t&&t.classList.remove(i.CLASS_NAMES.active)})}triggerEvent(e,t=!1){this.lastAction=e;const n=`sm.${e}${t?"-after":""}`,s=new CustomEvent(n);this.menuElem.dispatchEvent(s)}navigate(e=1,t){var r,m,S;if(this.isAnimating||e===-1&&this.level===0)return;const n=(this.level+e)*-100,s=window.innerWidth>=this.options.minWidthFold&&((t==null?void 0:t.classList.contains(i.CLASS_NAMES.hasFoldableSubmenu))??this.foldLevel>0);this.menuElem.classList.remove(i.CLASS_NAMES.foldOpen);const l=this.getNextSubmenu(t),o=this.getPreviousSubmenu(this.activeSubmenu);t&&l&&e===1?(this.markSelectedItem(t),s?((r=this.activeSubmenu)!=null&&r.classList.contains(i.CLASS_NAMES.foldableSubmenu)&&this.activeSubmenu!==this.getPreviousSubmenu(l)&&((m=this.activeSubmenu)==null||m.classList.remove(i.CLASS_NAMES.active),this.foldLevel--),this.positionFoldableSubmenu(l)):l.style.left="100%",this.activeSubmenu=l):o&&e===-1&&(this.activeSubmenu=o),this.setTabIndex(this.activeSubmenu,s),(S=this.activeSubmenu)==null||S.classList.add(i.CLASS_NAMES.active);const u=e===1?"forward":"back";this.triggerEvent(u),s?(this.foldLevel+=e,console.log(this.foldLevel),this.foldLevel>0&&this.menuElem.classList.add(i.CLASS_NAMES.foldOpen)):(this.level+=e,this.moveSlider(this.wrapperElem,n)),setTimeout(()=>{var d;this.focusFirstElemInSubmenu(this.activeSubmenu),(d=this.activeSubmenu)==null||d.querySelectorAll("."+i.CLASS_NAMES.active).forEach(f=>{f.classList.remove(i.CLASS_NAMES.active)})},this.options.transitionDuration)}getParentSubmenuOfAnchor(e){return e.closest("ul")}getPreviousSubmenu(e){var t;return(t=e==null?void 0:e.parentElement)==null?void 0:t.closest("ul")}getNextSubmenu(e){var t;return(t=e==null?void 0:e.parentElement)==null?void 0:t.querySelector("ul")}markSelectedItem(e){this.menuElem.querySelectorAll("."+i.CLASS_NAMES.activeItem).forEach(t=>{t.classList.remove(i.CLASS_NAMES.activeItem)}),e.classList.add(i.CLASS_NAMES.activeItem)}setTabIndex(e,t){const n=`a, .${i.CLASS_NAMES.decorator}[tabindex]`;if(!t&&e){const s=this.getPreviousSubmenu(e);s==null||s.querySelectorAll(n).forEach(l=>{l.setAttribute("tabindex","-1")})}e==null||e.querySelectorAll(n).forEach(s=>{s.setAttribute("tabindex","0")})}focusFirstElemInSubmenu(e){var n;(n=e==null?void 0:e.querySelector('a[href][tabindex]:not([tabindex="-1"])'))==null||n.focus()}positionFoldableSubmenu(e){e.style.left=this.options.position==="left"?"100%":"-100%";const t=b(e);this.options.alignFoldTop&&t>0&&(e.style.top=`-${t}px`,e.classList.add(i.CLASS_NAMES.foldableSubmenuAlignTop))}moveSlider(e,t){t.toString().includes("%")||(t+="%"),e.style.transform=`translateX(${t})`,this.isAnimating=!0}initMenu(){this.runWithoutAnimation(()=>{switch(this.options.position){case"left":Object.assign(this.menuElem.style,{left:0,right:"auto",transform:"translateX(-100%)"});break;default:Object.assign(this.menuElem.style,{left:"auto",right:0});break}}),this.menuElem.style.display="block",this.menuElem.querySelectorAll("a").forEach(t=>{t.classList.add(i.CLASS_NAMES.item),t.setAttribute("tabindex","0")});const e=this.menuElem.dataset.openTarget??"smdm-sm-no-default-provided";this.defaultOpenTarget=this.menuElem.querySelector(`a[href="${e}"]`)??this.menuElem.querySelector(e)}runWithoutAnimation(e){const t=[this.menuElem,this.wrapperElem];t.forEach(n=>n.style.transition="none"),e(),this.menuElem.offsetHeight,t.forEach(n=>n.style.removeProperty("transition")),this.isAnimating=!1}initSubmenus(){this.menuElem.querySelectorAll("a").forEach(e=>{var l;if(e.parentElement===null)return;const t=e.parentElement.querySelector("ul");if(!t)return;const n=e.textContent;if(this.addLinkDecorators(e),e.classList.add(i.CLASS_NAMES.hasSubMenu),t.classList.add(i.CLASS_NAMES.submenu),e.classList.contains(i.CLASS_NAMES.hasFoldableSubmenu)&&t.classList.add(i.CLASS_NAMES.foldableSubmenu),this.options.onlyNavigateDecorator?(l=e.querySelector("."+i.CLASS_NAMES.decorator))==null||l.addEventListener("click",o=>{o.preventDefault()}):e.addEventListener("click",o=>{o.preventDefault()}),this.options.showBackLink){const{backLinkBefore:o,backLinkAfter:u}=this.options,r=document.createElement("a");r.innerHTML=o+n+u,r.classList.add(i.CLASS_NAMES.backlink,i.CLASS_NAMES.control,i.CLASS_NAMES.item),r.setAttribute("data-action","back"),r.setAttribute("tabindex","0"),r.setAttribute("href","#");const m=document.createElement("li");m.appendChild(r),t.insertBefore(m,t.firstChild)}}),this.activeSubmenu=this.menuElem.querySelector("ul")}addLinkDecorators(e){const{submenuLinkBefore:t,submenuLinkAfter:n}=this.options;if(t){const s=document.createElement("span");s.classList.add(i.CLASS_NAMES.decorator),s.innerHTML=t,this.options.onlyNavigateDecorator&&s.setAttribute("tabindex","0"),e.insertBefore(s,e.firstChild)}if(n){const s=document.createElement("span");s.classList.add(i.CLASS_NAMES.decorator),s.innerHTML=n,this.options.onlyNavigateDecorator&&s.setAttribute("tabindex","0"),e.appendChild(s)}return e}};i.NAMESPACE="slide-menu",i.CLASS_NAMES={active:`${i.NAMESPACE}__submenu--active`,backlink:`${i.NAMESPACE}__backlink`,control:`${i.NAMESPACE}__control`,decorator:`${i.NAMESPACE}__decorator`,wrapper:`${i.NAMESPACE}__slider`,item:`${i.NAMESPACE}__item`,submenu:`${i.NAMESPACE}__submenu`,hasSubMenu:`${i.NAMESPACE}__item--has-submenu`,activeItem:`${i.NAMESPACE}__item--active`,hasFoldableSubmenu:`${i.NAMESPACE}__item--has-foldable-submenu`,foldableSubmenu:`${i.NAMESPACE}__submenu--foldable`,foldableSubmenuAlignTop:`${i.NAMESPACE}__submenu--foldable-align-top`,foldOpen:`${i.NAMESPACE}--fold-open`};let c=i;document.addEventListener("click",a=>{if(!(a.target instanceof HTMLElement))return;const e=a.target.className.includes(c.CLASS_NAMES.control)?a.target:h(a.target,`.${c.CLASS_NAMES.control}`);if(!e||!e.className.includes(c.CLASS_NAMES.control))return;const t=e.getAttribute("data-target"),n=!t||t==="this"?h(e,`.${c.NAMESPACE}`):document.getElementById(t);if(!n)throw new Error(`Unable to find menu ${t}`);const s=n._slideMenu,l=e.getAttribute("data-action"),o=e.getAttribute("data-arg");s&&l&&typeof s[l]=="function"&&(o?s[l](o):s[l]())});window.SlideMenu=c;
