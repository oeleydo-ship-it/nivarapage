/**
 * Stylesheet shared by the builder canvas and the published renderer.
 *
 * Blocks are laid out with container queries (not viewport media queries) so the
 * builder's device-preview widths produce exactly the same layout the published
 * site shows at that width.
 */
export const blockCss = `
[data-page-renderer]{container-name:udpage;position:relative;}
/* Size containment on the page root makes descendant sticky headers stick to the page box, which scrolls away. Keep query containers on each section instead. */
[data-page-renderer] > *{container-type:inline-size;container-name:udpage;}
[data-page-renderer][data-surface-pattern="lines"]::before{content:"";pointer-events:none;position:absolute;inset:0;z-index:1;background-image:repeating-linear-gradient(0deg,transparent 0 63px,color-mix(in srgb,var(--color-primary,#8b5cf6) 10%,transparent) 64px);opacity:.55;}
[data-page-renderer][data-surface-pattern="lines"] > *{position:relative;z-index:2;}
[data-page-renderer][data-surface-pattern="lines"] > .ud-sticky-header.ud-sticky-header{position:sticky;z-index:80;}
.ud-sticky-header.ud-sticky-header{position:sticky;top:0;z-index:80;}

.ud-section{position:relative;padding-block:var(--ud-pt,var(--section-spacing,80px)) var(--ud-pb,var(--section-spacing,80px));min-height:var(--ud-min-height,auto);background:var(--ud-bg,var(--color-background,#fff));color:var(--ud-fg,var(--color-text,#0f172a));font-family:var(--font-body,system-ui,sans-serif);font-size:var(--ud-body-size,1rem);font-weight:var(--font-body-weight,400);border:var(--ud-border-width,0) solid var(--ud-border-color,transparent);border-radius:var(--ud-section-radius,0);box-shadow:var(--ud-section-shadow,none);overflow:var(--ud-overflow,hidden);isolation:isolate;}
.ud-section--bleed{padding-inline:0;}
.ud-section__overlay{position:absolute;inset:0;z-index:-1;}

/* Image display settings. Every rule is behind its own data attribute, set only
   when that group of fields has been used, so an untouched block is unaffected. */
.ud-section[data-img-fit] img{object-fit:var(--ud-img-fit,cover);object-position:var(--ud-img-pos,50% 50%);}
.ud-section[data-img-box] img{aspect-ratio:var(--ud-img-aspect,auto);max-height:var(--ud-img-max-h,none);width:100%;height:auto;}
.ud-section[data-img-box][data-img-fit] img{height:100%;}
.ud-section[data-img-edge] img{border-radius:var(--ud-img-radius,0);border:var(--ud-img-border-w,0) solid var(--ud-img-border-c,transparent);}
.ud-section[data-img-fx] img{filter:var(--ud-img-filter,none);box-shadow:var(--ud-img-tint,none);}
.ud-anim{animation-duration:var(--ud-anim-duration,.7s);animation-delay:var(--ud-anim-delay,0s);animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both;}
.ud-anim-fade{animation-name:ud-fade;}
.ud-anim-fade-up{animation-name:ud-fade-up;}
.ud-anim-fade-down{animation-name:ud-fade-down;}
.ud-anim-fade-left{animation-name:ud-fade-left;}
.ud-anim-fade-right{animation-name:ud-fade-right;}
.ud-anim-zoom-in{animation-name:ud-zoom-in;}
.ud-anim-slide-up{animation-name:ud-slide-up;}
.ud-anim[data-ud-anim="scroll"]:not(.ud-anim-in){animation:none;opacity:0;}
@keyframes ud-fade{from{opacity:0}to{opacity:1}}
@keyframes ud-fade-up{from{opacity:0;transform:translate3d(0,28px,0)}to{opacity:1;transform:none}}
@keyframes ud-fade-down{from{opacity:0;transform:translate3d(0,-28px,0)}to{opacity:1;transform:none}}
@keyframes ud-fade-left{from{opacity:0;transform:translate3d(32px,0,0)}to{opacity:1;transform:none}}
@keyframes ud-fade-right{from{opacity:0;transform:translate3d(-32px,0,0)}to{opacity:1;transform:none}}
@keyframes ud-zoom-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
@keyframes ud-slide-up{from{opacity:0;transform:translate3d(0,56px,0)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  .ud-anim{animation:none!important;opacity:1!important;transform:none!important;}
}
.ud-container{position:relative;width:100%;max-width:var(--ud-max,var(--container-width,1120px));margin-inline:auto;padding-inline:var(--ud-px,clamp(20px,4cqi,40px));}

.ud-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ud-accent,var(--color-primary,#2563eb));margin:0 0 14px;}
.ud-h1,.ud-h2,.ud-h3,.ud-h4{font-family:var(--font-heading,system-ui,sans-serif);font-weight:var(--font-heading-weight,700);color:var(--ud-heading,var(--ud-fg,var(--color-text,#0f172a)));letter-spacing:-.025em;line-height:1.1;margin:0;text-wrap:balance;}
.ud-h1{font-size:var(--ud-heading-size,clamp(2.1rem,4.4cqi + .7rem,3.75rem));}
.ud-h2{font-size:var(--ud-heading-size,clamp(1.65rem,2.4cqi + .85rem,2.6rem));}
.ud-h3{font-size:clamp(1.15rem,1cqi + .85rem,1.5rem);line-height:1.25;}
.ud-h4{font-size:1.05rem;line-height:1.3;letter-spacing:-.01em;}
.ud-lead{font-size:var(--ud-body-size,clamp(1rem,.55cqi + .9rem,1.2rem));line-height:1.65;color:var(--ud-muted,var(--color-muted,#64748b));margin:16px 0 0;}
.ud-text{font-size:var(--ud-body-size,inherit);color:var(--ud-muted,var(--color-muted,#64748b));line-height:1.7;margin:10px 0 0;}
.ud-small{font-size:.875rem;color:var(--ud-muted,var(--color-muted,#64748b));}
.ud-head{max-width:720px;}
.ud-head--center{margin-inline:auto;text-align:center;}
.ud-head + .ud-body{margin-top:clamp(32px,3cqi,56px);}

.ud-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 24px;border-radius:var(--radius-button,8px);font-family:var(--font-body,system-ui,sans-serif);font-weight:600;font-size:.95rem;line-height:1;text-decoration:none;border:1px solid transparent;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,background .16s ease,color .16s ease;}
.ud-btn:hover{transform:translateY(-1px);}
.ud-btn--primary{background:var(--color-primary,#2563eb);color:#fff;box-shadow:0 8px 20px -8px color-mix(in srgb,var(--color-primary,#2563eb) 65%,transparent);}
.ud-btn--secondary{background:var(--color-secondary,#0f172a);color:#fff;}
.ud-btn--accent{background:var(--color-accent,#f59e0b);color:#111;}
.ud-btn--outline{background:transparent;color:var(--ud-fg,var(--color-text,#0f172a));border-color:color-mix(in srgb,var(--ud-fg,#0f172a) 24%,transparent);}
.ud-btn--outline:hover{background:color-mix(in srgb,var(--ud-fg,#0f172a) 6%,transparent);}
.ud-btn--ghost{background:transparent;color:var(--ud-fg,var(--color-text,#0f172a));padding-inline:8px;}
.ud-btn--ghost:hover{color:var(--color-primary,#2563eb);}
.ud-btn--light{background:#fff;color:#0f172a;}
.ud-btn--link{background:transparent;padding:0;color:var(--color-primary,#2563eb);}
.ud-btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;}
.ud-head--center .ud-btns,.ud-center .ud-btns{justify-content:center;}
.ud-right .ud-btns{justify-content:flex-end;}

.ud-grid{display:grid;gap:var(--ud-gap,24px);grid-template-columns:repeat(var(--ud-cols-now,var(--ud-cols,3)),minmax(0,1fr));}
.ud-split{display:grid;gap:clamp(28px,4cqi,64px);grid-template-columns:var(--ud-split,1.02fr .98fr);align-items:center;}
.ud-split--reverse > .ud-split__media{order:-1;}
.ud-stack{display:grid;gap:var(--ud-gap,16px);}
.ud-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--ud-gap,16px);}
.ud-between{justify-content:space-between;}
.ud-center{text-align:center;}
.ud-right{text-align:right;}

.ud-card{background:var(--ud-card,var(--color-surface,#f8fafc));border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 8%,transparent);border-radius:var(--radius-card,12px);padding:clamp(20px,2cqi,28px);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;}
.ud-card--hover:hover{transform:translateY(-3px);box-shadow:0 18px 40px -24px color-mix(in srgb,var(--ud-fg,#0f172a) 55%,transparent);border-color:color-mix(in srgb,var(--color-primary,#2563eb) 34%,transparent);}
.ud-card--flat{background:transparent;border-color:transparent;padding:0;}
.ud-card--outline{background:transparent;}
.ud-card--featured{border-width:2px;border-color:var(--color-primary,#2563eb);box-shadow:0 24px 60px -30px color-mix(in srgb,var(--color-primary,#2563eb) 60%,transparent);}
.ud-card--glow{box-shadow:0 30px 70px -28px color-mix(in srgb,var(--color-primary,#8b5cf6) 58%,transparent);border-color:color-mix(in srgb,var(--color-primary,#8b5cf6) 34%,transparent);background:linear-gradient(180deg,color-mix(in srgb,var(--color-primary,#8b5cf6) 10%,var(--ud-card,var(--color-surface))) 0%,var(--ud-card,var(--color-surface)) 42%);}

.ud-icon{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:calc(var(--radius-card,12px) * .8);background:color-mix(in srgb,var(--color-primary,#2563eb) 14%,transparent);color:var(--color-primary,#2563eb);flex:none;}
.ud-icon svg{width:24px;height:24px;}
.ud-icon--solid{background:var(--color-primary,#2563eb);color:#fff;}
.ud-icon--round{border-radius:999px;}
.ud-icon--sm{width:36px;height:36px;}
.ud-icon--sm svg{width:18px;height:18px;}
.ud-icon--lg{width:60px;height:60px;}
.ud-icon--lg svg{width:30px;height:30px;}
.ud-icon--plain{background:transparent;width:auto;height:auto;}

.ud-media{display:block;width:100%;height:100%;object-fit:cover;border-radius:var(--radius-card,12px);}
.ud-media-box{position:relative;overflow:hidden;border-radius:var(--radius-card,12px);background:linear-gradient(135deg,color-mix(in srgb,var(--color-primary,#2563eb) 22%,var(--color-surface,#f8fafc)),color-mix(in srgb,var(--color-accent,#f59e0b) 16%,var(--color-surface,#f8fafc)));}
.ud-media-box > img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.ud-media-box--zoom > img{transition:transform .4s ease;}
.ud-media-box--zoom:hover > img{transform:scale(1.05);}

.ud-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-size:12px;font-weight:600;background:color-mix(in srgb,var(--color-primary,#2563eb) 12%,transparent);color:var(--color-primary,#2563eb);}
.ud-badge--solid{background:var(--color-primary,#2563eb);color:#fff;}
.ud-pill{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);background:color-mix(in srgb,var(--ud-fg,#0f172a) 4%,transparent);font-size:13px;}

.ud-list{list-style:none;margin:0;padding:0;display:grid;gap:12px;}
.ud-list li{display:flex;align-items:flex-start;gap:10px;line-height:1.55;}
.ud-list svg{width:18px;height:18px;flex:none;margin-top:2px;color:var(--color-primary,#2563eb);}
.ud-list--pills li svg{width:12px;height:12px;margin-top:1px;padding:4px;border-radius:999px;background:var(--color-primary,#2563eb);color:#fff;box-sizing:content-box;}
.ud-divide > * + *{border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 10%,transparent);}

.ud-nav{position:relative;z-index:5;}
.ud-nav__bar{display:flex;align-items:center;gap:clamp(16px,2cqi,40px);min-height:76px;}
.ud-nav__logo{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-heading,system-ui,sans-serif);font-weight:700;font-size:1.15rem;color:var(--ud-fg,var(--color-text));text-decoration:none;letter-spacing:-.02em;}
.ud-nav__links{display:flex;align-items:center;gap:clamp(14px,1.8cqi,28px);flex-wrap:wrap;}
.ud-nav__link{position:relative;color:var(--ud-fg,var(--color-text));text-decoration:none;font-size:.95rem;font-weight:500;opacity:.78;transition:opacity .15s ease,color .15s ease;}
.ud-nav__link:hover{opacity:1;color:var(--color-primary,#2563eb);}
.ud-nav__group{position:relative;}
.ud-nav__menu{position:absolute;top:calc(100% + 12px);left:0;min-width:200px;padding:8px;border-radius:var(--radius-card,12px);background:var(--color-background,#fff);border:1px solid color-mix(in srgb,var(--color-text,#0f172a) 10%,transparent);box-shadow:0 20px 50px -24px rgb(15 23 42 / .35);display:none;z-index:20;}
.ud-nav__group:hover .ud-nav__menu,.ud-nav__group:focus-within .ud-nav__menu{display:grid;}
.ud-nav__menu a{display:block;padding:9px 12px;border-radius:8px;color:var(--color-text,#0f172a);text-decoration:none;font-size:.9rem;}
.ud-nav__menu a:hover{background:color-mix(in srgb,var(--color-primary,#2563eb) 10%,transparent);}
.ud-nav__toggle{display:none;align-items:center;justify-content:center;width:42px;height:42px;border-radius:10px;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 16%,transparent);background:transparent;color:inherit;cursor:pointer;}
.ud-nav__drawer{display:none;padding:8px 0 20px;}
.ud-nav__drawer[data-open="true"]{display:grid;gap:4px;}
.ud-nav__drawer a{padding:11px 4px;color:var(--ud-fg,var(--color-text));text-decoration:none;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 10%,transparent);}
.ud-nav--sticky.ud-nav--sticky{position:sticky;top:0;backdrop-filter:saturate(180%) blur(12px);}
/* Shared sticky-header utility for navigation blocks that have no family rule of their own. Kept above section content but below overlays. */
.ud-is-sticky.ud-is-sticky{position:sticky;top:0;z-index:70;}
.ud-nav__actions{display:inline-flex;align-items:center;gap:8px;flex:none;}
.ud-nav__end{display:flex;align-items:center;gap:clamp(12px,1.6cqi,28px);margin-left:auto;}
.ud-nav--inset{padding-inline:clamp(12px,2cqi,28px);padding-block:10px !important;}
.ud-nav--inset .ud-nav__bar{border-radius:var(--ud-nav-radius,18px);padding-inline:18px;background:color-mix(in srgb,var(--ud-bg,var(--color-background,#fff)) 92%,transparent);box-shadow:0 12px 32px -24px rgb(15 23 42 / .4);}
.ud-nav-density--compact .ud-nav__bar{min-height:58px;}
.ud-nav-density--roomy .ud-nav__bar{min-height:88px;}
.ud-nav-links--pill .ud-nav__link{padding:7px 12px;border-radius:999px;}
.ud-nav-links--pill .ud-nav__link:hover{background:color-mix(in srgb,var(--color-primary,#2563eb) 12%,transparent);opacity:1;}
.ud-nav-links--line .ud-nav__link{padding-bottom:4px;border-bottom:1px solid transparent;}
.ud-nav-links--line .ud-nav__link:hover{border-bottom-color:currentColor;opacity:1;color:inherit;}
.ud-nav-look{z-index:6;}
.ud-nav-look__bar{display:flex;align-items:center;gap:clamp(12px,1.6cqi,28px);min-height:72px;}
.ud-nav-look__end{display:flex;align-items:center;gap:clamp(12px,1.6cqi,28px);margin-left:auto;}
.ud-nav-look--pill{padding-block:12px !important;background:transparent !important;}
.ud-nav-look--pill .ud-nav-look__bar{border-radius:999px;padding:6px 14px 6px 22px;background:var(--ud-bg,var(--color-secondary,#0f172a));color:var(--ud-fg,#fff);box-shadow:0 18px 40px -24px rgb(15 23 42 / .55);}
.ud-nav-look--pill .ud-nav-look__end{gap:clamp(16px,2cqi,28px);}
.ud-nav-look--pill .ud-nav__actions .ud-btn{border-radius:999px;padding:11px 20px;min-height:42px;}
.ud-nav-look--pill .ud-nav__logo,.ud-nav-look--pill .ud-nav__link{color:inherit;}
.ud-nav-look--split .ud-nav-look__cluster{display:flex;justify-content:center;}
.ud-nav-look--split .ud-nav-look__cluster .ud-nav__links{padding:6px 8px;border-radius:999px;background:color-mix(in srgb,var(--ud-fg,#0f172a) 6%,transparent);}
.ud-nav-look--underline .ud-nav-look__bar{border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);min-height:84px;}
.ud-nav-look--underline .ud-nav__logo{letter-spacing:.08em;text-transform:uppercase;font-size:.82rem;}
.ud-nav-look--island{padding-block:14px !important;background:transparent !important;}
.ud-nav-look--island .ud-nav-look__bar{border-radius:var(--ud-nav-radius,22px);padding:10px 16px;background:var(--ud-bg,var(--color-surface,#f8fafc));box-shadow:0 18px 40px -26px rgb(15 23 42 / .45);border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 8%,transparent);}
.ud-nav-util{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:8px 0 0;font-size:.78rem;opacity:.7;}
.ud-nav-util__mail{color:inherit;text-decoration:none;}
.ud-nav-look--minimal .ud-nav-look__dots{display:flex;}
.ud-nav-look--minimal .ud-nav__links{gap:22px;}
.ud-nav-look--minimal .ud-nav__link{font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;opacity:.55;}
.ud-nav-look--minimal .ud-nav__link:hover{opacity:1;}
.ud-scheme-toggle{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 18%,transparent);background:transparent;color:inherit;cursor:pointer;transition:background .15s ease,border-color .15s ease;}
.ud-scheme-toggle:hover{background:color-mix(in srgb,var(--ud-fg,#0f172a) 8%,transparent);border-color:color-mix(in srgb,var(--color-primary,#8b5cf6) 45%,transparent);color:var(--color-primary,#8b5cf6);}

.ud-prose{line-height:1.75;color:var(--ud-fg,var(--color-text));font-family:var(--font-body,system-ui,sans-serif);font-size:var(--ud-body-size,inherit);}
.ud-prose > * + *{margin-top:1.1em;}
.ud-prose h1{font-family:var(--font-heading,system-ui,sans-serif);font-size:2rem;letter-spacing:-.03em;line-height:1.2;}
.ud-prose h2{font-family:var(--font-heading,system-ui,sans-serif);font-size:1.7rem;letter-spacing:-.02em;}
.ud-prose h3{font-family:var(--font-heading,system-ui,sans-serif);font-size:1.3rem;}
.ud-prose a{color:var(--color-primary,#2563eb);}
.ud-prose ul,.ud-prose ol{padding-left:1.3em;}
.ud-prose li + li{margin-top:.4em;}
.ud-prose blockquote{margin:0;padding-left:1.1em;border-left:3px solid var(--color-primary,#2563eb);color:var(--ud-muted,var(--color-muted));}
.ud-prose img{max-width:100%;height:auto;border-radius:var(--radius-card,12px);}
.ud-prose hr{border:0;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 14%,transparent);margin:1.6em 0;}
.ud-prose pre{overflow-x:auto;padding:14px 16px;border-radius:10px;background:color-mix(in srgb,var(--ud-fg,#0f172a) 6%,transparent);font-size:.9em;}
.ud-prose code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;}
.ud-prose mark{background:color-mix(in srgb,var(--color-accent,#f59e0b) 35%,transparent);padding:0 .15em;}
.ud-prose table{width:100%;border-collapse:collapse;font-size:.95em;}
.ud-prose th,.ud-prose td{padding:.6em .75em;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);text-align:left;}

.ud-accordion{border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);}
.ud-accordion__item{border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);}
.ud-accordion__item > summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 2px;cursor:pointer;font-family:var(--font-heading,system-ui,sans-serif);font-weight:600;font-size:1.05rem;list-style:none;}
.ud-accordion__item > summary::-webkit-details-marker{display:none;}
.ud-accordion__item > summary::after{content:"+";font-size:1.4rem;line-height:1;color:var(--color-primary,#2563eb);transition:transform .2s ease;}
.ud-accordion__item[open] > summary::after{content:"\\2013";}
.ud-accordion__body{padding:0 2px 22px;color:var(--ud-muted,var(--color-muted));line-height:1.7;max-width:70ch;font-size:var(--ud-body-size,inherit);}

.ud-table-wrap{overflow-x:auto;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 10%,transparent);border-radius:var(--radius-card,12px);}
.ud-table{width:100%;border-collapse:collapse;font-size:.95rem;min-width:560px;}
.ud-table th,.ud-table td{padding:16px 18px;text-align:left;border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 8%,transparent);}
.ud-table thead th{background:color-mix(in srgb,var(--ud-fg,#0f172a) 4%,transparent);font-family:var(--font-heading,system-ui,sans-serif);}
.ud-table tbody tr:last-child td{border-bottom:0;}
.ud-table td svg{width:18px;height:18px;color:var(--color-primary,#2563eb);}

.ud-scroller{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(min(360px,80cqi),1fr);gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;scrollbar-width:thin;}
.ud-scroller > *{scroll-snap-align:start;}
.ud-masonry{columns:var(--ud-mcols,3);column-gap:var(--ud-gap,16px);}
.ud-masonry > *{margin-bottom:16px;break-inside:avoid;}
.ud-logos{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:clamp(24px,4cqi,64px);}
.ud-logos img{max-height:38px;width:auto;opacity:.6;filter:grayscale(1);transition:opacity .2s ease,filter .2s ease;}
.ud-logos img:hover{opacity:1;filter:none;}
.ud-logo-text{font-family:var(--font-heading,system-ui,sans-serif);font-weight:700;font-size:1.15rem;opacity:.45;letter-spacing:-.02em;}

.ud-stars{display:inline-flex;gap:2px;color:var(--color-accent,#f59e0b);}
.ud-stars svg{width:16px;height:16px;}
.ud-avatar{width:48px;height:48px;border-radius:999px;object-fit:cover;flex:none;background:color-mix(in srgb,var(--color-primary,#2563eb) 18%,transparent);display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:var(--color-primary,#2563eb);font-family:var(--font-heading,system-ui,sans-serif);}
.ud-quote{font-family:var(--font-heading,system-ui,sans-serif);font-weight:500;letter-spacing:-.015em;line-height:1.4;}

.ud-field{display:grid;gap:7px;}
.ud-field > span{font-size:.85rem;font-weight:600;color:var(--ud-fg,var(--color-text));}
.ud-input{width:100%;padding:12px 14px;border-radius:var(--radius-button,8px);border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 18%,transparent);background:var(--color-background,#fff);color:var(--color-text,#0f172a);font-family:var(--font-body,system-ui,sans-serif);font-size:.95rem;outline:none;}
.ud-input:focus{border-color:var(--color-primary,#2563eb);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary,#2563eb) 18%,transparent);}
.ud-form{display:grid;gap:16px;}
.ud-form--inline{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}
.ud-form--inline .ud-input{min-width:240px;flex:1;}

.ud-stat{font-family:var(--font-heading,system-ui,sans-serif);font-weight:var(--font-heading-weight,700);font-size:clamp(2.2rem,3.4cqi + 1rem,3.4rem);letter-spacing:-.04em;line-height:1;color:var(--ud-heading,var(--ud-fg,var(--color-text,#0f172a)));}
.ud-steps{position:relative;}
.ud-step{position:relative;}
.ud-step__num{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;padding:0 10px;border-radius:999px;background:color-mix(in srgb,var(--color-primary,#2563eb) 12%,transparent);color:var(--color-primary,#2563eb);font-family:var(--font-heading,system-ui,sans-serif);font-weight:700;font-size:.9rem;letter-spacing:.04em;}
.ud-timeline{display:grid;gap:14px;position:relative;padding-left:18px;}
.ud-timeline:before{content:"";position:absolute;left:5px;top:8px;bottom:8px;width:2px;background:color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);}
.ud-timeline__item{position:relative;}
.ud-hours{margin:0;display:grid;gap:0;}
.ud-hours__row{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 10%,transparent);font-size:.95rem;}
.ud-hours__row > span:first-child{font-weight:600;}
.ud-hours__row > span:last-child{color:var(--ud-muted,var(--color-muted,#64748b));}
.ud-banner{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.ud-video{position:relative;aspect-ratio:16/9;border-radius:var(--radius-card,12px);overflow:hidden;background:#0b1220;}
.ud-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}
.ud-video--poster .ud-media-box{position:absolute;inset:0;border-radius:0;aspect-ratio:auto;}
.ud-video__play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76px;height:76px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:var(--color-primary,#8b5cf6);color:#fff;pointer-events:none;box-shadow:0 18px 40px -12px color-mix(in srgb,var(--color-primary,#8b5cf6) 70%,transparent);}
.ud-ba{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,2cqi,24px);}
.ud-ba__pane{margin:0;}
.ud-ba__pane figcaption{margin-top:10px;font-size:.85rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ud-muted,var(--color-muted));}
.ud-proof{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,.85fr);gap:clamp(20px,4cqi,48px);align-items:center;}
.ud-proof__stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 28px;}

.ud-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}
.ud-map{width:100%;border:0;display:block;border-radius:var(--radius-card,12px);min-height:280px;}
.ud-ratio{position:relative;width:100%;}
.ud-ratio > *{position:absolute;inset:0;width:100%;height:100%;}

/* Inline editing affordances. Only ever rendered inside the builder canvas. */
.ud-editable{outline:none;cursor:text;border-radius:3px;transition:box-shadow .12s ease,background .12s ease;}
.ud-editable:hover{box-shadow:0 0 0 1px color-mix(in srgb,var(--color-primary,#2563eb) 45%,transparent);}
.ud-editable:focus{box-shadow:0 0 0 2px var(--color-primary,#2563eb);background:color-mix(in srgb,var(--color-primary,#2563eb) 6%,transparent);}
.ud-editable[data-edit-empty]::before{content:attr(data-placeholder);opacity:.42;}
.ud-editable[data-edit-empty]:focus::before{content:none;}
.ud-edit-image{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:rgb(9 9 11 / .82);color:#fff;font:600 12px/1 system-ui,sans-serif;letter-spacing:.01em;cursor:pointer;opacity:0;transition:opacity .15s ease;}
.ud-h-accent{font-style:italic;font-weight:500;letter-spacing:-.03em;}
.ud-mesh{position:relative;overflow:hidden;}
.ud-mesh::before,.ud-mesh::after{content:"";position:absolute;width:min(48cqi,480px);height:min(48cqi,480px);border-radius:999px;filter:blur(90px);pointer-events:none;z-index:0;}
.ud-mesh::before{background:var(--color-accent,#FEE232);opacity:.42;top:-18%;left:-8%;}
.ud-mesh::after{background:var(--color-primary,#5D5DFF);opacity:.28;bottom:-22%;right:-10%;}
.ud-mesh > .ud-container{position:relative;z-index:1;}
.ud-studio-hero{max-width:820px;margin-inline:auto;text-align:center;}
.ud-studio-hero .ud-lead{max-width:34em;margin-inline:auto;}
.ud-studio-hero__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:18px 28px;margin-top:28px;}
.ud-studio-hero__row .ud-btns{margin-top:0;}
.ud-studio-proof{display:inline-flex;align-items:center;gap:12px;}
.ud-studio-avatars{display:flex;}
.ud-studio-avatars .ud-avatar{width:36px;height:36px;border:2px solid var(--color-background,#fff);margin-left:-10px;}
.ud-studio-avatars .ud-avatar:first-child{margin-left:0;}
.ud-studio-tags{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:28px 0 40px;}
.ud-studio-tag{display:inline-flex;padding:8px 16px;border-radius:999px;font-size:.9rem;font-weight:600;color:#111;}
.ud-studio-stat{text-align:center;}
.ud-cta-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;padding:26px 34px;border-radius:999px;background:var(--color-secondary,#111);color:#fff;}
.ud-cta-bar .ud-h3{color:#fff;margin:0;}
.ud-cta-bar .ud-btns{margin-top:0;}
.ud-project{display:grid;transition:transform .22s ease;}
.ud-project:hover{transform:scale(1.02);}
.ud-project__media{position:relative;}
.ud-project__explore{position:absolute;top:16px;left:16px;z-index:1;padding:7px 14px;border-radius:999px;background:var(--color-accent,#FEE232);color:#111;font-size:12px;font-weight:700;opacity:0;transform:translateY(-4px);transition:opacity .2s ease,transform .2s ease;}
.ud-project:hover .ud-project__explore{opacity:1;transform:none;}
.ud-bento{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,.9fr);gap:16px;}
.ud-bento-card{border-radius:calc(var(--radius-card,28px));padding:28px;min-height:180px;display:grid;align-content:space-between;gap:16px;}
.ud-bento-card--quote{background:var(--color-secondary,#111);color:#fff;grid-column:1;grid-row:1;}
.ud-bento-card--quote .ud-text{color:rgba(255,255,255,.88);font-size:1.15rem;}
.ud-bento-card--stat{background:var(--color-accent,#FEE232);color:#111;grid-column:2;grid-row:1;}
.ud-bento-card--video{background:var(--color-secondary,#111);color:#fff;grid-column:1;grid-row:2;padding:0;overflow:hidden;}
.ud-bento-card--text{background:var(--color-surface,#f6f6f8);grid-column:2;grid-row:2;}
.ud-bento-person{display:flex;align-items:center;gap:12px;}
.ud-bento-video{position:relative;}
.ud-bento-play{position:absolute;inset:auto auto 18px 18px;width:44px;height:44px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:#fff;color:#111;}
.ud-duo-card{border-radius:calc(var(--radius-card,28px));padding:32px;min-height:100%;}
.ud-duo-card--accent{background:var(--color-accent,#FEE232);color:#111;}
.ud-duo-card--primary{background:var(--color-primary,#5D5DFF);color:#fff;}
.ud-duo-card--dark{background:var(--color-secondary,#111);color:#fff;}
.ud-duo-card--primary .ud-small,.ud-duo-card--dark .ud-small,.ud-duo-card--primary .ud-list,.ud-duo-card--dark .ud-list{color:inherit;}
.ud-duo-price{display:flex;align-items:baseline;gap:10px;margin:12px 0 20px;}
.ud-cta-gradient{border-radius:calc(var(--radius-card,28px) + 8px);padding:clamp(48px,6cqi,80px) 32px;text-align:center;background:linear-gradient(90deg,var(--color-primary,#5D5DFF),var(--color-accent,#FEE232));color:#111;}
.ud-cta-gradient .ud-h2{color:#111;max-width:16em;margin-inline:auto;}
.ud-cta-gradient .ud-btns{justify-content:center;}

.ud-kicker{display:inline-block;margin:0 0 18px;padding:6px 12px;border-radius:999px;border:1px solid color-mix(in srgb,var(--ud-fg,#111) 10%,transparent);background:var(--color-surface,#F9FAFB);color:var(--ud-muted,var(--color-muted,#6b7280));font-size:.8125rem;font-weight:500;letter-spacing:0;text-transform:none;}
.ud-product-hero{max-width:40rem;margin-inline:auto;text-align:center;}
.ud-product-hero .ud-h1{font-size:var(--ud-heading-size,clamp(2.4rem,5cqi + .4rem,3.5rem));letter-spacing:-.04em;}
.ud-product-hero .ud-btns{justify-content:center;}
.ud-product-media{position:relative;margin-top:clamp(36px,4cqi,56px);border-radius:calc(var(--radius-card,16px) + 4px);overflow:hidden;border:1px solid color-mix(in srgb,var(--ud-fg,#111) 10%,transparent);box-shadow:0 28px 60px -36px rgb(17 17 17 / .35);}
.ud-play{position:absolute;inset:50% auto auto 50%;z-index:2;display:grid;place-items:center;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:999px;background:#111;color:#fff;box-shadow:0 12px 30px -10px rgb(0 0 0 / .45);transition:transform .18s ease,background .18s ease;}
.ud-play:hover{transform:scale(1.06);background:#000;}
.ud-feature-min{text-align:left;padding:8px 4px;transition:transform .18s ease;}
.ud-feature-min:hover{transform:translateY(-4px);}
.ud-feature-min .ud-icon{margin-bottom:14px;color:var(--ud-fg,#111);}
.ud-feature-min .ud-h4{margin:0;}
.ud-team-circle{text-align:center;transition:transform .18s ease;}
.ud-team-circle:hover{transform:translateY(-4px);}
.ud-team-circle__photo{width:148px;height:148px;margin:0 auto 16px;border-radius:999px;overflow:hidden;}
.ud-team-circle__photo .ud-media-box{height:100%;border-radius:999px;}
.ud-team-circle__social{display:flex;justify-content:center;gap:10px;margin-top:12px;}
.ud-team-circle__social a{display:grid;place-items:center;width:32px;height:32px;border-radius:999px;color:var(--ud-muted,#6b7280);border:1px solid color-mix(in srgb,var(--ud-fg,#111) 10%,transparent);transition:color .16s ease,border-color .16s ease,transform .16s ease;}
.ud-team-circle__social a:hover{color:#111;border-color:#111;transform:scale(1.06);}
.ud-quote-compact{padding:18px 18px 16px;text-align:left;}
.ud-quote-compact__who{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.ud-quote-compact__name{font-weight:600;font-size:.9rem;line-height:1.2;}
.ud-quote-compact__text{margin:0;font-size:.8125rem;line-height:1.55;color:var(--ud-muted,#6b7280);}
.ud-quote-compact .ud-avatar{width:36px;height:36px;font-size:.75rem;}

.ud-glow-hero{position:relative;overflow:hidden;text-align:center;}
.ud-glow-orbs{position:absolute;inset:0;pointer-events:none;z-index:0;}
.ud-glow-orb{position:absolute;width:min(32rem,78cqi);height:min(32rem,78cqi);border-radius:50%;filter:blur(100px);opacity:.4;animation:ud-glow-drift 16s ease-in-out infinite;}
.ud-glow-orb--orange{background:#F26A06;top:-18%;left:50%;margin-left:-16rem;animation-delay:0s;}
.ud-glow-orb--pink{background:#D10A8A;top:28%;left:-8%;animation-delay:-5s;}
.ud-glow-orb--blue{background:#2E08CF;top:22%;right:-12%;animation-delay:-9s;}
@keyframes ud-glow-drift{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(18px,-22px,0) scale(1.08)}}
.ud-glow-copy{position:relative;z-index:1;max-width:48rem;margin-inline:auto;}
.ud-glow-copy .ud-h1{font-size:var(--ud-heading-size,clamp(2.25rem,5.6cqi + .35rem,3.75rem));font-weight:600;letter-spacing:-.025em;line-height:1.12;}
.ud-glow-copy .ud-lead{max-width:28rem;margin-inline:auto;color:#f3f4f6;font-size:var(--ud-body-size,1rem);line-height:1.75;}
.ud-glow-copy .ud-btns{justify-content:center;margin-top:24px;}
.ud-glow-kicker{display:inline-block;margin:0 0 18px;padding:6px 14px;border-radius:999px;border:1px solid #F26A06;color:#F26A06;background:transparent;font-size:.75rem;font-weight:500;letter-spacing:0;text-transform:none;}
.ud-rail{position:relative;height:100%;padding:26px 24px 26px 28px;border-radius:var(--radius-card,16px);background:#141414;border:1px solid rgba(255,255,255,.08);border-left:4px solid var(--ud-rail,#F26A06);text-align:left;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease,background .2s ease;}
.ud-rail:hover{transform:translateY(-4px) scale(1.02);background:#1a1a1a;box-shadow:0 18px 40px -24px color-mix(in srgb,var(--ud-rail,#F26A06) 70%,transparent),0 0 28px -8px color-mix(in srgb,var(--ud-rail,#F26A06) 45%,transparent);}
.ud-rail__icon{display:inline-flex;margin-bottom:16px;color:#fff;}
.ud-rail .ud-h4{margin:0;}
.ud-rail .ud-text{margin-top:10px;color:#a1a1aa;}
.ud-rail--quote{display:grid;gap:14px;align-content:start;}
.ud-rail--quote .ud-stars{color:#f5c518;}
.ud-rail__who{display:flex;align-items:center;gap:12px;margin-top:8px;}
.ud-rail__name{margin:0;font-weight:600;font-size:.9rem;color:#fff;}
.ud-zigzag{position:relative;display:grid;gap:clamp(40px,6cqi,72px);margin-top:clamp(32px,3cqi,56px);}
.ud-zigzag::before{content:"";position:absolute;top:12px;bottom:12px;left:50%;width:1px;background:linear-gradient(#D10A8A,#2E08CF,#F26A06);opacity:.45;transform:translateX(-50%);}
.ud-zigzag__row{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,5cqi,64px);align-items:center;position:relative;}
.ud-zigzag__row--flip .ud-zigzag__media{order:2;}
.ud-zigzag__row--flip .ud-zigzag__copy{order:1;text-align:right;}
.ud-zigzag__num{margin:0 0 10px;font-size:.8rem;font-weight:600;letter-spacing:.16em;color:#F26A06;}
.ud-zigzag__copy .ud-h3{margin-top:0;}
.ud-zigzag__media .ud-media-box{border-radius:16px;min-height:220px;}
.ud-counsel-nav .ud-nav__toggle{display:none;margin-left:auto;}
.ud-counsel-nav__bar{display:flex;align-items:center;gap:28px;max-width:var(--ud-max,1360px);margin-inline:auto;min-height:76px;padding-inline:clamp(20px,4cqi,48px);}
.ud-counsel-nav__end{display:flex;align-items:center;gap:20px;margin-left:auto;}
.ud-counsel-logo{display:inline-flex;align-items:flex-start;gap:2px;font-family:var(--font-heading,Inter,system-ui,sans-serif);font-weight:700;font-size:1.35rem;letter-spacing:-.04em;color:#1a1a1a;text-decoration:none;}
.ud-counsel-logo sup{font-size:.55em;font-weight:500;margin-top:.35em;letter-spacing:0;}
.ud-counsel-nav__links{display:flex;align-items:center;gap:32px;font-size:.95rem;}
.ud-counsel-nav__links a{color:#1a1a1a;text-decoration:none;}
.ud-counsel-nav .ud-counsel-dot-btn{border-radius:8px;padding:10px 16px 10px 18px;}
.ud-counsel-dot{width:7px;height:7px;border-radius:999px;background:#fff;display:inline-block;}
.ud-counsel-nav__mobile{display:none;flex-direction:column;gap:12px;padding:8px 24px 20px;border-top:1px solid #1a1a1a;}
.ud-panel-hero{background:#f8f7f4;}
.ud-panel-hero__grid{display:grid;grid-template-columns:1fr 1fr;min-height:min(72vh,640px);}
.ud-panel-hero__copy{display:flex;flex-direction:column;justify-content:flex-end;gap:20px;background:#26231d;color:#fff;padding:clamp(40px,6cqi,88px) clamp(28px,5cqi,72px) clamp(36px,5cqi,64px);}
.ud-panel-hero__copy .ud-h1{color:#fff;font-size:var(--ud-heading-size,clamp(2.4rem,4.2cqi + .8rem,3.25rem));font-weight:700;letter-spacing:-.04em;line-height:1.05;max-width:11ch;}
.ud-panel-hero__copy .ud-lead{margin:0;max-width:36ch;color:rgba(255,255,255,.88);font-size:1rem;line-height:1.65;}
.ud-counsel-arrow-btn{display:inline-flex;align-items:center;gap:10px;width:max-content;margin-top:12px;padding:12px 18px;border-radius:6px;background:#fff;color:#1a1a1a;font-weight:600;font-size:.92rem;text-decoration:none;}
.ud-counsel-arrow-btn--dark{background:#2a2a2a;color:#fff;}
.ud-panel-hero__media{position:relative;min-height:480px;}
.ud-panel-hero__media .ud-media-box{height:100%;min-height:480px;border-radius:0;aspect-ratio:auto;}
.ud-panel-proof{position:absolute;right:20px;bottom:20px;display:flex;align-items:center;gap:14px;max-width:280px;padding:14px 16px;border-radius:10px;background:#fff;color:#1a1a1a;box-shadow:0 12px 30px -18px rgb(0 0 0 / .45);}
.ud-panel-proof__faces{display:flex;}
.ud-panel-proof__faces .ud-avatar{width:28px;height:28px;border:2px solid #fff;margin-left:-8px;}
.ud-panel-proof__faces .ud-avatar:first-child{margin-left:0;}
.ud-panel-proof__value{margin:0;font-weight:700;font-size:1.05rem;line-height:1.1;}
.ud-panel-proof__label{margin:4px 0 0;font-size:10px;letter-spacing:.08em;text-transform:uppercase;line-height:1.35;color:#4d4d4d;}
.ud-counsel-edit .ud-container,.ud-counsel-band .ud-container{max-width:1360px;}
.ud-counsel-edit__grid{display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,4cqi,56px) clamp(32px,5cqi,72px);align-items:start;}
.ud-counsel-edit__h{grid-column:1;max-width:16ch;font-weight:700;letter-spacing:-.035em;line-height:1.12;}
.ud-counsel-edit__n1{grid-column:2;}
.ud-counsel-edit__stack{grid-column:1;display:grid;gap:28px;max-width:34rem;justify-self:center;width:min(100%,28rem);}
.ud-counsel-edit__media{grid-column:2;}
.ud-counsel-edit__media .ud-media-box{min-height:420px;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%,0 18%);border-radius:0;}
.ud-counsel-marker{margin:0 0 10px;font-size:.78rem;letter-spacing:.04em;color:#4d4d4d;}
.ud-counsel-label{margin:0 0 10px;font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#1a1a1a;}
.ud-counsel-rulehead{border-bottom:1px solid #2a2a2a;margin-bottom:28px;}
.ud-counsel-band .ud-h2{max-width:16ch;margin-bottom:18px;font-weight:700;letter-spacing:-.03em;}
.ud-counsel-band__cols{margin-top:40px;}
.ud-counsel-band__photo{margin-top:36px;}
.ud-counsel-band__photo .ud-media-box{border-radius:0;min-height:280px;}
.ud-counsel-steps{margin-top:40px;}
@media (prefers-reduced-motion:reduce){
  .ud-glow-orb{animation:none;}
  .ud-rail:hover{transform:none;}
}

.ud-media-box:hover .ud-edit-image,.ud-edit-image:focus{opacity:1;}

.ud-blog-list{display:grid;gap:28px;}
/* One article at its own address. Capped at a comfortable measure so long
   prose does not run the full width of a wide container. */
.ud-blog-article{max-width:min(72ch,100%);margin-inline:auto;}
.ud-blog-article .ud-media{margin-block:28px;}

.ud-blog-row{display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:24px;align-items:center;}
.ud-blog-featured{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,.75fr);gap:clamp(24px,3cqi,40px);align-items:start;}
.ud-blog-featured__side{display:grid;gap:0;}
.ud-blog-side{padding:18px 0;border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 10%,transparent);}
.ud-blog-side:first-child{padding-top:0;}
.ud-blog-magazine{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:20px;align-items:stretch;}
.ud-blog-magazine__lead{height:100%;}
.ud-blog-overlay{position:relative;min-height:280px;}
.ud-blog-overlay .ud-media-box{min-height:320px;height:100%;}
.ud-blog-overlay__copy{position:absolute;inset:auto 0 0;z-index:1;padding:22px 20px 20px;background:linear-gradient(180deg,transparent,rgba(8,10,18,.82));color:#fff;border-radius:0 0 var(--radius-card,12px) var(--radius-card,12px);}
.ud-blog-overlay__copy .ud-h3{color:#fff;}

@container udpage (max-width: 1024px){
  .ud-grid[data-cols="3"],.ud-grid[data-cols="4"],.ud-grid[data-cols="5"],.ud-grid[data-cols="6"]{--ud-cols-now:2;}
  .ud-masonry{columns:2;}
}
@container udpage (max-width: 860px){
  .ud-split{grid-template-columns:1fr;}
  .ud-split--reverse > .ud-split__media{order:0;}
  .ud-nav__links,.ud-nav__cta-desktop,.ud-nav__end{display:none;}
  .ud-nav__toggle{display:inline-flex;}
  .ud-nav__bar,.ud-nav-look__bar{justify-content:space-between;min-height:64px;}
  .ud-nav-look__cluster,.ud-nav-look__dots,.ud-nav-look__end,.ud-nav-util{display:none;}
  .ud-table{min-width:520px;}
  .ud-ba{grid-template-columns:1fr;}
  .ud-banner{flex-direction:column;align-items:flex-start;}
  .ud-proof{grid-template-columns:1fr;}
  .ud-blog-featured,.ud-blog-magazine,.ud-blog-row{grid-template-columns:1fr;}
  .ud-cta-bar{border-radius:32px;}
  .ud-bento{grid-template-columns:1fr;}
  .ud-bento-card--quote,.ud-bento-card--stat,.ud-bento-card--video,.ud-bento-card--text{grid-column:auto;grid-row:auto;}
  .ud-zigzag::before{display:none;}
  .ud-zigzag__row,.ud-zigzag__row--flip{grid-template-columns:1fr;}
  .ud-zigzag__row--flip .ud-zigzag__media,.ud-zigzag__row--flip .ud-zigzag__copy{order:0;text-align:left;}
  .ud-counsel-nav__links,.ud-counsel-nav .ud-counsel-dot-btn,.ud-counsel-nav__end{display:none;}
  .ud-counsel-nav .ud-nav__toggle{display:inline-flex;margin-left:auto;}
  .ud-counsel-nav__mobile{display:flex;}
  .ud-panel-hero__grid,.ud-counsel-edit__grid{grid-template-columns:1fr;}
  .ud-counsel-edit__h,.ud-counsel-edit__n1,.ud-counsel-edit__stack,.ud-counsel-edit__media{grid-column:auto;}
  .ud-counsel-edit__stack{justify-self:stretch;width:100%;max-width:none;}
  .ud-panel-hero__copy .ud-h1{max-width:none;}
}
@container udpage (max-width: 640px){
  .ud-grid{grid-template-columns:1fr;}
  .ud-masonry{columns:1;}
  .ud-section{padding-block:calc(var(--ud-pt,var(--section-spacing,80px)) * .7) calc(var(--ud-pb,var(--section-spacing,80px)) * .7);}
  .ud-row--stack{flex-direction:column;align-items:stretch;}
  .ud-btns .ud-btn{width:100%;}
  .ud-hide-sm{display:none;}
}
.ud-skill{display:grid;gap:10px;}
.ud-skills{display:grid;gap:22px;}
.ud-skill__row{display:flex;justify-content:space-between;gap:16px;font-size:.95rem;font-weight:600;color:var(--ud-fg,var(--color-text,#0f172a));}
.ud-skill__track{height:6px;border-radius:999px;background:color-mix(in srgb,var(--color-primary,#2563eb) 16%,transparent);overflow:hidden;}
.ud-skill__fill{height:100%;border-radius:inherit;background:var(--color-primary,#2563eb);}
.ud-map{position:relative;width:100%;border-radius:var(--radius-card,12px);background:color-mix(in srgb,var(--ud-fg,#0f172a) 8%,var(--color-surface,#f1f5f9));overflow:hidden;display:flex;align-items:center;justify-content:center;}
.ud-map iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}
.ud-locations{display:grid;gap:0;}
.ud-location{display:grid;gap:8px;padding:22px 0;border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 10%,transparent);grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr);align-items:start;}
.ud-location:first-child{padding-top:0;}
.ud-location__meta{display:grid;gap:6px;justify-items:start;}
@media (max-width: 800px){
  .ud-location{grid-template-columns:1fr;gap:6px;}
}

/* Original AI compositions — not clones of catalog kits */
.ud-gen{--ud-gen-wash:transparent;}
.ud-gen.ud-section{background:
  linear-gradient(180deg,var(--ud-gen-wash),transparent 42%),
  var(--ud-bg,var(--color-background,#fff));}
.ud-gen-kicker{margin:0 0 .6rem;font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;font-weight:600;color:var(--ud-accent,var(--color-primary,#2563eb));}
.ud-gen-copy{max-width:42rem;}
.ud-gen-copy--intro{margin-bottom:2.4rem;}
.ud-gen-density--airy.ud-section{padding-block:calc(var(--section-spacing,80px) * 1.25);}
.ud-gen-density--tight.ud-section{padding-block:calc(var(--section-spacing,80px) * .65);}
.ud-gen-mark{display:inline-flex;align-items:center;gap:.55rem;font-weight:700;letter-spacing:-.03em;color:inherit;text-decoration:none;}
.ud-gen-mark__dot{width:.7rem;height:.7rem;border-radius:2px;background:var(--ud-accent,var(--color-primary,#2563eb));transform:rotate(12deg);}
.ud-gen-links{display:flex;flex-wrap:wrap;gap:.2rem 1.4rem;}
.ud-gen-links__item{color:inherit;text-decoration:none;font-size:.92rem;opacity:.82;border-bottom:1px solid transparent;}
.ud-gen-links__item:hover{opacity:1;border-bottom-color:currentColor;}
.ud-gen-nav{padding-block:18px !important;}
.ud-gen-nav__bar{display:flex;align-items:center;gap:1.2rem;}
.ud-gen-nav__end{display:flex;align-items:center;gap:1.2rem;margin-left:auto;}
.ud-gen-nav--stack .ud-gen-nav__bar{justify-content:center;}
.ud-gen-nav--stack .ud-gen-links{justify-content:center;margin-top:.9rem;}
.ud-gen-nav--split .ud-gen-nav__bar{border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);padding-bottom:14px;}
.ud-gen-hero--mast .ud-h1{max-width:14ch;letter-spacing:-.05em;}
.ud-gen-hero--cut{position:relative;overflow:hidden;}
.ud-gen-hero__cut{padding-block:clamp(3rem,8vw,6.5rem);}
.ud-gen-hero__blade{position:absolute;inset:auto -8% -18% 18%;height:48%;background:color-mix(in srgb,var(--ud-accent,#2563eb) 22%,transparent);clip-path:polygon(12% 0,100% 28%,88% 100%,0 72%);pointer-events:none;}
.ud-gen-hero__stage{position:relative;min-height:min(72vh,640px);display:grid;align-items:end;}
.ud-gen-hero__stage-media{min-height:min(72vh,640px);}
.ud-gen-hero__fill{min-height:280px;border-radius:var(--radius-card,12px);background:
  repeating-linear-gradient(-18deg,color-mix(in srgb,var(--ud-accent,#2563eb) 18%,transparent) 0 14px,transparent 14px 28px),
  color-mix(in srgb,var(--ud-fg,#0f172a) 8%,var(--ud-bg,#fff));}
.ud-gen-hero__card{position:relative;margin:0 6% 8%;max-width:36rem;padding:1.8rem 1.9rem;background:color-mix(in srgb,var(--ud-bg,#fff) 88%,transparent);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 10%,transparent);}
.ud-gen-hero__slab{display:grid;gap:0;}
.ud-gen-hero__slab-fill{min-height:240px;border-radius:0;}
.ud-gen-hero__slab-copy{padding-block:2.4rem 3.2rem;}
.ud-gen-hero__folio{display:grid;gap:1.6rem;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);align-items:end;}
.ud-gen-hero__index{margin:0;font-size:.75rem;letter-spacing:.22em;text-transform:uppercase;opacity:.55;}
.ud-gen-collect__list--mosaic{display:grid;grid-template-columns:repeat(12,1fr);gap:1rem;}
.ud-gen-collect__list--mosaic .ud-gen-collect__item:nth-child(3n+1){grid-column:span 7;}
.ud-gen-collect__list--mosaic .ud-gen-collect__item:nth-child(3n+2){grid-column:span 5;}
.ud-gen-collect__list--mosaic .ud-gen-collect__item:nth-child(3n){grid-column:span 12;}
.ud-gen-collect__item{padding:1.4rem 1.5rem;background:var(--ud-card,color-mix(in srgb,var(--ud-fg,#0f172a) 4%,transparent));border-radius:2px 18px 2px 18px;}
.ud-gen-collect__meta{display:block;font-size:.75rem;letter-spacing:.16em;opacity:.55;margin-bottom:.5rem;}
.ud-gen-collect__list--rail{display:flex;gap:1rem;overflow:auto;padding-bottom:.4rem;}
.ud-gen-collect__list--rail .ud-gen-collect__item{min-width:min(280px,80%);}
.ud-gen-collect__list--index{display:grid;gap:0;}
.ud-gen-collect__list--index .ud-gen-collect__item{display:grid;grid-template-columns:4rem minmax(0,1fr);gap:.8rem 1.2rem;border-radius:0;background:transparent;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);padding:1.2rem 0;}
.ud-gen-collect__list--index .ud-gen-collect__item .ud-text{grid-column:2;}
.ud-gen-collect__list--pills{display:flex;flex-wrap:wrap;gap:.7rem;}
.ud-gen-collect__list--pills .ud-gen-collect__item{border-radius:999px;padding:.9rem 1.3rem;}
.ud-gen-story__grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:2.2rem;align-items:center;}
.ud-gen-story--manifesto .ud-gen-story__grid{grid-template-columns:1fr;}
.ud-gen-story--manifesto .ud-h2{font-size:clamp(2rem,5vw,3.6rem);max-width:16ch;}
.ud-gen-story--offset .ud-gen-story__grid{align-items:start;}
.ud-gen-story--offset .ud-gen-story__grid > :last-child{margin-top:3rem;}
.ud-gen-composition__head{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(220px,.85fr);gap:2rem;align-items:center;margin-bottom:2.4rem;}
.ud-gen-composition__visual{position:relative;min-height:240px;overflow:hidden;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);background:linear-gradient(145deg,color-mix(in srgb,var(--ud-accent,#2563eb) 18%,transparent),transparent 62%);}
.ud-gen-composition__visual span{position:absolute;display:block;inset:50% auto auto 50%;width:clamp(70px,12vw,150px);aspect-ratio:1;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 34%,transparent);border-radius:50%;transform:translate(-50%,-50%);}
.ud-gen-composition__visual span:nth-child(2){width:clamp(130px,20vw,250px);opacity:.6;}
.ud-gen-composition__visual span:nth-child(3){width:clamp(190px,28vw,350px);opacity:.3;}
.ud-gen-composition-visual--grid .ud-gen-composition__visual{background-image:linear-gradient(color-mix(in srgb,var(--ud-fg,#0f172a) 9%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--ud-fg,#0f172a) 9%,transparent) 1px,transparent 1px);background-size:30px 30px;transform:perspective(500px) rotateX(5deg);}
.ud-gen-composition-visual--grid .ud-gen-composition__visual span{display:none;}
.ud-gen-composition-visual--beam .ud-gen-composition__visual{background:linear-gradient(118deg,transparent 12%,color-mix(in srgb,var(--ud-accent,#2563eb) 54%,transparent) 46%,transparent 72%);}
.ud-gen-composition-visual--beam .ud-gen-composition__visual span{border-radius:0;width:58%;height:160%;transform:translate(-50%,-50%) rotate(28deg);}
.ud-gen-composition-visual--type .ud-gen-composition__visual:after{content:'Aa';position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);font:800 clamp(4rem,11vw,9rem)/1 var(--font-heading,inherit);letter-spacing:-.1em;color:color-mix(in srgb,var(--ud-fg,#0f172a) 84%,transparent);}
.ud-gen-composition-visual--type .ud-gen-composition__visual span{display:none;}
.ud-gen-composition__regions{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:1rem;}
.ud-gen-composition__region{grid-column:span 4;padding:1.4rem;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 16%,transparent);background:var(--ud-card,color-mix(in srgb,var(--ud-fg,#0f172a) 3%,transparent));}
.ud-gen-composition__label{display:block;margin-bottom:1.4rem;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;opacity:.58;}
.ud-gen-composition__link{display:inline-block;margin-top:1rem;color:inherit;text-decoration:none;border-bottom:1px solid currentColor;font-weight:650;}
.ud-gen-composition--asymmetric .ud-gen-composition__region:first-child{grid-column:span 7;}
.ud-gen-composition--asymmetric .ud-gen-composition__region:nth-child(2){grid-column:span 5;}
.ud-gen-composition--asymmetric .ud-gen-composition__region:nth-child(n+3){grid-column:span 6;}
.ud-gen-composition--bento .ud-gen-composition__region:nth-child(4n+1){grid-column:span 7;min-height:220px;}
.ud-gen-composition--bento .ud-gen-composition__region:nth-child(4n+2){grid-column:span 5;}
.ud-gen-composition--bento .ud-gen-composition__region:nth-child(4n+3),.ud-gen-composition--bento .ud-gen-composition__region:nth-child(4n){grid-column:span 6;}
.ud-gen-composition--editorial .ud-gen-composition__regions{display:block;}
.ud-gen-composition--editorial .ud-gen-composition__region{display:grid;grid-template-columns:4rem minmax(180px,.7fr) minmax(0,1.3fr);gap:1.2rem;background:transparent;padding:1.3rem 0;}
.ud-gen-composition--editorial .ud-gen-composition__label{margin:0;}
.ud-gen-composition--split .ud-gen-composition__regions{grid-template-columns:repeat(2,minmax(0,1fr));}
.ud-gen-composition--split .ud-gen-composition__region{grid-column:auto;}
.ud-gen-composition--marquee .ud-gen-composition__regions{display:flex;overflow:auto;padding-bottom:.5rem;scroll-snap-type:x proximity;}
.ud-gen-composition--marquee .ud-gen-composition__region{min-width:min(330px,82vw);scroll-snap-align:start;}
.ud-gen-faq__list{display:grid;gap:0;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 14%,transparent);}
.ud-gen-faq__item{display:grid;grid-template-columns:3.5rem minmax(0,.8fr) minmax(0,1.2fr);gap:1rem;padding:1.35rem 0;border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 14%,transparent);align-items:start;}
.ud-gen-faq__index{font-size:.72rem;letter-spacing:.16em;opacity:.5;padding-top:.3rem;}
.ud-gen-faq--split .ud-gen-faq__list,.ud-gen-faq--cards .ud-gen-faq__list{grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;border:0;}
.ud-gen-faq--split .ud-gen-faq__item,.ud-gen-faq--cards .ud-gen-faq__item{display:block;padding:1.4rem;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);}
.ud-gen-faq--cards .ud-gen-faq__item{background:var(--ud-card,color-mix(in srgb,var(--ud-fg,#0f172a) 4%,transparent));border-radius:18px 2px;}
.ud-gen-metrics__list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;}
.ud-gen-metrics__item{padding:1.5rem;border-top:3px solid var(--ud-accent,var(--color-primary,#2563eb));background:var(--ud-card,color-mix(in srgb,var(--ud-fg,#0f172a) 4%,transparent));}
.ud-gen-metrics__value{display:block;font-size:clamp(2rem,5vw,4rem);line-height:1;letter-spacing:-.06em;margin-bottom:1rem;}
.ud-gen-metrics--poster .ud-gen-metrics__item:nth-child(even){transform:translateY(1.5rem);}
.ud-gen-metrics--orbit .ud-gen-metrics__item{border-radius:999px;aspect-ratio:1;display:flex;flex-direction:column;justify-content:center;text-align:center;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);}
.ud-gen-pricing__list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;align-items:stretch;}
.ud-gen-pricing__item{padding:1.6rem;background:var(--ud-card,color-mix(in srgb,var(--ud-fg,#0f172a) 4%,transparent));border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 11%,transparent);display:flex;flex-direction:column;gap:.85rem;border-radius:3px 22px;}
.ud-gen-pricing__item:nth-child(even){transform:translateY(-.65rem);}
.ud-gen-pricing__price{font-size:clamp(1.8rem,4vw,3rem);letter-spacing:-.05em;}
.ud-gen-pricing__features{white-space:pre-line;padding:1rem 0;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);flex:1;line-height:1.8;}
.ud-gen-pricing--editorial .ud-gen-pricing__item{border-width:0 0 1px;border-radius:0;background:transparent;}
.ud-gen-pricing--compact .ud-gen-pricing__item{transform:none;padding:1.2rem;}
.ud-gen-voices__list--pull{display:grid;gap:2rem;}
.ud-gen-voices__quote{font-size:clamp(1.2rem,2.4vw,1.7rem);line-height:1.35;margin:0 0 .8rem;letter-spacing:-.03em;}
.ud-gen-voices__item footer{opacity:.7;font-size:.9rem;}
.ud-gen-voices__list--stagger{display:grid;gap:1rem;grid-template-columns:1fr 1fr;}
.ud-gen-voices__list--stagger .ud-gen-voices__item:nth-child(even){margin-top:2.2rem;}
.ud-gen-voices__list--strip{display:flex;gap:1rem;overflow:auto;}
.ud-gen-voices__list--strip .ud-gen-voices__item{min-width:min(320px,85%);}
.ud-gen-cta--ticket .ud-gen-cta__inner{border:2px dashed color-mix(in srgb,var(--ud-fg,#0f172a) 22%,transparent);padding:2rem 1.8rem;border-radius:4px;}
.ud-gen-cta--bleed.ud-section{padding-block:clamp(3rem,8vw,5.5rem);}
.ud-gen-cta--quiet .ud-gen-cta__inner{display:flex;justify-content:space-between;gap:1.5rem;align-items:end;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 14%,transparent);padding-top:1.4rem;}
.ud-gen-foot{padding-block:2rem !important;}
.ud-gen-foot__row{display:flex;justify-content:space-between;gap:1rem;align-items:center;flex-wrap:wrap;}
.ud-gen-foot--stripe{border-top:8px solid var(--ud-accent,var(--color-primary,#2563eb));}
.ud-gen-foot__copy{margin:.9rem 0 0;font-size:.85rem;opacity:.7;}
.ud-gen-form__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2.4rem;align-items:start;}
.ud-gen-form--narrow .ud-gen-form__grid{grid-template-columns:1fr;max-width:36rem;}
.ud-gen-form__panel{padding:1.4rem;background:var(--ud-card,color-mix(in srgb,var(--ud-fg,#0f172a) 5%,transparent));border-radius:2px 22px;}
.ud-gen--ink .ud-gen-mark__dot,.ud-gen--tide .ud-gen-mark__dot{background:#fff;}
@container udpage (max-width: 800px){
  .ud-gen-hero__folio,.ud-gen-story__grid,.ud-gen-form__grid,.ud-gen-voices__list--stagger,.ud-gen-collect__list--mosaic,.ud-gen-faq--split .ud-gen-faq__list,.ud-gen-faq--cards .ud-gen-faq__list,.ud-gen-metrics__list,.ud-gen-composition__head,.ud-gen-composition--split .ud-gen-composition__regions{grid-template-columns:1fr;}
  .ud-gen-composition__region,.ud-gen-composition--asymmetric .ud-gen-composition__region:first-child,.ud-gen-composition--asymmetric .ud-gen-composition__region:nth-child(2),.ud-gen-composition--asymmetric .ud-gen-composition__region:nth-child(n+3),.ud-gen-composition--bento .ud-gen-composition__region:nth-child(n){grid-column:span 12;}
  .ud-gen-composition--editorial .ud-gen-composition__region{grid-template-columns:2.5rem minmax(0,1fr);}
  .ud-gen-composition--editorial .ud-gen-composition__region .ud-text,.ud-gen-composition--editorial .ud-gen-composition__region .ud-gen-composition__link{grid-column:2;}
  .ud-gen-faq__item{grid-template-columns:2.5rem 1fr;}
  .ud-gen-faq__item .ud-text{grid-column:2;}
  .ud-gen-metrics--poster .ud-gen-metrics__item,.ud-gen-pricing__item:nth-child(even){transform:none;}
  .ud-gen-collect__list--mosaic .ud-gen-collect__item{grid-column:span 1 !important;}
  .ud-gen-cta--quiet .ud-gen-cta__inner{flex-direction:column;align-items:stretch;}
  .ud-gen-voices__list--stagger .ud-gen-voices__item:nth-child(even){margin-top:0;}
}

/* Verdara — light green SaaS kit */
.ud-vd-btn{transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;border-radius:16px;padding:12px 22px;font-weight:600;}
.ud-vd-btn:hover{transform:scale(1.05);filter:brightness(1.06);}
.ud-vd-btn--ghost{background:transparent;color:var(--ud-fg,#0f172a);border:1px solid transparent;box-shadow:none;}
.ud-vd-btn--ghost:hover{background:color-mix(in srgb,var(--ud-fg,#0f172a) 5%,transparent);transform:scale(1.03);}
.ud-vd-nav{padding-block:14px !important;background:color-mix(in srgb,#fff 88%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 6%,transparent);z-index:40;}
.ud-vd-nav--sticky.ud-vd-nav--sticky{position:sticky;top:0;}
.ud-vd-nav__bar{display:flex;align-items:center;gap:18px;position:relative;}
.ud-vd-nav__end{display:flex;align-items:center;gap:18px;margin-left:auto;}
.ud-vd-brand{display:inline-flex;align-items:center;gap:.55rem;font-weight:800;letter-spacing:-.04em;color:inherit;text-decoration:none;font-size:1.05rem;}
.ud-vd-brand__mark{width:28px;height:28px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;background:var(--color-primary,#4ADE80);color:#052e16;}
.ud-vd-nav__links{display:flex;gap:1.35rem;}
.ud-vd-nav__link{color:inherit;text-decoration:none;font-size:.92rem;font-weight:500;opacity:.72;}
.ud-vd-nav__link:hover{opacity:1;}
.ud-vd-nav__actions{display:flex;align-items:center;gap:8px;}
.ud-vd-nav__toggle{display:none;margin-left:auto;border:0;background:transparent;color:inherit;}
.ud-vd-hero{overflow:hidden;text-align:center;padding-block:clamp(4rem,9vw,7rem) 3.5rem !important;}
.ud-vd-glow{position:absolute;inset:8% 18% auto;height:min(28rem,70cqi);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--color-primary,#4ADE80) 42%,transparent),transparent 68%);filter:blur(8px);pointer-events:none;z-index:0;animation:ud-vd-pulse 8s ease-in-out infinite;}
@keyframes ud-vd-pulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.08);opacity:1}}
.ud-vd-hero__copy{position:relative;z-index:1;max-width:44rem;margin-inline:auto;}
.ud-vd-hero__title{font-size:clamp(2.4rem,5.2cqi + .4rem,3.6rem);letter-spacing:-.045em;line-height:1.08;}
.ud-vd-hero__title em{font-style:normal;color:var(--color-primary,#4ADE80);}
.ud-vd-hero .ud-lead{max-width:34rem;margin-inline:auto;}
.ud-vd-hero__cta{margin-top:1.6rem;display:grid;gap:12px;justify-items:center;}
.ud-vd-badge{display:inline-flex;align-items:center;gap:10px;padding:6px 14px 6px 8px;border-radius:999px;background:#fff;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 8%,transparent);box-shadow:0 10px 30px -18px rgba(15,23,42,.35);font-size:.82rem;font-weight:600;margin-bottom:1.4rem;}
.ud-vd-badge__faces{display:flex;}
.ud-vd-badge__faces .ud-avatar{width:26px;height:26px;border:2px solid #fff;margin-left:-8px;font-size:.65rem;}
.ud-vd-badge__faces .ud-avatar:first-child{margin-left:0;}
.ud-vd-logos{padding-block:1.4rem !important;}
.ud-vd-logos__row{display:flex;flex-wrap:wrap;justify-content:center;gap:1.6rem 2.6rem;align-items:center;}
.ud-vd-logos__item{font-weight:800;letter-spacing:-.04em;font-size:1.15rem;color:#94a3b8;filter:grayscale(1);opacity:.85;}
.ud-vd-feat__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:3rem;align-items:center;}
.ud-vd-photos{position:relative;min-height:360px;}
.ud-vd-photos__a,.ud-vd-photos__b{position:absolute;width:62%;border-radius:22px;overflow:hidden;box-shadow:0 24px 50px -28px rgba(15,23,42,.45);}
.ud-vd-photos__a{left:0;top:8%;transform:rotate(-7deg);}
.ud-vd-photos__b{right:0;bottom:0;transform:rotate(6deg);}
.ud-vd-chip{display:inline-flex;margin:0 0 12px;padding:5px 12px;border-radius:999px;background:color-mix(in srgb,var(--color-primary,#4ADE80) 18%,#fff);color:#166534;font-size:.75rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}
.ud-vd-feat__list{display:grid;gap:1.15rem;margin-top:1.4rem;}
.ud-vd-feat__item{display:flex;gap:14px;align-items:flex-start;text-align:left;}
.ud-vd-feat__icon{width:36px;height:36px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;flex:none;}
.ud-vd-crew{background:linear-gradient(105deg,#f3e8ff 0%,#e0e7ff 52%,#fce7f3 100%);padding-block:3.2rem !important;}
.ud-vd-crew__inner{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2rem;align-items:center;}
.ud-vd-crew .ud-h2{max-width:14ch;}
.ud-vd-crew .ud-vd-btn{background:#fff;color:#0f172a;margin-top:1.2rem;box-shadow:0 10px 24px -16px rgba(15,23,42,.4);}
.ud-vd-crew__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.ud-vd-crew__grid .ud-avatar{width:100%;height:auto;aspect-ratio:1;border-radius:18px;font-size:1.4rem;}
.ud-vd-quotes .ud-h2{margin-bottom:2rem;}
.ud-vd-quotes__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;text-align:left;}
.ud-vd-card{background:#fff;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 8%,transparent);border-radius:22px;padding:1.2rem 1.25rem;box-shadow:0 10px 30px -24px rgba(15,23,42,.3);transition:transform .2s ease,box-shadow .2s ease;}
.ud-vd-card:hover{transform:translateY(-8px);box-shadow:0 22px 40px -24px rgba(15,23,42,.35);}
.ud-vd-quotes__card header{display:flex;gap:12px;align-items:center;margin-bottom:10px;}
.ud-vd-quotes__card .ud-avatar{width:44px;height:44px;}
.ud-vd-quotes__handle{display:flex;align-items:center;gap:6px;margin:2px 0 0;font-size:.82rem;color:var(--color-primary,#4ADE80);font-weight:600;}
.ud-vd-price .ud-h2{margin-bottom:1.2rem;}
.ud-vd-toggle{display:inline-flex;padding:5px;border-radius:999px;background:#f1f5f9;margin:0 auto 1.8rem;gap:4px;}
.ud-vd-toggle button{border:0;background:transparent;padding:8px 18px;border-radius:999px;font-weight:600;cursor:pointer;color:inherit;transition:background .2s ease,color .2s ease;}
.ud-vd-toggle button.is-on{background:var(--color-primary,#4ADE80);color:#052e16;}
.ud-vd-price__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;align-items:stretch;text-align:left;}
.ud-vd-price__card{display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden;}
.ud-vd-price__card--on{border-color:var(--color-primary,#4ADE80);transform:scale(1.04);box-shadow:0 24px 44px -28px color-mix(in srgb,var(--color-primary,#4ADE80) 70%,transparent);}
.ud-vd-price__card--on:hover{transform:scale(1.04) translateY(-8px);}
.ud-vd-price__wash{position:absolute;inset:0 0 auto;height:7.5rem;background:linear-gradient(180deg,color-mix(in srgb,var(--color-primary,#4ADE80) 35%,#fff),transparent);pointer-events:none;}
.ud-vd-price__top{display:flex;justify-content:space-between;align-items:center;position:relative;}
.ud-vd-price__amount{margin:0;font-size:2.4rem;font-weight:800;letter-spacing:-.04em;position:relative;}
.ud-vd-price__amount .ud-small{font-size:1rem;font-weight:500;margin-left:4px;}
.ud-vd-price__card .ud-list{flex:1;}
.ud-vd-price__card .ud-list svg{color:var(--color-primary,#4ADE80);}
.ud-vd-join__row{display:flex;justify-content:space-between;gap:1.5rem;align-items:center;}
.ud-vd-join .ud-h2{max-width:18ch;margin:0;}
.ud-vd-foot{background:linear-gradient(180deg,#ecfdf5,#ffffff);padding-block:3rem 1.6rem !important;}
.ud-vd-foot__grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:1.6rem;}
.ud-vd-foot ul{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px;}
.ud-vd-foot a{color:inherit;text-decoration:none;opacity:.72;font-size:.9rem;}
.ud-vd-foot a:hover{opacity:1;}
.ud-vd-foot .ud-small{margin-top:10px;max-width:16rem;}
.ud-vd-foot__base{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-top:2rem;padding-top:1rem;border-top:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 8%,transparent);}
.ud-vd-foot__social{display:flex;gap:10px;}
.ud-vd-foot__social a{width:34px;height:34px;border-radius:999px;border:1px solid color-mix(in srgb,var(--ud-fg,#0f172a) 12%,transparent);display:inline-flex;align-items:center;justify-content:center;opacity:1;}
@media (prefers-reduced-motion:reduce){
  .ud-vd-glow,.ud-vd-btn,.ud-vd-card{animation:none;transition:none;}
  .ud-vd-btn:hover,.ud-vd-card:hover,.ud-vd-price__card--on:hover{transform:none;}
}
@container udpage (max-width: 860px){
  .ud-vd-nav__links{display:none;position:absolute;left:0;right:0;top:100%;background:#fff;flex-direction:column;padding:12px 20px 18px;border-bottom:1px solid #e2e8f0;}
  .ud-vd-nav__links.is-open{display:flex;}
  .ud-vd-nav__toggle{display:inline-flex;}
  .ud-vd-nav__actions .ud-vd-btn--ghost{display:none;}
  .ud-vd-feat__grid,.ud-vd-crew__inner,.ud-vd-quotes__grid,.ud-vd-price__grid,.ud-vd-join__row,.ud-vd-foot__grid{grid-template-columns:1fr;}
  .ud-vd-photos{min-height:280px;}
  .ud-vd-price__card--on{transform:none;}
  .ud-vd-join__row{flex-direction:column;align-items:flex-start;}
  .ud-vd-foot__base{flex-direction:column;align-items:flex-start;}
}

.ud-sl-btn{transition:transform .18s ease,filter .18s ease;border-radius:12px;padding:11px 20px;font-weight:600;font-size:.92rem;box-shadow:0 10px 24px -16px color-mix(in srgb,var(--color-primary,#FF6B1A) 80%,transparent);}
.ud-sl-btn:hover{transform:translateY(-1px);filter:brightness(1.05);}
.ud-sl-btn--ghost{background:#fff;color:var(--ud-fg,#111);border:1px solid color-mix(in srgb,var(--ud-fg,#111) 12%,transparent);box-shadow:0 8px 20px -16px rgba(15,23,42,.35);}
.ud-sl-btn--ghost:hover{background:#fff;}
.ud-sl-nav{padding-block:14px !important;background:color-mix(in srgb,#fff 90%,transparent);backdrop-filter:blur(16px);z-index:40;}
.ud-sl-nav--sticky.ud-sl-nav--sticky{position:sticky;top:0;}
.ud-sl-nav__bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;position:relative;}
.ud-sl-nav__links{display:flex;gap:1.5rem;justify-self:center;}
.ud-sl-nav__link{color:inherit;text-decoration:none;font-size:.92rem;font-weight:500;opacity:.7;}
.ud-sl-nav__link:hover{opacity:1;}
.ud-sl-nav__actions{justify-self:end;display:flex;align-items:center;}
.ud-sl-nav__toggle{display:none;justify-self:end;border:0;background:transparent;color:inherit;}
.ud-sl-brand{display:inline-flex;align-items:center;gap:.55rem;font-weight:800;letter-spacing:-.04em;color:inherit;text-decoration:none;font-size:1.08rem;}
.ud-sl-brand__mark{width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:var(--color-primary,#FF6B1A);color:#fff;}
.ud-sl-hero{overflow:hidden;text-align:center;padding-block:clamp(3.2rem,8vw,6.2rem) 2.2rem !important;}
.ud-sl-glow{position:absolute;inset:-8% 6% auto;height:min(34rem,78cqi);border-radius:50%;background:
  radial-gradient(circle at 32% 40%,color-mix(in srgb,var(--color-primary,#FF6B1A) 38%,transparent),transparent 58%),
  radial-gradient(circle at 68% 45%,color-mix(in srgb,#93c5fd 46%,transparent),transparent 60%),
  radial-gradient(circle at 50% 70%,color-mix(in srgb,#f9a8d4 28%,transparent),transparent 62%);
  filter:blur(6px);pointer-events:none;z-index:0;}
.ud-sl-hero__copy{position:relative;z-index:1;max-width:42rem;margin-inline:auto;}
.ud-sl-hero__title{font-size:clamp(2.35rem,5cqi + .35rem,3.5rem);letter-spacing:-.05em;line-height:1.08;font-weight:800;}
.ud-sl-hero .ud-lead{max-width:34rem;margin-inline:auto;font-size:1.05rem;line-height:1.65;}
.ud-sl-hero__cta{margin-top:1.55rem;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;}
.ud-sl-play{width:22px;height:22px;border-radius:999px;border:1px solid color-mix(in srgb,var(--ud-fg,#111) 16%,transparent);display:inline-flex;align-items:center;justify-content:center;margin-right:8px;}
.ud-sl-badge{display:inline-flex;align-items:center;gap:10px;padding:6px 10px 6px 8px;border-radius:999px;background:#fff;border:1px solid color-mix(in srgb,var(--ud-fg,#111) 8%,transparent);box-shadow:0 12px 30px -20px rgba(15,23,42,.4);font-size:.82rem;font-weight:600;margin-bottom:1.45rem;}
.ud-sl-badge__faces{display:flex;}
.ud-sl-badge__faces .ud-avatar{width:26px;height:26px;border:2px solid #fff;margin-left:-8px;font-size:.65rem;}
.ud-sl-badge__faces .ud-avatar:first-child{margin-left:0;}
.ud-sl-badge__tag{background:var(--color-primary,#FF6B1A);color:#fff;border-radius:999px;padding:3px 8px;font-size:.7rem;font-weight:700;}
.ud-sl-stats{padding-block:0 2.6rem !important;}
.ud-sl-stats__row{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;max-width:44rem;margin-inline:auto;text-align:center;}
.ud-sl-stats__value{margin:0;font-size:clamp(2rem,4cqi,2.7rem);font-weight:800;letter-spacing:-.05em;line-height:1;}
.ud-sl-kicker{display:inline-flex;align-items:center;gap:8px;font-weight:700;margin:0 0 12px;font-size:1rem;}
.ud-sl-kicker--center{justify-content:center;}
.ud-sl-kicker__icon{width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:var(--color-primary,#FF6B1A);color:#fff;}
.ud-sl-feat__grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:3.2rem;align-items:center;}
.ud-sl-feat .ud-h2{max-width:14ch;}
.ud-sl-feat__cta{margin-top:1.4rem;}
.ud-sl-feat__cta .ud-sl-btn{padding:14px 28px;border-radius:14px;}
.ud-sl-feat__list{display:grid;gap:12px;}
.ud-sl-feat__card{display:flex;gap:14px;align-items:flex-start;text-align:left;padding:16px 18px;border-radius:18px;}
.ud-sl-feat__icon{width:38px;height:38px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;flex:none;}
.ud-sl-feat__card .ud-h4{margin:0 0 4px;font-size:1rem;}
.ud-sl-feat__card .ud-text{margin:0;font-size:.9rem;}
.ud-sl-faq__grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:2.4rem;align-items:start;}
.ud-sl-faq__list{margin-top:1.2rem;display:grid;gap:8px;}
.ud-sl-faq__item{border-bottom:1px solid color-mix(in srgb,var(--ud-fg,#111) 10%,transparent);padding-block:12px;}
.ud-sl-faq__item summary{list-style:none;display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:pointer;font-weight:650;}
.ud-sl-faq__item summary::-webkit-details-marker{display:none;}
.ud-sl-faq__body{margin:.75rem 0 0;color:var(--color-muted,#6b7280);font-size:.94rem;line-height:1.6;}
.ud-sl-faq__card{background:var(--color-accent,#8B7CF6);color:#fff;border-radius:28px;padding:2.2rem 1.8rem;min-height:280px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 24px 50px -28px rgba(99,102,241,.7);}
.ud-sl-faq__card .ud-h3{color:#fff;max-width:16ch;font-size:1.55rem;line-height:1.25;}
.ud-sl-faq__card .ud-sl-btn--ghost{align-self:flex-start;background:#fff;color:#111;border:0;}
.ud-sl-team .ud-h2{margin-bottom:1.8rem;}
.ud-sl-team__grid{display:grid;grid-template-columns:repeat(2,minmax(0,280px));justify-content:center;gap:1.6rem;}
.ud-sl-team__photo{border-radius:22px;overflow:hidden;filter:grayscale(1);margin-bottom:12px;}
.ud-sl-price .ud-h2{margin-bottom:.9rem;}
.ud-sl-toggle{display:inline-flex;padding:5px;border-radius:999px;background:#f1f5f9;margin:0 auto 1.8rem;gap:4px;}
.ud-sl-toggle button{border:0;background:transparent;padding:8px 18px;border-radius:999px;font-weight:600;cursor:pointer;color:inherit;}
.ud-sl-toggle button.is-on{background:#fff;box-shadow:0 6px 16px -10px rgba(15,23,42,.4);}
.ud-sl-price__grid{display:grid;grid-template-columns:repeat(2,minmax(0,320px));justify-content:center;gap:1.2rem;text-align:left;}
.ud-sl-price__card{background:#fff;border:1px solid color-mix(in srgb,var(--ud-fg,#111) 10%,transparent);border-radius:22px;padding:1.4rem 1.35rem;display:flex;flex-direction:column;gap:14px;box-shadow:0 16px 36px -28px rgba(15,23,42,.35);}
.ud-sl-price__amount{margin:0;font-size:2.35rem;font-weight:800;letter-spacing:-.05em;}
.ud-sl-price__amount .ud-small{font-size:1rem;font-weight:500;margin-left:4px;}
.ud-sl-price__card .ud-list svg{color:var(--color-primary,#FF6B1A);}
.ud-sl-quotes__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;align-items:stretch;text-align:left;}
.ud-sl-quotes__card{background:#fff;border:1px solid color-mix(in srgb,var(--ud-fg,#111) 8%,transparent);border-radius:22px;padding:1.25rem;display:flex;flex-direction:column;gap:12px;box-shadow:0 14px 32px -24px rgba(15,23,42,.3);}
.ud-sl-quotes__card .ud-stars{color:var(--color-primary,#FF6B1A);}
.ud-sl-quotes__card footer{display:flex;gap:10px;align-items:center;margin-top:auto;}
.ud-sl-quotes__card--on{background:var(--color-primary,#FF6B1A);color:#fff;border-color:transparent;}
.ud-sl-quotes__card--on .ud-text,.ud-sl-quotes__card--on .ud-small,.ud-sl-quotes__card--on .ud-stars{color:#fff;}
.ud-sl-more{display:inline-flex;margin-top:1.4rem;padding:8px 16px;border-radius:999px;background:#FFF1E6;color:var(--color-primary,#FF6B1A);font-weight:650;font-size:.85rem;text-decoration:none;}
.ud-sl-foot{background:linear-gradient(180deg,#FFE4CC 0%,#FFF1E6 55%,#fff 100%);padding-block:3.4rem 2rem !important;overflow:hidden;}
.ud-sl-foot__inner{position:relative;}
.ud-sl-foot__mark{position:absolute;right:-2%;bottom:-18%;font-size:clamp(5rem,18cqi,10rem);font-weight:800;letter-spacing:-.06em;opacity:.08;pointer-events:none;line-height:.8;}
.ud-sl-foot__grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:1.6rem;position:relative;}
.ud-sl-foot ul{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px;}
.ud-sl-foot a{color:inherit;text-decoration:none;opacity:.72;font-size:.9rem;}
.ud-sl-foot a:hover{opacity:1;}
.ud-sl-foot .ud-small{margin-top:10px;}
@media (prefers-reduced-motion:reduce){
  .ud-sl-btn,.ud-sl-quotes__card{transition:none;}
  .ud-sl-btn:hover{transform:none;}
}
@container udpage (max-width: 860px){
  .ud-sl-nav__bar{grid-template-columns:1fr auto;}
  .ud-sl-nav__links{display:none;position:absolute;left:0;right:0;top:100%;background:#fff;flex-direction:column;padding:12px 20px 18px;border-bottom:1px solid #e2e8f0;}
  .ud-sl-nav__links.is-open{display:flex;}
  .ud-sl-nav__toggle{display:inline-flex;}
  .ud-sl-nav__actions{display:none;}
  .ud-sl-feat__grid,.ud-sl-faq__grid,.ud-sl-quotes__grid,.ud-sl-price__grid,.ud-sl-foot__grid,.ud-sl-stats__row,.ud-sl-team__grid{grid-template-columns:1fr;}
  .ud-sl-hero__cta{flex-direction:column;}
}

.ud-mk{--ud-max:1180px;}
.ud-mk-btn{border-radius:8px;padding:12px 24px;font-weight:500;font-size:.875rem;transition:transform .18s ease,filter .18s ease;box-shadow:none;}
.ud-mk-btn:hover{transform:translateY(-1px);filter:brightness(1.05);}
.ud-mk-btn--light{background:#fff;color:#111827;border:0;border-radius:999px;box-shadow:none;}
.ud-mk-nav{padding-block:var(--ud-pt,16px) var(--ud-pb,16px) !important;background:#fff;border-bottom:0;z-index:40;}
.ud-mk-nav--sticky.ud-mk-nav--sticky{position:sticky;top:0;}
.ud-mk-nav__bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;position:relative;}
.ud-mk-nav__links{display:flex;gap:3rem;justify-self:center;}
.ud-mk-nav__link{color:#111827;text-decoration:none;font-size:.875rem;font-weight:500;opacity:1;}
.ud-mk-nav__link:hover{opacity:1;}
.ud-mk-nav__actions{justify-self:end;}
.ud-mk-nav__toggle{display:none;justify-self:end;border:0;background:transparent;color:inherit;}
.ud-mk-brand{display:inline-flex;align-items:center;gap:.6rem;font-weight:700;letter-spacing:-.025em;color:#111827;text-decoration:none;font-size:1.5rem;}
.ud-mk-brand__mark{width:34px;height:34px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:var(--color-primary,#5337ff);color:#fff;font-size:1.25rem;font-weight:700;letter-spacing:0;}
.ud-mk-hero{position:relative;display:grid;align-items:center;padding-block:var(--ud-pt,5rem) var(--ud-pb,5rem) !important;color:#fff;background-color:#111827;background-position:center !important;}
.ud-mk-hero__overlay{position:absolute;inset:0;background:rgba(15,23,42,.38);z-index:1;}
.ud-mk-hero__copy{position:relative;z-index:2;text-align:center;max-width:760px;margin-inline:auto;}
.ud-mk-hero .ud-h1{color:#fff;font-size:58px;letter-spacing:-.035em;line-height:1.05;font-weight:600;max-width:720px;margin-inline:auto;}
.ud-mk-hero .ud-lead{color:#fff;max-width:650px;margin:24px auto 18px;font-size:16px;line-height:1.65;}
.ud-mk-eyebrow{display:inline-flex;align-items:center;justify-content:center;color:#667085;font-weight:400;font-size:.8rem;letter-spacing:0;text-transform:none;margin:0 0 14px;padding:5px 12px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;}
.ud-mk-section-head{text-align:center;margin-bottom:70px;}
.ud-mk-section-head .ud-h2,.ud-mk-about .ud-h2,.ud-mk-feat .ud-h2,.ud-mk-benefits .ud-h2,.ud-mk-quotes .ud-h2,.ud-mk-price .ud-h2,.ud-mk-faq .ud-h2,.ud-mk-cta .ud-h2{font-size:42px;line-height:1.15;font-weight:600;letter-spacing:-.035em;}
.ud-mk-about{padding-block:var(--ud-pt,108px) var(--ud-pb,126px);}
.ud-mk-about__grid,.ud-mk-story__grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;max-width:1050px;margin-inline:auto;}
.ud-mk-about__photo{border-radius:12px;overflow:hidden;aspect-ratio:1/1.1;}
.ud-mk-about .ud-h3{margin:0 0 20px;font-size:2rem;line-height:1.25;font-weight:500;letter-spacing:-.025em;max-width:500px;}
.ud-mk-about .ud-text{max-width:500px;font-size:15px;line-height:1.65;}
.ud-mk-about__stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:28px 0 26px;max-width:340px;border:1px solid #e5e7eb;}
.ud-mk-about__stat{text-align:center;padding:16px 10px;border-right:1px solid #e5e7eb;}
.ud-mk-about__stat:last-child{border-right:0;}
.ud-mk-about__stat-icon{display:none;}
.ud-mk-about__stat-value{margin:0;font-size:1.35rem;font-weight:600;letter-spacing:-.03em;}
.ud-mk-about__stat .ud-small{margin:2px 0 0;font-size:.7rem;color:#667085;}
.ud-mk-feat{padding-block:var(--ud-pt,100px) var(--ud-pb,134px);}
.ud-mk-feat>.ud-container>.ud-h2{margin-bottom:48px;}
.ud-mk-feat__grid{display:grid;grid-template-columns:1.25fr .9fr;gap:48px;align-items:start;}
.ud-mk-feat__list{display:grid;gap:0;}
.ud-mk-feat__item{display:grid;grid-template-columns:48px 1fr 34px;gap:16px;align-items:center;padding:20px 0;border-bottom:1px solid #e5e7eb;}
.ud-mk-feat__number,.ud-mk-feat__arrow{width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#f7f7f8;color:#344054;font-size:.75rem;flex:none;}
.ud-mk-feat__item .ud-h4{font-size:1rem;margin:0 0 4px;font-weight:600;}
.ud-mk-feat__item .ud-text{font-size:.86rem;line-height:1.55;margin:0;}
.ud-mk-feat__arrow{justify-self:end;}
.ud-mk-feat__visual{display:flex;flex-direction:column;gap:20px;}
.ud-mk-feat__more{align-self:flex-end;display:inline-flex;align-items:center;gap:8px;color:#667085;text-decoration:none;font-size:.82rem;}
.ud-mk-feat__photo{border-radius:10px;overflow:hidden;aspect-ratio:4/5;}
.ud-mk-benefits{padding-block:var(--ud-pt,114px) var(--ud-pb,126px);}
.ud-mk-benefits .ud-h2{margin-bottom:16px;}
.ud-mk-benefits .ud-lead,.ud-mk-price .ud-lead,.ud-mk-faq .ud-lead{max-width:590px;margin:0 auto 56px;font-size:.92rem;line-height:1.65;}
.ud-mk-benefits__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;text-align:left;}
.ud-mk-benefits__card{background:#fafafa;border:0;border-radius:12px;padding:24px;box-shadow:none;min-height:150px;}
.ud-mk-benefits__icon{width:38px;height:38px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#f3f4f6;color:#111827;margin-bottom:16px;}
.ud-mk-benefits__card .ud-h4{font-weight:500;margin-bottom:8px;}
.ud-mk-benefits__card .ud-text{font-size:.82rem;line-height:1.5;margin:0;}
.ud-mk-story{padding-block:var(--ud-pt,116px) var(--ud-pb,128px);}
.ud-mk-story__grid{max-width:1100px;}
.ud-mk-story__photo{border-radius:12px;overflow:hidden;aspect-ratio:1.36/1;}
.ud-mk-story .ud-h2{font-size:34px;font-weight:500;letter-spacing:-.03em;margin-bottom:16px;}
.ud-mk-story__list{display:grid;gap:14px;margin-top:24px;}
.ud-mk-story__item{display:grid;grid-template-columns:48px 1fr;gap:16px;align-items:center;}
.ud-mk-story__icon{width:46px;height:46px;border:1px solid #e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#4b5563;}
.ud-mk-story__item .ud-h4{font-size:.95rem;font-weight:500;margin-bottom:3px;}
.ud-mk-story__item .ud-small{margin:0;color:#667085;font-size:.78rem;}
.ud-mk-quotes{padding-block:var(--ud-pt,116px) var(--ud-pb,132px);}
.ud-mk-quotes .ud-h2{margin-bottom:62px;}
.ud-mk-quotes__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;text-align:left;}
.ud-mk-quotes__card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:22px;display:flex;flex-direction:column;gap:14px;min-height:178px;}
.ud-mk-quotes__card .ud-stars{color:#172033;}
.ud-mk-quotes__card .ud-text{font-size:.82rem;line-height:1.55;margin:0;}
.ud-mk-quotes__card footer{display:flex;gap:10px;align-items:center;margin-top:auto;}
.ud-mk-price{padding-block:var(--ud-pt,120px) var(--ud-pb,138px);}
.ud-mk-price .ud-h2{margin-bottom:18px;}
.ud-mk-price__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;align-items:stretch;text-align:left;}
.ud-mk-price__card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px 20px 20px;display:flex;flex-direction:column;gap:14px;position:relative;}
.ud-mk-price__card--on{background:#f3f4ff;border-color:#e5e7eb;box-shadow:none;}
.ud-mk-price__badge{position:absolute;top:0;right:0;background:var(--color-primary,#5337ff);color:#fff;border-radius:0 10px 0 0;padding:6px 12px;font-size:.65rem;font-weight:600;text-transform:none;letter-spacing:0;}
.ud-mk-price__amount{margin:0;font-size:1.65rem;font-weight:600;letter-spacing:-.04em;}
.ud-mk-price__amount .ud-small{font-size:.75rem;font-weight:400;margin-left:5px;}
.ud-mk-price__tagline{margin:0 0 8px;color:#667085;}
.ud-mk-price__card .ud-list{flex:1;}
.ud-mk-price__card .ud-list{font-size:.78rem;line-height:1.7;}
.ud-mk-price__card .ud-list svg{color:#667085;}
.ud-mk-price__card .ud-mk-btn{width:100%;}
.ud-mk-faq{padding-block:var(--ud-pt,122px) var(--ud-pb,138px);}
.ud-mk-faq .ud-h2{margin-bottom:16px;}
.ud-mk-faq__grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;text-align:left;}
.ud-mk-faq__col{display:grid;gap:14px;align-content:start;}
.ud-mk-faq__item{background:#f7f8fa;border:1px solid #e7eaf0;border-radius:8px;padding:15px 16px;}
.ud-mk-faq__item summary{list-style:none;display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:pointer;font-weight:650;}
.ud-mk-faq__item summary::-webkit-details-marker{display:none;}
.ud-mk-faq__body{margin:.75rem 0 0;color:var(--color-muted,#64748B);font-size:.94rem;line-height:1.6;}
.ud-mk-cta{padding-block:var(--ud-pt,128px) var(--ud-pb,150px);}
.ud-mk-cta .ud-h2{max-width:18ch;margin-inline:auto;}
.ud-mk-cta .ud-lead{margin:18px auto 24px;max-width:480px;font-size:.9rem;line-height:1.55;}
.ud-mk-foot{padding-block:var(--ud-pt,60px) var(--ud-pb,22px) !important;background:#fafafa;border-top:0;}
.ud-mk-foot__grid{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:3rem;}
.ud-mk-foot .ud-mk-brand{margin-bottom:20px;}
.ud-mk-foot>.ud-container>.ud-mk-foot__grid>div:first-child>.ud-small{max-width:330px;line-height:1.8;color:#667085;}
.ud-mk-foot ul{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px;font-size:.9rem;color:var(--color-muted,#64748B);}
.ud-mk-foot a{color:inherit;text-decoration:none;opacity:.78;}
.ud-mk-foot a:hover{opacity:1;color:var(--color-primary,#6366F1);}
.ud-mk-foot__social{display:flex;gap:10px;margin-top:14px;}
.ud-mk-foot__social a{width:34px;height:34px;border-radius:999px;border:1px solid color-mix(in srgb,var(--ud-fg,#111) 12%,transparent);display:inline-flex;align-items:center;justify-content:center;}
.ud-mk-foot__base{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-top:52px;padding-top:20px;border-top:1px solid #e5e7eb;}
.ud-mk-foot__legal{display:flex;gap:14px;}
@media (prefers-reduced-motion:reduce){.ud-mk-btn:hover{transform:none;}}
@container udpage (max-width: 860px){
  .ud-mk-nav__bar{grid-template-columns:1fr auto;}
  .ud-mk-nav__links{display:none;position:absolute;left:0;right:0;top:100%;background:#fff;flex-direction:column;padding:12px 20px 18px;border-bottom:1px solid #e2e8f0;}
  .ud-mk-nav__links.is-open{display:flex;}
  .ud-mk-nav__toggle{display:inline-flex;}
  .ud-mk-nav__actions{display:none;}
  .ud-mk-hero{min-height:680px !important;}
  .ud-mk-hero .ud-h1{font-size:clamp(2.5rem,10vw,3.6rem);}
  .ud-mk-about__grid,.ud-mk-feat__grid,.ud-mk-story__grid,.ud-mk-benefits__grid,.ud-mk-quotes__grid,.ud-mk-price__grid,.ud-mk-faq__grid,.ud-mk-foot__grid{grid-template-columns:1fr;}
  .ud-mk-about__stats{grid-template-columns:repeat(3,1fr);}
  .ud-mk-feat__visual{margin-top:20px;}
  .ud-mk-foot__base{flex-direction:column;align-items:flex-start;}
}

/* Cinder & Row — full-width editorial local-service kit */
.ud-cr-wide{width:min(100% - 64px,1800px);margin-inline:auto;}
.ud-cr-kicker{margin:0 0 28px;font:600 .72rem/1.2 var(--font-body,Arial,sans-serif);letter-spacing:.28em;text-transform:uppercase;color:#303030;}
.ud-cr-title{font-family:var(--font-heading,Georgia,serif);font-weight:600;font-size:clamp(3.2rem,6.1vw,7.6rem);line-height:.88;letter-spacing:-.065em;max-width:11ch;}
.ud-cr-title>*{display:block;margin:0;color:#070707;}
.ud-cr-title .ud-cr-accent,.ud-cr-accent{color:#ff5a1f;font-style:italic;font-weight:400;}
.ud-cr-copy,.ud-cr-lead{font-size:1.05rem;line-height:1.6;max-width:620px;color:#292929;}
.ud-cr-lead{font-size:1.18rem;margin:36px 0;}
.ud-cr-section-head{display:flex;justify-content:space-between;align-items:end;gap:60px;margin-bottom:64px;}
.ud-cr-section-head .ud-cr-title{font-size:clamp(3rem,5vw,6rem);}
.ud-cr-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.ud-cr-button{display:inline-flex!important;align-items:center;gap:10px!important;padding:14px 24px!important;border-radius:999px!important;font-weight:700!important;}
.ud-cr-button--black{background:#050505!important;color:#fff!important;border-color:#050505!important;}
.ud-cr-link{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:1px solid rgba(0,0,0,.16);border-radius:999px;padding:13px 22px;text-decoration:none;color:#111;font-weight:650;background:rgba(255,255,255,.8);}
.ud-cr-link--dark{border-radius:8px;background:#050505;color:#fff;border-color:#050505;}
.ud-cr-nav{padding:22px 32px;background:#fff;position:relative;z-index:45;}
.ud-cr-nav--sticky.ud-cr-nav--sticky{position:sticky;top:0;}
.ud-cr-nav__bar{width:min(100%,1800px);margin:auto;border:1px solid #e4e4e4;border-radius:999px;min-height:68px;padding:8px 16px 8px 24px;display:grid;grid-template-columns:1.2fr 1.8fr .7fr auto;align-items:center;gap:24px;background:rgba(255,255,255,.96);}
.ud-cr-brand{display:flex;align-items:center;gap:12px;color:#090909;text-decoration:none;font:700 1rem var(--font-heading,Georgia,serif);}
.ud-cr-brand__mark{width:34px;height:34px;border-radius:50%;background:#050505;color:#ff5a1f;display:grid;place-items:center;}
.ud-cr-brand small{display:block;font:500 .55rem var(--font-body,Arial,sans-serif);letter-spacing:.24em;margin-top:3px;}
.ud-cr-nav__links{display:flex;justify-content:center;gap:42px;}
.ud-cr-nav__links a{color:#111;text-decoration:none;font-size:.86rem;}
.ud-cr-nav__status{font-size:.7rem;letter-spacing:.18em;white-space:nowrap;}
.ud-cr-nav__status i{display:inline-block;width:7px;height:7px;background:#ff5a1f;border-radius:50%;margin-right:8px;}
.ud-cr-nav__toggle{display:none;border:0;background:transparent;}
.ud-cr-hero{position:relative;min-height:850px!important;background-position:center;background-size:cover;display:flex;align-items:center;padding-block:120px 90px!important;}
.ud-cr-hero__wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.94) 0%,rgba(255,255,255,.76) 38%,rgba(255,255,255,.13) 78%);}
.ud-cr-hero__copy{position:relative;z-index:2;}
.ud-cr-hero .ud-cr-title{font-size:clamp(4.5rem,8.3vw,10rem);max-width:7.2ch;}
.ud-cr-hero .ud-cr-lead{max-width:470px;}
.ud-cr-badges{display:flex;gap:10px;flex-wrap:wrap;margin-top:46px;}
.ud-cr-badges span{background:rgba(255,255,255,.9);border:1px solid #ddd;border-radius:999px;padding:9px 14px;font-size:.62rem;font-weight:700;letter-spacing:.18em;}
.ud-cr-badges i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#ff5a1f;margin-right:7px;}
.ud-cr-intro{padding-block:100px 120px!important;}
.ud-cr-intro .ud-cr-lead{max-width:650px;}
.ud-cr-bento,.ud-cr-split,.ud-cr-testimonials,.ud-cr-gallery,.ud-cr-service-list,.ud-cr-pricing,.ud-cr-process,.ud-cr-timeline,.ud-cr-values,.ud-cr-journal,.ud-cr-contact{padding-block:130px!important;background:#faf9f7;}
.ud-cr-bento__grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;}
.ud-cr-bento__card{grid-column:span 4;min-height:235px;border:1px solid #dedede;border-radius:22px;padding:28px;display:flex;flex-direction:column;background:#fff;background-size:cover;background-position:center;overflow:hidden;}
.ud-cr-bento__card:first-child{grid-column:span 6;grid-row:span 2;min-height:510px;}
.ud-cr-bento__card:last-child{grid-column:span 8;}
.ud-cr-bento__card.is-orange{background:#ff5a1f;border-color:#ff5a1f;}
.ud-cr-bento__card.is-dark,.ud-cr-bento__card.is-photo{color:#fff;background-color:#080808;}
.ud-cr-bento__card.is-photo .ud-cr-kicker,.ud-cr-bento__card.is-photo .ud-cr-copy{color:#fff;}
.ud-cr-bento__card h3{font:600 clamp(1.8rem,3vw,3.6rem)/.95 var(--font-heading,Georgia,serif);margin:auto 0 18px;}
.ud-cr-bento__card h3>*{display:block;}
.ud-cr-bento__card strong{font:600 1.4rem var(--font-heading,Georgia,serif);margin-top:auto;}
.ud-cr-split{background:#fff;}
.ud-cr-split__grid{display:grid;grid-template-columns:.75fr 1.25fr;align-items:center;gap:80px;}
.ud-cr-split__media{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ud-cr-split__media>*{border-radius:18px;overflow:hidden;}
.ud-cr-split__media>*:last-child{grid-column:1/-1;aspect-ratio:2.2/1;}
.ud-cr-split .ud-cr-link{margin-top:26px;}
.ud-cr-ticker{overflow:hidden;padding:25px 0;}
.ud-cr-ticker.is-dark{background:#050505;color:#fff;}
.ud-cr-ticker.is-orange{background:#ff5a1f;color:#050505;}
.ud-cr-ticker>div{display:flex;width:max-content;animation:ud-cr-marquee 36s linear infinite;}
.ud-cr-ticker span{font:500 clamp(2.2rem,4vw,5rem) var(--font-heading,Georgia,serif);white-space:nowrap;display:flex;align-items:center;}
.ud-cr-ticker i{font-style:normal;font-size:.45em;margin:0 44px;opacity:.6;}
@keyframes ud-cr-marquee{to{transform:translateX(-50%)}}
.ud-cr-coverage{background:#050505!important;color:#fff;padding-block:130px!important;}
.ud-cr-coverage .ud-cr-title>*,.ud-cr-coverage .ud-cr-copy,.ud-cr-coverage .ud-cr-kicker{color:#fff;}
.ud-cr-coverage .ud-cr-accent{color:#ff5a1f;}
.ud-cr-coverage__grid{display:grid;grid-template-columns:1fr 1.15fr;gap:32px;align-items:start;}
.ud-cr-coverage__areas{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.ud-cr-coverage__areas article{border:1px solid #333;border-radius:10px;padding:22px;background:#101010;}
.ud-cr-coverage__areas strong{display:block;font:500 2rem var(--font-heading,Georgia,serif);}
.ud-cr-coverage__areas p{margin:8px 0;font-weight:650;}
.ud-cr-coverage__areas small{font-size:.58rem;letter-spacing:.14em;}
.ud-cr-coverage .ud-media{border-radius:12px;overflow:hidden;filter:grayscale(1) contrast(.85);}
.ud-cr-testimonials{background:#fff;}
.ud-cr-testimonials__grid{display:grid;grid-template-columns:.55fr 1.45fr;gap:80px;align-items:center;}
.ud-cr-testimonials blockquote{font:500 clamp(2rem,3.5vw,4.8rem)/1.02 var(--font-heading,Georgia,serif);margin:0 0 38px;}
.ud-cr-testimonials small{display:block;color:#666;margin-top:4px;}
.ud-cr-testimonials__arrows{display:flex;gap:8px;margin-top:32px;}
.ud-cr-testimonials__arrows button{width:42px;height:42px;border-radius:50%;border:1px solid #ddd;background:#fff;}
.ud-cr-testimonials__tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:36px;}
.ud-cr-testimonials__tabs button{text-align:left;border:1px solid #ddd;background:#fff;padding:14px;border-radius:8px;}
.ud-cr-testimonials__tabs .is-active{background:#050505;color:#fff;}
.ud-cr-gallery{background:#faf9f7;}
.ud-cr-gallery__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:58px;}
.ud-cr-gallery__grid>*{border-radius:12px;overflow:hidden;}
.ud-cr-service-list .ud-cr-pills,.ud-cr-pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.ud-cr-pills button{border:1px solid #ddd;border-radius:999px;padding:10px 18px;background:#fff;}
.ud-cr-pills button.is-active{background:#050505;color:#fff;border-color:#050505;}
.ud-cr-service-row{display:grid;grid-template-columns:1fr 1.35fr .25fr;gap:40px;align-items:center;padding:30px 0;border-top:1px solid #d7d7d7;}
.ud-cr-service-row h3{font:500 1.5rem var(--font-heading,Georgia,serif);margin:0 0 10px;}
.ud-cr-service-row small{font-size:.63rem;letter-spacing:.18em;}
.ud-cr-service-row>div:last-child{text-align:right;}
.ud-cr-service-row>div:last-child strong{display:block;font:500 2rem var(--font-heading,Georgia,serif);}
.ud-cr-pricing{background:#fff;}
.ud-cr-pricing__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.ud-cr-pricing__grid article{border:1px solid #ddd;border-radius:12px;padding:36px;display:flex;flex-direction:column;min-height:470px;}
.ud-cr-pricing__grid article.is-featured{background:#050505;color:#fff;}
.ud-cr-pricing__grid article.is-featured .ud-cr-kicker{color:#ff5a1f;}
.ud-cr-pricing__grid h3{font:500 2rem var(--font-heading,Georgia,serif);margin:12px 0 26px;}
.ud-cr-pricing__grid article>strong{font:500 3.4rem var(--font-heading,Georgia,serif);}
.ud-cr-pricing__grid ul{list-style:none;padding:20px 0;margin:0;line-height:2.2;flex:1;}
.ud-cr-pricing__grid li{font-size:.92rem;}
.ud-cr-process{background:#faf9f7;}
.ud-cr-process__grid,.ud-cr-values__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:60px;}
.ud-cr-process__grid article,.ud-cr-values__grid article{background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:34px;min-height:240px;}
.ud-cr-process__grid span,.ud-cr-values__grid span{font:500 2.8rem var(--font-heading,Georgia,serif);color:#aaa;}
.ud-cr-process__grid h3,.ud-cr-values__grid h3{font:500 1.45rem var(--font-heading,Georgia,serif);margin:40px 0 12px;}
.ud-cr-timeline{background:#fff;}
.ud-cr-timeline__grid{display:grid;grid-template-columns:.55fr 1.45fr;gap:80px;}
.ud-cr-timeline__grid article{display:grid;grid-template-columns:48px 1fr auto;gap:24px;padding:0 0 36px;position:relative;}
.ud-cr-timeline__grid article i{width:42px;height:42px;border:2px solid #111;border-radius:50%;display:grid;place-items:center;font:600 .75rem var(--font-heading,Georgia,serif);font-style:normal;background:#fff;z-index:2;}
.ud-cr-timeline__grid article:not(:last-child):before{content:"";position:absolute;left:20px;top:40px;bottom:-2px;width:1px;background:#111;}
.ud-cr-timeline__grid h3{font:500 1.45rem var(--font-heading,Georgia,serif);margin:5px 0 8px;}
.ud-cr-timeline__grid article>strong{color:#ff5a1f;font-size:.72rem;letter-spacing:.2em;margin-top:10px;}
.ud-cr-values{background:#faf9f7;}
.ud-cr-values__grid{grid-template-columns:1fr 1fr;}
.ud-cr-journal{background:#faf9f7;}
.ud-cr-journal__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:58px;}
.ud-cr-journal__grid article{background:#fff;border:1px solid #ddd;border-radius:12px;overflow:hidden;}
.ud-cr-journal__grid article>div:last-child{padding:28px;}
.ud-cr-journal__grid article span{font-size:.64rem;letter-spacing:.16em;color:#555;}
.ud-cr-journal__grid article h3{font:500 1.55rem/1.12 var(--font-heading,Georgia,serif);margin:18px 0;}
.ud-cr-journal__grid article.is-featured{grid-column:1/-1;display:grid;grid-template-columns:1.35fr 1fr;align-items:center;}
.ud-cr-journal__grid article.is-featured h3{font-size:clamp(2rem,3.6vw,4.6rem);}
.ud-cr-journal .ud-cr-link{margin-top:16px;}
.ud-cr-contact{background:#faf9f7;}
.ud-cr-contact__grid{display:grid;grid-template-columns:.7fr 1.3fr;gap:70px;align-items:start;}
.ud-cr-contact dl{margin-top:42px;display:grid;gap:18px;}
.ud-cr-contact dl div{display:grid;grid-template-columns:100px 1fr;gap:12px;}
.ud-cr-contact dt{font-size:.62rem;letter-spacing:.2em;}
.ud-cr-contact dd{margin:0;font-weight:650;}
.ud-cr-contact form{background:#fff;border:1px solid #ddd;border-radius:12px;padding:38px;display:grid;gap:24px;}
.ud-cr-form__two{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.ud-cr-contact label,.ud-cr-contact legend{font-size:.64rem;letter-spacing:.18em;font-weight:600;}
.ud-cr-contact input,.ud-cr-contact textarea{display:block;width:100%;border:1px solid #ddd;background:#fafafa;border-radius:7px;padding:14px;margin-top:9px;font:400 .9rem var(--font-body,Arial,sans-serif);}
.ud-cr-contact fieldset{border:0;padding:0;margin:0;}
.ud-cr-contact .ud-cr-pills label{position:relative;cursor:pointer;font-size:.78rem;letter-spacing:0;font-weight:500;}
.ud-cr-contact .ud-cr-pills label input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;margin:0;padding:0;}
.ud-cr-contact .ud-cr-pills label span{display:block;border:1px solid #d8d6d2;border-radius:999px;padding:10px 15px;background:#fff;transition:.2s ease;}
.ud-cr-contact .ud-cr-pills label input:checked+span{background:#080808;border-color:#080808;color:#fff;}
.ud-cr-contact .ud-cr-pills label input:focus-visible+span{outline:3px solid color-mix(in srgb,#ff5a1f 45%,transparent);outline-offset:2px;}
.ud-cr-contact .ud-form__status[data-status="ok"]{padding:12px 14px;border-radius:8px;background:#ecfdf3;color:#166534!important;}
.ud-cr-cta{background:#ff5a1f!important;padding-block:105px!important;}
.ud-cr-cta__grid{display:grid;grid-template-columns:1.2fr .8fr;gap:80px;align-items:center;}
.ud-cr-cta .ud-cr-title{font-size:clamp(3.3rem,6vw,7rem);}
.ud-cr-cta .ud-cr-accent{color:#111;}
.ud-cr-cta__grid>div:last-child{display:grid;gap:10px;}
.ud-cr-cta .ud-cr-link{border-radius:8px;justify-content:flex-start;padding:18px 22px;background:rgba(0,0,0,.06);color:#111;border-color:rgba(0,0,0,.18);}
.ud-cr-cta .ud-cr-link:first-child{background:#050505;color:#fff;}
.ud-cr-cta .ud-cr-link svg:last-child{margin-left:auto;}
.ud-cr-footer{background:#050505;color:#fff;padding:90px 0 20px;}
.ud-cr-footer__grid{display:grid;grid-template-columns:1.7fr .65fr .85fr;gap:80px;}
.ud-cr-footer__grid>div:first-child>strong{font:600 1.2rem var(--font-heading,Georgia,serif);}
.ud-cr-footer h2{font:500 clamp(2.4rem,4.5vw,5.6rem)/.95 var(--font-heading,Georgia,serif);max-width:10ch;margin:28px 0;}
.ud-cr-footer .ud-cr-copy{color:#ccc;}
.ud-cr-footer nav{display:grid;align-content:start;gap:12px;}
.ud-cr-footer nav a{color:#fff;text-decoration:none;}
.ud-cr-footer__grid span{font-size:.62rem;letter-spacing:.2em;color:#aaa;}
.ud-cr-footer__base{border-top:1px solid #292929;margin-top:70px;padding-top:20px;font-size:.75rem;color:#aaa;}
@keyframes ud-cr-curtain{0%{transform:scaleX(1)}100%{transform:scaleX(0)}}
@keyframes ud-cr-reveal{0%{opacity:0;transform:translateY(34px)}100%{opacity:1;transform:translateY(0)}}
@keyframes ud-cr-card-in{0%{opacity:0;transform:translateY(28px) scale(.985)}100%{opacity:1;transform:translateY(0) scale(1)}}
.ud-cr-hero[data-ud-anim="load"]::after{content:"";position:absolute;inset:0;background:#ff5a1f;z-index:12;pointer-events:none;transform-origin:right center;animation:ud-cr-curtain 1.05s .08s cubic-bezier(.76,0,.24,1) both;}
.ud-cr-hero[data-ud-anim="load"] .ud-cr-kicker,.ud-cr-hero[data-ud-anim="load"] .ud-cr-title>*,.ud-cr-hero[data-ud-anim="load"] .ud-cr-lead,.ud-cr-hero[data-ud-anim="load"] .ud-cr-actions,.ud-cr-hero[data-ud-anim="load"] .ud-cr-badges{opacity:0;animation:ud-cr-reveal .82s cubic-bezier(.22,1,.36,1) both;}
.ud-cr-hero[data-ud-anim="load"] .ud-cr-kicker{animation-delay:.62s}.ud-cr-hero[data-ud-anim="load"] .ud-cr-title>*:first-child{animation-delay:.72s}.ud-cr-hero[data-ud-anim="load"] .ud-cr-title>*:last-child{animation-delay:.84s}.ud-cr-hero[data-ud-anim="load"] .ud-cr-lead{animation-delay:.96s}.ud-cr-hero[data-ud-anim="load"] .ud-cr-actions{animation-delay:1.06s}.ud-cr-hero[data-ud-anim="load"] .ud-cr-badges{animation-delay:1.16s}
.ud-cr-bento:is(.ud-anim-in,[data-ud-anim="load"]) .ud-cr-bento__card,.ud-cr-gallery:is(.ud-anim-in,[data-ud-anim="load"]) .ud-cr-gallery__grid>*,.ud-cr-pricing:is(.ud-anim-in,[data-ud-anim="load"]) .ud-cr-pricing__grid>*,.ud-cr-process:is(.ud-anim-in,[data-ud-anim="load"]) .ud-cr-process__grid>*,.ud-cr-values:is(.ud-anim-in,[data-ud-anim="load"]) .ud-cr-values__grid>*,.ud-cr-journal:is(.ud-anim-in,[data-ud-anim="load"]) .ud-cr-journal__grid>*{animation:ud-cr-card-in .72s cubic-bezier(.22,1,.36,1) both;}
.ud-cr-bento__card:nth-child(2),.ud-cr-gallery__grid>*:nth-child(2),.ud-cr-pricing__grid>*:nth-child(2),.ud-cr-process__grid>*:nth-child(2),.ud-cr-values__grid>*:nth-child(2),.ud-cr-journal__grid>*:nth-child(2){animation-delay:.1s!important}.ud-cr-bento__card:nth-child(3),.ud-cr-gallery__grid>*:nth-child(3),.ud-cr-pricing__grid>*:nth-child(3),.ud-cr-process__grid>*:nth-child(3),.ud-cr-values__grid>*:nth-child(3),.ud-cr-journal__grid>*:nth-child(3){animation-delay:.2s!important}.ud-cr-bento__card:nth-child(4),.ud-cr-gallery__grid>*:nth-child(4),.ud-cr-process__grid>*:nth-child(4),.ud-cr-values__grid>*:nth-child(4),.ud-cr-journal__grid>*:nth-child(4){animation-delay:.3s!important}.ud-cr-bento__card:nth-child(5),.ud-cr-gallery__grid>*:nth-child(5),.ud-cr-process__grid>*:nth-child(5),.ud-cr-journal__grid>*:nth-child(5){animation-delay:.4s!important}.ud-cr-gallery__grid>*:nth-child(6){animation-delay:.5s!important}
.ud-cr-bento__card,.ud-cr-gallery__grid>*,.ud-cr-pricing__grid>*,.ud-cr-process__grid>*,.ud-cr-values__grid>*,.ud-cr-journal__grid>*{will-change:transform,opacity;}
.ud-cr-button,.ud-cr-link,.ud-cr-bento__card{transition:transform .25s ease,box-shadow .25s ease,background-color .25s ease;}.ud-cr-button:hover,.ud-cr-link:hover{transform:translateY(-2px)}.ud-cr-bento__card:hover{transform:translateY(-5px);box-shadow:0 24px 60px -36px rgba(0,0,0,.45)}
@container udpage (max-width: 900px){
  .ud-cr-wide{width:min(100% - 32px,1800px)}
  .ud-cr-nav{padding:12px}.ud-cr-nav__bar{grid-template-columns:1fr auto auto}.ud-cr-nav__links{display:none;position:absolute;top:76px;left:14px;right:14px;background:#fff;border:1px solid #ddd;border-radius:18px;padding:22px;flex-direction:column;gap:18px}.ud-cr-nav__links.is-open{display:flex}.ud-cr-nav__status{display:none}.ud-cr-nav__toggle{display:block}.ud-cr-nav .ud-cr-button{display:none!important}
  .ud-cr-hero{min-height:720px!important}.ud-cr-hero__wash{background:rgba(255,255,255,.78)}
  .ud-cr-section-head,.ud-cr-split__grid,.ud-cr-coverage__grid,.ud-cr-testimonials__grid,.ud-cr-timeline__grid,.ud-cr-contact__grid,.ud-cr-cta__grid,.ud-cr-footer__grid{grid-template-columns:1fr;display:grid;gap:38px;align-items:start}
  .ud-cr-bento__grid{grid-template-columns:1fr}.ud-cr-bento__card,.ud-cr-bento__card:first-child,.ud-cr-bento__card:last-child{grid-column:auto;min-height:300px}
  .ud-cr-gallery__grid,.ud-cr-pricing__grid,.ud-cr-process__grid,.ud-cr-values__grid,.ud-cr-journal__grid{grid-template-columns:1fr}
  .ud-cr-gallery__grid{grid-template-columns:1fr 1fr}
  .ud-cr-journal__grid article.is-featured{grid-column:auto;display:block}.ud-cr-service-row{grid-template-columns:1fr;gap:12px}.ud-cr-service-row>div:last-child{text-align:left}.ud-cr-coverage__areas{grid-template-columns:1fr 1fr}.ud-cr-testimonials__tabs{grid-template-columns:1fr}.ud-cr-form__two{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){.ud-cr-hero[data-ud-anim="load"]::after{display:none}.ud-cr-hero[data-ud-anim="load"] .ud-cr-kicker,.ud-cr-hero[data-ud-anim="load"] .ud-cr-title>*,.ud-cr-hero[data-ud-anim="load"] .ud-cr-lead,.ud-cr-hero[data-ud-anim="load"] .ud-cr-actions,.ud-cr-hero[data-ud-anim="load"] .ud-cr-badges,.ud-cr-bento__card,.ud-cr-gallery__grid>*,.ud-cr-pricing__grid>*,.ud-cr-process__grid>*,.ud-cr-values__grid>*,.ud-cr-journal__grid>*{animation:none!important;opacity:1!important;transform:none!important}.ud-cr-ticker>div{animation:none!important}.ud-cr-button,.ud-cr-link,.ud-cr-bento__card{transition:none!important}}

/* Lumen & Lane — full-width navy, signal-yellow and warm-white trade kit */
.ud-ll-wide{width:min(calc(100% - 64px),1860px);margin-inline:auto}.ud-ll-copy{color:#4d4f58;line-height:1.65}.ud-ll-lead{font-size:clamp(1rem,1.25vw,1.3rem);line-height:1.55;max-width:650px}.ud-ll-kicker{display:inline-flex;align-items:center;gap:8px;margin:0 0 24px;padding:7px 13px;border:1px solid #d9d8d3;border-radius:999px;font-size:.7rem;font-weight:650;letter-spacing:.18em;text-transform:uppercase}.ud-ll-kicker:before{content:"";width:6px;height:6px;border-radius:50%;background:#ffd400}.ud-ll-head{font:680 clamp(2.5rem,4.2vw,5.3rem)/.98 var(--font-heading,Inter,Arial,sans-serif);letter-spacing:-.055em}.ud-ll-head>*{display:block}.ud-ll-head>span:last-child{color:#e1af00}.ud-ll-centered{text-align:center;max-width:930px;margin-inline:auto}.ud-ll-centered .ud-ll-copy{max-width:680px;margin:22px auto 0}.ud-ll-centered .ud-ll-kicker{margin-inline:auto}.ud-ll-button{display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:15px 22px;border-radius:9px;background:#02071d;color:#fff!important;text-decoration:none;font-weight:750;white-space:nowrap;transition:transform .2s ease,box-shadow .2s ease}.ud-ll-button.is-yellow{background:#ffd400;color:#050914!important}.ud-ll-button:hover{transform:translateY(-2px);box-shadow:0 14px 25px -18px #02071d}.ud-ll-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:32px}
.ud-ll-nav{height:80px;background:#fcfbf7;border-bottom:1px solid #e7e5de;position:relative;z-index:40;font-family:var(--font-body,Inter,Arial,sans-serif)}.ud-ll-nav.is-sticky{position:sticky;top:0}.ud-ll-nav__inner{height:100%;padding:0 32px;display:grid;grid-template-columns:minmax(260px,1fr) auto minmax(260px,1fr);align-items:center;gap:24px}.ud-ll-brand{display:flex;align-items:center;gap:12px;color:inherit;text-decoration:none;font-weight:800}.ud-ll-brand>b{width:42px;height:42px;display:grid;place-items:center;background:#ffd400;color:#02071d;border-radius:8px;font-size:1.4rem}.ud-ll-brand span{display:grid}.ud-ll-brand small{font-size:.58rem;letter-spacing:.22em;font-weight:500;margin-top:3px}.ud-ll-nav nav{display:flex;gap:38px;align-items:center}.ud-ll-nav nav a{color:#16181d;text-decoration:none;font-size:.92rem}.ud-ll-phone{justify-self:end;color:#16181d;text-decoration:none;display:flex;align-items:center;gap:9px;font-size:.9rem}.ud-ll-nav__inner>.ud-ll-button{grid-column:4}.ud-ll-nav__toggle{display:none;border:0;background:none}
.ud-ll-hero{min-height:520px!important;margin:16px;border-radius:22px!important;background-position:center;background-size:cover!important;color:#fff!important;display:flex;align-items:center;padding:70px 48px!important;overflow:hidden}.ud-ll-hero.is-tall{min-height:640px!important}.ud-ll-hero__copy{width:min(760px,94%);position:relative;z-index:2}.ud-ll-hero .ud-ll-head{font-size:clamp(3rem,5.25vw,6rem)}.ud-ll-hero .ud-ll-head>span:last-child{color:#ffd400}.ud-ll-hero .ud-ll-kicker{border-color:rgba(255,255,255,.4)}.ud-ll-hero .ud-ll-lead{margin-top:28px}.ud-ll-hero .ud-ll-button:not(.is-yellow){background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.5)}
.ud-ll-services{background:#fcfbf7;padding-block:120px!important}.ud-ll-services .ud-ll-segments{display:inline-flex;margin-top:38px;padding:4px;border:1px solid #dedbd2;border-radius:999px}.ud-ll-segments button{border:0;background:transparent;border-radius:999px;padding:12px 24px;font-weight:700}.ud-ll-segments button.is-active{background:#02071d;color:#fff}.ud-ll-services__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:58px}.ud-ll-services__grid article{border:1px solid #dedbd2;border-radius:17px;overflow:hidden;background:#fff;transition:transform .22s ease,box-shadow .22s ease}.ud-ll-services__grid article:hover{transform:translateY(-5px);box-shadow:0 26px 45px -34px #02071d}.ud-ll-services__image{position:relative}.ud-ll-services__image .ud-media{height:285px}.ud-ll-services__image>span,.ud-ll-services__image>b{position:absolute;top:14px;border-radius:999px;padding:7px 11px;font-size:.68rem;letter-spacing:.12em}.ud-ll-services__image>span{left:14px;background:#fff}.ud-ll-services__image>b{right:14px;background:#02071d;color:#fff;letter-spacing:0}.ud-ll-services__grid article>div:last-child{padding:25px}.ud-ll-services__grid h3{font-size:1.2rem;margin:0 0 9px}.ud-ll-services__grid article a{display:flex;align-items:center;gap:8px;color:#02071d;text-decoration:none;font-weight:750;margin-top:20px}
.ud-ll-values{background:#f3f2ee;padding-block:120px!important}.ud-ll-values__grid{display:grid;grid-template-columns:1.15fr .85fr;gap:70px;align-items:center}.ud-ll-values__grid>div:first-child>.ud-ll-copy{max-width:600px;margin-top:24px}.ud-ll-stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:65px;border-top:1px solid #d7d4cb}.ud-ll-stats>div{padding:32px 18px 0 0;border-right:1px solid #d7d4cb}.ud-ll-stats>div:last-child{border:0;padding-left:18px}.ud-ll-stats strong{font-size:clamp(2.2rem,3.2vw,4rem);color:#ddb000;letter-spacing:-.05em}.ud-ll-stats p{margin:8px 0 0;color:#50515a}.ud-ll-values__cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ud-ll-values__cards article{background:#fff;border:1px solid #dfddd6;border-radius:14px;padding:25px}.ud-ll-values__cards svg{color:#d4a400}.ud-ll-values__cards h3{font-size:1rem;margin:18px 0 6px}.ud-ll-values__cards .ud-ll-copy{font-size:.85rem}
.ud-ll-pricing{background:#fcfbf7;padding-block:120px!important}.ud-ll-pricing__grid{display:grid;grid-template-columns:.7fr 1fr;gap:40px;margin-top:60px;align-items:start}.ud-ll-pricing__grid>div{border:1px solid #dedbd2;border-radius:16px;overflow:hidden;background:#f5f4f0}.ud-ll-pricing__grid article{display:grid;grid-template-columns:38px 1fr auto;gap:14px;padding:22px;border-bottom:1px solid #dedbd2;align-items:center}.ud-ll-pricing__grid article:last-child{border:0}.ud-ll-pricing__grid h3{margin:0 0 4px;font-size:1rem}.ud-ll-pricing__grid .ud-ll-copy{margin:0;font-size:.84rem}.ud-ll-pricing__grid article>strong{font-size:1.8rem;color:#bb8f00}.ud-ll-pricing__grid aside{display:flex;gap:12px;align-items:center;background:#02071d;color:#fff;padding:24px;border-radius:12px;margin-top:20px;font-size:.86rem}
.ud-ll-about{background:#fcfbf7;padding-block:120px!important}.ud-ll-about__hero{display:grid;grid-template-columns:1.15fr .85fr;gap:70px;align-items:center;min-height:720px}.ud-ll-about__hero>div:first-child{max-width:740px}.ud-ll-about__hero .ud-ll-lead{margin:28px 0}.ud-ll-about__hero .ud-media{height:640px;border-radius:20px;overflow:hidden}.ud-ll-about__cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:80px}.ud-ll-about__cards article{min-height:360px;border:1px solid #dfddd6;border-radius:18px;padding:40px;display:flex;flex-direction:column;justify-content:flex-end;background:#f4f3ef}.ud-ll-about__cards h3{font-size:1.5rem;margin:0 0 14px}
.ud-ll-area{background:#fcfbf7;padding-block:120px!important}.ud-ll-area__top{display:grid;grid-template-columns:.72fr 1fr;gap:40px}.ud-ll-area__top>div:first-child>.ud-ll-copy{margin:22px 0 34px;max-width:520px}.ud-ll-area__top>div:first-child>.ud-media{height:390px;border-radius:16px;overflow:hidden}.ud-ll-area__places{display:grid;grid-template-columns:1fr 1fr;gap:16px}.ud-ll-area__places article{border:1px solid #dedbd2;border-radius:16px;overflow:hidden;background:#fff}.ud-ll-area__places .ud-media{height:300px}.ud-ll-area__places article>div{padding:20px;position:relative}.ud-ll-area__places h3{margin:0 0 8px}.ud-ll-area__places small{position:absolute;right:20px;top:22px;letter-spacing:.14em}.ud-ll-area__places p{margin:0;color:#5c5d64}.ud-ll-roads{margin-top:65px;display:flex;gap:10px;flex-wrap:wrap}.ud-ll-roads span{display:flex;align-items:center;gap:7px;border:1px solid #dedbd2;border-radius:999px;padding:10px 15px;font-size:.82rem;background:#fff}.ud-ll-roads svg{color:#d4a400}
.ud-ll-contact,.ud-ll-book{background:#fcfbf7;padding-block:110px!important}.ud-ll-contact__grid,.ud-ll-book__grid{display:grid;grid-template-columns:.72fr 1.28fr;gap:38px;margin-top:62px;align-items:start}.ud-ll-contact aside,.ud-ll-book aside,.ud-ll-contact form,.ud-ll-book form{border:1px solid #dedbd2;border-radius:17px;background:#fff;padding:34px}.ud-ll-contact aside{display:grid;gap:15px}.ud-ll-contact aside>div{padding:22px;border-radius:12px;background:#f4f3ef;display:grid;gap:8px}.ud-ll-contact aside span,.ud-ll-book aside>span{font-size:.65rem;letter-spacing:.2em}.ud-ll-contact aside strong{font-size:1.05rem}.ud-ll-contact aside .ud-media{height:280px;border-radius:12px;overflow:hidden;margin-top:8px}.ud-ll-contact form,.ud-ll-book form{display:grid;grid-template-columns:1fr 1fr;gap:20px}.ud-ll-contact form .ud-field,.ud-ll-book form .ud-field{display:grid;gap:8px;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase}.ud-ll-contact form .ud-field:has(textarea),.ud-ll-book form .ud-field:has(textarea),.ud-ll-contact form .ud-btn,.ud-ll-book form .ud-btn,.ud-ll-contact .ud-form__status,.ud-ll-book .ud-form__status{grid-column:1/-1}.ud-ll-contact .ud-input,.ud-ll-book .ud-input{border:1px solid #dedbd2;background:#fbfaf7;border-radius:9px;padding:15px;font:400 .92rem var(--font-body,Inter,Arial,sans-serif);letter-spacing:0;text-transform:none}.ud-ll-contact textarea.ud-input,.ud-ll-book textarea.ud-input{min-height:150px}.ud-ll-contact .ud-btn,.ud-ll-book .ud-btn{justify-self:end;border:0;border-radius:9px;background:#02071d;color:#fff;padding:15px 23px;font-weight:750}.ud-ll-book__grid{grid-template-columns:.5fr 1.1fr;max-width:1100px;margin-inline:auto;margin-top:62px}.ud-ll-book aside>span{display:block;margin-bottom:22px}.ud-ll-book aside article{display:grid;grid-template-columns:36px 1fr;gap:12px;margin:0 0 22px}.ud-ll-book aside article i{width:34px;height:34px;background:#02071d;color:#fff;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:.7rem}.ud-ll-book aside h3{margin:2px 0 6px;font-size:.95rem}.ud-ll-book aside .ud-ll-copy{font-size:.8rem;margin:0}
.ud-ll-cta{background:#fcfbf7;padding-block:135px!important}.ud-ll-cta .ud-ll-centered{max-width:900px}.ud-ll-cta .ud-ll-actions{justify-content:center}.ud-ll-cta .ud-ll-actions>a:last-child{color:#02071d;text-decoration:none;font-weight:750;display:flex;gap:8px;align-items:center}.ud-ll-footer{background:#02071d;color:#fff;margin:16px;border-radius:20px 20px 0 0;padding:78px 0 22px;position:relative;overflow:hidden;font-family:var(--font-body,Inter,Arial,sans-serif)}.ud-ll-footer__word{position:absolute;left:0;right:0;bottom:-.08em;color:rgba(255,255,255,.055);font-size:clamp(8rem,19vw,23rem);font-weight:900;line-height:.7;white-space:nowrap;text-align:center;letter-spacing:-.08em}.ud-ll-footer__grid{position:relative;display:grid;grid-template-columns:1.35fr .65fr .8fr 1fr;gap:70px}.ud-ll-footer__grid>div:first-child>.ud-ll-copy{color:#fff;max-width:390px;margin-top:24px}.ud-ll-footer__grid>nav,.ud-ll-footer__grid>div:not(:first-child){display:grid;align-content:start;gap:11px}.ud-ll-footer__grid span{font-size:.67rem;letter-spacing:.2em}.ud-ll-footer__grid nav a{color:#fff;text-decoration:none}.ud-ll-footer__grid p{margin:0}.ud-ll-footer__grid .ud-ll-button{justify-self:start;margin-top:10px}.ud-ll-footer__base{position:relative;border-top:1px solid rgba(255,255,255,.14);margin-top:70px;padding-top:20px;font-size:.75rem;color:#d6d8df}
@keyframes ud-ll-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}.ud-ll-services:is(.ud-anim-in,[data-ud-anim="load"]) article,.ud-ll-values:is(.ud-anim-in,[data-ud-anim="load"]) article,.ud-ll-area:is(.ud-anim-in,[data-ud-anim="load"]) article{animation:ud-ll-rise .65s cubic-bezier(.22,1,.36,1) both}.ud-ll-services article:nth-child(2),.ud-ll-values article:nth-child(2),.ud-ll-area article:nth-child(2){animation-delay:.08s}.ud-ll-services article:nth-child(3),.ud-ll-values article:nth-child(3),.ud-ll-area article:nth-child(3){animation-delay:.16s}.ud-ll-services article:nth-child(4),.ud-ll-values article:nth-child(4),.ud-ll-area article:nth-child(4){animation-delay:.24s}
@container udpage (max-width:1000px){.ud-ll-wide{width:min(calc(100% - 32px),1860px)}.ud-ll-nav__inner{padding:0 16px;grid-template-columns:1fr auto}.ud-ll-nav nav{display:none;position:absolute;top:80px;left:12px;right:12px;background:#fff;border:1px solid #dedbd2;border-radius:14px;padding:24px;flex-direction:column;align-items:flex-start}.ud-ll-nav nav.is-open{display:flex}.ud-ll-nav__inner>.ud-ll-button,.ud-ll-phone{display:none}.ud-ll-nav__toggle{display:block}.ud-ll-hero{margin:10px;padding:54px 26px!important;min-height:580px!important}.ud-ll-services__grid{grid-template-columns:1fr 1fr}.ud-ll-values__grid,.ud-ll-about__hero,.ud-ll-area__top,.ud-ll-contact__grid,.ud-ll-book__grid,.ud-ll-footer__grid,.ud-ll-pricing__grid{grid-template-columns:1fr}.ud-ll-about__hero .ud-media{height:520px}.ud-ll-footer__grid{gap:42px}.ud-ll-footer{margin:8px}.ud-ll-contact form,.ud-ll-book form{grid-template-columns:1fr}.ud-ll-contact form .ud-field,.ud-ll-book form .ud-field,.ud-ll-contact form .ud-btn,.ud-ll-book form .ud-btn{grid-column:1}}
@container udpage (max-width:640px){.ud-ll-head{font-size:2.55rem}.ud-ll-services__grid,.ud-ll-values__cards,.ud-ll-about__cards,.ud-ll-area__places{grid-template-columns:1fr}.ud-ll-services{padding-block:80px!important}.ud-ll-services__image .ud-media{height:250px}.ud-ll-stats{grid-template-columns:1fr}.ud-ll-stats>div{border-right:0;border-bottom:1px solid #d7d4cb;padding:22px 0}.ud-ll-pricing__grid article{grid-template-columns:32px 1fr}.ud-ll-pricing__grid article>strong{grid-column:2}.ud-ll-about__hero{min-height:auto}.ud-ll-about__hero .ud-media{height:420px}.ud-ll-actions{align-items:stretch;flex-direction:column}.ud-ll-actions>*{width:100%}.ud-ll-footer__word{display:none}}
@media (prefers-reduced-motion:reduce){.ud-ll-services article,.ud-ll-values article,.ud-ll-area article{animation:none!important;opacity:1!important;transform:none!important}.ud-ll-button,.ud-ll-services__grid article{transition:none!important}}

/* Axiom North — dark VC / consulting kit */
.ud-ax{color:#fff;font-family:var(--font-body,'DM Sans',system-ui,sans-serif);--ax-muted:#a1a1aa;--ax-surface:#141414;--ax-surface-2:#18181b;--ax-border:rgba(255,255,255,.08);--ax-amber:rgba(245,158,11,.55)}
.ud-ax :is(h1,h2,h3,h4,.ud-ax-title,.ud-ax-hero__title,.ud-ax-card__title,.ud-ax-pillar__title,.ud-ax-stats__value){font-family:var(--font-heading,Syne,system-ui,sans-serif);letter-spacing:-.03em}
.ud-ax-eyebrow{margin:0 0 .9rem;font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ax-muted)}
.ud-ax-title{margin:0;font-size:clamp(1.85rem,3.2cqi + .4rem,2.85rem);line-height:1.12;font-weight:700}
.ud-ax-hero__title{margin:0;font-size:clamp(2.4rem,5.2cqi + .35rem,4.1rem);line-height:1.05;font-weight:700;max-width:18ch}
.ud-ax-lead,.ud-ax-muted{color:var(--ax-muted);line-height:1.65}
.ud-ax-lead{margin:.9rem 0 0;font-size:1.02rem;max-width:38rem}
.ud-ax-head{max-width:46rem}
.ud-ax-head--center{text-align:center;margin-inline:auto}
.ud-ax-head--center .ud-ax-eyebrow,.ud-ax-head--center .ud-ax-title,.ud-ax-head--center .ud-ax-lead{margin-inline:auto}
.ud-ax-head--center .ud-ax-title{max-width:22ch}
.ud-ax-meta{margin:.55rem 0 0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ax-muted)}
.ud-ax-index{margin:0 0 .75rem;font-size:.72rem;letter-spacing:.14em;color:var(--ax-muted)}
.ud-ax-btn{border-radius:999px;padding:12px 22px;font-weight:650;background:#fff;color:#000!important;border:1px solid #fff;transition:transform .18s ease,opacity .18s ease}
.ud-ax-btn:hover{transform:translateY(-1px);opacity:.92}
.ud-ax-btn--ghost{background:transparent;color:#fff!important;border-color:rgba(255,255,255,.35)}
.ud-ax-btn--ghost:hover{background:rgba(255,255,255,.06)}
.ud-ax-text-link{display:inline-flex;align-items:center;gap:4px;margin-top:1rem;color:#fff;text-decoration:none;font-size:.88rem;font-weight:600}
.ud-ax-text-link:hover{opacity:.8}
.ud-ax-glow{position:absolute;left:50%;top:8%;width:min(42rem,90%);height:min(22rem,55cqi);border-radius:50%;background:radial-gradient(circle,var(--ax-amber),transparent 68%);filter:blur(18px);pointer-events:none;z-index:0;opacity:.85;transform:translateX(-50%);animation:ud-ax-pulse 9s ease-in-out infinite}
.ud-ax-glow--soft{top:0;opacity:.55;height:min(18rem,45cqi)}
.ud-ax-glow--media{inset:auto;left:50%;top:50%;width:120%;height:120%;opacity:.7;transform:translate(-50%,-50%);animation:none}
.ud-ax-glow--cta{top:auto;bottom:-18%;opacity:.9;width:min(56rem,100%);height:min(18rem,40cqi)}
@keyframes ud-ax-pulse{0%,100%{transform:translateX(-50%) scale(1);opacity:.75}50%{transform:translateX(-50%) scale(1.08);opacity:1}}
.ud-ax-cross{position:absolute;inset:12% 8% 30%;background:
  linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px) 0 50%/100% 48px,
  linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px) 50% 0/48px 100%;
  mask-image:radial-gradient(circle at 50% 40%,#000 18%,transparent 72%);pointer-events:none;z-index:0}
.ud-ax-card,.ud-ax-sector,.ud-ax-studio__card{background:var(--ax-surface);border:1px solid var(--ax-border);border-radius:14px;padding:1.35rem 1.3rem 1.45rem}
.ud-ax-card__icon{width:36px;height:36px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border:1px solid var(--ax-border);margin-bottom:.9rem;color:#fff}
.ud-ax-card__title{margin:.15rem 0 .45rem;font-size:1.12rem;font-weight:700}
.ud-ax-card-grid{display:grid;gap:1rem;margin-top:2.2rem}
.ud-ax-card-grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-ax-card-grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-ax-card-grid--4{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-ax-nav{padding-block:14px!important;background:rgba(0,0,0,.72);backdrop-filter:blur(16px);border-bottom:1px solid var(--ax-border);z-index:40;color:#fff}
.ud-ax-nav--sticky.ud-ax-nav--sticky{position:sticky;top:0}
.ud-ax-nav__bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;position:relative}
.ud-ax-brand{display:inline-flex;align-items:center;gap:.55rem;font-weight:700;letter-spacing:-.03em;color:inherit;text-decoration:none;font-family:var(--font-heading,Syne,system-ui,sans-serif);font-size:1.02rem}
.ud-ax-brand__mark{width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:#fff;color:#000}
.ud-ax-nav__links{display:flex;gap:1.5rem;justify-content:center;align-items:center}
.ud-ax-nav__link{color:rgba(255,255,255,.78);text-decoration:none;font-size:.9rem;font-weight:500}
.ud-ax-nav__link:hover{color:#fff}
.ud-ax-nav__actions{justify-self:end;display:flex;align-items:center}
.ud-ax-nav__mobile-cta{display:none}
.ud-ax-nav__toggle{display:none;border:0;background:transparent;color:#fff;justify-self:end}
.ud-ax-hero{overflow:hidden;text-align:center;padding-block:clamp(4.5rem,10vw,7.5rem) 3.8rem!important;background:#000!important}
.ud-ax-hero__copy{position:relative;z-index:1;display:grid;justify-items:center;text-align:center}
.ud-ax-hero__copy .ud-ax-eyebrow,.ud-ax-hero__copy .ud-ax-hero__title,.ud-ax-hero__copy .ud-ax-lead{margin-inline:auto;text-align:center}
.ud-ax-hero__cta{margin-top:1.6rem;display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.ud-ax-pills{margin-top:2rem;display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.ud-ax-pill{display:inline-flex;align-items:center;padding:10px 16px;border-radius:999px;border:1px solid var(--ax-border);color:rgba(255,255,255,.78);text-decoration:none;font-size:.82rem;font-weight:600;background:rgba(255,255,255,.03)}
.ud-ax-pill:hover{color:#fff;border-color:rgba(255,255,255,.28)}
.ud-ax-page-hero{overflow:hidden;padding-block:clamp(3.5rem,8vw,5.5rem)!important;background:#000!important;position:relative}
.ud-ax-page-hero__inner{position:relative;z-index:1;display:grid;gap:2.5rem;align-items:center;justify-items:center;text-align:center}
.ud-ax-page-hero__copy{display:grid;justify-items:center;text-align:center;max-width:46rem}
.ud-ax-page-hero__copy .ud-ax-eyebrow,.ud-ax-page-hero__copy .ud-ax-hero__title,.ud-ax-page-hero__copy .ud-ax-lead{margin-inline:auto;text-align:center}
.ud-ax-page-hero--split .ud-ax-page-hero__inner{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);text-align:left;justify-items:stretch}
.ud-ax-page-hero--split .ud-ax-page-hero__copy{justify-items:start;text-align:left;max-width:none}
.ud-ax-page-hero--split .ud-ax-page-hero__copy .ud-ax-eyebrow,.ud-ax-page-hero--split .ud-ax-page-hero__copy .ud-ax-hero__title,.ud-ax-page-hero--split .ud-ax-page-hero__copy .ud-ax-lead{margin-inline:0;text-align:left}
.ud-ax-page-hero__media{position:relative;max-width:420px;margin-inline:auto}
.ud-ax-page-hero__media .ud-media{border-radius:18px;overflow:hidden;position:relative;z-index:1}
.ud-ax-stats{padding-block:1.5rem 2.5rem!important;background:#000!important}
.ud-ax-stats__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;border-top:1px solid var(--ax-border);border-bottom:1px solid var(--ax-border)}
.ud-ax-stats__item{padding:1.6rem 1rem;text-align:center}
.ud-ax-stats__value{margin:0;font-size:clamp(1.8rem,3cqi,2.6rem);font-weight:700}
.ud-ax-stats__label{margin:.45rem 0 0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ax-muted)}
.ud-ax-proof{padding-block:1.2rem 2rem!important;background:#000!important}
.ud-ax-proof__row{display:flex;flex-wrap:wrap;justify-content:center;gap:.65rem 1.4rem;align-items:center}
.ud-ax-proof__item{font-weight:700;letter-spacing:-.02em;font-size:1.05rem;color:rgba(255,255,255,.38);font-family:var(--font-heading,Syne,system-ui,sans-serif)}
.ud-ax-proof__item:not(:last-child)::after{content:"·";margin-left:1.4rem;color:rgba(255,255,255,.2);font-weight:400}
.ud-ax-principles,.ud-ax-values,.ud-ax-thesis,.ud-ax-sectors,.ud-ax-process,.ud-ax-studio,.ud-ax-services,.ud-ax-journal,.ud-ax-portfolio,.ud-ax-projects,.ud-ax-team,.ud-ax-timeline,.ud-ax-faq,.ud-ax-contact,.ud-ax-pillars{background:#000!important}
.ud-ax-pillars__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
.ud-ax-pillar{position:relative;min-height:420px;border-radius:16px;overflow:hidden;border:1px solid var(--ax-border);background:var(--ax-surface)}
.ud-ax-pillar__media{position:absolute;inset:0}.ud-ax-pillar__media .ud-media{height:100%;object-fit:cover;filter:grayscale(.35) brightness(.55)}
.ud-ax-pillar__overlay{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;background:linear-gradient(180deg,transparent 20%,rgba(0,0,0,.88) 78%),radial-gradient(ellipse at 50% 110%,var(--ax-amber),transparent 55%)}
.ud-ax-pillar__title{margin:.35rem 0 .55rem;font-size:1.45rem;font-weight:700;max-width:12ch}
.ud-ax-portfolio__top{display:grid;justify-items:center;gap:1.25rem;text-align:center}
.ud-ax-portfolio__tools{display:flex;justify-content:center;flex-wrap:wrap;gap:1rem;align-items:center}
.ud-ax-filters{display:inline-flex;gap:6px;padding:4px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid var(--ax-border)}
.ud-ax-filter{border:0;background:transparent;color:rgba(255,255,255,.7);padding:9px 14px;border-radius:999px;font:inherit;font-size:.78rem;font-weight:650;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}
.ud-ax-filter.is-active{background:#fff;color:#000}
.ud-ax-portfolio__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem;margin-top:2rem}
.ud-ax-port-card__media{position:relative;border-radius:14px;overflow:hidden;margin-bottom:.9rem;border:1px solid var(--ax-border)}
.ud-ax-port-card__tag{position:absolute;top:12px;left:12px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.12);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase}
.ud-ax-journal__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.1rem;margin-top:2rem}
.ud-ax-journal__card .ud-media{border-radius:12px;overflow:hidden;margin-bottom:.75rem;border:1px solid var(--ax-border)}
.ud-ax-cta{overflow:hidden;text-align:center;padding-block:clamp(4rem,9vw,6.5rem)!important;background:#000!important;position:relative}
.ud-ax-cta__watermark{position:absolute;left:50%;bottom:-.18em;translate:-50% 0;font-size:clamp(6rem,22cqi,16rem);font-weight:800;letter-spacing:-.06em;color:rgba(255,255,255,.045);font-family:var(--font-heading,Syne,system-ui,sans-serif);pointer-events:none;white-space:nowrap;line-height:.8}
.ud-ax-cta__copy{position:relative;z-index:1;max-width:40rem;margin-inline:auto;text-align:center}
.ud-ax-cta__copy .ud-ax-title,.ud-ax-cta__copy .ud-ax-lead{margin-inline:auto}
.ud-ax-footer{background:#000;color:#fff;padding:4rem 0 1.5rem;border-top:1px solid var(--ax-border);font-family:var(--font-body,'DM Sans',system-ui,sans-serif)}
.ud-ax-footer__grid{display:grid;grid-template-columns:1.4fr .7fr .9fr;gap:2.5rem}
.ud-ax-footer__brand .ud-ax-muted{margin-top:1rem;max-width:26rem}
.ud-ax-footer__social{display:flex;gap:10px;margin-top:1.2rem}
.ud-ax-social{width:34px;height:34px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ax-border);color:var(--ax-muted);text-decoration:none}
.ud-ax-social:hover{color:#fff;border-color:rgba(255,255,255,.28)}
.ud-ax-footer__col{display:grid;align-content:start;gap:.55rem}
.ud-ax-footer__label{margin:0 0 .35rem;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ax-muted)}
.ud-ax-footer__link{color:rgba(255,255,255,.82);text-decoration:none;font-size:.92rem}
.ud-ax-footer__link:hover{color:#fff}
.ud-ax-footer__legal{margin-top:2.8rem;padding-top:1.1rem;border-top:1px solid var(--ax-border);display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.75rem;color:var(--ax-muted)}
.ud-ax-footer__legal-links{display:flex;gap:1rem}
.ud-ax-footer__legal-links a{color:inherit;text-decoration:none}
.ud-ax-timeline__list{list-style:none;margin:2.2rem auto 0;padding:0 0 0 1.2rem;border-left:1px solid var(--ax-border);display:grid;gap:1.8rem;max-width:40rem;text-align:left}
.ud-ax-timeline__item{position:relative;padding-left:1.4rem}
.ud-ax-timeline__dot{position:absolute;left:-1.2rem;top:.35rem;width:9px;height:9px;border-radius:50%;background:#fff;translate:-50% 0;box-shadow:0 0 0 4px #000}
.ud-ax-timeline__year{margin:0 0 .25rem;font-size:.78rem;color:var(--ax-muted);letter-spacing:.08em}
.ud-ax-team__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.1rem;margin-top:2rem}
.ud-ax-team__card .ud-media{border-radius:12px;overflow:hidden;margin-bottom:.85rem;filter:grayscale(.85);border:1px solid var(--ax-border)}
.ud-ax-studio__top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.35rem}
.ud-ax-studio__top .ud-ax-card__icon{margin:0}
.ud-ax-projects__list{margin-top:2rem;border-top:1px solid var(--ax-border)}
.ud-ax-projects__row{display:grid;grid-template-columns:minmax(140px,.7fr) minmax(0,1.4fr) auto;gap:1rem;align-items:start;padding:1.2rem 0;border-bottom:1px solid var(--ax-border)}
.ud-ax-projects__row .ud-ax-muted{margin:0}
.ud-ax-projects__row .ud-ax-meta{margin:0;text-align:right}
.ud-ax-faq__list{margin-top:1.8rem;border-top:1px solid var(--ax-border)}
.ud-ax-faq__item{border-bottom:1px solid var(--ax-border);padding:.15rem 0}
.ud-ax-faq__item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:1.1rem 0;font-weight:600}
.ud-ax-faq__item summary::-webkit-details-marker{display:none}
.ud-ax-faq__item .ud-ax-muted{padding:0 0 1.1rem;margin:0}
.ud-ax-contact__grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:2rem;align-items:start}
.ud-ax-contact__details{list-style:none;margin:1.6rem 0 0;padding:0;display:grid;gap:.9rem}
.ud-ax-contact__details li{display:flex;gap:.7rem;align-items:flex-start;color:var(--ax-muted)}
.ud-ax-contact__details a{color:#fff;text-decoration:none}
.ud-ax-contact__form{background:var(--ax-surface);border:1px solid var(--ax-border);border-radius:16px;padding:1.4rem}
.ud-ax-contact__form .ud-field{display:grid;gap:6px;margin-bottom:1rem;font-size:.78rem;color:var(--ax-muted)}
.ud-ax-contact__form .ud-input{width:100%;border:1px solid var(--ax-border);background:#0a0a0a;color:#fff;border-radius:10px;padding:12px 14px;font:inherit}
.ud-ax-contact__form textarea.ud-input{min-height:120px;resize:vertical}
.ud-ax-contact__form .ud-btn{border:0;border-radius:999px;background:#fff;color:#000;padding:12px 20px;font-weight:650;cursor:pointer}
@keyframes ud-ax-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.ud-ax:is(.ud-anim-in,[data-ud-anim="load"]) .ud-ax-card,.ud-ax:is(.ud-anim-in,[data-ud-anim="load"]) .ud-ax-sector,.ud-ax:is(.ud-anim-in,[data-ud-anim="load"]) .ud-ax-port-card,.ud-ax:is(.ud-anim-in,[data-ud-anim="load"]) .ud-ax-pillar,.ud-ax:is(.ud-anim-in,[data-ud-anim="load"]) .ud-ax-team__card,.ud-ax:is(.ud-anim-in,[data-ud-anim="load"]) .ud-ax-journal__card{animation:ud-ax-rise .7s cubic-bezier(.22,1,.36,1) both}
.ud-ax-card:nth-child(2),.ud-ax-sector:nth-child(2),.ud-ax-port-card:nth-child(2),.ud-ax-pillar:nth-child(2),.ud-ax-team__card:nth-child(2),.ud-ax-journal__card:nth-child(2){animation-delay:.08s}
.ud-ax-card:nth-child(3),.ud-ax-sector:nth-child(3),.ud-ax-port-card:nth-child(3),.ud-ax-pillar:nth-child(3),.ud-ax-team__card:nth-child(3),.ud-ax-journal__card:nth-child(3){animation-delay:.16s}
.ud-ax-card:nth-child(4),.ud-ax-sector:nth-child(4),.ud-ax-port-card:nth-child(4),.ud-ax-pillar:nth-child(4),.ud-ax-team__card:nth-child(4){animation-delay:.24s}
@container udpage (max-width:980px){
  .ud-ax-nav__bar{grid-template-columns:1fr auto}
  .ud-ax-nav__links{display:none;position:absolute;top:58px;left:0;right:0;flex-direction:column;align-items:stretch;gap:0;padding:14px;background:#0a0a0a;border:1px solid var(--ax-border);border-radius:14px;z-index:50}
  .ud-ax-nav__links.is-open{display:flex}
  .ud-ax-nav__link{padding:12px 8px;border-bottom:1px solid var(--ax-border)}
  .ud-ax-nav__mobile-cta{display:block;margin-top:10px;text-align:center;padding:12px;border-radius:999px;background:#fff;color:#000;text-decoration:none;font-weight:650}
  .ud-ax-nav__actions{display:none}
  .ud-ax-nav__toggle{display:inline-flex}
  .ud-ax-page-hero--split .ud-ax-page-hero__inner,.ud-ax-card-grid--2,.ud-ax-card-grid--3,.ud-ax-card-grid--4,.ud-ax-pillars__grid,.ud-ax-portfolio__grid,.ud-ax-journal__grid,.ud-ax-team__grid,.ud-ax-stats__grid,.ud-ax-contact__grid,.ud-ax-footer__grid,.ud-ax-projects__row{grid-template-columns:1fr}
  .ud-ax-stats__grid{grid-template-columns:1fr 1fr}
  .ud-ax-projects__row .ud-ax-meta{text-align:left}
  .ud-ax-card-grid--4{grid-template-columns:1fr 1fr}
}
@container udpage (max-width:640px){
  .ud-ax-stats__grid,.ud-ax-card-grid--4,.ud-ax-journal__grid{grid-template-columns:1fr}
  .ud-ax-pills{flex-direction:column;width:100%;border-radius:16px}
  .ud-ax-hero__cta{flex-direction:column;width:100%}.ud-ax-hero__cta>*{width:100%}
  .ud-ax-filters{flex-wrap:wrap;justify-content:center}
}
@media (prefers-reduced-motion:reduce){.ud-ax-glow{animation:none}.ud-ax-card,.ud-ax-sector,.ud-ax-port-card,.ud-ax-pillar,.ud-ax-team__card,.ud-ax-journal__card{animation:none!important;opacity:1!important;transform:none!important}}

/* Shared media backgrounds and editable text entrance effects */
.ud-section__video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}.ud-section__video-overlay{position:absolute;inset:0;z-index:-1;background:color-mix(in srgb,var(--ud-overlay-color,#000) var(--ud-overlay-opacity,55%),transparent);pointer-events:none}.ud-text-anim :is(h1,h2,h3,h4,h5,h6,p,.ud-eyebrow,.ud-kicker,.ud-btn){animation-duration:var(--ud-text-duration,.7s);animation-delay:var(--ud-text-delay,.08s);animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1)}.ud-text-anim--fade :is(h1,h2,h3,h4,h5,h6,p,.ud-eyebrow,.ud-kicker,.ud-btn){animation-name:udTextFade}.ud-text-anim--fade-up :is(h1,h2,h3,h4,h5,h6,p,.ud-eyebrow,.ud-kicker,.ud-btn),.ud-text-anim--slide-up :is(h1,h2,h3,h4,h5,h6,p,.ud-eyebrow,.ud-kicker,.ud-btn){animation-name:udTextUp}.ud-text-anim--blur-in :is(h1,h2,h3,h4,h5,h6,p,.ud-eyebrow,.ud-kicker,.ud-btn){animation-name:udTextBlur}.ud-text-anim--reveal :is(h1,h2,h3,h4,h5,h6,p,.ud-eyebrow,.ud-kicker,.ud-btn){animation-name:udTextReveal;transform-origin:left}@keyframes udTextFade{from{opacity:0}to{opacity:1}}@keyframes udTextUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}@keyframes udTextBlur{from{opacity:0;filter:blur(14px);transform:scale(.985)}to{opacity:1;filter:none;transform:none}}@keyframes udTextReveal{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0)}}
@media (prefers-reduced-motion:reduce){.ud-text-anim :is(h1,h2,h3,h4,h5,h6,p,.ud-eyebrow,.ud-kicker,.ud-btn){animation:none!important}}

/* ------------------------------------------------------------- Vantage.OS */
.ud-nx{
  --nx-ink:var(--ud-heading,var(--ud-fg,var(--color-text,#0b1a33)));
  --nx-body:var(--ud-muted,var(--color-muted,#5c6b85));
  --nx-blue:var(--ud-accent,var(--color-primary,#1a5bf5));
  --nx-line:color-mix(in srgb,var(--nx-ink) 12%,transparent);
  --nx-hair:color-mix(in srgb,var(--nx-ink) 8%,transparent);
  --nx-panel:var(--ud-card,var(--color-surface,#f5f7fb));
  --nx-mono:var(--font-mono,"JetBrains Mono",ui-monospace,SFMono-Regular,monospace);
  color:var(--nx-ink);
  font-family:var(--font-body,Inter,system-ui,sans-serif);
}
.ud-nx :where(h1,h2,h3,h4){font-family:var(--font-heading,"Playfair Display",Georgia,serif);font-weight:var(--font-heading-weight,500);color:var(--nx-ink);letter-spacing:-.015em;margin:0}
.ud-nx-display{font-size:var(--ud-heading-size,clamp(1.9rem,3.5cqi + .6rem,3rem));line-height:1.16;max-width:22ch}
.ud-nx-title{font-size:var(--ud-heading-size,clamp(1.5rem,2.3cqi + .6rem,2.15rem));line-height:1.2;max-width:24ch}
.ud-nx-title--light{color:#fff}
.ud-nx-lead{margin:1rem 0 0;max-width:48ch;font-size:var(--ud-body-size,.94rem);line-height:1.72;color:var(--nx-body)}
.ud-nx-body{margin:0;font-size:var(--ud-body-size,.92rem);line-height:1.85;color:var(--nx-body)}
.ud-nx-head{max-width:44rem}
.ud-nx-head--center{margin-inline:auto;text-align:center}
.ud-nx-eyebrow{margin:0 0 1rem;font-family:var(--nx-mono);font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--nx-blue);display:flex;align-items:center;gap:.6rem}
.ud-nx-head--center .ud-nx-eyebrow{justify-content:center}
.ud-nx-eyebrow--dashed::before{content:"";width:26px;height:1px;background:currentColor;opacity:.55;flex:none}

.ud-nx-rail{display:flex;align-items:center;gap:.55rem;margin:0 0 3.2rem;font-family:var(--nx-mono);font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:color-mix(in srgb,var(--nx-body) 78%,transparent)}
.ud-nx-rail__slash{opacity:.45}
.ud-nx-rail__dash{width:44px;height:1px;background:currentColor;opacity:.4;flex:none}
.ud-nx-rail__label{color:var(--nx-ink);opacity:.72}

.ud-nx-btn{display:inline-flex;align-items:center;gap:.5rem;padding:11px 18px;border-radius:var(--radius-button,7px);background:var(--nx-blue);color:#fff;font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.8rem;font-weight:600;letter-spacing:.01em;text-decoration:none;border:1px solid transparent;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
.ud-nx-btn:hover{transform:translateY(-1px);box-shadow:0 12px 26px -14px color-mix(in srgb,var(--nx-blue) 80%,transparent)}
.ud-nx-btn--ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.32)}
.ud-nx-btn--ghost:hover{background:rgba(255,255,255,.1)}
.ud-nx-btn--dark{background:var(--nx-ink);color:#fff}

.ud-nx-round{display:inline-flex;align-items:center;gap:.7rem;text-decoration:none;color:var(--nx-ink);font-size:.82rem;font-weight:500}
.ud-nx-round__dot{width:34px;height:34px;border-radius:999px;background:var(--nx-blue);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:none;transition:transform .2s ease}
.ud-nx-round:hover .ud-nx-round__dot{transform:translateX(3px)}

.ud-nx-corners{position:absolute;inset:8px;pointer-events:none}
.ud-nx-corners i{position:absolute;width:7px;height:7px;border:1px solid currentColor;opacity:.3}
.ud-nx-corners i:nth-child(1){top:0;left:0;border-right:0;border-bottom:0}
.ud-nx-corners i:nth-child(2){top:0;right:0;border-left:0;border-bottom:0}
.ud-nx-corners i:nth-child(3){bottom:0;left:0;border-right:0;border-top:0}
.ud-nx-corners i:nth-child(4){bottom:0;right:0;border-left:0;border-top:0}

.ud-nx-watermark{position:absolute;right:2%;top:22%;font-family:var(--font-heading,"Playfair Display",Georgia,serif);font-size:clamp(6rem,18cqi,14rem);line-height:1;color:color-mix(in srgb,var(--nx-ink) 5%,transparent);pointer-events:none;user-select:none;z-index:0}
.ud-nx-dark .ud-nx-watermark{color:rgba(255,255,255,.05)}

.ud-nx-pill{display:inline-flex;align-items:center;gap:.5rem;padding:8px 15px;border-radius:999px;border:1px solid var(--nx-line);background:var(--color-background,#fff);font-family:var(--nx-mono);font-size:.63rem;letter-spacing:.16em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-pill__dot{width:5px;height:5px;border-radius:999px;background:var(--nx-blue);flex:none}

.ud-nx-badge{display:inline-flex;align-items:center;gap:.65rem;padding:8px 16px 8px 8px;border-radius:999px;border:1px solid var(--nx-line);background:var(--color-background,#fff);box-shadow:0 10px 30px -22px rgba(11,26,51,.5)}
.ud-nx-badge__dot{width:30px;height:30px;border-radius:999px;background:var(--nx-blue);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:none}

/* navbar */
.ud-nx-nav{background:var(--ud-bg,var(--color-background,#fff));border-bottom:1px solid var(--nx-hair);position:relative;z-index:60}
.ud-nx-nav--sticky.ud-nx-nav--sticky{position:sticky;top:0}
.ud-nx-nav__bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;min-height:62px}
.ud-nx-wordmark{font-family:var(--font-body,Inter,system-ui,sans-serif);font-weight:700;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--nx-ink);text-decoration:none}
.ud-nx-nav__links{display:flex;align-items:center;gap:.2rem;justify-self:center;padding:4px;border-radius:999px;background:color-mix(in srgb,var(--nx-ink) 4%,transparent)}
.ud-nx-nav__link{padding:7px 15px;border-radius:999px;font-family:var(--nx-mono);font-size:.63rem;letter-spacing:.16em;text-transform:uppercase;color:var(--nx-body);text-decoration:none;transition:background .18s ease,color .18s ease}
.ud-nx-nav__link:hover{background:var(--color-background,#fff);color:var(--nx-ink)}
.ud-nx-nav__actions{display:flex;align-items:center;gap:1rem;justify-self:end}
.ud-nx-nav__signin{font-size:.8rem;color:var(--nx-body);text-decoration:none}
.ud-nx-nav__signin:hover{color:var(--nx-ink)}
.ud-nx-nav__toggle{display:none;background:none;border:0;color:inherit;cursor:pointer;padding:6px;justify-self:end}

/* home hero */
.ud-nx-hero{padding-block:var(--ud-pt,2rem) var(--ud-pb,4rem)}
.ud-nx-hero__top{display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;margin-bottom:1.6rem}
.ud-nx-hero__scroll{display:flex;align-items:center;gap:.7rem;font-family:var(--nx-mono);font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-hero__scroll-line{width:70px;height:1px;background:currentColor;opacity:.4}
.ud-nx-hero__wordmark{margin:0;font-family:var(--font-heading,"Playfair Display",Georgia,serif);font-weight:var(--font-heading-weight,500);font-size:clamp(2rem,5cqi,3.6rem);line-height:1;color:var(--nx-ink)}
.ud-nx-hero__stage{position:relative;border-radius:16px;overflow:visible}
.ud-nx-hero__media{border-radius:16px;aspect-ratio:2.3 / 1;min-height:420px;background:linear-gradient(140deg,#cfe2fb,#eef4ff 46%,#dbe9fd 74%,#c8dcf8)}
.ud-nx-hero__scrim{position:absolute;inset:0;pointer-events:none;background:linear-gradient(78deg,rgba(255,255,255,.92) 12%,rgba(255,255,255,.66) 42%,rgba(255,255,255,0) 72%)}
.ud-nx-hero__copy{position:absolute;left:clamp(1.2rem,4cqi,3.4rem);bottom:clamp(1.4rem,5cqi,3.6rem);max-width:34rem}
.ud-nx-hero__copy .ud-nx-display{margin-bottom:1.6rem}
.ud-nx-hero__chip{position:absolute;top:-18px;left:clamp(1rem,3cqi,2.4rem);display:inline-flex;align-items:center;gap:.65rem;padding:9px 16px 9px 9px;border-radius:12px;background:var(--color-background,#fff);border:1px solid var(--nx-line);box-shadow:0 18px 40px -28px rgba(11,26,51,.7)}
.ud-nx-hero__chip-dot,.ud-nx-phero__chip-dot{width:28px;height:28px;border-radius:8px;background:var(--nx-ink);color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:none}
.ud-nx-hero__chip-copy{display:grid;line-height:1.3}
.ud-nx-hero__chip-copy strong{font-size:.78rem;font-weight:600;color:var(--nx-ink)}
.ud-nx-hero__chip-copy span{font-family:var(--nx-mono);font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-hero__corner{position:absolute;right:clamp(.6rem,2cqi,1.6rem);bottom:-18px;display:inline-flex;align-items:center;gap:.8rem;padding:9px 14px;border-radius:10px;background:var(--color-background,#fff);border:1px solid var(--nx-line);font-family:var(--nx-mono);font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:var(--nx-body);box-shadow:0 18px 40px -28px rgba(11,26,51,.7)}
.ud-nx-hero__corner-keys{display:inline-flex;gap:4px}
.ud-nx-hero__corner-keys i{width:16px;height:16px;border-radius:4px;background:color-mix(in srgb,var(--nx-ink) 10%,transparent)}
.ud-nx-hero__corner-keys i:last-child{background:var(--nx-ink)}

/* about */
.ud-nx-about__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,5cqi,4.5rem);align-items:center}
.ud-nx-about__art{position:relative;padding-bottom:3.5rem}
.ud-nx-about__main{border-radius:10px}
.ud-nx-about__inset{position:absolute;right:-6%;bottom:0;width:46%;border-radius:8px;border:5px solid var(--color-background,#fff);box-shadow:0 24px 50px -32px rgba(11,26,51,.6)}
.ud-nx-about__stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin:2.4rem 0}
.ud-nx-stat__value{margin:0;font-family:var(--font-heading,"Playfair Display",Georgia,serif);font-size:1.7rem;line-height:1;color:var(--nx-ink)}
.ud-nx-stat__label{margin:.5rem 0 0;font-family:var(--nx-mono);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body)}

/* services */
.ud-nx-services__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:2.6rem}
.ud-nx-service{text-decoration:none;color:inherit;display:block}
.ud-nx-service__media{border-radius:8px;aspect-ratio:3 / 4}
.ud-nx-service__caption{margin:.9rem 0 0;display:flex;gap:.6rem;font-size:.82rem;color:var(--nx-ink);padding-top:.9rem;border-top:1px solid var(--nx-hair)}
.ud-nx-service__num{font-family:var(--nx-mono);font-size:.72rem;color:var(--nx-body)}
.ud-nx-services__foot{display:flex;justify-content:flex-end;margin-top:2.4rem}

/* dark bands */
.ud-nx-dark{color:#fff;--nx-ink:#fff;--nx-body:rgba(255,255,255,.68);--nx-line:rgba(255,255,255,.14);--nx-hair:rgba(255,255,255,.1)}
.ud-nx-dark::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(120% 90% at 12% 0%,rgba(56,110,255,.28),transparent 58%),radial-gradient(90% 80% at 92% 100%,rgba(24,70,190,.3),transparent 60%)}
.ud-nx-dark .ud-nx-eyebrow{color:color-mix(in srgb,var(--nx-blue) 55%,#ffffff)}
.ud-nx-impact__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:2.6rem}
.ud-nx-impact__card{position:relative;padding:1.6rem 1.3rem;border:1px solid var(--nx-line);border-radius:10px;background:rgba(255,255,255,.04)}
.ud-nx-impact__value{margin:0;font-family:var(--font-heading,"Playfair Display",Georgia,serif);font-size:2.2rem;line-height:1;color:#fff}
.ud-nx-impact__title{margin:1.6rem 0 .5rem;font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.82rem;font-weight:600;letter-spacing:.01em}
.ud-nx-impact__text{margin:0;font-size:.75rem;line-height:1.65;color:var(--nx-body)}

/* journal */
.ud-nx-journal__head{display:flex;align-items:flex-end;justify-content:space-between;gap:2rem}
.ud-nx-journal__all{font-family:var(--nx-mono);font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body);text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px}
.ud-nx-journal__all:hover{color:var(--nx-ink)}
.ud-nx-journal__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4rem;margin-top:2.6rem}
.ud-nx-post{text-decoration:none;color:inherit}
.ud-nx-post__media{border-radius:8px;aspect-ratio:4 / 3}
.ud-nx-post__date{margin:1rem 0 .5rem;font-family:var(--nx-mono);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-post__title{font-size:.95rem;line-height:1.45;padding-bottom:1rem;border-bottom:1px solid var(--nx-hair)}

/* benefits */
.ud-nx-benefits__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:clamp(2rem,5cqi,4.5rem);align-items:center}
.ud-nx-benefits__media{border-radius:10px;aspect-ratio:4 / 5}
.ud-nx-benefits__list{list-style:none;margin:2.2rem 0 0;padding:0;display:grid}
.ud-nx-benefit{display:flex;gap:1rem;padding:1.3rem 0;border-top:1px solid var(--nx-hair)}
.ud-nx-benefit:last-child{border-bottom:1px solid var(--nx-hair)}
.ud-nx-benefit__icon{width:30px;height:30px;border-radius:7px;background:color-mix(in srgb,var(--nx-blue) 12%,transparent);color:var(--nx-blue);display:inline-flex;align-items:center;justify-content:center;flex:none}
.ud-nx-benefit__title{font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.85rem;font-weight:600;margin:.2rem 0 .45rem}
.ud-nx-benefit__text{margin:0;font-size:.78rem;line-height:1.7;color:var(--nx-body)}

/* footer */
.ud-nx-footer{background:var(--ud-bg,var(--color-background,#fff));padding-block:var(--ud-pt,2rem) var(--ud-pb,2.4rem);color:var(--nx-ink);font-family:var(--font-body,Inter,system-ui,sans-serif)}
.ud-nx-footer__panel{position:relative;overflow:hidden;border-radius:14px;min-height:clamp(180px,26cqi,300px);display:flex;align-items:center;padding:clamp(1.5rem,5cqi,4rem);background:linear-gradient(115deg,#8ec6f5,#bfe0fb 42%,#dcefff 70%,#a9d4f7)}
.ud-nx-footer__panel-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ud-nx-footer__signature{position:relative;margin:0;font-family:var(--font-heading,"Playfair Display",Georgia,serif);font-weight:var(--font-heading-weight,500);font-size:clamp(2.4rem,9cqi,6rem);line-height:1;color:#0d2a4d}
.ud-nx-footer__grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1.6rem;margin-top:2.6rem}
.ud-nx-footer__col{display:grid;align-content:start;gap:.55rem}
.ud-nx-footer__col-title{margin:0 0 .35rem;font-family:var(--nx-mono);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-footer__link{font-size:.78rem;color:var(--nx-body);text-decoration:none}
.ud-nx-footer__link:first-child{color:var(--nx-blue)}
.ud-nx-footer__link:hover{color:var(--nx-ink)}
.ud-nx-footer__address{margin:0;font-size:.78rem;line-height:1.7;color:var(--nx-body);white-space:pre-line}
.ud-nx-footer__fine{margin:0;font-size:.7rem;line-height:1.6;color:color-mix(in srgb,var(--nx-body) 80%,transparent)}
.ud-nx-footer__col--contact .ud-nx-footer__fine:first-of-type{margin-top:.9rem}

/* page hero */
.ud-nx-phero{padding-block:var(--ud-pt,2.2rem) var(--ud-pb,4rem)}
.ud-nx-phero__crumb{display:flex;align-items:center;gap:.7rem;font-family:var(--nx-mono);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--nx-body);margin-bottom:clamp(2rem,6cqi,4.5rem)}
.ud-nx-phero__version{margin-left:auto}
.ud-nx-phero__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.92fr);gap:clamp(2rem,5cqi,4rem);align-items:center}
.ud-nx-phero__pills{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:2rem}
.ud-nx-phero__art{position:relative}
.ud-nx-phero__media{border-radius:12px;aspect-ratio:4 / 3;box-shadow:0 40px 80px -50px rgba(11,26,51,.8)}
.ud-nx-phero__tag{position:absolute;top:14px;left:50%;translate:-50% 0;padding:6px 14px;border-radius:999px;background:rgba(9,20,38,.72);color:#fff;font-family:var(--nx-mono);font-size:.56rem;letter-spacing:.2em;text-transform:uppercase;backdrop-filter:blur(6px)}
.ud-nx-phero__chip{position:absolute;left:-14px;bottom:-16px;display:inline-flex;align-items:center;gap:.6rem;padding:9px 15px 9px 9px;border-radius:12px;background:var(--color-background,#fff);border:1px solid var(--nx-line);box-shadow:0 18px 40px -28px rgba(11,26,51,.7)}
.ud-nx-phero__chip-dot{border-radius:999px;background:var(--nx-blue)}

/* pillars */
.ud-nx-pillars__head{display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;flex-wrap:wrap}
.ud-nx-pillars__panel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:2.6rem;border:1px solid var(--nx-line);border-radius:12px;background:var(--nx-panel);overflow:hidden}
.ud-nx-pillar{padding:1.7rem 1.5rem;border-right:1px solid var(--nx-hair);border-bottom:1px solid var(--nx-hair)}
.ud-nx-pillar:nth-child(3n){border-right:0}
.ud-nx-pillar:nth-last-child(-n+3){border-bottom:0}
.ud-nx-pillar__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem}
.ud-nx-pillar__icon{width:30px;height:30px;border-radius:7px;background:color-mix(in srgb,var(--nx-blue) 12%,transparent);color:var(--nx-blue);display:inline-flex;align-items:center;justify-content:center}
.ud-nx-pillar__num{font-family:var(--nx-mono);font-size:.6rem;letter-spacing:.16em;color:var(--nx-body)}
.ud-nx-pillar__title{font-size:1rem;margin-bottom:.55rem}
.ud-nx-pillar__text{margin:0;font-size:.76rem;line-height:1.72;color:var(--nx-body)}

/* split */
.ud-nx-split__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,5cqi,4rem);align-items:center}
.ud-nx-split--reverse .ud-nx-split__art{order:2}
.ud-nx-split__art{position:relative}
.ud-nx-split__media{border-radius:10px;aspect-ratio:4 / 3}
.ud-nx-split__tag{position:absolute;left:14px;bottom:14px;padding:6px 13px;border-radius:999px;background:rgba(9,20,38,.72);color:#fff;font-family:var(--nx-mono);font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;backdrop-filter:blur(6px)}
.ud-nx-checks{list-style:none;margin:1.7rem 0 0;padding:0;display:grid;gap:.75rem}
.ud-nx-checks li{display:flex;gap:.65rem;align-items:flex-start;font-size:.8rem;line-height:1.6;color:var(--nx-body)}
.ud-nx-checks svg{color:var(--nx-blue);flex:none;margin-top:3px}

/* steps */
.ud-nx-steps__list{list-style:none;margin:2.6rem 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.6rem}
.ud-nx-step{position:relative;padding-top:3.4rem}
.ud-nx-step::before{content:"";position:absolute;top:16px;left:0;right:0;height:1px;background:var(--nx-line)}
.ud-nx-step:last-child::before{right:50%}
.ud-nx-step:first-child::before{left:0}
.ud-nx-step__num{position:absolute;top:0;left:0;width:33px;height:33px;border-radius:999px;border:1px solid var(--nx-line);background:var(--ud-bg,#08152e);display:inline-flex;align-items:center;justify-content:center;font-family:var(--nx-mono);font-size:.62rem;color:#fff;z-index:1}
.ud-nx-step__node{display:none}
.ud-nx-step__title{font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.88rem;font-weight:600;margin-bottom:.55rem;color:#fff}
.ud-nx-step__text{margin:0;font-size:.75rem;line-height:1.7;color:var(--nx-body)}

/* integrations */
.ud-nx-integrations__grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));margin-top:2.6rem;border:1px solid var(--nx-line);border-radius:12px;background:var(--nx-panel);overflow:hidden}
.ud-nx-logo{display:grid;justify-items:center;gap:.7rem;padding:1.6rem .6rem;border-right:1px solid var(--nx-hair);color:var(--nx-body);text-align:center}
.ud-nx-logo:last-child{border-right:0}
.ud-nx-logo span{font-family:var(--nx-mono);font-size:.56rem;letter-spacing:.14em;text-transform:uppercase}

/* cta card */
.ud-nx-ctacard__panel{position:relative;overflow:hidden;border-radius:14px;background:#08152e;color:#fff;isolation:isolate}
.ud-nx-ctacard__bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.4;z-index:-1}
.ud-nx-ctacard__panel::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(100deg,rgba(6,16,36,.94) 38%,rgba(6,16,36,.45))}
.ud-nx-ctacard__inner{padding:clamp(1.8rem,5cqi,3.6rem);max-width:38rem}
.ud-nx-ctacard__tags{display:flex;justify-content:space-between;gap:1rem;font-family:var(--nx-mono);font-size:.56rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:1.6rem}
.ud-nx-ctacard__inner .ud-nx-lead{color:rgba(255,255,255,.72)}
.ud-nx-ctacard__btns{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.8rem}

/* pricing */
.ud-nx-toggle{display:inline-flex;margin:0 auto;padding:4px;border-radius:999px;border:1px solid var(--nx-line);background:var(--nx-panel);gap:2px}
.ud-nx-pricing{text-align:center}
.ud-nx-pricing .ud-nx-rail{justify-content:flex-start;text-align:left}
.ud-nx-toggle__btn{border:0;cursor:pointer;padding:8px 18px;border-radius:999px;background:transparent;color:var(--nx-body);font-family:var(--nx-mono);font-size:.6rem;letter-spacing:.16em;text-transform:uppercase}
.ud-nx-toggle__btn.is-on{background:var(--nx-blue);color:#fff}
.ud-nx-pricing__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.2rem;margin-top:2.6rem;text-align:left;align-items:start}
.ud-nx-plan{position:relative;padding:1.8rem 1.6rem;border:1px solid var(--nx-line);border-radius:12px;background:var(--color-background,#fff);display:grid;align-content:start}
.ud-nx-plan--featured{background:#08152e;border-color:transparent;color:#fff;--nx-ink:#fff;--nx-body:rgba(255,255,255,.68);box-shadow:0 40px 80px -50px rgba(11,26,51,.9)}
.ud-nx-plan__badge{position:absolute;top:-11px;left:1.6rem;padding:5px 12px;border-radius:999px;background:var(--nx-blue);color:#fff;font-family:var(--nx-mono);font-size:.54rem;letter-spacing:.18em;text-transform:uppercase}
.ud-nx-plan__num{position:absolute;top:1.6rem;right:1.5rem;font-family:var(--nx-mono);font-size:.58rem;color:var(--nx-body)}
.ud-nx-plan__name{font-size:1.3rem;margin-bottom:.7rem}
.ud-nx-plan__text{margin:0 0 1.6rem;font-size:.76rem;line-height:1.7;color:var(--nx-body);max-width:26ch}
.ud-nx-plan__price{margin:0 0 1.4rem;display:flex;align-items:baseline;gap:.5rem;font-family:var(--font-heading,"Playfair Display",Georgia,serif);font-size:2.3rem;line-height:1;color:var(--nx-ink)}
.ud-nx-plan__note{font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.66rem;color:var(--nx-body)}
.ud-nx-plan__list{list-style:none;margin:0 0 1.8rem;padding:0;display:grid;gap:.6rem}
.ud-nx-plan__list li{display:flex;gap:.6rem;align-items:flex-start;font-size:.77rem;line-height:1.55;color:var(--nx-body)}
.ud-nx-plan__list svg{color:var(--nx-blue);flex:none;margin-top:3px}
.ud-nx-plan__cta{justify-content:space-between}

/* comparison table */
.ud-nx-compare__scroll{margin-top:2.4rem;overflow-x:auto;border:1px solid var(--nx-line);border-radius:12px;background:var(--nx-panel)}
.ud-nx-table{width:100%;border-collapse:collapse;font-size:.78rem;min-width:640px}
.ud-nx-table th,.ud-nx-table td{padding:.85rem 1.2rem;text-align:center;color:var(--nx-body)}
.ud-nx-table thead th{font-family:var(--nx-mono);font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-ink);border-bottom:1px solid var(--nx-line)}
.ud-nx-table tbody th{text-align:left;font-weight:500;color:var(--nx-ink)}
.ud-nx-table tbody tr:nth-child(even){background:color-mix(in srgb,var(--nx-ink) 3%,transparent)}
.ud-nx-table__yes{color:var(--nx-blue);display:inline-flex}
.ud-nx-table__no{opacity:.4}

/* faq */
.ud-nx-faq__grid{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1fr);gap:clamp(2rem,5cqi,4rem);align-items:start}
.ud-nx-faq__list{border-top:1px solid var(--nx-line)}
.ud-nx-faq__item{border-bottom:1px solid var(--nx-line)}
.ud-nx-faq__item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.15rem 0;font-size:.85rem;color:#fff}
.ud-nx-faq__item summary::-webkit-details-marker{display:none}
.ud-nx-faq__mark{width:26px;height:26px;border-radius:999px;border:1px solid var(--nx-line);display:inline-flex;align-items:center;justify-content:center;flex:none;transition:background .18s ease,color .18s ease}
.ud-nx-faq__item[open] .ud-nx-faq__mark{background:var(--nx-blue);border-color:transparent;color:#fff}
.ud-nx-faq__answer{margin:0;padding:0 3rem 1.3rem 0;font-size:.78rem;line-height:1.75;color:var(--nx-body)}

/* sizing */
.ud-nx-sizing__panel{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.85fr);gap:clamp(1.5rem,4cqi,3rem);align-items:center;padding:clamp(1.4rem,3.5cqi,2.4rem);border:1px solid var(--nx-line);border-radius:14px;background:var(--nx-panel)}
.ud-nx-sizing__foot{display:flex;align-items:center;gap:2rem;flex-wrap:wrap;margin-top:2rem}
.ud-nx-sizing__proof{display:flex;align-items:center;gap:.8rem}
.ud-nx-sizing__proof strong{display:block;font-size:.72rem;font-weight:600;color:var(--nx-ink)}
.ud-nx-sizing__proof span span,.ud-nx-sizing__proof>span>span{display:block;font-family:var(--nx-mono);font-size:.55rem;letter-spacing:.16em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-avatars{display:flex}
.ud-nx-avatars img{width:30px;height:30px;border-radius:999px;object-fit:cover;border:2px solid var(--color-background,#fff);margin-left:-9px}
.ud-nx-avatars img:first-child{margin-left:0}
.ud-nx-sizing__art{position:relative}
.ud-nx-sizing__media{border-radius:10px;aspect-ratio:4 / 3}

/* contact */
.ud-nx-contact__grid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.15fr);gap:clamp(2rem,5cqi,4rem);align-items:start}
.ud-nx-contact__details{list-style:none;margin:2.2rem 0 0;padding:0;display:grid;gap:1.2rem}
.ud-nx-contact__details li{display:flex;gap:.85rem;align-items:flex-start}
.ud-nx-contact__details em{display:block;font-style:normal;font-family:var(--nx-mono);font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body);margin-bottom:.25rem}
.ud-nx-contact__details a,.ud-nx-contact__details>li>span>span{font-size:.82rem;color:var(--nx-ink);text-decoration:none}
.ud-nx-contact__icon{width:30px;height:30px;border-radius:7px;background:color-mix(in srgb,var(--nx-blue) 12%,transparent);color:var(--nx-blue);display:inline-flex;align-items:center;justify-content:center;flex:none}
.ud-nx-contact__panel{padding:clamp(1.4rem,3.5cqi,2.2rem);border:1px solid var(--nx-line);border-radius:14px;background:var(--nx-panel)}
.ud-nx-contact__topics{margin-bottom:1.2rem}
.ud-nx-contact__topics-label{display:block;font-family:var(--nx-mono);font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body);margin-bottom:.6rem}
.ud-nx-contact__chips{display:flex;flex-wrap:wrap;gap:.5rem}
.ud-nx-chip{padding:7px 14px;border-radius:999px;border:1px solid var(--nx-line);background:var(--color-background,#fff);font-size:.72rem;color:var(--nx-body)}
.ud-nx-chip.is-on{background:var(--nx-ink);border-color:transparent;color:#fff}
/* Pair the short fields two-up; message, honeypot and submit span the row. */
.ud-nx-contact__panel .ud-form{display:grid;grid-template-columns:1fr 1fr;column-gap:1rem}
.ud-nx-contact__panel .ud-form>:not(.ud-field),.ud-nx-contact__panel .ud-field:last-of-type{grid-column:1 / -1}
.ud-nx-contact__panel .ud-field{display:grid;gap:6px;margin-bottom:1rem;font-family:var(--nx-mono);font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-contact__panel .ud-input{width:100%;border:1px solid var(--nx-line);background:var(--color-background,#fff);color:var(--nx-ink);border-radius:8px;padding:11px 13px;font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.82rem;text-transform:none;letter-spacing:normal}
.ud-nx-contact__panel textarea.ud-input{min-height:110px;resize:vertical}
.ud-nx-contact__panel .ud-btn{border:0;border-radius:7px;background:var(--nx-blue);color:#fff;padding:11px 20px;font-size:.8rem;font-weight:600;cursor:pointer}
.ud-nx-contact__consent{margin:1rem 0 0;font-size:.68rem;line-height:1.6;color:var(--nx-body)}

/* map */
.ud-nx-map__grid{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1fr);gap:clamp(2rem,5cqi,4rem);align-items:center}
.ud-nx-map__frame{position:relative;border-radius:12px;overflow:hidden;border:1px solid var(--nx-line);aspect-ratio:4 / 3}
.ud-nx-map__frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}

/* offices */
.ud-nx-offices__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.2rem;margin-top:2.6rem}
.ud-nx-office{border:1px solid var(--nx-line);border-radius:12px;overflow:hidden;background:var(--color-background,#fff)}
.ud-nx-office__art{position:relative}
.ud-nx-office__num{position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:999px;background:rgba(9,20,38,.7);color:#fff;font-family:var(--nx-mono);font-size:.54rem;letter-spacing:.16em}
.ud-nx-office__status{position:absolute;top:12px;right:12px;padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.9);color:var(--nx-ink);font-family:var(--nx-mono);font-size:.54rem;letter-spacing:.16em;text-transform:uppercase}
.ud-nx-office__body{padding:1.3rem}
.ud-nx-office__top{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem}
.ud-nx-office__pin{width:28px;height:28px;border-radius:7px;background:color-mix(in srgb,var(--nx-blue) 12%,transparent);color:var(--nx-blue);display:inline-flex;align-items:center;justify-content:center}
.ud-nx-office__tag{font-family:var(--nx-mono);font-size:.55rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-office__city{font-size:1.15rem;margin-bottom:.6rem}
.ud-nx-office__address{margin:0 0 1.2rem;font-size:.76rem;line-height:1.65;color:var(--nx-body);white-space:pre-line}
.ud-nx-office__hours-label{margin:0 0 .3rem;padding-top:1rem;border-top:1px solid var(--nx-hair);font-family:var(--nx-mono);font-size:.54rem;letter-spacing:.18em;text-transform:uppercase;color:var(--nx-body)}
.ud-nx-office__hours{margin:0;font-size:.76rem;color:var(--nx-ink)}

@container udpage (max-width:1024px){
  .ud-nx-services__grid,.ud-nx-impact__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-nx-pillars__panel{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-nx-pillar:nth-child(3n){border-right:1px solid var(--nx-hair)}
  .ud-nx-pillar:nth-child(2n){border-right:0}
  .ud-nx-pillar:nth-last-child(-n+3){border-bottom:1px solid var(--nx-hair)}
  .ud-nx-pillar:nth-last-child(-n+2){border-bottom:0}
  .ud-nx-integrations__grid{grid-template-columns:repeat(4,minmax(0,1fr))}
  .ud-nx-logo:nth-child(4n){border-right:0}
  .ud-nx-steps__list{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-nx-step::before{display:none}
  .ud-nx-footer__grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@container udpage (max-width:860px){
  .ud-nx-nav__bar{grid-template-columns:1fr auto}
  .ud-nx-nav__links{display:none;position:absolute;top:60px;left:12px;right:12px;flex-direction:column;align-items:stretch;gap:0;padding:12px;border-radius:14px;background:var(--color-background,#fff);border:1px solid var(--nx-line);z-index:60}
  .ud-nx-nav__links.is-open{display:flex}
  .ud-nx-nav__link{padding:12px 8px;border-bottom:1px solid var(--nx-hair)}
  .ud-nx-nav__actions{display:none}
  .ud-nx-nav__toggle{display:inline-flex}
  .ud-nx-about__grid,.ud-nx-benefits__grid,.ud-nx-split__grid,.ud-nx-phero__grid,.ud-nx-faq__grid,.ud-nx-contact__grid,.ud-nx-map__grid,.ud-nx-sizing__panel,.ud-nx-journal__grid,.ud-nx-pricing__grid,.ud-nx-offices__grid{grid-template-columns:1fr}
  .ud-nx-split--reverse .ud-nx-split__art{order:0}
  .ud-nx-hero__copy{position:static;margin-top:1.6rem;max-width:none}
  .ud-nx-hero__media{min-height:200px;aspect-ratio:16 / 10}
  .ud-nx-hero__corner{display:none}
  .ud-nx-about__inset{position:static;width:60%;margin-top:-2.5rem;margin-left:auto}
  .ud-nx-about__art{padding-bottom:0}
  .ud-nx-journal__head{flex-direction:column;align-items:flex-start;gap:1rem}
  /* the oversized serif watermark crowds body copy once columns stack */
  .ud-nx-watermark{display:none}
}
@container udpage (max-width:600px){
  .ud-nx-services__grid,.ud-nx-impact__grid,.ud-nx-steps__list,.ud-nx-footer__grid{grid-template-columns:1fr}
  .ud-nx-pillars__panel{grid-template-columns:1fr}
  .ud-nx-pillar{border-right:0!important;border-bottom:1px solid var(--nx-hair)!important}
  .ud-nx-pillar:last-child{border-bottom:0!important}
  .ud-nx-integrations__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-nx-logo:nth-child(2n){border-right:0}
  .ud-nx-about__stats{grid-template-columns:1fr}
  .ud-nx-contact__panel .ud-form{grid-template-columns:1fr}
  .ud-nx-ctacard__btns{flex-direction:column;align-items:stretch}
  .ud-nx-ctacard__btns>*{justify-content:center}
}

/* ---------------------------------------------------------------- Junction */
.ud-jn{
  --jn-ink:var(--ud-heading,var(--ud-fg,var(--color-text,#1f1d1b)));
  --jn-body:var(--ud-muted,var(--color-muted,#5c5754));
  --jn-orange:var(--ud-accent,var(--color-primary,#ff4f00));
  --jn-line:color-mix(in srgb,var(--jn-ink) 14%,transparent);
  --jn-hair:color-mix(in srgb,var(--jn-ink) 8%,transparent);
  --jn-cream:var(--ud-card,var(--color-surface,#faf7f4));
  --jn-tint:#eeeae6;
  color:var(--jn-ink);
  font-family:var(--font-body,Inter,system-ui,sans-serif);
}
.ud-jn :where(h1,h2,h3,h4){font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-weight:var(--font-heading-weight,600);color:var(--jn-ink);letter-spacing:-.025em;line-height:1.1;margin:0}
.ud-jn-display{font-size:var(--ud-heading-size,clamp(2rem,4cqi + .7rem,3.3rem));max-width:20ch}
.ud-jn-title{font-size:var(--ud-heading-size,clamp(1.55rem,2.6cqi + .6rem,2.5rem));max-width:24ch}
/* Scoped under .ud-jn so it outranks the base heading reset, which zeroes the
   margins and would otherwise leave these boxes hard against the left edge. */
.ud-jn .ud-jn-title--center{max-width:26ch;margin-inline:auto;text-align:center}
.ud-jn .ud-jn-head--center .ud-jn-display,.ud-jn .ud-jn-head--center .ud-jn-title{margin-inline:auto}
.ud-jn-head{max-width:44rem}
.ud-jn-head--center{margin-inline:auto;text-align:center}
.ud-jn-head--center .ud-jn-display,.ud-jn-head--center .ud-jn-title{margin-inline:auto}
.ud-jn-head--center .ud-jn-lead{margin-inline:auto}
.ud-jn-lead{margin:1.1rem 0 0;max-width:46ch;font-size:var(--ud-body-size,1rem);line-height:1.6;color:var(--jn-body)}
.ud-jn-lead--center{margin-inline:auto;text-align:center}
.ud-jn-eyebrow{display:flex;align-items:center;gap:.45rem;margin:0 0 1rem;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--jn-orange)}
.ud-jn-head--center .ud-jn-eyebrow{justify-content:center}
.ud-jn-eyebrow__mark{width:9px;height:9px;border-radius:2px;background:currentColor;flex:none}
/* Underline hugs the accent phrase and repeats per line when it wraps. */
.ud-jn-mark{position:relative;background-image:linear-gradient(var(--jn-orange),var(--jn-orange));background-repeat:no-repeat;background-size:100% 3px;background-position:0 calc(100% - 2px);padding-bottom:3px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.ud-jn-note{margin:.9rem 0 0;font-size:.8rem;color:var(--jn-body)}
.ud-jn-footnote{margin:1.4rem auto 0;max-width:60ch;text-align:center;font-size:.76rem;color:var(--jn-body)}
.ud-jn-checks{list-style:none;margin:1rem 0 0;padding:0;display:grid;gap:.55rem}
.ud-jn-checks li{display:flex;gap:.55rem;align-items:flex-start;font-size:.82rem;line-height:1.5;color:var(--jn-body)}
.ud-jn-checks svg{color:var(--jn-orange);flex:none;margin-top:3px}
.ud-jn-chip{display:inline-flex;align-items:center;gap:.4rem;padding:6px 12px;border-radius:999px;border:1px solid var(--jn-line);font-size:.74rem;color:var(--jn-body)}
.ud-jn-chip svg{color:var(--jn-orange);flex:none}

.ud-jn-btn{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;padding:12px 20px;border-radius:var(--radius-button,6px);font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.88rem;font-weight:600;text-decoration:none;border:1px solid transparent;cursor:pointer;transition:background .16s ease,color .16s ease,border-color .16s ease,transform .16s ease}
.ud-jn-btn:hover{transform:translateY(-1px)}
.ud-jn-btn--orange{background:var(--jn-orange);color:#fff}
/* dark/light stay literal — they must not invert with the band they sit on */
.ud-jn-btn--dark{background:var(--color-secondary,#1f1d1b);color:#fff}
.ud-jn-btn--outline{background:transparent;color:var(--jn-ink);border-color:var(--jn-line)}
.ud-jn-btn--outline:hover{border-color:var(--jn-ink)}
.ud-jn-btn--light{background:#fff;color:var(--color-secondary,#1f1d1b)}
.ud-jn-btn--blue{background:#2563c7;color:#fff}
.ud-jn-btn--wide{width:100%;max-width:22rem}
.ud-jn-btns{display:flex;flex-wrap:wrap;gap:.7rem}
.ud-jn-head--center + .ud-jn-hero__cta .ud-jn-btns,.ud-jn-ctaband__btns .ud-jn-btns{justify-content:center}

.ud-jn-logo{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.15rem;font-weight:700;letter-spacing:-.03em;color:var(--jn-ink);text-decoration:none}
.ud-jn-logo__mark{width:16px;height:4px;border-radius:2px;background:var(--jn-orange);flex:none}
.ud-jn-logo--light{color:#fff}
.ud-jn-logo-word{font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:.95rem;font-weight:700;letter-spacing:-.01em;color:color-mix(in srgb,var(--jn-ink) 55%,transparent)}
.ud-jn-logos__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1.6rem 2.6rem;margin-top:1.2rem}

/* dark bands */
.ud-jn-dark{color:#fff;--jn-ink:#fff;--jn-body:rgba(255,255,255,.7);--jn-line:rgba(255,255,255,.18);--jn-hair:rgba(255,255,255,.1)}
.ud-jn-dark::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(110% 90% at 8% 0%,rgba(120,160,90,.24),transparent 60%),radial-gradient(90% 90% at 95% 100%,rgba(40,70,35,.5),transparent 62%)}
.ud-jn-indigo{color:#fff;--jn-ink:#fff;--jn-body:rgba(255,255,255,.72);--jn-line:rgba(255,255,255,.2)}
.ud-jn-indigo::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(160deg,#2b1e5e,#1d1442 70%)}

/* navbar */
.ud-jn-nav{background:var(--ud-bg,var(--color-background,#fff));border-bottom:1px solid var(--jn-hair);position:relative;z-index:60}
.ud-jn-nav--sticky.ud-jn-nav--sticky{position:sticky;top:0}
.ud-jn-nav__bar{display:flex;align-items:center;gap:1.4rem;min-height:58px}
.ud-jn-nav__links{display:flex;align-items:center;gap:.1rem}
.ud-jn-nav__link{display:inline-flex;align-items:center;gap:.25rem;padding:8px 11px;border-radius:6px;font-size:.85rem;font-weight:500;color:var(--jn-ink);text-decoration:none}
.ud-jn-nav__link:hover{background:var(--jn-cream)}
.ud-jn-nav__link svg{opacity:.5}
.ud-jn-nav__utility{display:flex;align-items:center;gap:1rem;margin-left:auto}
.ud-jn-nav__util{font-size:.82rem;color:var(--jn-body);text-decoration:none}
.ud-jn-nav__util:hover{color:var(--jn-ink)}
.ud-jn-nav__cta{padding:9px 17px;font-size:.83rem}
.ud-jn-nav__toggle{display:none;margin-left:auto;background:none;border:0;color:inherit;cursor:pointer;padding:6px}

/* hero */
.ud-jn-hero{text-align:center}
.ud-jn-hero--left{text-align:left}
.ud-jn-hero--left .ud-jn-hero__cta{justify-items:start}
.ud-jn-hero--left .ud-jn-display{max-width:22ch}
.ud-jn-hero__cta{display:grid;justify-items:center;margin-top:1.8rem}
.ud-jn-hero__stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:3rem;padding-top:2rem;border-top:1px solid var(--jn-hair)}
.ud-jn-hero__stat-value{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.5rem;font-weight:700;color:var(--jn-ink)}
.ud-jn-hero__stat-label{margin:.3rem 0 0;font-size:.76rem;color:var(--jn-body)}

/* app hero */
.ud-jn-apphero{text-align:center}
.ud-jn-apphero__bar{display:flex;align-items:center;justify-content:center;gap:.8rem;text-align:left;padding-bottom:1.6rem;margin-bottom:2rem;border-bottom:1px solid var(--jn-hair)}
.ud-jn-apphero__icon{width:42px;height:42px;border-radius:9px;background:#1f6fb2;color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:none}
.ud-jn-apphero__name{margin:0;display:flex;align-items:center;gap:.5rem;font-size:.95rem;font-weight:650}
.ud-jn-apphero__badge{padding:2px 8px;border-radius:4px;background:#efe7fb;color:#6d28d9;font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.ud-jn-apphero__category{margin:.15rem 0 0;font-size:.76rem;color:var(--jn-body)}
.ud-jn-apphero__body{max-width:44rem;margin-inline:auto}
.ud-jn-apphero__body .ud-jn-display,.ud-jn-apphero__body .ud-jn-lead{margin-inline:auto}
.ud-jn-apphero__cta{display:grid;justify-items:center;gap:.6rem;margin-top:1.8rem}
.ud-jn-apphero__chips{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin-top:1.4rem}
.ud-jn-apphero__search{display:flex;align-items:center;gap:.6rem;max-width:34rem;margin:2.6rem auto 0;padding:11px 15px;border:1px solid var(--jn-line);border-radius:8px;color:var(--jn-body);font-size:.85rem;text-align:left}
.ud-jn-apphero__search-icon{display:inline-flex;flex:none}
.ud-jn-apphero__pair{margin:1.2rem 0 1.4rem;font-size:.82rem;color:var(--jn-body)}
.ud-jn-apps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.9rem;text-align:left}
.ud-jn-app{padding:1rem;border:1px solid var(--jn-line);border-radius:10px;background:var(--color-background,#fff)}
.ud-jn-app__icon{width:34px;height:34px;border-radius:7px;color:#fff;display:inline-flex;align-items:center;justify-content:center;margin-bottom:.7rem}
.ud-jn-app__name{margin:0;font-size:.85rem;font-weight:650}
.ud-jn-app__category{margin:.2rem 0 0;font-size:.7rem;color:var(--jn-body)}
.ud-jn-apphero__logos{margin-top:2.6rem}

/* banner */
.ud-jn-banner__panel{position:relative;border-radius:12px;padding:clamp(1.4rem,3cqi,2.2rem);color:#fff;background:linear-gradient(105deg,#2c3a24,#3d5030 55%,#6d7f4e)}
.ud-jn-banner__title{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.05rem;font-weight:650}
.ud-jn-banner__text{margin:.6rem 0 0;max-width:56ch;font-size:.85rem;line-height:1.6;color:rgba(255,255,255,.82)}
.ud-jn-banner__link{display:inline-flex;align-items:center;gap:.35rem;margin-top:1rem;font-size:.82rem;font-weight:600;color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.5);padding-bottom:2px}

/* feature cards */
.ud-jn-cards__grid{display:grid;gap:1.1rem;margin-top:2.6rem;grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-jn-cards__grid[data-cols="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-jn-card{display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:var(--jn-tint);border:1px solid var(--jn-hair)}
.ud-jn-card__copy{padding:1.5rem 1.5rem 1.1rem}
.ud-jn-card__eyebrow{margin:0 0 .5rem;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--jn-orange)}
.ud-jn-card__title{font-size:1.05rem;margin-bottom:.5rem}
.ud-jn-card__text{margin:0;font-size:.84rem;line-height:1.6;color:var(--jn-body)}
.ud-jn-card__shot{margin:0 1.2rem 1.2rem;border-radius:10px;overflow:hidden;box-shadow:0 20px 42px -28px rgba(31,29,27,.55)}
.ud-jn-card__shot .ud-media-box{border-radius:10px}
.ud-jn-cards__foot{display:flex;justify-content:center;margin-top:2.2rem}

/* dark split */
.ud-jn-split__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1.8rem,4cqi,3.4rem);align-items:center}
.ud-jn-split--reverse .ud-jn-split__media{order:-1}
.ud-jn-split__media{border-radius:12px;aspect-ratio:4 / 3}
.ud-jn-split__copy .ud-jn-btn{margin-top:1.6rem}

/* accordion + shots */
.ud-jn-accordion__grid{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1fr);gap:clamp(1.8rem,4cqi,3.4rem);align-items:start;margin-top:2.6rem}
.ud-jn-accordion__list{border-top:1px solid var(--jn-line)}
.ud-jn-accordion__item{border-bottom:1px solid var(--jn-line)}
.ud-jn-accordion__item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.05rem 0;font-size:.92rem;font-weight:600}
.ud-jn-accordion__item summary::-webkit-details-marker{display:none}
.ud-jn-accordion__mark{width:22px;height:22px;border-radius:999px;border:1px solid var(--jn-line);display:inline-flex;align-items:center;justify-content:center;flex:none}
.ud-jn-accordion__item[open] .ud-jn-accordion__mark{background:var(--jn-orange);border-color:transparent;color:#fff}
.ud-jn-accordion__text{margin:0;padding:0 2.4rem 1.1rem 0;font-size:.83rem;line-height:1.65;color:var(--jn-body)}
.ud-jn-accordion__art{display:grid;gap:1rem}
.ud-jn-accordion__art .ud-media-box{border-radius:12px;box-shadow:0 26px 52px -34px rgba(31,29,27,.6)}

/* security */
.ud-jn-secure__lead{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1.1rem;margin-top:2.6rem;border-radius:14px;overflow:hidden;background:var(--jn-cream);border:1px solid var(--jn-hair)}
.ud-jn-secure__lead-copy{padding:1.8rem}
.ud-jn-secure__lead-shot{aspect-ratio:4 / 3;border-radius:0}
.ud-jn-secure__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem;margin-top:1.1rem}

/* steps */
.ud-jn-steps__list{list-style:none;margin:2.2rem auto 0;padding:0;max-width:46rem;display:grid;gap:.8rem}
.ud-jn-step{display:flex;align-items:center;gap:1rem;padding:1rem 1.3rem;border-radius:10px;background:rgba(255,255,255,.07);border:1px solid var(--jn-line);font-size:.92rem;color:#fff}
.ud-jn-step__num{width:28px;height:28px;border-radius:999px;background:#fff;color:#2b1e5e;display:inline-flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;flex:none}

/* use cases */
.ud-jn-usecases__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:2.4rem}
.ud-jn-usecase{padding:1.4rem;border-radius:12px;background:var(--color-background,#fff);border:1px solid var(--jn-hair)}
.ud-jn-usecase__title{font-size:.95rem;margin-bottom:.5rem}
.ud-jn-usecase__text{margin:0;font-size:.82rem;line-height:1.6;color:var(--jn-body)}

/* workflow rows */
.ud-jn-workflows__search{display:flex;align-items:center;gap:.6rem;max-width:44rem;margin:1.8rem auto 1.4rem;padding:11px 15px;border:1px solid var(--jn-line);border-radius:8px;color:var(--jn-body);font-size:.84rem}
.ud-jn-workflows__list{border:1px solid var(--jn-hair);border-radius:12px;overflow:hidden}
.ud-jn-wf{display:flex;align-items:center;gap:1rem;padding:1rem 1.2rem;border-bottom:1px solid var(--jn-hair);background:var(--color-background,#fff)}
.ud-jn-wf:last-child{border-bottom:0}
.ud-jn-wf__icons{display:inline-flex;flex:none}
.ud-jn-wf__icons i{width:24px;height:24px;border-radius:6px;background:var(--jn-cream);border:1px solid var(--jn-hair);display:inline-block}
.ud-jn-wf__icons i:last-child{margin-left:-8px;background:color-mix(in srgb,var(--jn-orange) 18%,#fff)}
.ud-jn-wf__copy{flex:1;min-width:0}
.ud-jn-wf__title{margin:0;font-size:.86rem;font-weight:600}
.ud-jn-wf__pair{margin:.2rem 0 0;font-size:.72rem;color:var(--jn-body)}
.ud-jn-wf__actions{display:flex;align-items:center;gap:.6rem;flex:none}
.ud-jn-wf__badge{padding:3px 9px;border-radius:4px;background:#efe7fb;color:#6d28d9;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.ud-jn-wf__try{padding:6px 14px;border-radius:6px;background:var(--jn-cream);border:1px solid var(--jn-line);font-size:.76rem;font-weight:600}

/* triggers & actions */
.ud-jn-tabs{display:inline-flex;margin:1.8rem auto 0;padding:4px;border-radius:8px;background:var(--jn-cream);border:1px solid var(--jn-hair);gap:2px}
.ud-jn-triggers{text-align:center}
.ud-jn-triggers .ud-jn-head{text-align:center;margin-inline:auto}
.ud-jn-tab{border:0;cursor:pointer;padding:8px 20px;border-radius:6px;background:transparent;color:var(--jn-body);font-family:inherit;font-size:.82rem;font-weight:600}
.ud-jn-tab.is-on{background:var(--jn-ink);color:#fff}
.ud-jn-triggers__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem;margin-top:1.8rem;text-align:left}
.ud-jn-trigger{padding:1.1rem 1.2rem;border:1px solid var(--jn-hair);border-radius:10px;background:var(--color-background,#fff)}
.ud-jn-trigger__tag{display:inline-block;margin-bottom:.6rem;padding:3px 9px;border-radius:4px;background:color-mix(in srgb,var(--jn-orange) 14%,transparent);color:var(--jn-orange);font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.ud-jn-trigger__tag.is-action{background:#e6efe9;color:#2f7d59}
.ud-jn-trigger__title{font-size:.9rem;margin-bottom:.35rem}
.ud-jn-trigger__text{margin:0;font-size:.78rem;line-height:1.6;color:var(--jn-body)}

/* developer cards */
.ud-jn-code__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem;margin-top:2.4rem}
.ud-jn-code__card{display:flex;flex-direction:column;gap:.9rem;padding:1.5rem;border:1px solid var(--jn-hair);border-radius:14px;background:var(--jn-cream)}
.ud-jn-code__card .ud-jn-btn{align-self:flex-start;margin-top:auto}
.ud-jn-code__sample{padding:1rem;border-radius:10px;background:var(--color-background,#fff);border:1px solid var(--jn-hair)}
.ud-jn-code__sample-label{display:block;margin-bottom:.4rem;font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--jn-body)}
.ud-jn-code__sample-text{margin:0;font-size:.82rem;line-height:1.55}
.ud-jn-code__meta{margin:0;font-size:.72rem;color:var(--jn-body)}
.ud-jn-code__block{padding:1rem 1.1rem;border-radius:10px;background:#1c1c1c;color:#e7e3df;font-family:var(--font-mono,"JetBrains Mono",ui-monospace,monospace);font-size:.72rem;line-height:1.7;white-space:pre-wrap;overflow-x:auto}

/* big number band */
.ud-jn-bignum{text-align:center}
.ud-jn-bignum__value{margin:2rem 0 0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:clamp(2.4rem,7cqi,5rem);font-weight:700;letter-spacing:-.04em;color:var(--jn-orange);line-height:1}
.ud-jn-bignum__label{margin:.7rem 0 0;font-size:.85rem;color:var(--jn-body)}
.ud-jn-bignum__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4rem;margin-top:3rem;text-align:left}
.ud-jn-bignum__col{padding-top:1.2rem;border-top:1px solid var(--jn-line)}
.ud-jn-bignum__col-title{font-size:1rem;margin-bottom:.5rem;color:#fff}
.ud-jn-bignum__col-text{margin:0;font-size:.8rem;line-height:1.6;color:var(--jn-body)}

/* metrics */
.ud-jn-metrics__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4rem;margin-top:2.6rem}
.ud-jn-metric{padding-top:1.3rem;border-top:2px solid var(--jn-orange)}
.ud-jn-metric__value{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:2.2rem;font-weight:700;letter-spacing:-.03em;line-height:1}
.ud-jn-metric__title{font-size:.95rem;margin:.7rem 0 .4rem}
.ud-jn-metric__text{margin:0;font-size:.8rem;line-height:1.6;color:var(--jn-body)}

/* customer proof */
.ud-jn-quote__grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.8fr);gap:clamp(1.6rem,4cqi,3rem);align-items:center;margin-top:2.6rem;padding:clamp(1.4rem,3cqi,2.2rem);border-radius:14px;background:var(--color-background,#fff);border:1px solid var(--jn-hair)}
.ud-jn-quote__text{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.15rem;line-height:1.45;color:var(--jn-ink)}
.ud-jn-quote__by{margin:1.2rem 0 0;display:grid;gap:.15rem;font-size:.8rem}
.ud-jn-quote__by strong{font-weight:650}
.ud-jn-quote__by span{color:var(--jn-body)}
.ud-jn-quote__stats{display:flex;gap:2.4rem;margin:1.6rem 0}
.ud-jn-quote__stat-value{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.7rem;font-weight:700;color:var(--jn-orange);line-height:1}
.ud-jn-quote__stat-label{margin:.25rem 0 0;font-size:.72rem;color:var(--jn-body)}
.ud-jn-quote__art{position:relative;border-radius:12px;overflow:hidden}
.ud-jn-quote__art .ud-media-box{border-radius:12px}
.ud-jn-quote__word{position:absolute;left:50%;bottom:1.4rem;translate:-50% 0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.1rem;font-weight:700;letter-spacing:.22em;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5)}

/* logo strip */
.ud-jn-logos{text-align:center}
.ud-jn-logos__title{margin:0;font-size:.85rem;color:var(--jn-body)}

/* pricing */
.ud-jn-pricing__segments{display:flex;flex-wrap:wrap;gap:1rem;padding:1rem;border-radius:12px;background:var(--jn-cream);border:1px solid var(--jn-hair)}
.ud-jn-seg{display:grid;gap:.5rem}
.ud-jn-seg__label{margin:0;font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--jn-body)}
.ud-jn-seg__row{display:flex;gap:.5rem}
.ud-jn-seg__btn{padding:10px 26px;border-radius:7px;background:var(--color-background,#fff);border:1px solid var(--jn-line);font-size:.85rem;font-weight:600}
.ud-jn-seg__btn.is-on{background:var(--jn-ink);border-color:transparent;color:#fff}
.ud-jn-slider{margin-top:1.1rem;padding:1.3rem 1.5rem;border-radius:12px;border:1px solid var(--jn-hair);background:var(--color-background,#fff)}
.ud-jn-slider__top{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.1rem}
.ud-jn-slider__label{margin:0;font-size:.88rem;font-weight:600}
.ud-jn-slider__link{font-size:.76rem;color:var(--jn-body);text-decoration:none;border-bottom:1px solid var(--jn-line)}
.ud-jn-slider__value{margin:0 0 .6rem;display:flex;align-items:baseline;gap:.4rem}
.ud-jn-slider__value strong{font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.4rem;font-weight:700;letter-spacing:-.02em;color:var(--jn-ink)}
.ud-jn-slider__value span{font-size:.74rem;color:var(--jn-body)}
/* Real draggable input, restyled to the flat track + dark knob of the design. */
.ud-jn-slider__range{-webkit-appearance:none;appearance:none;width:100%;height:16px;background:transparent;cursor:pointer;display:block;margin:0}
.ud-jn-slider__range:focus{outline:none}
.ud-jn-slider__range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 4px color-mix(in srgb,var(--jn-orange) 35%,transparent)}
.ud-jn-slider__range::-webkit-slider-runnable-track{height:3px;border-radius:999px;background:var(--jn-line)}
.ud-jn-slider__range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;margin-top:-6px;width:15px;height:15px;border-radius:999px;background:var(--jn-ink);border:0;transition:transform .12s ease}
.ud-jn-slider__range:active::-webkit-slider-thumb{transform:scale(1.15)}
.ud-jn-slider__range::-moz-range-track{height:3px;border-radius:999px;background:var(--jn-line)}
.ud-jn-slider__range::-moz-range-thumb{width:15px;height:15px;border-radius:999px;background:var(--jn-ink);border:0}
.ud-jn-slider__ticks{display:flex;justify-content:space-between;margin-top:.5rem;font-size:.66rem;color:var(--jn-body)}
.ud-jn-slider__tick.is-on{color:var(--jn-ink);font-weight:700}
.ud-jn-seg__btn{cursor:pointer;font-family:inherit;transition:background .16s ease,color .16s ease,border-color .16s ease}
.ud-jn-seg__btn:hover:not(.is-on){border-color:var(--jn-ink)}
.ud-jn-pricing__billing{display:flex;flex-wrap:wrap;align-items:center;gap:1.4rem;margin:1.4rem 0 1.2rem}
.ud-jn-radio{display:inline-flex;align-items:center;gap:.45rem;background:none;border:0;cursor:pointer;font-family:inherit;font-size:.82rem;color:var(--jn-body);padding:0}
.ud-jn-radio__dot{width:14px;height:14px;border-radius:999px;border:1px solid var(--jn-line);flex:none}
.ud-jn-radio.is-on{color:var(--jn-ink);font-weight:600}
.ud-jn-radio.is-on .ud-jn-radio__dot{border-color:var(--jn-ink);background:radial-gradient(circle,var(--jn-ink) 45%,transparent 47%)}
.ud-jn-currency{margin-left:auto;padding:7px 13px;border-radius:6px;border:1px solid var(--jn-line);font-size:.78rem}
.ud-jn-plans{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--jn-hair);border-radius:14px;overflow:hidden;background:var(--color-background,#fff)}
.ud-jn-plan{display:flex;flex-direction:column;padding:1.6rem 1.3rem;border-right:1px solid var(--jn-hair)}
.ud-jn-plan:last-child{border-right:0}
.ud-jn-plan--featured{background:var(--jn-cream)}
.ud-jn-plan__name{font-size:1.2rem}
.ud-jn-plan__sub{margin:.5rem 0 0;font-size:.72rem;color:var(--jn-body)}
.ud-jn-plan__price{margin:.35rem 0 0;display:flex;align-items:baseline;gap:.25rem;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.85rem;font-weight:700;letter-spacing:-.03em;line-height:1.15}
.ud-jn-plan__unit{font-size:.75rem;font-weight:500;color:var(--jn-body)}
.ud-jn-plan__text{margin:.8rem 0 1.2rem;font-size:.76rem;line-height:1.6;color:var(--jn-body)}
.ud-jn-plan__cta{width:100%;margin-top:auto}
.ud-jn-plan__link{display:block;margin-top:.7rem;text-align:center;font-size:.75rem;color:var(--jn-body);text-decoration:underline}
.ud-jn-plan__flabel{margin:1.3rem 0 .6rem;font-size:.72rem;font-weight:700}
.ud-jn-plan__list{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}
.ud-jn-plan__list li{display:flex;gap:.45rem;align-items:flex-start;font-size:.74rem;line-height:1.45;color:var(--jn-body)}
.ud-jn-plan__list svg{color:var(--jn-orange);flex:none;margin-top:3px}

/* plan includes */
.ud-jn-included__panel{padding:clamp(1.4rem,3cqi,2.2rem);border-radius:14px;background:var(--jn-cream);border:1px solid var(--jn-hair)}
.ud-jn-included__title{font-size:1.25rem;margin-bottom:1.4rem}
.ud-jn-included__cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.6rem}
.ud-jn-included__col-title{font-size:.88rem;margin-bottom:.3rem}
.ud-jn-access{list-style:none;margin:1rem 0 0;padding:0;display:grid;gap:.55rem}
.ud-jn-access li{display:flex;align-items:center;gap:.55rem;font-size:.82rem;color:var(--jn-body)}
.ud-jn-access__icon{display:inline-flex;flex:none}

/* platform band */
.ud-jn-platform__head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2rem;align-items:end}
.ud-jn-platform__panel{margin-top:2.4rem;border:1px solid var(--jn-line);border-radius:14px;overflow:hidden;background:rgba(255,255,255,.04)}
.ud-jn-platform__brand{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.4rem 1.5rem;border-bottom:1px solid var(--jn-line)}
.ud-jn-platform__note{font-size:.72rem;color:var(--jn-body)}
.ud-jn-platform__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-jn-platform__cell{padding:1.4rem 1.5rem;border-right:1px solid var(--jn-line)}
.ud-jn-platform__cell:last-child{border-right:0}
.ud-jn-platform__cell-title{margin:0 0 .5rem;display:flex;align-items:center;gap:.4rem;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:.92rem;font-weight:650;color:#fff}
.ud-jn-platform__spark{color:var(--jn-orange);display:inline-flex;flex:none}
.ud-jn-platform__cell-text{margin:0 0 .9rem;font-size:.78rem;line-height:1.6;color:var(--jn-body)}
.ud-jn-platform__link{font-size:.78rem;font-weight:600;color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.4);padding-bottom:2px}
.ud-jn-platform__strip{padding:1.3rem 1.5rem;border-top:1px solid var(--jn-line);background:rgba(255,255,255,.03)}

/* grouped FAQ */
.ud-jn-faq__body{max-width:52rem;margin:2.4rem auto 0}
.ud-jn-faq__group{margin-bottom:2rem}
.ud-jn-faq__group-title{margin:0 0 .7rem;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:.95rem;font-weight:650}
.ud-jn-faq__item{border-radius:8px;background:var(--jn-cream);margin-bottom:.4rem}
.ud-jn-faq__item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.95rem 1.1rem;font-size:.85rem}
.ud-jn-faq__item summary::-webkit-details-marker{display:none}
.ud-jn-faq__mark{color:var(--jn-body);display:inline-flex;flex:none}
.ud-jn-faq__item[open] .ud-jn-faq__mark{color:var(--jn-orange)}
.ud-jn-faq__answer{margin:0;padding:0 1.1rem 1.1rem;font-size:.82rem;line-height:1.65;color:var(--jn-body)}

/* CTA band */
.ud-jn-ctaband{text-align:center}
.ud-jn-ctaband__btns{display:flex;justify-content:center;margin-top:1.8rem}

/* footer */
.ud-jn-footer{background:var(--ud-bg,var(--color-background,#fff));font-family:var(--font-body,Inter,system-ui,sans-serif);color:var(--jn-ink)}
.ud-jn-footer__cta{position:relative;isolation:isolate;padding:clamp(3rem,7cqi,5rem) 0;color:#fff;background:#1f1d1b;text-align:center;--jn-ink:#fff;--jn-body:rgba(255,255,255,.7)}
.ud-jn-footer__body{padding-block:clamp(2.4rem,5cqi,3.6rem)}
.ud-jn-footer__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.6rem}
.ud-jn-footer__col{display:grid;align-content:start;gap:.5rem}
.ud-jn-footer__col-title{margin:0 0 .3rem;font-size:.8rem;font-weight:700}
.ud-jn-footer__link{font-size:.8rem;color:var(--jn-body);text-decoration:none}
.ud-jn-footer__link:hover{color:var(--jn-ink)}
.ud-jn-footer__bar{display:flex;flex-wrap:wrap;align-items:center;gap:1.2rem;margin-top:2.4rem;padding-top:1.4rem;border-top:1px solid var(--jn-hair)}
.ud-jn-footer__social{display:flex;align-items:center;gap:.5rem;font-size:.75rem;color:var(--jn-body)}
.ud-jn-social{width:26px;height:26px;border-radius:999px;border:1px solid var(--jn-line);display:inline-flex;align-items:center;justify-content:center;color:var(--jn-body);text-decoration:none}
.ud-jn-social:hover{color:var(--jn-ink);border-color:var(--jn-ink)}
.ud-jn-footer__legal{display:flex;flex-wrap:wrap;align-items:center;gap:1rem;margin-left:auto;font-size:.74rem;color:var(--jn-body)}
.ud-jn-footer__legal a{color:inherit;text-decoration:none}

@container udpage (max-width:1024px){
  .ud-jn-plans{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-jn-plan:nth-child(2n){border-right:0}
  .ud-jn-plan:nth-child(-n+2){border-bottom:1px solid var(--jn-hair)}
  .ud-jn-hero__stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-jn-usecases__grid,.ud-jn-included__cols,.ud-jn-platform__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-jn-platform__cell:nth-child(2n){border-right:0}
  .ud-jn-nav__links{display:none}
}
@container udpage (max-width:860px){
  .ud-jn-nav__bar{gap:.6rem}
  .ud-jn-nav__links{position:absolute;top:58px;left:12px;right:12px;flex-direction:column;align-items:stretch;gap:0;padding:10px;border-radius:12px;background:var(--color-background,#fff);border:1px solid var(--jn-line);z-index:60}
  .ud-jn-nav__links.is-open{display:flex}
  .ud-jn-nav__link{padding:11px 8px;border-bottom:1px solid var(--jn-hair)}
  .ud-jn-nav__utility{display:none}
  .ud-jn-nav__toggle{display:inline-flex}
  .ud-jn-cards__grid,.ud-jn-cards__grid[data-cols="3"],.ud-jn-split__grid,.ud-jn-accordion__grid,.ud-jn-secure__lead,.ud-jn-secure__grid,.ud-jn-triggers__grid,.ud-jn-code__grid,.ud-jn-bignum__grid,.ud-jn-metrics__grid,.ud-jn-quote__grid,.ud-jn-platform__head,.ud-jn-usecases__grid,.ud-jn-included__cols,.ud-jn-platform__grid,.ud-jn-apps{grid-template-columns:1fr}
  .ud-jn-split--reverse .ud-jn-split__media{order:0}
  .ud-jn-platform__cell{border-right:0;border-bottom:1px solid var(--jn-line)}
  .ud-jn-footer__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-jn-quote__word{bottom:1rem}
}
@container udpage (max-width:600px){
  .ud-jn-plans{grid-template-columns:1fr}
  .ud-jn-plan{border-right:0;border-bottom:1px solid var(--jn-hair)}
  .ud-jn-plan:last-child{border-bottom:0}
  .ud-jn-hero__stats,.ud-jn-footer__grid{grid-template-columns:1fr}
  .ud-jn-btns{flex-direction:column;align-items:stretch;width:100%}
  .ud-jn-pricing__billing{gap:.8rem}
  .ud-jn-currency{margin-left:0}
  .ud-jn-quote__stats{gap:1.4rem}
  .ud-jn-footer__legal{margin-left:0}
}

/* ----------------------------------------------------------------- Kindred */
.ud-kd{
  --kd-brand:var(--ud-accent,var(--color-primary,#36960d));
  --kd-ink:var(--ud-heading,var(--ud-fg,var(--color-text,#161616)));
  --kd-body:var(--ud-muted,var(--color-muted,#5f5f5f));
  --kd-pink:var(--ud-card,var(--color-surface,#eef6ea));
  --kd-line:color-mix(in srgb,var(--kd-ink) 14%,transparent);
  --kd-serif:var(--font-serif,"Libre Baskerville",Georgia,serif);
  --kd-band:var(--kd-pink);
  color:var(--kd-ink);
  font-family:var(--font-body,Inter,system-ui,sans-serif);
}
.ud-kd :where(h1,h2,h3,h4){font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-weight:var(--font-heading-weight,800);color:var(--kd-ink);letter-spacing:-.02em;line-height:1.08;margin:0}
.ud-kd-title{font-size:var(--ud-heading-size,clamp(1.7rem,2.6cqi + .8rem,2.5rem))}
.ud-kd-title--xl{font-size:var(--ud-heading-size,clamp(2.2rem,4.4cqi + .9rem,4rem))}
.ud-kd .ud-kd-title--center{text-align:center;margin-inline:auto}
.ud-kd .ud-kd-title--narrow{max-width:18ch}
.ud-kd-title--light{color:#fff}
.ud-kd-dot{color:var(--kd-brand)}
.ud-kd-lead{margin:1.2rem auto 0;max-width:52ch;text-align:center;font-size:var(--ud-body-size,.95rem);line-height:1.65;color:var(--kd-body)}

/* the thin red rule the reference drops between sections */
.ud-kd-connector{display:block;width:1px;height:56px;margin:0 auto 2.4rem;background:var(--kd-brand)}

/* pale band with slanted top and bottom edges */
.ud-kd-band{position:relative;isolation:isolate}
.ud-kd-band::before{content:"";position:absolute;left:0;right:0;top:0;bottom:0;z-index:-1;background:var(--kd-band);transform:skewY(-1.1deg);transform-origin:100% 0}

.ud-kd-more{display:inline-flex;align-items:center;gap:.45rem;font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--kd-ink);text-decoration:none}
.ud-kd-more--light{color:#fff}
.ud-kd-more:hover{opacity:.75}
.ud-kd-btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 26px;border-radius:var(--radius-button,4px);font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.78rem;font-weight:700;text-decoration:none;border:2px solid transparent;transition:background .16s ease,color .16s ease,border-color .16s ease}
.ud-kd-btn--red{background:var(--kd-brand);color:#fff}
.ud-kd-btn--red:hover{background:color-mix(in srgb,var(--kd-brand) 84%,#000)}
.ud-kd-btn--outline{background:transparent;color:var(--kd-ink);border-color:var(--kd-line)}
.ud-kd-btn--outline:hover{border-color:var(--kd-ink)}
.ud-kd-btn--light{background:#fff;color:var(--kd-ink)}
.ud-kd-back{display:inline-flex;align-items:center;gap:.35rem;margin-bottom:1.2rem;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--kd-body);text-decoration:none}

/* wordmark — a heavy italic display signature */
.ud-kd-wordmark{font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.6rem;font-weight:800;font-style:italic;letter-spacing:-.045em;color:var(--kd-brand);text-decoration:none;line-height:1}
.ud-kd-wordmark--sm{font-size:1.25rem}
.ud-kd-wordmark__img{position:relative;display:inline-flex;align-items:center}
.ud-kd-wordmark__img img{max-width:220px;object-fit:contain}

/* masthead */
.ud-kd-nav{background:var(--ud-bg,var(--color-background,#fff));position:relative;z-index:60}
.ud-kd-nav--sticky.ud-kd-nav--sticky{position:sticky;top:0}
.ud-kd-nav__top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:12px clamp(16px,4cqi,40px);border-bottom:1px solid var(--kd-line)}
.ud-kd-nav__menu{display:inline-flex;align-items:center;gap:.5rem;background:none;border:0;cursor:pointer;font-family:inherit;font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--kd-brand);justify-self:start;padding:0}
.ud-kd-nav__spacer{display:block}
.ud-kd-nav__menu.is-open{opacity:.75}
/* drawer opened by the MENU button */
.ud-kd-menu{border-bottom:1px solid var(--kd-line);background:var(--color-background,#fff);animation:ud-kd-drawer .18s ease both}
@keyframes ud-kd-drawer{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.ud-kd-menu__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.6rem 2.4rem;padding-block:2rem}
.ud-kd-menu__col{display:grid;align-content:start;gap:.55rem}
.ud-kd-menu__title{margin:0 0 .4rem;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:.68rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--kd-brand)}
.ud-kd-menu__link{font-size:.9rem;color:var(--kd-ink);text-decoration:none}
.ud-kd-menu__link:hover{color:var(--kd-brand)}
.ud-kd-menu__foot{grid-column:1 / -1;display:inline-flex;align-items:center;gap:.4rem;margin-top:.6rem;padding-top:1.2rem;border-top:1px solid var(--kd-line);font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--kd-brand);text-decoration:none}
.ud-kd-nav__row{display:flex;align-items:center;justify-content:center;gap:clamp(1rem,3cqi,2.6rem);padding:12px clamp(16px,4cqi,40px);border-bottom:1px solid var(--kd-line);flex-wrap:wrap}
.ud-kd-nav__link{font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--kd-ink);text-decoration:none}
.ud-kd-nav__link:hover{color:var(--kd-brand)}

/* section sub-nav */
.ud-kd-subnav{background:var(--ud-bg,var(--color-background,#fff));position:relative;z-index:55}
.ud-kd-subnav__top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:10px clamp(16px,4cqi,40px)}
.ud-kd-subnav__tag{display:inline-flex;align-items:center;gap:.5rem;justify-self:start;padding:6px 14px 6px 0;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--kd-brand)}
.ud-kd-subnav__row{display:flex;align-items:center;justify-content:center;gap:clamp(.8rem,3cqi,2.4rem);padding:0 clamp(16px,4cqi,40px);border-bottom:1px solid var(--kd-line);flex-wrap:wrap}
.ud-kd-subnav__link{position:relative;padding:12px 2px;font-size:.68rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--kd-ink);text-decoration:none}
.ud-kd-subnav__link.is-on{color:var(--kd-brand)}
.ud-kd-subnav__link.is-on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--kd-brand)}

/* red hero with the slanted foot */
.ud-kd-hero{color:#fff;padding-block:var(--ud-pt,clamp(2.5rem,6cqi,4.5rem)) var(--ud-pb,clamp(4rem,9cqi,7rem));isolation:isolate}
.ud-kd-hero__bg{position:absolute;left:0;right:0;top:-40px;bottom:0;z-index:-1;background:var(--kd-brand);transform:skewY(-1.6deg);transform-origin:100% 100%}
.ud-kd-hero__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.72fr);gap:clamp(1.5rem,4cqi,3rem);align-items:center}
.ud-kd-hero__title{font-size:var(--ud-heading-size,clamp(1.9rem,3.4cqi + .8rem,3rem));color:#fff;max-width:16ch;margin-bottom:1.6rem}
.ud-kd-hero__art{position:relative;justify-self:center}
.ud-kd-hero__circle{border-radius:50%;overflow:hidden;aspect-ratio:1 / 1;width:clamp(180px,26cqi,320px)}
.ud-kd-hero__circle .ud-media-box,.ud-kd-hero__circle img{border-radius:50%}
.ud-kd-hero__caption{display:block;margin-top:.7rem;text-align:center;font-size:.66rem;color:rgba(255,255,255,.75)}

/* page title */
.ud-kd-pagehead{text-align:center}

/* logo cards + carousel */
.ud-kd-carousel__viewport{position:relative;margin-top:2.4rem}
.ud-kd-carousel__grid{display:grid;gap:1rem;grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-kd-carousel__grid[data-per="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-kd-carousel__grid[data-per="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-kd-logocard{display:grid;justify-items:center;gap:1.4rem;padding:2.4rem 1.2rem 1.4rem;background:#fff;text-decoration:none;color:var(--kd-ink);min-height:170px;align-content:center}
.ud-kd-logocard__mark{display:grid;place-items:center;min-height:64px}
.ud-kd-logocard__mark img{max-width:130px;max-height:64px;object-fit:contain}
.ud-kd-logocard__word{font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1.5rem;font-weight:800;font-style:italic;letter-spacing:-.04em;color:var(--kd-brand)}
.ud-kd-logocard__name{display:inline-flex;align-items:center;gap:.4rem;font-size:.86rem}
.ud-kd-logocard__name svg{color:var(--kd-brand)}
.ud-kd-logocard:hover .ud-kd-logocard__name{color:var(--kd-brand)}
.ud-kd-carousel__next{position:absolute;right:-14px;top:50%;translate:0 -50%;width:34px;height:34px;border-radius:999px;border:0;background:var(--kd-brand);color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.ud-kd-dots{display:flex;justify-content:center;gap:.4rem;margin-top:1.2rem}
.ud-kd-dots__dot{width:7px;height:7px;border-radius:999px;border:0;padding:0;cursor:pointer;background:color-mix(in srgb,var(--kd-ink) 25%,transparent)}
.ud-kd-dots__dot.is-on{background:var(--kd-brand)}
.ud-kd-carousel__foot{display:flex;justify-content:center;margin-top:2rem}

/* editorial cards */
.ud-kd-articles__grid{display:grid;gap:1.6rem 1.4rem;margin-top:2.4rem;grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-kd-articles__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-kd-article{display:block;text-decoration:none;color:inherit}
.ud-kd-article__media{position:relative;display:block;overflow:hidden}
.ud-kd-article__media .ud-media-box{border-radius:0}
.ud-kd-article__media--flat{display:grid;align-items:center;padding:1.6rem 1.4rem 2.6rem;aspect-ratio:16 / 10}
.ud-kd-article__flat-text{font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1rem;font-weight:700;line-height:1.35;color:#fff}
.ud-kd-article__tag{position:absolute;left:0;bottom:0;padding:6px 12px;background:var(--kd-brand);color:#fff;font-size:.6rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.ud-kd .ud-kd-article__title{font-family:var(--kd-serif);font-size:1rem;font-weight:700;line-height:1.32;letter-spacing:0;margin-top:1rem}
.ud-kd-article:hover .ud-kd-article__title{color:var(--kd-brand)}
.ud-kd-article__date{margin:.6rem 0 0;font-size:.72rem;color:var(--kd-body)}

/* featured story with the overlapping panel */
.ud-kd-lead-story{position:relative;display:block;text-decoration:none;color:inherit;padding-bottom:1.4rem}
.ud-kd-lead-story__media{width:min(70%,760px);margin-left:auto}
.ud-kd-lead-story__media .ud-media-box{border-radius:0}
.ud-kd-lead-story__panel{position:absolute;left:0;top:12%;max-width:min(46%,420px);background:#fff;padding:1.6rem 1.8rem 1.4rem;display:grid;gap:.6rem}
.ud-kd-lead-story__tag{font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--kd-brand)}
.ud-kd .ud-kd-lead-story__title{font-family:var(--kd-serif);font-size:clamp(1.2rem,2cqi + .6rem,1.8rem);font-weight:700;line-height:1.24;letter-spacing:0}

/* filter tabs */
.ud-kd-filter{text-align:center}
.ud-kd-filter__tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem 1.6rem;margin-top:1.6rem}
.ud-kd-filter__tab{position:relative;background:none;border:0;cursor:pointer;padding:6px 2px;font-family:inherit;font-size:.85rem;font-weight:600;color:var(--kd-ink)}
.ud-kd-filter__tab.is-on{color:var(--kd-brand)}
.ud-kd-filter__tab.is-on::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--kd-brand)}
.ud-kd-filter__select{position:relative;display:inline-flex;align-items:center;margin-top:1.4rem}
.ud-kd-filter__select select{appearance:none;padding:9px 40px 9px 16px;border:1px solid var(--kd-line);border-radius:4px;background:#fff;font-family:inherit;font-size:.82rem;color:var(--kd-ink);min-width:220px;cursor:pointer}
.ud-kd-filter__select svg{position:absolute;right:14px;pointer-events:none;color:var(--kd-body)}

/* story + long copy */
.ud-kd-story{text-align:center}
.ud-kd-story__banner{margin-bottom:2.6rem}
.ud-kd-story__banner .ud-media-box{border-radius:0}
.ud-kd-story__body{max-width:44rem;margin:1.6rem auto 0;font-size:.92rem;line-height:1.75;color:var(--kd-body);text-align:center;white-space:pre-line}
.ud-kd-rich__intro{max-width:40rem;margin:0 auto;font-size:1.05rem;line-height:1.6;color:var(--kd-ink)}
.ud-kd-rich__body{max-width:40rem;margin:2.4rem auto 0;display:grid;gap:2.2rem}
.ud-kd-rich__subtitle{font-size:1.5rem;margin-bottom:.9rem}
.ud-kd-rich__text{margin:0;font-size:.88rem;line-height:1.8;color:var(--kd-body);white-space:pre-line}

/* value panels */
.ud-kd-values__rail{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:2.6rem}
.ud-kd-value{position:relative;margin:0;padding:2.6rem 1.6rem 1.2rem;background:#fff;min-height:230px;display:grid;align-content:center}
.ud-kd-value--red{background:var(--kd-brand)}
.ud-kd-value--red .ud-kd-value__word{color:#fff}
.ud-kd-value--red .ud-kd-value__frac{color:rgba(255,255,255,.85)}
.ud-kd-value--red figcaption{color:rgba(255,255,255,.7)}
.ud-kd-value__frac{position:absolute;top:1rem;left:1.4rem;font-size:.8rem;color:var(--kd-brand);font-weight:700}
.ud-kd-value__frac sup,.ud-kd-value__frac sub{font-size:.7rem}
.ud-kd-value__word{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:clamp(1.6rem,3cqi,2.4rem);font-weight:800;font-style:italic;line-height:1.02;letter-spacing:-.04em;color:var(--kd-brand)}
.ud-kd-value figcaption{margin-top:1.4rem;font-size:.62rem;color:var(--kd-body)}

/* key statistics */
.ud-kd-stats{text-align:center}
.ud-kd-stats__rail{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin-top:2.4rem}
.ud-kd-stats__panel{margin:0}
.ud-kd-stats__panel .ud-media-box{border-radius:0}
.ud-kd-stats__panel figcaption{margin-top:.5rem;text-align:right;font-size:.62rem;color:var(--kd-body)}

/* big numbers */
.ud-kd-numbers{text-align:center}
.ud-kd-numbers__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.6rem;max-width:46rem;margin:2.2rem auto 0}
.ud-kd-number{padding-top:1rem;border-top:2px solid var(--kd-ink)}
.ud-kd-number__value{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:clamp(1.7rem,3cqi,2.4rem);font-weight:800;letter-spacing:-.03em;line-height:1}
.ud-kd-number__label{margin:.5rem 0 0;font-size:.8rem;color:var(--kd-body)}

/* video band */
.ud-kd-videoband{position:relative;isolation:isolate;text-align:center}
.ud-kd-videoband::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--kd-band)}
.ud-kd-videoband__frame{position:relative;max-width:720px;margin:2rem auto 0;aspect-ratio:16 / 9;overflow:hidden}
.ud-kd-videoband__frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.ud-kd-videoband__frame .ud-media-box{border-radius:0;height:100%}
.ud-kd-videoband__play{position:absolute;inset:0;display:grid;place-items:center;color:#fff}
.ud-kd-videoband__play svg{filter:drop-shadow(0 4px 14px rgba(0,0,0,.5))}
.ud-kd-videoband__caption{margin:1rem 0 0;font-size:.72rem;color:rgba(255,255,255,.7)}

/* benefits */
.ud-kd-benefits{position:relative;isolation:isolate;text-align:center}
.ud-kd-benefits::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--kd-band)}
.ud-kd-benefits__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2rem;margin-top:2.6rem}
.ud-kd-benefit__icon{display:grid;place-items:center;color:var(--kd-ink);opacity:.9}
.ud-kd-benefit__text{margin:1.4rem 0 0;font-size:.82rem;line-height:1.7;color:var(--kd-body)}

/* jobs */
.ud-kd-jobs{text-align:center}
.ud-kd-jobs__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:2.4rem}
.ud-kd-job{display:grid;justify-items:center;gap:.3rem;padding:2rem 1.2rem;background:#fff;text-decoration:none;color:inherit}
.ud-kd-job__mark{margin-bottom:1rem;font-size:1.3rem}
.ud-kd-job__role{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:.95rem;font-weight:700}
.ud-kd-job__company{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:.95rem;font-weight:700}
.ud-kd-job__loc{display:inline-flex;align-items:center;gap:.3rem;margin-top:.7rem;font-size:.72rem;color:var(--kd-body)}

/* company grid */
.ud-kd-companies__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}

/* promos */
.ud-kd-promos__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1.4rem,4cqi,3rem)}
.ud-kd-promo{background:transparent}
.ud-kd-promo .ud-media-box{border-radius:0}
.ud-kd-promo__body{padding:1.2rem 0 0}
.ud-kd-promo__title{font-size:1.15rem;margin-bottom:.6rem}
.ud-kd-promo__text{margin:0 0 .9rem;font-size:.82rem;line-height:1.65;color:var(--kd-body)}
.ud-kd-promo__link{display:inline-flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;color:var(--kd-brand);text-decoration:none}

/* social badge */
.ud-kd-social{text-align:center}
.ud-kd-social__badge{display:grid;place-items:center;width:86px;height:86px;margin:0 auto 1.2rem;border-radius:50%;background:var(--kd-brand);color:#fff;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:2rem;font-weight:800;font-style:italic}
.ud-kd-social__title{margin:0;font-family:var(--font-heading,Figtree,system-ui,sans-serif);font-size:1rem;font-weight:700}
.ud-kd-social__text{margin:.4rem 0 0;font-size:.8rem;color:var(--kd-body)}
.ud-kd-social__row{display:flex;justify-content:center;gap:1.2rem;margin-top:1.2rem}
.ud-kd-social__row a{color:var(--kd-ink);text-decoration:none}
.ud-kd-social__row a:hover{color:var(--kd-brand)}

/* footer */
.ud-kd-footer{background:var(--ud-bg,var(--color-background,#fff));padding-block:clamp(2rem,5cqi,3.4rem);border-top:1px solid var(--kd-line);font-family:var(--font-body,Inter,system-ui,sans-serif)}
.ud-kd-footer__grid{display:grid;grid-template-columns:repeat(3,minmax(0,.7fr)) minmax(0,1.3fr);gap:1.6rem;margin-top:1.6rem}
.ud-kd-footer__col{display:grid;align-content:start;gap:.55rem}
.ud-kd-footer__link{font-size:.74rem;color:var(--kd-ink);text-decoration:none}
.ud-kd-footer__link:hover{color:var(--kd-brand)}
.ud-kd-footer__quote{margin:0;font-family:var(--kd-serif);font-size:.86rem;line-height:1.5;text-align:right;color:var(--kd-ink)}
.ud-kd-footer__quote-by{display:block;margin-top:.7rem;font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.72rem;color:var(--kd-body)}
.ud-kd-footer__social{display:flex;justify-content:center;gap:1.1rem;margin-top:2.4rem}
.ud-kd-footer__social a{color:var(--kd-ink);text-decoration:none}
.ud-kd-footer__social a:hover{color:var(--kd-brand)}
.ud-kd-footer__fine{margin:1.2rem 0 0;text-align:center;font-size:.68rem;color:var(--kd-body)}

@container udpage (max-width:1024px){
  .ud-kd-articles__grid,.ud-kd-articles__grid[data-cols="2"],.ud-kd-companies__grid,.ud-kd-carousel__grid,.ud-kd-carousel__grid[data-per="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-kd-values__rail,.ud-kd-benefits__grid,.ud-kd-jobs__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-kd-footer__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-kd-footer__quote{text-align:left}
  .ud-kd-carousel__next{right:-6px}
}
@container udpage (max-width:820px){
  .ud-kd-hero__grid{grid-template-columns:1fr;text-align:center}
  .ud-kd-hero__title{margin-inline:auto}
  .ud-kd-lead-story__media{width:100%}
  .ud-kd-lead-story__panel{position:static;max-width:none;padding:1.2rem 0 0}
  .ud-kd-promos__grid,.ud-kd-stats__rail,.ud-kd-numbers__grid{grid-template-columns:1fr}
  .ud-kd-nav__row,.ud-kd-subnav__row{gap:.9rem}
}
@container udpage (max-width:600px){
  .ud-kd-articles__grid,.ud-kd-articles__grid[data-cols="2"],.ud-kd-companies__grid,.ud-kd-carousel__grid,.ud-kd-carousel__grid[data-per="2"],.ud-kd-carousel__grid[data-per="4"]{grid-template-columns:1fr}
  .ud-kd-values__rail,.ud-kd-benefits__grid,.ud-kd-jobs__grid,.ud-kd-footer__grid{grid-template-columns:1fr}
  .ud-kd-nav__top,.ud-kd-subnav__top{grid-template-columns:auto 1fr}
  .ud-kd-nav__spacer{display:none}
  .ud-kd-nav__row{display:none}
  .ud-kd-menu__grid{grid-template-columns:1fr;padding-block:1.4rem}
  .ud-kd-nav__row.is-open{display:flex;flex-direction:column;align-items:flex-start}
}


/* ------------------------------------------------- shared nav dropdown menu */
.ud-navitem{position:relative;display:inline-flex;align-items:center;gap:.3rem}
/* Extend the item's own hover box down to meet the panel. Without this the
   cursor crosses dead space on the way to the menu and it closes mid-move.
   The negative margin cancels the padding so layout is unchanged. */
.ud-navitem--has-menu{padding-bottom:10px;margin-bottom:-10px}
.ud-submenu__caret{display:inline-flex;opacity:.55;transition:transform .16s ease}
.ud-navitem--has-menu:hover .ud-submenu__caret,.ud-navitem--has-menu:focus-within .ud-submenu__caret{transform:rotate(180deg);opacity:.9}
.ud-submenu{position:absolute;top:100%;left:0;min-width:210px;margin-top:0;padding:8px;border-radius:10px;background:var(--color-background,#fff);border:1px solid color-mix(in srgb,var(--color-text,#111) 12%,transparent);box-shadow:0 22px 48px -26px rgb(0 0 0 / .45);display:grid;z-index:80;text-align:left;visibility:hidden;opacity:0;translate:0 -4px;transition:opacity .13s ease,translate .13s ease,visibility 0s linear .22s}
.ud-navitem:hover>.ud-submenu,.ud-navitem:focus-within>.ud-submenu{visibility:visible;opacity:1;translate:0 0;transition:opacity .13s ease,translate .13s ease,visibility 0s}
.ud-submenu__link{display:block;padding:8px 12px;border-radius:6px;color:var(--color-text,#111);text-decoration:none;font-size:.85rem;font-weight:500;letter-spacing:normal;text-transform:none;white-space:nowrap}
.ud-submenu__link:hover{background:color-mix(in srgb,var(--color-primary,#2563eb) 12%,transparent);color:var(--color-primary,#2563eb)}
/* The disclosure button is for touch, where there is no hover to open a
   dropdown with. On a wide screen hover still does it and the button stays out
   of the way. */
.ud-navitem__toggle{display:none;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;padding:0;border:0;background:none;color:inherit;cursor:pointer;position:absolute;top:0;right:0;opacity:.65;transition:transform .16s ease,opacity .16s ease}
.ud-navitem__toggle:hover{opacity:1}
.ud-navitem.is-open>.ud-navitem__toggle{transform:rotate(180deg);opacity:1}
@container udpage (max-width:860px){
  .ud-navitem{display:flex;flex-direction:column;align-items:stretch;width:100%;position:relative}
  /* Collapsed until the disclosure button is pressed. Leaving every submenu
     open pushed the top-level links off the screen. */
  .ud-submenu{position:static;display:none;margin:4px 0 8px 12px;border:0;box-shadow:none;padding:0;min-width:0;background:transparent;visibility:visible;opacity:1;translate:none;transition:none}
  .ud-navitem.is-open>.ud-submenu{display:grid}
  /* Hover cannot open a menu on a touch screen, so the button is the only way in. */
  .ud-navitem:hover>.ud-submenu,.ud-navitem:focus-within>.ud-submenu{display:none}
  .ud-navitem.is-open:hover>.ud-submenu,.ud-navitem.is-open:focus-within>.ud-submenu{display:grid}
  .ud-navitem--has-menu>.ud-navitem__toggle{display:inline-flex}
  .ud-navitem--has-menu{padding-bottom:0;margin-bottom:0}
  .ud-submenu__link{padding:7px 0;font-size:.8rem}
  .ud-submenu__caret{display:none}
}


/* --------------------------------------------------------------- Northbook */
.ud-nb{
  --nb-green:var(--ud-accent,var(--color-primary,#2bb673));
  --nb-navy:var(--ud-heading,var(--color-secondary,#0e3c4d));
  --nb-ink:var(--ud-fg,var(--color-text,#0e3c4d));
  --nb-body:var(--ud-muted,var(--color-muted,#5f7178));
  --nb-line:color-mix(in srgb,var(--nb-navy) 13%,transparent);
  --nb-soft:var(--ud-card,var(--color-surface,#f5f8f8));
  --nb-band:#dfe9e9;
  color:var(--nb-ink);
  font-family:var(--font-body,Inter,system-ui,sans-serif);
}
.ud-nb :where(h1,h2,h3,h4){font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-weight:var(--font-heading-weight,700);color:var(--nb-navy);letter-spacing:-.02em;line-height:1.18;margin:0}
.ud-nb-title{font-size:var(--ud-heading-size,clamp(1.45rem,2.1cqi + .7rem,2.1rem))}
.ud-nb-title--xl{font-size:var(--ud-heading-size,clamp(1.9rem,3cqi + .8rem,2.9rem));max-width:17ch}
.ud-nb .ud-nb-title--center{text-align:center;margin-inline:auto;max-width:22ch}
.ud-nb-title--light{color:#fff}
.ud-nb-dot{color:var(--nb-green)}
.ud-nb-eyebrow{margin:0 0 .6rem;font-size:.82rem;font-weight:600;color:var(--nb-green)}
.ud-nb-lead{margin:1rem 0 0;max-width:46ch;font-size:var(--ud-body-size,.92rem);line-height:1.7;color:var(--nb-body)}
.ud-nb-lead--center{margin-inline:auto;text-align:center}
.ud-nb-head--center{text-align:center;margin-inline:auto;max-width:44rem}
.ud-nb-head--center .ud-nb-lead{margin-inline:auto}

.ud-nb-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;padding:13px 26px;border-radius:var(--radius-button,999px);background:var(--nb-green);color:#fff;font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.85rem;font-weight:600;text-decoration:none;border:1px solid transparent;transition:filter .16s ease,transform .16s ease}
.ud-nb-btn:hover{filter:brightness(.94);transform:translateY(-1px)}
.ud-nb-btn--outline{background:transparent;color:var(--nb-green);border-color:var(--nb-green)}
.ud-nb-btn--light{background:#fff;color:var(--nb-navy)}
.ud-nb-link{display:inline-flex;align-items:center;gap:.45rem;font-size:.82rem;font-weight:600;color:var(--nb-green);text-decoration:none}
.ud-nb-glyph{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:color-mix(in srgb,var(--nb-green) 12%,transparent);color:var(--nb-green);flex:none}
.ud-nb-glyph--dark{background:rgba(255,255,255,.1);color:var(--nb-green)}

.ud-nb-logo{display:inline-flex;align-items:center;text-decoration:none;color:var(--nb-navy)}
.ud-nb-logo--light,.ud-nb-logo--light .ud-nb-logo__text{color:#fff}
.ud-nb-logo__img{position:relative;display:inline-flex;align-items:center}
.ud-nb-logo__img img{max-width:230px;object-fit:contain}
.ud-nb-logo__text{display:grid;font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-size:1.25rem;font-weight:700;line-height:1.05;letter-spacing:-.03em;position:relative}
.ud-nb-logo__sub{font-size:1.25rem;font-weight:700;color:inherit}
.ud-nb-logo__mark{position:absolute;top:-2px;right:-16px;color:var(--nb-green)}

/* utility bar */
.ud-nb-topbar{background:var(--ud-bg,var(--color-background,#fff));font-size:.72rem}
.ud-nb-topbar__bar{display:flex;align-items:center;gap:1.4rem;padding-block:9px;flex-wrap:wrap}
.ud-nb-topbar__links{display:flex;gap:1.1rem}
.ud-nb-topbar__links a{color:var(--nb-body);text-decoration:none;text-transform:uppercase;letter-spacing:.06em;font-weight:600;font-size:.66rem}
.ud-nb-topbar__contact{display:flex;gap:1.4rem;margin-left:auto}
.ud-nb-topbar__contact a{display:inline-flex;align-items:center;gap:.5rem;color:var(--nb-navy);text-decoration:none;font-weight:600}
.ud-nb-topbar__social{display:flex;gap:.7rem}
.ud-nb-topbar__social a{color:var(--nb-navy);text-decoration:none}
.ud-nb-topbar__social a:hover,.ud-nb-topbar__links a:hover{color:var(--nb-green)}

/* navbar */
.ud-nb-nav{background:var(--ud-bg,var(--color-background,#fff));border-bottom:1px solid var(--nb-line);position:relative;z-index:60}
.ud-nb-nav--sticky.ud-nb-nav--sticky{position:sticky;top:0}
.ud-nb-nav__bar{display:flex;align-items:center;gap:1.6rem;min-height:74px}
.ud-nb-nav__links{display:flex;align-items:center;gap:.2rem;margin-left:auto}
.ud-nb-nav__link{display:inline-flex;align-items:center;gap:.25rem;padding:9px 13px;font-size:.85rem;font-weight:600;color:var(--nb-navy);text-decoration:none;border-radius:6px}
.ud-nb-nav__link:hover{color:var(--nb-green)}
.ud-nb-nav__end{display:flex;align-items:center;gap:.8rem}
.ud-nb-nav__toggle{display:none;background:none;border:0;color:inherit;cursor:pointer;padding:6px}

/* hero */
.ud-nb-hero{position:relative;isolation:isolate}
.ud-nb-hero::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--nb-band)}
.ud-nb-hero__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.95fr);gap:clamp(1.6rem,4cqi,3.4rem);align-items:center}
.ud-nb-hero__copy .ud-nb-btn{margin-top:1.8rem}
.ud-nb-hero__media{border-radius:8px;aspect-ratio:4 / 3}
.ud-nb-pagehero{position:relative;isolation:isolate}
.ud-nb-pagehero::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--nb-band)}

/* cards */
.ud-nb-cards{display:grid;gap:1.1rem;margin-top:2.4rem;grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-nb-cards[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-nb-cards[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-nb-card{padding:1.6rem;border:1px solid var(--nb-line);border-radius:var(--radius-card,8px);background:var(--color-background,#fff)}
.ud-nb-card__title{font-size:1rem;margin:1.1rem 0 .6rem}
.ud-nb-card__text{margin:0;font-size:.82rem;line-height:1.7;color:var(--nb-body)}

/* icon list */
.ud-nb-list__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.8rem 2.4rem;margin-top:2.4rem}
.ud-nb-list__grid[data-cols="1"]{grid-template-columns:1fr}
.ud-nb-listitem{display:flex;gap:1rem}
.ud-nb-listitem__title{font-size:.95rem;margin-bottom:.45rem}
.ud-nb-listitem__text{margin:0;font-size:.8rem;line-height:1.7;color:var(--nb-body)}

/* split */
.ud-nb-split__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(1.6rem,4cqi,3.4rem);align-items:center}
.ud-nb-split--reverse .ud-nb-split__media{order:2}
.ud-nb-split__media{border-radius:8px;aspect-ratio:4 / 3}
.ud-nb-pills{list-style:none;margin:1.4rem 0 0;padding:0;display:grid;gap:.6rem;justify-items:start}
.ud-nb-pills li{display:inline-flex;align-items:center;gap:.6rem;padding:9px 16px;border-radius:999px;background:var(--nb-soft);font-size:.8rem;color:var(--nb-navy)}
.ud-nb-pills svg{color:var(--nb-green);flex:none}
.ud-nb-split__copy .ud-nb-btn{margin-top:1.6rem}

/* stats */
.ud-nb-stats__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
.ud-nb-stat{padding:1.4rem 1.6rem;border-radius:8px;background:var(--nb-soft)}
.ud-nb-stat__label{margin:0 0 .5rem;font-size:.74rem;color:var(--nb-body)}
.ud-nb-stat__value{margin:0;font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-size:1.7rem;font-weight:700;color:var(--nb-navy)}

/* logo strip */
.ud-nb-logos{text-align:center}
.ud-nb-logos__title{margin:0;font-size:.76rem;font-weight:600;color:var(--nb-navy)}
.ud-nb-logos__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1.4rem 2.6rem;margin-top:1.4rem}
.ud-nb-logoword{font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-size:1rem;font-weight:700;color:var(--nb-navy)}
.ud-nb-logos__row img{max-height:26px;width:auto;object-fit:contain}

/* navy resources */
.ud-nb-navy{position:relative;isolation:isolate;color:#fff;--nb-ink:#fff;--nb-navy:#fff;--nb-body:rgba(255,255,255,.72);--nb-line:rgba(255,255,255,.16)}
.ud-nb-navy::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--color-secondary,#0e3c4d)}
.ud-nb-resources__grid{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(1.6rem,4cqi,3.4rem)}
.ud-nb-resources__items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.6rem}
.ud-nb-resource__title{font-size:.92rem;margin:.9rem 0 .45rem;color:#fff}
.ud-nb-resource__text{margin:0;font-size:.78rem;line-height:1.65;color:rgba(255,255,255,.72)}

/* testimonials */
.ud-nb-quotes__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.6rem;margin-top:2rem}
.ud-nb-quote{margin:0}
.ud-nb-quote__media{border-radius:8px;aspect-ratio:4 / 3}
.ud-nb-quote__logo{display:inline-block;margin:1.1rem 0 .5rem;font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-size:.72rem;font-weight:700;letter-spacing:.02em;color:var(--nb-navy)}
.ud-nb-quote__title{font-size:1.05rem;margin-bottom:.6rem}
.ud-nb-quote__text{margin:0 0 .9rem;font-size:.82rem;line-height:1.7;color:var(--nb-body)}
.ud-nb-quote figcaption{display:grid;gap:.1rem;font-size:.75rem}
.ud-nb-quote figcaption strong{color:var(--nb-navy)}
.ud-nb-quote figcaption span{color:var(--nb-body)}

/* personas */
.ud-nb-persona{padding:1.4rem;border:1px solid var(--nb-line);border-radius:8px;background:var(--color-background,#fff);text-align:center}
.ud-nb-persona__title{font-size:.92rem;text-align:left;margin-bottom:1.2rem}
.ud-nb-persona__avatar{display:block;width:130px;margin:0 auto 1.4rem;border-radius:999px;overflow:hidden}
.ud-nb-persona__avatar .ud-media-box{border-radius:999px}
.ud-nb-persona__quote{margin:0 0 .9rem;font-size:.82rem;line-height:1.7;color:var(--nb-body);text-align:left}
.ud-nb-persona__by{margin:0;display:grid;gap:.1rem;font-size:.74rem;text-align:left}
.ud-nb-persona__by strong{color:var(--nb-navy)}
.ud-nb-persona__by span{color:var(--nb-body)}

/* inline cta */
.ud-nb-inline{text-align:center}
.ud-nb-inline__foot{display:flex;justify-content:center;margin-top:1.6rem}

/* comparison */
.ud-nb-compare__panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin-top:2.2rem;border:1px solid var(--nb-line);border-radius:10px;overflow:hidden;background:var(--color-background,#fff)}
.ud-nb-compare__col{padding:1.8rem}
.ud-nb-compare__col--muted{background:var(--nb-soft);border-left:1px solid var(--nb-line)}
.ud-nb-compare__label{margin:0 0 1.2rem;font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-size:.95rem;font-weight:700;color:var(--nb-navy)}
.ud-nb-compare__col ul{list-style:none;margin:0;padding:0;display:grid;gap:.85rem}
.ud-nb-compare__col li{display:flex;gap:.75rem;align-items:flex-start;font-size:.8rem;line-height:1.55;color:var(--nb-body)}
.ud-nb-compare__col li svg{flex:none;margin-top:2px;color:var(--nb-green)}
.ud-nb-compare__col--muted li svg{color:#d9534f}

/* consultation */
.ud-nb-consult__panel{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(1.6rem,4cqi,3rem);padding:clamp(1.6rem,4cqi,3rem);border-radius:10px;background:var(--color-secondary,#0e3c4d);color:#fff}
.ud-nb-consult__details{list-style:none;margin:1.8rem 0 0;padding:0;display:grid;gap:1.3rem}
.ud-nb-consult__details li{display:flex;gap:.9rem}
.ud-nb-consult__icon{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:rgba(255,255,255,.1);color:var(--nb-green);flex:none}
.ud-nb-consult__label{margin:0 0 .25rem;font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-size:.85rem;font-weight:700;color:#fff}
.ud-nb-consult__text{margin:0;font-size:.78rem;line-height:1.6;color:rgba(255,255,255,.75);white-space:pre-line}
.ud-nb-consult__form{background:#fff;border-radius:8px;padding:1.4rem}
.ud-nb-consult__form .ud-form{display:grid;grid-template-columns:1fr 1fr;column-gap:.9rem}
.ud-nb-consult__form .ud-form>:not(.ud-field),.ud-nb-consult__form .ud-field:nth-last-of-type(-n+2){grid-column:1 / -1}
.ud-nb-consult__form .ud-field{display:grid;gap:5px;margin-bottom:.9rem;font-size:.74rem;color:var(--nb-body)}
.ud-nb-consult__form .ud-input{width:100%;border:1px solid var(--nb-line);border-radius:6px;padding:10px 12px;font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.82rem;color:var(--nb-navy);background:#fff}
.ud-nb-consult__form textarea.ud-input{min-height:96px;resize:vertical}
.ud-nb-consult__form .ud-btn{width:100%;border:0;border-radius:999px;background:var(--nb-green);color:#fff;padding:12px 20px;font-size:.85rem;font-weight:600;cursor:pointer}

/* navy cta band */
.ud-nb-ctaband__panel{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.6rem;padding:clamp(1.6rem,4cqi,2.8rem);border-radius:10px;background:var(--color-secondary,#0e3c4d);color:#fff}
.ud-nb-ctaband__text{margin:.7rem 0 0;font-size:.88rem;color:rgba(255,255,255,.78)}
.ud-nb-ctaband__end{display:flex;align-items:center;gap:1.6rem}
.ud-nb-ctaband__phone{display:inline-flex;align-items:center;gap:.4rem;color:#fff;text-decoration:none;font-size:.85rem;font-weight:600}

/* posts */
.ud-nb-posts__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2rem 1.8rem;margin-top:2.2rem}
.ud-nb-posts__grid[data-cols="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-nb-post{text-decoration:none;color:inherit;display:block}
.ud-nb-post__media{border-radius:6px;aspect-ratio:16 / 10}
.ud-nb-post__title{font-size:1.05rem;text-align:center;margin:1rem 0 .8rem}
.ud-nb-post__meta{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem}
.ud-nb-post__meta span{padding:4px 10px;border:1px solid var(--nb-line);border-radius:4px;font-size:.66rem;color:var(--nb-body)}

/* newsletter */
.ud-nb-news__panel{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:1.6rem;align-items:center;padding:clamp(1.4rem,3cqi,2.2rem);border-radius:10px;background:var(--color-background,#fff);box-shadow:0 20px 44px -30px rgba(14,60,77,.4);border:1px solid var(--nb-line)}
.ud-nb-news__text{margin:.5rem 0 0;font-size:.82rem;color:var(--nb-body)}
.ud-nb-news__form .ud-form{display:grid;gap:.7rem}
.ud-nb-news__form .ud-field{display:grid;gap:4px}
.ud-nb-news__form .ud-input{width:100%;border:1px solid var(--nb-line);border-radius:6px;padding:12px 14px;font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:.85rem}
.ud-nb-news__form .ud-btn{width:100%;border:0;border-radius:6px;background:var(--nb-green);color:#fff;padding:12px 20px;font-size:.85rem;font-weight:600;cursor:pointer}

/* team */
.ud-nb-team__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.6rem;margin-top:2.2rem}
.ud-nb-team__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-nb-team__grid[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-nb-member__media{border-radius:8px;aspect-ratio:1 / 1;margin-bottom:1rem}
.ud-nb-member__name{font-size:.95rem;margin:.9rem 0 .2rem}
.ud-nb-member__role{margin:0 0 .85rem;font-size:.76rem;color:var(--nb-body)}
.ud-nb-member__social{display:flex;gap:.75rem;color:var(--nb-navy);opacity:.75}

/* values */
.ud-nb-values__grid{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(1.6rem,4cqi,3rem);align-items:center}
.ud-nb-values__cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.ud-nb-value{padding:1.3rem;border:1px solid var(--nb-line);border-radius:8px;background:var(--color-background,#fff);text-align:center;display:grid;justify-items:center}
.ud-nb-value__title{font-size:.9rem;margin:.8rem 0 .35rem}
.ud-nb-value__text{margin:0;font-size:.75rem;line-height:1.6;color:var(--nb-body)}

/* offices */
.ud-nb-office{padding:0;border:1px solid var(--nb-line);border-radius:8px;overflow:hidden;background:var(--color-background,#fff)}
.ud-nb-office__map{aspect-ratio:4 / 3}
.ud-nb-office__map .ud-media-box{border-radius:0}
.ud-nb-office__city{font-size:.95rem;margin:1.1rem 1.2rem .45rem}
.ud-nb-office__address{margin:0 1.2rem 1rem;font-size:.78rem;line-height:1.6;color:var(--nb-body);white-space:pre-line}
.ud-nb-office .ud-nb-link{margin:0 1.2rem 1.2rem}

/* image band */
.ud-nb-band{position:relative;isolation:isolate}
.ud-nb-band::before{content:"";position:absolute;left:0;right:0;top:0;height:55%;z-index:-1;background:var(--nb-band)}
.ud-nb-band__grid{display:grid;grid-template-columns:.7fr 1.6fr .7fr;gap:1rem;align-items:center}
.ud-nb-band__grid .ud-media-box{border-radius:6px}
.ud-nb-band__caption{margin:1.1rem 0 0;text-align:center;font-size:.74rem;color:var(--nb-body)}

/* long copy */
.ud-nb-rich__body{max-width:44rem;margin:1.2rem 0 0;font-size:.86rem;line-height:1.85;color:var(--nb-body);white-space:pre-line}

/* footer */
.ud-nb-footer{background:var(--ud-bg,var(--color-background,#fff));padding-block:clamp(2.4rem,5cqi,3.6rem);font-family:var(--font-body,Inter,system-ui,sans-serif)}
.ud-nb-footer__grid{display:grid;grid-template-columns:minmax(0,1.3fr) repeat(2,minmax(0,.7fr)) minmax(0,1.1fr);gap:1.8rem}
.ud-nb-footer__text{margin:1rem 0 0;font-size:.78rem;line-height:1.7;color:var(--nb-body);white-space:pre-line}
.ud-nb-footer__col{display:grid;align-content:start;gap:.6rem}
.ud-nb-footer__col-title{margin:0 0 .3rem;font-family:var(--font-heading,"Plus Jakarta Sans",system-ui,sans-serif);font-size:.88rem;font-weight:700;color:var(--nb-navy)}
.ud-nb-footer__link{font-size:.8rem;color:var(--nb-navy);text-decoration:none}
.ud-nb-footer__link:hover{color:var(--nb-green)}
.ud-nb-footer__pill{display:inline-flex;align-items:center;gap:.45rem;padding:10px 16px;border-radius:8px;background:var(--nb-soft);font-size:.8rem;color:var(--nb-navy);text-decoration:none}
.ud-nb-footer__base{display:flex;flex-wrap:wrap;align-items:center;gap:1rem;margin-top:2.4rem;padding-top:1.2rem;border-top:1px solid var(--nb-line);font-size:.74rem;color:var(--nb-body)}
.ud-nb-footer__social{display:flex;gap:.9rem;margin-inline:auto}
.ud-nb-footer__social a{color:var(--nb-navy);text-decoration:none}
.ud-nb-footer__top{color:var(--nb-body);text-decoration:none}

@container udpage (max-width:1024px){
  .ud-nb-cards,.ud-nb-cards[data-cols="4"],.ud-nb-team__grid,.ud-nb-team__grid[data-cols="4"],.ud-nb-posts__grid[data-cols="3"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-nb-footer__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-nb-nav__links{display:none}
  .ud-nb-nav__toggle{display:inline-flex}
  .ud-nb-nav__links.is-open{display:flex;position:absolute;top:74px;left:12px;right:12px;flex-direction:column;align-items:stretch;padding:10px;border-radius:10px;background:var(--color-background,#fff);border:1px solid var(--nb-line);z-index:70}
}
@container udpage (max-width:860px){
  .ud-nb-hero__grid,.ud-nb-split__grid,.ud-nb-resources__grid,.ud-nb-values__grid,.ud-nb-consult__panel,.ud-nb-news__panel,.ud-nb-quotes__grid,.ud-nb-list__grid,.ud-nb-band__grid{grid-template-columns:1fr}
  .ud-nb-split--reverse .ud-nb-split__media{order:0}
  .ud-nb-resources__items{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-nb-consult__form .ud-form{grid-template-columns:1fr}
  .ud-nb-stats__grid{grid-template-columns:1fr}
  .ud-nb-band::before{height:40%}
}
@container udpage (max-width:600px){
  .ud-nb-cards,.ud-nb-cards[data-cols="2"],.ud-nb-cards[data-cols="4"],.ud-nb-team__grid,.ud-nb-posts__grid,.ud-nb-posts__grid[data-cols="3"],.ud-nb-compare__panel,.ud-nb-values__cards,.ud-nb-resources__items,.ud-nb-footer__grid{grid-template-columns:1fr}
  .ud-nb-compare__col--muted{border-left:0;border-top:1px solid var(--nb-line)}
  .ud-nb-topbar__contact{margin-left:0}
  .ud-nb-ctaband__panel{flex-direction:column;align-items:flex-start}
  .ud-nb-footer__social{margin-inline:0}
}

/* ==================================================================== voltera
   Electric indigo panels, a chartreuse lime accent, near-black geometric
   headlines and generously rounded hairline cards.
   Heading resets use :where() so a single-class rule can still override them.
*/
.ud-vt{--vt-blue:#2a18f2;--vt-blue-deep:#1b0fbe;--vt-lime:#c8f60c;--vt-ink:#0b0b12;--vt-muted:#5b5b6b;--vt-surface:#f4f5f9;--vt-line:#e7e8f0;--vt-r:18px;color:var(--vt-ink);font-family:var(--font-body,inherit)}
.ud-vt :where(h1,h2,h3,h4){margin:0;font-family:var(--font-heading,inherit);letter-spacing:-.02em}
.ud-vt :where(p){margin:0}
.ud-vt :where(ul){margin:0;padding:0;list-style:none}
.ud-vt :where(a){color:inherit;text-decoration:none}

.ud-vt-badge{display:inline-block;padding:5px 13px;border-radius:999px;background:var(--vt-lime);color:var(--vt-ink);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.ud-vt-badge--light{background:var(--vt-lime);color:var(--vt-ink)}
.ud-vt-chip{display:inline-block;padding:5px 12px;border-radius:999px;background:#fff;color:var(--vt-ink);font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 1px 3px rgba(11,11,18,.1)}

.ud-vt-title{font-size:clamp(30px,4.4cqi,52px);line-height:1.1;font-weight:var(--heading-weight,700)}
.ud-vt-title--xl{font-size:clamp(34px,5.6cqi,62px)}
.ud-vt-lead{max-width:62ch;color:var(--vt-muted);font-size:15px;line-height:1.65}
.ud-vt-head{display:grid;gap:14px;justify-items:start}
.ud-vt-head--center{justify-items:center;text-align:center}
.ud-vt-head--center .ud-vt-lead{margin-inline:auto}
.ud-vt-head--light{color:#fff}
.ud-vt-head--light .ud-vt-lead{color:rgba(255,255,255,.82)}

.ud-vt-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;font-size:13.5px;font-weight:600;line-height:1;transition:transform .16s ease,box-shadow .16s ease,background .16s ease}
.ud-vt-btn:hover{transform:translateY(-1px)}
.ud-vt-btn__arrow{display:inline-flex}
.ud-vt-btn--lime{background:var(--vt-lime);color:var(--vt-ink)}
.ud-vt-btn--lime:hover{box-shadow:0 10px 24px -12px rgba(200,246,12,.9)}
.ud-vt-btn--blue{background:var(--vt-blue);color:#fff}
.ud-vt-btn--outline{background:transparent;color:var(--vt-blue);border:1px solid var(--vt-blue)}
.ud-vt-btn--outline:hover{background:rgba(42,24,242,.06)}
.ud-vt-btn--light{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55)}
.ud-vt-btn--light:hover{background:rgba(255,255,255,.12)}
.ud-vt-buttons{display:flex;flex-wrap:wrap;gap:10px}
.ud-vt-buttons--center{justify-content:center}

.ud-vt-textlink{display:inline-flex;align-items:center;gap:6px;color:var(--vt-blue);font-size:13px;font-weight:600}
.ud-vt-round{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:999px;background:var(--vt-lime);color:var(--vt-ink);flex:none}
.ud-vt-round--lime{background:var(--vt-lime)}

.ud-vt-logo{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:17px}
.ud-vt-logo__mark{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:var(--vt-blue);color:var(--vt-lime);flex:none}
.ud-vt-logo--light{color:#fff}
.ud-vt-logo--light .ud-vt-logo__mark{background:var(--vt-lime);color:var(--vt-blue)}
.ud-vt-logo__img{position:relative;display:inline-flex}

.ud-vt-ticks{display:grid;gap:9px}
.ud-vt-ticks li{display:flex;align-items:flex-start;gap:9px;font-size:13.5px;line-height:1.5}
.ud-vt-tick{display:grid;place-items:center;width:17px;height:17px;border-radius:999px;background:var(--vt-blue);color:#fff;flex:none;margin-top:1px}
.ud-vt-ticks--dots .ud-vt-tick{width:19px;height:19px}

/* The lime corner arrow that marks every blue panel.
   A band's .ud-container is deliberately static so the arrow anchors to the
   band itself; left relative it would sit on the text column and cover the
   content. z-index:0 keeps it behind the cards for the same reason. */
.ud-vt-corner{position:absolute;width:150px;height:150px;color:var(--vt-lime);pointer-events:none;z-index:0}
.ud-vt-corner--sm{width:52px;height:52px;z-index:1}
.ud-vt-corner--lg{width:210px;height:210px}
.ud-vt-corner--tr{top:0;right:0}
.ud-vt-corner--tl{top:0;left:0;transform:rotate(-90deg)}
.ud-vt-corner--bl{bottom:0;left:0;transform:rotate(180deg)}
.ud-vt-corner--br{bottom:0;right:0;transform:rotate(90deg)}
.ud-vt-band>.ud-container{position:static}
.ud-vt-band>.ud-container>*:not(.ud-vt-corner){position:relative;z-index:1}
.ud-vt-band .ud-vt-corner--bl{bottom:-30px;left:-24px}
.ud-vt-band .ud-vt-corner--tr{top:-30px;right:-24px}

/* blue full-bleed band shared by services, stat strip, quotes and cards */
.ud-vt-band{position:relative;overflow:hidden;background:var(--vt-blue);color:#fff}
.ud-vt-band .ud-vt-title{color:#fff}

/* ---- hero */
.ud-vt-hero__grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.ud-vt-hero__copy{display:grid;gap:18px;justify-items:start}
.ud-vt-hero__stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;width:100%;margin-top:12px}
.ud-vt-stat__value{font-size:clamp(20px,2.6cqi,30px);font-weight:700;letter-spacing:-.02em}
.ud-vt-stat__label{margin-top:2px;font-size:12.5px;color:var(--vt-muted)}
.ud-vt-stat--light .ud-vt-stat__value{color:var(--vt-lime)}
.ud-vt-stat--light .ud-vt-stat__label{color:rgba(255,255,255,.85)}
.ud-vt-hero__media{position:relative}
.ud-vt-hero__panel{position:relative;overflow:hidden;border-radius:var(--vt-r);background:var(--vt-blue);padding:0}
.ud-vt-hero__img img{border-radius:var(--vt-r)}
.ud-vt-hero__float{position:absolute;right:-14px;bottom:24px;display:grid;gap:9px;padding:14px;border-radius:14px;background:#fff;box-shadow:0 20px 44px -24px rgba(11,11,18,.45);z-index:2}
.ud-vt-hero__floatrow{display:flex;align-items:center;gap:9px;font-size:12.5px;font-weight:600}
.ud-vt-hero__floaticon{display:grid;place-items:center;width:20px;height:20px;border-radius:999px;background:rgba(42,24,242,.1);color:var(--vt-blue);flex:none}

/* ---- page header */
.ud-vt-pagehero__stats{display:flex;flex-wrap:wrap;justify-content:center;gap:44px;margin-top:34px;text-align:center}
.ud-vt-pagehero__img{margin-top:38px}
.ud-vt-pagehero__img img{border-radius:var(--vt-r)}
.ud-vt-pagehero .ud-vt-buttons{justify-content:center;margin-top:22px}

/* ---- service accordion */
.ud-vt-accordion{display:grid;gap:12px;margin-top:40px;text-align:left}
.ud-vt-accordion__row{border-radius:999px;background:#fff;color:var(--vt-ink);overflow:hidden;transition:border-radius .18s ease}
.ud-vt-accordion__row.is-open{border-radius:22px}
.ud-vt-accordion__head{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:16px 16px 16px 26px;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:left}
.ud-vt-accordion__title{font-size:15.5px;font-weight:600}
.ud-vt-accordion__icon{display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:var(--vt-lime);color:var(--vt-ink);flex:none;transition:transform .18s ease}
.ud-vt-accordion__row.is-open .ud-vt-accordion__icon{transform:rotate(90deg)}
.ud-vt-accordion__body{display:grid;gap:10px;padding:0 26px 20px;color:var(--vt-muted);font-size:14px;line-height:1.65}

/* ---- numbered service cards */
.ud-vt-svccards__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,2),minmax(0,1fr));gap:22px}
.ud-vt-svccards__grid[data-cols="1"]{grid-template-columns:1fr}
.ud-vt-svccards__grid[data-cols="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-vt-svccard{display:grid;gap:14px;justify-items:start;padding:28px;border-radius:var(--vt-r);background:#fff;color:var(--vt-ink)}
.ud-vt-svccard__num{font-size:12px;font-weight:700;color:var(--vt-muted)}
.ud-vt-svccard__title{font-size:20px;font-weight:700}
.ud-vt-svccard__text{color:var(--vt-muted);font-size:13.5px;line-height:1.65}
.ud-vt-ticks--blue .ud-vt-tick{background:var(--vt-blue)}

/* ---- process */
.ud-vt-process__top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:22px;margin-bottom:38px}
.ud-vt-process__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.ud-vt-step{display:grid;gap:8px;padding:16px;border:1px solid var(--vt-line);border-radius:var(--vt-r);background:#fff}
.ud-vt-step__frame{overflow:hidden;border-radius:12px;background:var(--vt-surface);margin-bottom:12px}
.ud-vt-step__mock{display:grid;gap:9px;padding:24px;min-height:150px;align-content:center}
.ud-vt-step__bar{display:block;height:10px;border-radius:999px;background:#dcdee9;width:70%}
.ud-vt-step__bar--wide{width:100%}
.ud-vt-step__chip{display:block;height:26px;width:52px;border-radius:8px;background:var(--vt-lime)}
.ud-vt-step__label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--vt-muted)}
.ud-vt-step__title{font-size:17px;font-weight:700}
.ud-vt-step__text{color:var(--vt-muted);font-size:13px;line-height:1.6}

/* ---- image stats band */
.ud-vt-statsband__frame{position:relative;overflow:hidden;border-radius:var(--vt-r)}
.ud-vt-statsband__frame img{border-radius:var(--vt-r)}
.ud-vt-statsband__card{position:absolute;right:26px;top:50%;transform:translateY(-50%);display:grid;gap:14px;padding:20px 24px;border-radius:14px;background:#fff;box-shadow:0 24px 50px -28px rgba(11,11,18,.5)}
.ud-vt-statsband__brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px}
.ud-vt-statsband__stats{display:flex;gap:26px}
.ud-vt-statsband .ud-vt-buttons{margin-top:24px}

/* ---- stat strip */
.ud-vt-strip__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px;text-align:center}

/* ---- split + why */
.ud-vt-split__grid,.ud-vt-why__grid{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center}
.ud-vt-split__copy,.ud-vt-why__copy{display:grid;gap:20px;justify-items:start}
.ud-vt-split--reverse .ud-vt-split__media,.ud-vt-why--reverse .ud-vt-why__media{order:-1}
.ud-vt-split__media img,.ud-vt-why__media img{border-radius:var(--vt-r)}
.ud-vt-why__list{display:grid;gap:16px}
.ud-vt-why__list li{display:flex;align-items:flex-start;gap:11px}
.ud-vt-why__mark{display:grid;place-items:center;width:19px;height:19px;border-radius:999px;background:var(--vt-blue);color:#fff;flex:none;margin-top:2px}
.ud-vt-why__title{font-size:14.5px;font-weight:700}
.ud-vt-why__text{margin-top:3px;color:var(--vt-muted);font-size:13px;line-height:1.6}

/* ---- values */
.ud-vt-values__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,3),minmax(0,1fr));gap:22px;margin-top:40px;text-align:center}
.ud-vt-values__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-vt-values__grid[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-vt-value{display:grid;gap:10px}
.ud-vt-value__frame{position:relative;overflow:hidden;border-radius:var(--vt-r);margin-bottom:6px}
.ud-vt-value__frame img{border-radius:var(--vt-r)}
.ud-vt-value__title{font-size:17px;font-weight:700}
.ud-vt-value__text{color:var(--vt-muted);font-size:13px;line-height:1.6}

/* ---- team */
.ud-vt-team__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,3),minmax(0,1fr));gap:22px;margin-top:40px;text-align:center}
.ud-vt-team__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-vt-team__grid[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-vt-person__img{margin-bottom:12px}
.ud-vt-person__img img{border-radius:var(--vt-r)}
.ud-vt-person__name{font-size:16px;font-weight:700}
.ud-vt-person__role{margin-top:2px;color:var(--vt-muted);font-size:12.5px}

/* ---- featured case */
.ud-vt-featured__panel{display:grid;grid-template-columns:.9fr 1.1fr;gap:0;padding:16px;border-radius:24px;background:var(--vt-surface)}
.ud-vt-featured__logo{position:relative;display:grid;place-items:center;min-height:290px;border-radius:14px;padding:22px}
.ud-vt-featured__logo .ud-vt-chip{position:absolute;top:18px;left:18px}
.ud-vt-featured__wordmark{font-size:34px;font-weight:800;letter-spacing:-.03em}
.ud-vt-featured__mark{width:60%}
.ud-vt-featured__body{display:grid;gap:14px;justify-items:start;align-content:center;padding:26px 30px}
.ud-vt-featured__title{font-size:clamp(20px,2.6cqi,28px);font-weight:700;line-height:1.2}
.ud-vt-featured__text{color:var(--vt-muted);font-size:13.5px;line-height:1.65}
.ud-vt-featured__metrics{display:grid;gap:10px;width:100%;padding:16px 18px;border:1px solid var(--vt-line);border-radius:14px;background:#fff}
.ud-vt-featured__metrics li{display:flex;align-items:center;gap:9px;font-size:13px}
.ud-vt-featured__metrics strong{font-weight:700}
.ud-vt-featured__arrow{display:grid;place-items:center;color:#2fb98a;flex:none}

/* ---- case study grid */
.ud-vt-cases__top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:22px;margin-bottom:34px}
.ud-vt-cases__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,2),minmax(0,1fr));gap:22px}
.ud-vt-cases__grid[data-cols="1"]{grid-template-columns:1fr}
.ud-vt-cases__grid[data-cols="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-vt-case{display:flex;flex-direction:column;padding:14px;border:1px solid var(--vt-line);border-radius:var(--vt-r);background:#fff}
.ud-vt-case__panel{position:relative;display:grid;place-items:center;min-height:230px;border-radius:12px;padding:20px}
.ud-vt-case__panel .ud-vt-chip{position:absolute;top:14px;left:14px}
.ud-vt-case__wordmark{font-size:28px;font-weight:800;letter-spacing:-.03em}
.ud-vt-case__panel--dark .ud-vt-case__wordmark{color:#fff}
.ud-vt-case__mark{width:55%}
.ud-vt-case__body{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;padding:16px 8px 6px}
.ud-vt-case__title{font-size:16px;font-weight:700;line-height:1.3}
.ud-vt-case__text{margin-top:6px;color:var(--vt-muted);font-size:12.5px;line-height:1.55}

/* ---- testimonials */
.ud-vt-quote{display:grid;grid-template-columns:.8fr 1.2fr;gap:0;margin-top:40px;padding:16px;border-radius:20px;background:#dcd8fb;color:var(--vt-ink);text-align:left}
.ud-vt-quote__img img{border-radius:14px}
.ud-vt-quote__body{display:grid;gap:10px;align-content:center;padding:24px 28px}
.ud-vt-quote__top{display:flex;align-items:center;justify-content:space-between;gap:16px}
.ud-vt-quote__company{font-weight:700;font-size:14px}
.ud-vt-quote__nav{display:flex;gap:8px}
.ud-vt-quote__nav button{display:grid;place-items:center;width:30px;height:30px;border-radius:999px;border:1px solid rgba(11,11,18,.18);background:transparent;color:inherit;cursor:pointer}
.ud-vt-quote__nav button:first-child{transform:rotate(180deg)}
.ud-vt-quote__text{font-size:15px;font-style:italic;line-height:1.65}
.ud-vt-quote__name{font-weight:700;font-size:13px}
.ud-vt-quote__role{color:var(--vt-muted);font-size:12.5px}

/* ---- pricing */
.ud-vt-pricing__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,3),minmax(0,1fr));gap:20px;margin-top:44px;align-items:start;text-align:left}
.ud-vt-pricing__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-vt-pricing__grid[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-vt-plan{position:relative;display:grid;gap:14px;padding:26px;border:1px solid var(--vt-line);border-radius:var(--vt-r);background:var(--vt-surface)}
.ud-vt-plan--featured{background:var(--vt-blue);border-color:var(--vt-blue);color:#fff;transform:translateY(-14px);padding-bottom:40px}
.ud-vt-plan--featured .ud-vt-plan__text,.ud-vt-plan--featured .ud-vt-plan__period{color:rgba(255,255,255,.82)}
.ud-vt-plan--featured .ud-vt-tick{background:var(--vt-lime);color:var(--vt-ink)}
.ud-vt-plan__badge{position:absolute;top:16px;right:16px;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:var(--vt-lime);color:var(--vt-ink);font-size:11px;font-weight:700}
.ud-vt-plan__name{font-size:16px;font-weight:700}
.ud-vt-plan__price{display:flex;align-items:baseline;gap:2px;font-size:clamp(28px,3.6cqi,40px);font-weight:700;letter-spacing:-.03em}
.ud-vt-plan__period{font-size:14px;font-weight:500;color:var(--vt-muted)}
.ud-vt-plan__text{color:var(--vt-muted);font-size:13px;line-height:1.6;padding-bottom:14px;border-bottom:1px solid var(--vt-line)}
.ud-vt-plan--featured .ud-vt-plan__text{border-color:rgba(255,255,255,.24)}
.ud-vt-plan .ud-vt-btn{justify-content:center;margin-top:6px}

/* ---- inline callout */
.ud-vt-callout__panel{display:flex;flex-wrap:wrap;align-items:center;gap:18px;padding:22px 24px;border-radius:var(--vt-r);background:var(--vt-surface)}
.ud-vt-callout__icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#fff;color:var(--vt-blue);flex:none}
.ud-vt-callout__copy{flex:1 1 320px}
.ud-vt-callout__title{font-size:19px;font-weight:700}
.ud-vt-callout__text{margin-top:4px;color:var(--vt-muted);font-size:13px;line-height:1.6}

/* ---- faq */
.ud-vt-faq__list{display:grid;gap:14px;margin-top:44px;text-align:left}
.ud-vt-faq__row{border:1px solid var(--vt-line);border-radius:var(--vt-r);background:#fff}
.ud-vt-faq__head{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:20px 18px 20px 22px;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:left}
.ud-vt-faq__q{font-size:15px;font-weight:500}
.ud-vt-faq__row.is-open .ud-vt-round{transform:rotate(90deg)}
.ud-vt-faq__a{padding:0 22px 20px;color:var(--vt-muted);font-size:13.5px;line-height:1.65}
.ud-vt-faq__foot{display:grid;gap:8px;justify-items:center;margin-top:34px;text-align:center}
.ud-vt-faq__foot h3{font-size:16px;font-weight:700}
.ud-vt-faq__foot p{color:var(--vt-muted);font-size:13.5px}

/* ---- posts */
.ud-vt-posts__top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:22px;margin-bottom:32px}
.ud-vt-filters{display:flex;flex-wrap:wrap;gap:6px}
.ud-vt-filter{padding:9px 16px;border-radius:999px;font-size:13px;font-weight:500;color:var(--vt-ink)}
.ud-vt-filter.is-active{background:var(--vt-blue);color:#fff}
.ud-vt-posts__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,3),minmax(0,1fr));gap:26px}
.ud-vt-posts__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-vt-posts__grid[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-vt-post{display:grid;gap:8px;align-content:start}
.ud-vt-post__img{margin-bottom:6px}
.ud-vt-post__img img{border-radius:12px}
.ud-vt-post__meta{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--vt-muted)}
.ud-vt-post__dot{width:4px;height:4px;border-radius:999px;background:var(--vt-lime)}
.ud-vt-post__date{display:inline-flex;align-items:center;gap:5px}
.ud-vt-post__title{font-size:17px;font-weight:700;line-height:1.3}
.ud-vt-post__text{color:var(--vt-muted);font-size:13px;line-height:1.6}

/* ---- article body */
.ud-vt-rich__body{color:var(--vt-ink);font-size:14.5px;line-height:1.75}
.ud-vt-rich__body h2{margin:30px 0 12px;font-size:24px;font-weight:700}
.ud-vt-rich__body h3{margin:24px 0 10px;font-size:18px;font-weight:700}
.ud-vt-rich__body p{margin:0 0 14px;color:var(--vt-muted)}
.ud-vt-rich__body blockquote{margin:20px 0;padding:6px 0 6px 18px;border-left:3px solid var(--vt-blue);font-style:italic;color:var(--vt-ink)}
.ud-vt-rich__body img{max-width:100%;border-radius:12px}

/* ---- cta band */
.ud-vt-cta__panel{position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:26px;overflow:hidden;padding:48px 44px;border-radius:22px;background:var(--vt-blue);color:#fff}
.ud-vt-cta__copy{display:grid;gap:14px;justify-items:start;max-width:34ch}
.ud-vt-cta__title{font-size:clamp(24px,3.4cqi,38px);line-height:1.15;color:#fff}
.ud-vt-cta__text{font-size:13.5px;line-height:1.65;color:rgba(255,255,255,.85)}

/* ---- contact */
.ud-vt-contact__grid{display:grid;grid-template-columns:1fr 1.15fr;gap:56px;align-items:start}
.ud-vt-contact__copy{display:grid;gap:26px;justify-items:start}
.ud-vt-contact__details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;width:100%}
.ud-vt-contact__details h3{font-size:13.5px;font-weight:700}
.ud-vt-contact__details p{margin-top:5px;color:var(--vt-muted);font-size:13.5px}
.ud-vt-contact__social h3{font-size:13.5px;font-weight:700;margin-bottom:10px}
.ud-vt-contact__icons{display:flex;gap:9px}
.ud-vt-contact__icons a{display:grid;place-items:center;width:34px;height:34px;border-radius:999px;border:1px solid var(--vt-line);color:var(--vt-blue)}
.ud-vt-contact__form .ud-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.ud-vt-contact__form .ud-form>*:first-child,.ud-vt-contact__form .ud-form>*:last-child,.ud-vt-contact__form .ud-form>*:nth-last-child(2){grid-column:1/-1}

/* ---- map */
.ud-vt-map__frame{position:relative;margin-top:40px}
.ud-vt-map__dots{width:100%;height:auto;display:block;fill:#d3d6e4}
.ud-vt-map__pin{position:absolute;width:11px;height:11px;margin:-5px 0 0 -5px;border-radius:999px;background:var(--vt-blue);box-shadow:0 0 0 4px rgba(42,24,242,.16)}
.ud-vt-map__label{position:absolute;left:50%;top:-26px;transform:translateX(-50%);padding:3px 8px;border-radius:6px;background:#fff;color:var(--vt-ink);font-size:10.5px;white-space:nowrap;opacity:0;transition:opacity .14s ease;box-shadow:0 4px 12px -6px rgba(11,11,18,.5)}
.ud-vt-map__pin:hover .ud-vt-map__label{opacity:1}

/* ---- logos */
.ud-vt-logos__title{color:var(--vt-muted);font-size:13.5px}
.ud-vt-logos__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:38px;margin-top:24px}
.ud-vt-logos__word{font-size:19px;font-weight:700;color:#9aa0b4;letter-spacing:-.02em}
.ud-vt-logos__img{width:110px}

/* ---- navbar */
.ud-vt-nav{position:relative;z-index:60;background:var(--color-background,#fff)}
.ud-vt-nav--sticky.ud-vt-nav--sticky{position:sticky;top:0}
.ud-vt-nav__bar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-block:16px}
.ud-vt-nav__links{display:flex;align-items:center;gap:22px}
.ud-vt-nav__link{display:inline-flex;align-items:center;gap:4px;font-size:13.5px;font-weight:500;color:var(--vt-ink)}
.ud-vt-nav__link:hover{color:var(--vt-blue)}
.ud-vt-nav__end{display:flex;align-items:center;gap:10px}
.ud-vt-nav__toggle{display:none;border:0;background:transparent;color:inherit;cursor:pointer}

/* ---- footer */
.ud-vt-footer{position:relative;overflow:hidden;padding-block:64px 26px;background:var(--vt-blue);color:#fff}
.ud-vt-footer__grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:34px}
.ud-vt-footer__tagline{margin-top:14px;font-size:13.5px;font-weight:700}
.ud-vt-footer__title{margin-bottom:14px;font-size:14px;font-weight:700}
.ud-vt-footer__col ul{display:grid;gap:10px}
.ud-vt-footer__col a{font-size:13px;color:rgba(255,255,255,.86)}
.ud-vt-footer__col a:hover{color:var(--vt-lime)}
.ud-vt-footer__bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;margin-top:44px;padding-top:20px;border-top:1px solid rgba(255,255,255,.22);font-size:12px;color:rgba(255,255,255,.8)}
.ud-vt-footer__social{display:flex;gap:12px}
.ud-vt-footer__social a{color:#fff}
.ud-vt-footer__social a:hover{color:var(--vt-lime)}

@container udpage (max-width:900px){
  .ud-vt-hero__grid,.ud-vt-split__grid,.ud-vt-why__grid,.ud-vt-contact__grid,.ud-vt-featured__panel,.ud-vt-quote{grid-template-columns:1fr}
  .ud-vt-split--reverse .ud-vt-split__media,.ud-vt-why--reverse .ud-vt-why__media{order:0}
  .ud-vt-process__grid,.ud-vt-values__grid,.ud-vt-values__grid[data-cols="4"],.ud-vt-team__grid,.ud-vt-team__grid[data-cols="4"],.ud-vt-posts__grid,.ud-vt-posts__grid[data-cols="4"],.ud-vt-pricing__grid,.ud-vt-pricing__grid[data-cols="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-vt-svccards__grid,.ud-vt-svccards__grid[data-cols="3"],.ud-vt-cases__grid,.ud-vt-cases__grid[data-cols="3"]{grid-template-columns:1fr}
  .ud-vt-plan--featured{transform:none;padding-bottom:26px}
  .ud-vt-footer__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-vt-nav__links{display:none}
  .ud-vt-nav__links.is-open{display:flex;position:absolute;top:70px;left:12px;right:12px;flex-direction:column;align-items:stretch;padding:12px;border-radius:14px;background:var(--color-background,#fff);border:1px solid var(--vt-line);z-index:70}
  .ud-vt-nav__toggle{display:inline-grid;place-items:center}
  .ud-vt-hero__float{position:static;margin-top:14px}
  .ud-vt-statsband__card{position:static;transform:none;margin-top:-40px;margin-inline:16px}
}
@container udpage (max-width:600px){
  .ud-vt-process__grid,.ud-vt-values__grid,.ud-vt-values__grid[data-cols="2"],.ud-vt-values__grid[data-cols="4"],.ud-vt-team__grid,.ud-vt-team__grid[data-cols="2"],.ud-vt-team__grid[data-cols="4"],.ud-vt-posts__grid,.ud-vt-posts__grid[data-cols="2"],.ud-vt-posts__grid[data-cols="4"],.ud-vt-pricing__grid,.ud-vt-pricing__grid[data-cols="2"],.ud-vt-pricing__grid[data-cols="4"],.ud-vt-strip__grid,.ud-vt-hero__stats,.ud-vt-contact__details,.ud-vt-footer__grid{grid-template-columns:1fr}
  .ud-vt-contact__form .ud-form{grid-template-columns:1fr}
  .ud-vt-statsband__stats{flex-direction:column;gap:12px}
  .ud-vt-cta__panel{padding:32px 24px}
  .ud-vt-corner{width:92px;height:92px}
  .ud-vt-corner--lg{width:120px;height:120px}
  .ud-vt-band .ud-vt-corner--bl{bottom:-18px;left:-14px}
  .ud-vt-band .ud-vt-corner--tr{top:-18px;right:-14px}
}


/* ==================================================================== halcyon
   Near-white pages lit by soft pastel blooms, two-tone headlines that fade
   from ink to grey, hairline cards, a small dark pill button beside a sky-blue
   accent, and a near-black footer.
   Heading resets use :where() so a single-class rule can still override them.
*/
.ud-hc{--hc-ink:#1e2634;--hc-body:#525c70;--hc-muted:#8b93a4;--hc-blue:#1d9bf0;--hc-dark:#1b2434;--hc-line:#e8ebf1;--hc-soft:#f6f8fb;--hc-r:10px;color:var(--hc-body);font-family:var(--font-body,inherit);font-size:14px;line-height:1.65}
.ud-hc :where(h1,h2,h3,h4){margin:0;font-family:var(--font-heading,inherit);color:var(--hc-ink);letter-spacing:-.018em;font-weight:var(--heading-weight,500)}
.ud-hc :where(p){margin:0}
.ud-hc :where(ul){margin:0;padding:0;list-style:none}
.ud-hc :where(a){color:inherit;text-decoration:none}

/* pastel bloom backdrop */
.ud-hc-bloom{position:relative;isolation:isolate}
.ud-hc-bloom::before{content:"";position:absolute;inset:-8% -4%;z-index:-1;pointer-events:none;background:radial-gradient(38% 44% at 14% 22%,rgba(253,214,231,.72),transparent 70%),radial-gradient(34% 40% at 84% 18%,rgba(214,225,253,.7),transparent 70%),radial-gradient(42% 38% at 50% 92%,rgba(226,240,255,.72),transparent 72%)}

.ud-hc-title{font-size:clamp(24px,3.1cqi,34px);line-height:1.24;display:grid;gap:2px}
.ud-hc-title--xl{font-size:clamp(28px,3.9cqi,42px)}
.ud-hc-title__a{display:block;color:var(--hc-ink)}
.ud-hc-title__b{display:block;color:var(--hc-muted)}
.ud-hc-lead{max-width:62ch;color:var(--hc-body);font-size:14px;line-height:1.7}
.ud-hc-head{display:grid;gap:14px;justify-items:start}
.ud-hc-head--center{justify-items:center;text-align:center}
.ud-hc-head--center .ud-hc-lead{margin-inline:auto}

.ud-hc-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border:1px solid var(--hc-line);border-radius:999px;background:#fff;color:var(--hc-body);font-size:11.5px;font-weight:500}
.ud-hc-pill svg{color:var(--hc-muted)}

.ud-hc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 15px;border-radius:8px;font-size:13px;font-weight:500;line-height:1.4;transition:background .16s ease,border-color .16s ease,color .16s ease}
.ud-hc-btn--dark{background:var(--hc-dark);color:#fff}
.ud-hc-btn--dark:hover{background:#0f1725}
.ud-hc-btn--blue{background:var(--hc-blue);color:#fff}
.ud-hc-btn--blue:hover{background:#0d8ade}
.ud-hc-btn--outline{background:#fff;color:var(--hc-ink);border:1px solid var(--hc-line);box-shadow:0 1px 2px rgba(20,26,40,.05)}
.ud-hc-btn--outline:hover{border-color:#d3d9e4}
.ud-hc-buttons{display:flex;flex-wrap:wrap;gap:8px}
.ud-hc-head--center+.ud-hc-buttons,.ud-hc-scene__copy .ud-hc-buttons{justify-content:center}

.ud-hc-link{display:inline-flex;align-items:center;gap:5px;color:var(--hc-blue);font-size:13px;font-weight:500}
.ud-hc-link:hover{text-decoration:underline}

.ud-hc-logo{display:inline-flex;align-items:center;gap:8px;color:var(--hc-ink);font-weight:600;font-size:15px}
.ud-hc-logo__mark{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:var(--hc-dark);color:#fff;flex:none}
.ud-hc-logo--light{color:#fff}
.ud-hc-logo__img{position:relative;display:inline-flex}

.ud-hc-ticks{display:grid;gap:7px}
.ud-hc-ticks li{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--hc-body)}
.ud-hc-ticks svg{color:var(--hc-blue);flex:none;margin-top:3px}

/* ---- navbar */
.ud-hc-nav{position:relative;z-index:60;background:var(--color-background,#fff)}
.ud-hc-nav--sticky.ud-hc-nav--sticky{position:sticky;top:0}
.ud-hc-nav__bar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-block:14px}
.ud-hc-nav__links{display:flex;align-items:center;gap:20px;margin-left:auto}
.ud-hc-nav__link{display:inline-flex;align-items:center;gap:4px;font-size:13px;color:var(--hc-body)}
.ud-hc-nav__link:hover{color:var(--hc-blue)}
.ud-hc-nav__end{display:flex;align-items:center;gap:8px}
.ud-hc-nav__toggle{display:none;border:0;background:transparent;color:inherit;cursor:pointer}

/* ---- hero */
.ud-hc-hero .ud-hc-buttons{margin-top:20px}
.ud-hc-tabs{display:inline-flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-top:34px;padding:4px;border:1px solid var(--hc-line);border-radius:999px;background:#fff}
.ud-hc-tab{padding:6px 14px;border:0;border-radius:999px;background:transparent;color:var(--hc-body);font:inherit;font-size:12.5px;cursor:pointer}
.ud-hc-tab.is-active{background:var(--hc-dark);color:#fff}
.ud-hc-hero__frame{margin-top:26px;overflow:hidden;border:1px solid var(--hc-line);border-radius:14px;background:#fff;box-shadow:0 24px 60px -34px rgba(20,26,40,.4)}

/* ---- price card */
.ud-hc-price{max-width:330px;margin-inline:auto;display:grid;gap:16px;padding:30px 28px;border:1px solid var(--hc-line);border-radius:14px;background:#fff;box-shadow:0 14px 40px -30px rgba(20,26,40,.4);text-align:left}
.ud-hc-price__top{display:flex;align-items:baseline;gap:8px;justify-content:center}
.ud-hc-price__value{font-size:40px;font-weight:600;color:var(--hc-ink);letter-spacing:-.03em}
.ud-hc-price__unit{display:grid;font-size:11.5px;color:var(--hc-muted);line-height:1.35}
.ud-hc-price .ud-hc-btn{width:100%}
.ud-hc-price__fine{text-align:center;font-size:11px;font-style:italic;color:var(--hc-muted)}

/* ---- faq columns */
.ud-hc-faq__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,2),minmax(0,1fr));gap:34px 54px}
.ud-hc-faq__grid[data-cols="1"]{grid-template-columns:1fr}
.ud-hc-faq__grid[data-cols="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-hc-faq__item{break-inside:avoid}
.ud-hc-faq__q{font-size:13.5px;font-weight:600;margin-bottom:6px}
.ud-hc-faq__a{font-size:13px;color:var(--hc-body);line-height:1.7}
.ud-hc-faq .ud-hc-title{margin-bottom:30px}

/* ---- closing scene */
.ud-hc-scene{position:relative;padding-top:var(--ud-pt,86px);background:var(--color-background,#fff);overflow:hidden}
.ud-hc-scene__copy{display:grid;gap:14px;justify-items:center;text-align:center;padding-bottom:34px}
.ud-hc-scene__img img{display:block;width:100%;height:auto}

/* ---- channel cards */
.ud-hc-channels__row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(210px,1fr);gap:14px;margin-top:36px;overflow-x:auto;padding-bottom:6px;text-align:left;scrollbar-width:thin}
.ud-hc-channel{display:grid;gap:8px;align-content:start;padding:18px;border:1px solid var(--hc-line);border-radius:var(--hc-r);background:#fff}
.ud-hc-channel__icon{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--hc-soft);color:var(--hc-ink)}
.ud-hc-channel__title{font-size:13.5px;font-weight:600}
.ud-hc-channel__text{font-size:12.5px;color:var(--hc-body);line-height:1.6}

/* ---- showcase */
.ud-hc-showcase__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,3),minmax(0,1fr));gap:20px;margin-top:38px;text-align:left}
.ud-hc-showcase__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-hc-showcase__grid[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-hc-card{display:grid;gap:8px;align-content:start}
.ud-hc-card__frame{overflow:hidden;border:1px solid var(--hc-line);border-radius:var(--hc-r);margin-bottom:6px}
.ud-hc-card__title{font-size:14px;font-weight:600}
.ud-hc-card__text{font-size:12.5px;color:var(--hc-body);line-height:1.6}

/* ---- split */
.ud-hc-split__grid{display:grid;grid-template-columns:1fr 1.15fr;gap:48px;align-items:center}
.ud-hc-split__copy{display:grid;gap:18px;justify-items:start}
.ud-hc-split--reverse .ud-hc-split__frame{order:-1}
.ud-hc-split__frame{overflow:hidden;border:1px solid var(--hc-line);border-radius:14px;background:#fff}

/* ---- quote */
.ud-hc-quote__text{max-width:56ch;margin-inline:auto;font-size:16px;line-height:1.7;color:var(--hc-ink)}
.ud-hc-quote__who{display:inline-flex;align-items:center;gap:10px;margin-top:20px;text-align:left}
.ud-hc-quote__avatar{width:36px;flex:none}
.ud-hc-quote__avatar img{border-radius:999px}
.ud-hc-quote__name{font-size:13px;font-weight:600;color:var(--hc-ink)}
.ud-hc-quote__role{font-size:12px;color:var(--hc-muted)}

/* ---- integrations */
.ud-hc-logos__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin-top:30px}
.ud-hc-logos__chip{display:grid;place-items:center;width:46px;height:46px;border:1px solid var(--hc-line);border-radius:12px;background:#fff;color:var(--hc-ink)}
.ud-hc-logos__img{width:46px}

/* ---- principles */
.ud-hc-principles__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,3),minmax(0,1fr));gap:14px;margin-top:34px;text-align:left}
.ud-hc-principles__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-hc-principles__grid[data-cols="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-hc-tile{display:grid;gap:7px;align-content:start;padding:20px;border:1px solid var(--hc-line);border-radius:var(--hc-r);background:#fff}
.ud-hc-tile__title{font-size:13.5px;font-weight:600}
.ud-hc-tile__text{font-size:12.5px;color:var(--hc-body);line-height:1.65}

/* ---- founder letter */
.ud-hc-manifesto__body{max-width:60ch;margin:30px auto 0;display:grid;gap:14px;text-align:left;font-size:13.5px;line-height:1.75;color:var(--hc-body)}
.ud-hc-manifesto__lead{color:var(--hc-ink);font-weight:600}
.ud-hc-manifesto__sign{margin-top:6px;color:var(--hc-muted)}

/* ---- team panel */
.ud-hc-team__panel{padding:26px 28px;border:1px solid var(--hc-line);border-radius:14px;background:#fff}
.ud-hc-team__title{font-size:15px;font-weight:600}
.ud-hc-team__lead{margin-top:5px;font-size:12.5px;color:var(--hc-muted)}
.ud-hc-team__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,2),minmax(0,1fr));gap:22px;margin-top:24px}
.ud-hc-team__grid[data-cols="1"]{grid-template-columns:1fr}
.ud-hc-team__grid[data-cols="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-hc-person{display:flex;gap:12px}
.ud-hc-person__img{width:42px;flex:none}
.ud-hc-person__img img{border-radius:999px}
.ud-hc-person__name{font-size:13.5px;font-weight:600}
.ud-hc-person__role{font-size:12.5px;color:var(--hc-body)}
.ud-hc-person__place{font-size:12px;color:var(--hc-muted)}
.ud-hc-person__social{display:inline-grid;place-items:center;margin-top:6px;color:var(--hc-muted)}
.ud-hc-person__social:hover{color:var(--hc-blue)}

/* ---- story with photos */
.ud-hc-story__grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.ud-hc-story__copy{display:grid;gap:12px;font-size:13px;line-height:1.75}
.ud-hc-story--reverse .ud-hc-story__photos{order:-1}
.ud-hc-story__photos{position:relative;padding:10px 0 46px}
.ud-hc-story__photo{overflow:hidden;border-radius:6px;background:#fff;box-shadow:0 14px 34px -22px rgba(20,26,40,.55);padding:8px}
.ud-hc-story__photo--a{width:56%;transform:rotate(-2deg)}
.ud-hc-story__photo--b{position:absolute;right:6%;bottom:0;width:52%;transform:rotate(3deg)}

/* ---- before / after */
.ud-hc-compare__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:34px;text-align:left}
.ud-hc-compare__col{padding:22px;border:1px solid var(--hc-line);border-radius:var(--hc-r);background:#fff}
.ud-hc-compare__col h3{font-size:13.5px;font-weight:600;margin-bottom:12px}
.ud-hc-compare__col ul{display:grid;gap:9px}
.ud-hc-compare__col li{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;line-height:1.6}
.ud-hc-compare__col li svg{flex:none;margin-top:3px}
.ud-hc-compare__col--muted{color:var(--hc-muted)}
.ud-hc-compare__col--muted li svg{color:#c2c8d4}
.ud-hc-compare__col--good li svg{color:var(--hc-blue)}

/* ---- changelog */
.ud-hc-changelog__list{display:grid;gap:2px;margin-top:26px}
.ud-hc-entry{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:22px 0;border-top:1px solid var(--hc-line)}
.ud-hc-entry__date{font-size:12.5px;color:var(--hc-muted)}
.ud-hc-entry__tag{display:inline-block;margin-bottom:8px;padding:3px 9px;border-radius:999px;background:var(--hc-soft);color:var(--hc-ink);font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.ud-hc-entry__title{font-size:14px;font-weight:600}
.ud-hc-entry__text{margin-top:5px;font-size:13px;color:var(--hc-body);line-height:1.7}

/* ---- long copy */
.ud-hc-rich__body{font-size:13.5px;line-height:1.75;color:var(--hc-body)}
.ud-hc-rich__body h2{margin:26px 0 10px;font-size:20px;font-weight:600}
.ud-hc-rich__body h3{margin:20px 0 8px;font-size:15px;font-weight:600}
.ud-hc-rich__body p{margin:0 0 12px}
.ud-hc-rich__body a{color:var(--hc-blue)}

/* ---- contact */
.ud-hc-contact__grid{display:grid;grid-template-columns:1fr 1.05fr;gap:52px;align-items:start}
.ud-hc-contact__copy{display:grid;gap:26px;justify-items:start}
.ud-hc-contact__details{display:grid;gap:16px;width:100%}
.ud-hc-contact__details li{display:flex;align-items:flex-start;gap:11px}
.ud-hc-contact__icon{display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--hc-line);border-radius:9px;background:#fff;color:var(--hc-ink);flex:none}
.ud-hc-contact__label{font-size:12px;color:var(--hc-muted)}
.ud-hc-contact__value{font-size:13.5px;color:var(--hc-ink)}
.ud-hc-contact__panel{padding:26px 26px 22px;border:1px solid var(--hc-line);border-radius:14px;background:#fff;box-shadow:0 16px 44px -34px rgba(20,26,40,.45)}
.ud-hc-contact__formtitle{font-size:15px;font-weight:600;margin-bottom:16px}
.ud-hc-contact__fine{margin-top:12px;font-size:11.5px;color:var(--hc-muted)}
.ud-hc-contact__panel .ud-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ud-hc-contact__panel .ud-form>*:nth-child(4),.ud-hc-contact__panel .ud-form>*:nth-child(5),.ud-hc-contact__panel .ud-form>*:last-child{grid-column:1/-1}

/* ---- footer */
.ud-hc-footer{padding-block:52px 34px;background:#12161f;color:#98a1b2}
.ud-hc-footer__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:30px}
.ud-hc-footer h3{margin-bottom:14px;color:#fff;font-size:12.5px;font-weight:600}
.ud-hc-footer__col ul{display:grid;gap:9px}
.ud-hc-footer__col a{font-size:12.5px;color:#98a1b2}
.ud-hc-footer__col a:hover{color:#fff}
.ud-hc-footer__copy{margin-top:20px;font-size:11.5px;color:#6b7386}

@container udpage (max-width:900px){
  .ud-hc-split__grid,.ud-hc-story__grid,.ud-hc-contact__grid{grid-template-columns:1fr}
  .ud-hc-split--reverse .ud-hc-split__frame,.ud-hc-story--reverse .ud-hc-story__photos{order:0}
  .ud-hc-showcase__grid,.ud-hc-showcase__grid[data-cols="4"],.ud-hc-principles__grid,.ud-hc-principles__grid[data-cols="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-hc-footer__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-hc-nav__links{display:none}
  .ud-hc-nav__links.is-open{display:flex;position:absolute;top:62px;left:12px;right:12px;flex-direction:column;align-items:stretch;padding:12px;border-radius:12px;background:var(--color-background,#fff);border:1px solid var(--hc-line);z-index:70}
  .ud-hc-nav__toggle{display:inline-grid;place-items:center}
  .ud-hc-story__photo--a{width:70%}
  .ud-hc-story__photo--b{width:60%}
}
@container udpage (max-width:600px){
  .ud-hc-faq__grid,.ud-hc-faq__grid[data-cols="3"],.ud-hc-showcase__grid,.ud-hc-showcase__grid[data-cols="2"],.ud-hc-showcase__grid[data-cols="4"],.ud-hc-principles__grid,.ud-hc-principles__grid[data-cols="2"],.ud-hc-principles__grid[data-cols="4"],.ud-hc-team__grid,.ud-hc-team__grid[data-cols="3"],.ud-hc-compare__grid,.ud-hc-footer__grid{grid-template-columns:1fr}
  .ud-hc-contact__panel .ud-form{grid-template-columns:1fr}
  .ud-hc-entry{grid-template-columns:1fr;gap:8px}
  .ud-hc-channels__row{grid-auto-columns:minmax(200px,1fr)}
  .ud-hc-story__photos{padding-bottom:0}
  .ud-hc-story__photo--a{width:100%;transform:none}
  .ud-hc-story__photo--b{position:static;width:100%;margin-top:12px;transform:none}
}


/* ------------------------------------------------------------------ Tessera
 * A near-white sheet ruled by hairlines, one ember accent, and a geometric
 * grotesk set tight. Sections divide with 1px rules rather than colour blocks,
 * so consecutive Tessera blocks read as one continuous page.
 */
.ud-ts{--ts-line:color-mix(in srgb,var(--color-text,#101010) 11%,transparent);--ts-ink:var(--ud-fg,var(--color-text,#101010));--ts-soft:var(--ud-muted,var(--color-muted,#6f6f6a));--ts-ember:var(--ud-accent,var(--color-primary,#e2571f));--ts-sheet:var(--color-surface,#faf9f7)}
.ud-ts-eyebrow{margin:0 0 14px;font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--ts-soft)}
.ud-ts-lead{margin:14px 0 0;max-width:62ch;font-size:.95rem;line-height:1.7;color:var(--ts-soft)}
.ud-ts-duo{letter-spacing:-.035em;line-height:1.14;text-wrap:balance}
.ud-ts-duo__tail{color:var(--ts-soft);font-weight:inherit}
.ud-ts-head{margin:0 0 44px}
.ud-ts-head--center{text-align:center}
.ud-ts-head--center .ud-ts-lead{margin-inline:auto}
.ud-ts-link{display:inline-flex;align-items:center;gap:.4rem;margin-top:1rem;color:var(--ts-ember);font-size:.85rem;font-weight:600;text-decoration:none}
.ud-ts-link:hover{gap:.65rem}
.ud-ts-chip{width:30px;height:30px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;background:var(--ts-sheet);border:1px solid var(--ts-line);color:var(--ts-ink);flex:none}
.ud-ts-chip--accent{background:color-mix(in srgb,var(--ts-ember) 12%,transparent);border-color:color-mix(in srgb,var(--ts-ember) 26%,transparent);color:var(--ts-ember)}
.ud-ts-pill{display:inline-flex;align-items:center;gap:.35rem;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--ts-ember)}
.ud-ts-pill::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor}

.ud-ts-btn.ud-ts-btn{border-radius:999px;padding:.62rem 1.15rem;font-size:.85rem;font-weight:600;gap:.55rem;line-height:1;transition:background .18s ease,border-color .18s ease,color .18s ease}
.ud-ts-btn--primary{background:transparent;border:1px solid color-mix(in srgb,var(--ts-ember) 45%,transparent);color:var(--ts-ember)}
.ud-ts-btn--primary:hover{background:color-mix(in srgb,var(--ts-ember) 9%,transparent)}
.ud-ts-btn--quiet{background:transparent;border:1px solid var(--ts-line);color:var(--ts-ink)}
.ud-ts-btn--quiet:hover{border-color:color-mix(in srgb,var(--ts-ink) 30%,transparent)}
.ud-ts-btn--solid{background:var(--ts-ember);border:1px solid var(--ts-ember);color:#fff}
.ud-ts-btn--solid:hover{background:color-mix(in srgb,var(--ts-ember) 86%,#000)}
.ud-ts-btn:has(.ud-ts-btn__disc){padding-right:.5rem}
.ud-ts-btn__disc{width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,currentColor 16%,transparent);flex:none}
.ud-ts-btn--solid .ud-ts-btn__disc{background:rgba(255,255,255,.22)}

.ud-ts-brand{display:inline-flex;align-items:center;gap:.5rem;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:1.02rem;font-weight:700;letter-spacing:-.035em;color:var(--color-text,#101010);text-decoration:none}
.ud-ts-brand__mark{width:26px;height:26px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;background:var(--color-text,#101010);color:var(--color-background,#fff);flex:none}
.ud-ts-brand--light{color:#fff}
.ud-ts-brand--light .ud-ts-brand__mark{background:#fff;color:#0b0b0c}

/* announcement bar */
.ud-ts-announce{background:var(--ud-accent,var(--color-primary,#e2571f));color:#fff;padding-block:9px}
.ud-ts-announce__bar{display:flex;align-items:center;justify-content:center;gap:.85rem;flex-wrap:wrap;font-size:.8rem;font-family:var(--font-body,system-ui,sans-serif)}
.ud-ts-announce__text{opacity:.95}
.ud-ts-announce--sticky.ud-ts-announce--sticky{position:sticky;top:0;z-index:55}
.ud-ts-announce__link{display:inline-flex;align-items:center;gap:.3rem;color:#fff;font-weight:600;text-decoration:underline;text-underline-offset:3px}

/* navbar — sticky needs a solid background and a z-index above later sections */
.ud-ts-nav{background:var(--color-background,#fff);border-bottom:1px solid color-mix(in srgb,var(--color-text,#101010) 11%,transparent);padding-block:12px;font-family:var(--font-body,system-ui,sans-serif)}
.ud-ts-nav--sticky.ud-ts-nav--sticky{position:sticky;top:0;z-index:60}
.ud-ts-nav__bar{display:flex;align-items:center;gap:2rem;position:relative}
.ud-ts-nav__links{display:flex;align-items:center;gap:1.5rem;margin-inline:auto}
.ud-ts-nav__link{display:inline-flex;align-items:center;gap:.25rem;color:var(--color-text,#101010);font-size:.86rem;font-weight:500;text-decoration:none;opacity:.82}
.ud-ts-nav__link:hover{opacity:1}
.ud-ts-nav__actions{display:flex;align-items:center;gap:1rem}
.ud-ts-nav__signin{color:var(--color-text,#101010);font-size:.86rem;font-weight:500;text-decoration:none;opacity:.82}
.ud-ts-nav__signin:hover{opacity:1}
.ud-ts-nav__toggle{display:none;background:none;border:0;color:inherit;padding:6px;cursor:pointer}

/* hero */
.ud-ts-hero{border-bottom:1px solid var(--ts-line)}
.ud-ts-hero__copy{max-width:760px;margin-inline:auto;text-align:center}
.ud-ts-hero__title{font-size:var(--ud-heading-size,clamp(2.3rem,3.6cqi + 1.1rem,3.4rem));font-weight:var(--font-heading-weight,600)}
.ud-ts-hero__lead{margin:1.4rem auto 0;max-width:60ch;font-size:.95rem;line-height:1.75;color:var(--ts-soft)}
.ud-ts-hero__cta{display:flex;justify-content:center;flex-wrap:wrap;gap:.7rem;margin-top:2.1rem}

/* showcase pair */
.ud-ts-showcase__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
/* Full width: edge to edge, ruled off from the sections above and below. */
.ud-ts-showcase--bleed{padding-block:0}
.ud-ts-showcase--bleed .ud-ts-showcase__grid{border-bottom:1px solid var(--ts-line)}
/* Narrow / Default / Wide: a bordered box inside the shared container, so the
   card edges line up with every other section's content on the page. */
.ud-ts-showcase--boxed{padding-block:var(--ud-pt,56px) var(--ud-pb,56px);border-bottom:1px solid var(--ts-line)}
.ud-ts-showcase--boxed .ud-ts-showcase__grid{border:1px solid var(--ts-line);border-radius:var(--radius-card,14px);overflow:hidden}
.ud-ts-showcase__grid[data-count="1"]{grid-template-columns:minmax(0,1fr)}
.ud-ts-showcase__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-ts-showcase__grid[data-count="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-ts-showcase__card{padding:30px 32px 36px;background:var(--ts-sheet);min-width:0}
.ud-ts-showcase__card+.ud-ts-showcase__card{border-left:1px solid var(--ts-line)}
.ud-ts-showcase__media{border-radius:12px;overflow:hidden;background:color-mix(in srgb,var(--ts-ink) 5%,transparent)}
.ud-ts-showcase__meta{display:flex;align-items:center;gap:.6rem;margin-top:1.6rem}
.ud-ts-showcase__title{margin:.9rem 0 .5rem;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:1.32rem;font-weight:600;letter-spacing:-.03em;color:var(--ts-ink)}
.ud-ts-showcase__text{margin:0;max-width:46ch;font-size:.88rem;line-height:1.65;color:var(--ts-soft)}

/* ruled columns */
.ud-ts-pillars{border-bottom:1px solid var(--ts-line)}
.ud-ts-pillars__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-top:1px solid var(--ts-line);padding-top:34px}
.ud-ts-pillars__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-ts-pillars__grid[data-count="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-ts-pillars__col{padding:0 32px}
.ud-ts-pillars__col:first-child{padding-left:0}
.ud-ts-pillars__col+.ud-ts-pillars__col{border-left:1px solid var(--ts-line)}
.ud-ts-pillars__title{margin:0 0 .55rem;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:.98rem;font-weight:600;letter-spacing:-.02em;color:var(--ts-ink)}
.ud-ts-pillars__text{margin:0;font-size:.86rem;line-height:1.7;color:var(--ts-soft)}

/* split panel */
.ud-ts-split{border-bottom:1px solid var(--ts-line)}
.ud-ts-split__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:72px;align-items:center}
.ud-ts-split__grid--reverse .ud-ts-split__copy{order:2}
.ud-ts-split__title{font-size:clamp(1.8rem,2.2cqi + .9rem,2.4rem);font-weight:var(--font-heading-weight,600);letter-spacing:-.035em}
.ud-ts-split__cta{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.9rem}
.ud-ts-split__panel{background:var(--ts-sheet);border:1px solid var(--ts-line);border-radius:16px;padding:20px}
.ud-ts-panel__head{display:flex;align-items:flex-start;gap:.7rem}
.ud-ts-panel__title{display:block;font-size:.88rem;font-weight:600;color:var(--ts-ink)}
.ud-ts-panel__badge{display:block;font-size:.75rem;color:var(--ts-ember);font-weight:600}
.ud-ts-panel__text{margin:.9rem 0 1.1rem;font-size:.85rem;line-height:1.6;color:var(--ts-soft)}
.ud-ts-panel__card{display:flex;align-items:center;justify-content:space-between;gap:1rem;background:var(--color-background,#fff);border:1px solid var(--ts-line);border-radius:12px;padding:12px 12px 12px 16px}
.ud-ts-panel__card-title{display:block;font-size:.85rem;font-weight:600;color:var(--ts-ink)}
.ud-ts-panel__card-meta{display:block;margin-top:.2rem;font-size:.75rem;color:var(--ts-soft)}
.ud-ts-panel__card-media{width:56px;flex:none;border-radius:9px;overflow:hidden}

/* metrics */
.ud-ts-metrics{border-bottom:1px solid var(--ts-line)}
.ud-ts-metrics__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--ts-line);padding-top:34px}
.ud-ts-metrics__grid[data-count="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-ts-metrics__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-ts-metrics__cell{padding:0 28px}
.ud-ts-metrics__cell:first-child{padding-left:0}
.ud-ts-metrics__cell+.ud-ts-metrics__cell{border-left:1px solid var(--ts-line)}
.ud-ts-metrics__value{display:block;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:2.1rem;font-weight:600;letter-spacing:-.045em;color:var(--ts-ember);line-height:1}
.ud-ts-metrics__title{margin:.7rem 0 .4rem;font-size:.92rem;font-weight:600;letter-spacing:-.015em;color:var(--ts-ink)}
.ud-ts-metrics__text{margin:0;font-size:.82rem;line-height:1.6;color:var(--ts-soft)}

/* logo rail */
.ud-ts-logos{border-bottom:1px solid var(--ts-line);padding-block:44px}
.ud-ts-logos__label{margin:0 0 22px;font-size:.78rem;letter-spacing:.02em;color:var(--ts-soft)}
.ud-ts-logos__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px 52px}
.ud-ts-logos__name{font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:1.02rem;font-weight:600;letter-spacing:-.02em;color:var(--ts-ink);opacity:.42}
.ud-ts-logos__img{height:26px;width:auto;object-fit:contain;opacity:.5}

/* pricing */
.ud-ts-pricing{border-bottom:1px solid var(--ts-line)}
.ud-ts-pricing__title{font-size:clamp(1.9rem,2.2cqi + .9rem,2.5rem);letter-spacing:-.04em}
.ud-ts-pricing__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--ts-line);border-radius:14px;overflow:hidden;margin-top:1.8rem}
.ud-ts-pricing__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-ts-pricing__grid[data-count="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-ts-tier{padding:28px 26px 32px;background:var(--color-background,#fff);display:flex;flex-direction:column;align-items:flex-start}
.ud-ts-tier+.ud-ts-tier{border-left:1px solid var(--ts-line)}
.ud-ts-tier--featured{background:var(--ts-sheet)}
.ud-ts-tier__head{display:flex;align-items:baseline;justify-content:space-between;gap:.75rem;width:100%}
.ud-ts-tier__name{margin:0;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:1.18rem;font-weight:600;letter-spacing:-.03em;color:var(--ts-ink)}
.ud-ts-tier__badge{font-size:11px;font-weight:600;color:var(--ts-ember)}
.ud-ts-tier__blurb{margin:.55rem 0 1.4rem;font-size:.82rem;line-height:1.6;color:var(--ts-soft);min-height:2.6em}
.ud-ts-tier__price{margin:0 0 1.3rem;display:flex;align-items:baseline;gap:.3rem}
.ud-ts-tier__amount{font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:2rem;font-weight:600;letter-spacing:-.05em;color:var(--ts-ink)}
.ud-ts-tier__period{font-size:.82rem;color:var(--ts-soft)}
.ud-ts-tier .ud-ts-btn{width:100%;justify-content:center}
.ud-ts-tier__list{list-style:none;margin:1.6rem 0 0;padding:0;display:grid;gap:.62rem;width:100%}
.ud-ts-tier__list li{display:flex;align-items:flex-start;gap:.55rem;font-size:.82rem;line-height:1.5;color:var(--ts-soft)}
.ud-ts-tier__list svg{margin-top:.15rem;flex:none;color:var(--ts-ember)}
.ud-ts-custom{display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;border:1px solid var(--ts-line);border-radius:14px;padding:28px 30px;margin-top:18px;background:var(--color-background,#fff)}
.ud-ts-custom__title{margin:0;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:1.18rem;font-weight:600;letter-spacing:-.03em;color:var(--ts-ink)}
.ud-ts-custom__text{margin:.5rem 0 0;max-width:62ch;font-size:.84rem;line-height:1.6;color:var(--ts-soft)}
.ud-ts-custom__list{list-style:none;margin:1.2rem 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem 2rem}
.ud-ts-custom__list li{display:flex;align-items:flex-start;gap:.5rem;font-size:.8rem;color:var(--ts-soft)}
.ud-ts-custom__list svg{margin-top:.12rem;flex:none;color:var(--ts-ember)}

/* comparison table */
.ud-ts-compare{--ts-line:rgba(255,255,255,.14);--ts-ink:#fff;--ts-soft:rgba(255,255,255,.62)}
.ud-ts-compare__title{font-size:clamp(1.8rem,2.2cqi + .8rem,2.4rem);letter-spacing:-.04em;margin-bottom:2rem;color:#fff}
.ud-ts-compare__scroll{overflow-x:auto}
.ud-ts-compare__table{width:100%;border-collapse:collapse;font-size:.82rem;min-width:680px}
.ud-ts-compare__table th,.ud-ts-compare__table td{text-align:left;padding:13px 18px;border-bottom:1px solid var(--ts-line);vertical-align:middle}
.ud-ts-compare__table thead th{padding-block:0 18px}
.ud-ts-compare__col{display:block;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:1rem;font-weight:600;letter-spacing:-.02em;color:#fff}
.ud-ts-compare__note{display:block;margin-top:.2rem;font-size:.74rem;font-weight:400;color:var(--ts-soft)}
.ud-ts-compare__table tbody th{font-weight:400;color:var(--ts-soft)}
.ud-ts-compare__table tbody td{color:#fff}
.ud-ts-compare__table tbody td svg{color:var(--ud-accent,#e2571f)}
.ud-ts-compare__group th{font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);padding-top:26px}
.ud-ts-compare__off{color:rgba(255,255,255,.3)}

/* faq */
.ud-ts-faq{border-bottom:1px solid var(--ts-line)}
.ud-ts-faq__title{text-align:center;font-size:clamp(1.9rem,2.4cqi + .9rem,2.7rem);letter-spacing:-.04em;margin-bottom:2.6rem}
.ud-ts-faq__list{max-width:720px;margin-inline:auto}
.ud-ts-faq__row{border-bottom:1px solid var(--ts-line)}
.ud-ts-faq__q{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:19px 4px;cursor:pointer;list-style:none;font-size:.9rem;font-weight:500;color:var(--ts-ink)}
.ud-ts-faq__q::-webkit-details-marker{display:none}
.ud-ts-faq__caret{display:inline-flex;color:var(--ts-soft);transform:rotate(90deg);transition:transform .22s ease}
.ud-ts-faq__row[open] .ud-ts-faq__caret{transform:rotate(-90deg)}
.ud-ts-faq__a{margin:0;padding:0 4px 22px;max-width:64ch;font-size:.86rem;line-height:1.72;color:var(--ts-soft)}

/* principles */
.ud-ts-principles{border-bottom:1px solid var(--ts-line)}
.ud-ts-principles__grid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:72px}
.ud-ts-principles__title{font-size:clamp(1.7rem,2cqi + .8rem,2.2rem);letter-spacing:-.035em}
.ud-ts-principles__row{display:grid;grid-template-columns:44px 1fr;gap:1rem;padding:20px 0;border-bottom:1px solid var(--ts-line)}
.ud-ts-principles__row:first-child{border-top:1px solid var(--ts-line)}
.ud-ts-principles__index{font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:.76rem;color:var(--ts-soft);padding-top:.15rem}
.ud-ts-principles__name{margin:0 0 .3rem;font-size:.94rem;font-weight:600;letter-spacing:-.015em;color:var(--ts-ink)}
.ud-ts-principles__text{margin:0;font-size:.84rem;line-height:1.65;color:var(--ts-soft)}
.ud-ts-principles__stat{margin-top:28px;background:var(--ts-sheet);border:1px solid var(--ts-line);border-radius:12px;padding:22px 24px}
.ud-ts-principles__stat-title{margin:0;font-family:var(--font-heading,Sora,system-ui,sans-serif);font-size:1.05rem;font-weight:600;letter-spacing:-.025em;color:var(--ts-ink)}
.ud-ts-principles__stat-text{margin:.45rem 0 0;font-size:.82rem;color:var(--ts-soft)}

/* benefits */
.ud-ts-benefits{border-bottom:1px solid var(--ts-line)}
.ud-ts-benefits__title{font-size:clamp(1.8rem,2.2cqi + .8rem,2.4rem);letter-spacing:-.04em}
.ud-ts-benefits__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:38px 44px;margin-top:2.8rem;text-align:left}
.ud-ts-benefits__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-ts-benefits__grid[data-count="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-ts-benefits__name{margin:.9rem 0 .4rem;font-size:.94rem;font-weight:600;letter-spacing:-.015em;color:var(--ts-ink)}
.ud-ts-benefits__text{margin:0;font-size:.84rem;line-height:1.65;color:var(--ts-soft)}

/* open roles */
.ud-ts-roles{border-bottom:1px solid var(--ts-line)}
.ud-ts-roles__title{font-size:clamp(1.8rem,2.2cqi + .8rem,2.4rem);letter-spacing:-.04em}
.ud-ts-roles__list{list-style:none;margin:2.2rem 0 0;padding:0}
.ud-ts-roles__row{border-bottom:1px solid var(--ts-line)}
.ud-ts-roles__row:first-child{border-top:1px solid var(--ts-line)}
.ud-ts-roles__link{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:20px 4px;text-decoration:none;color:inherit}
.ud-ts-roles__link:hover .ud-ts-roles__go{background:var(--ts-ember);border-color:var(--ts-ember);color:#fff}
.ud-ts-roles__name{display:block;font-size:.98rem;font-weight:600;letter-spacing:-.02em;color:var(--ts-ink)}
.ud-ts-roles__meta{display:block;margin-top:.25rem;font-size:.8rem;color:var(--ts-soft)}
.ud-ts-roles__go{width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ts-line);color:var(--ts-soft);flex:none;transition:background .18s ease,color .18s ease,border-color .18s ease}

/* cta band */
.ud-ts-ctaband{--ts-line:rgba(255,255,255,.14);--ts-ink:#fff;--ts-soft:rgba(255,255,255,.66)}
.ud-ts-ctaband__inner{max-width:640px}
.ud-ts-ctaband__title{font-size:clamp(1.7rem,2.2cqi + .8rem,2.3rem);letter-spacing:-.04em;color:#fff}
.ud-ts-ctaband__text{margin:.9rem 0 0;font-size:.9rem;line-height:1.7;color:var(--ts-soft)}
.ud-ts-ctaband__cta{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.9rem}
.ud-ts-ctaband .ud-ts-btn--quiet{border-color:rgba(255,255,255,.28);color:#fff}
.ud-ts-ctaband .ud-ts-btn--quiet:hover{border-color:rgba(255,255,255,.55)}

/* footer */
.ud-ts-footer{--ts-line:rgba(255,255,255,.12);--ts-ink:#fff;--ts-soft:rgba(255,255,255,.6);padding-block:64px 34px}
.ud-ts-footer__top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.4fr);gap:56px}
.ud-ts-footer__address{margin:1.2rem 0 0;font-size:.78rem;line-height:1.75;color:var(--ts-soft);white-space:pre-line}
.ud-ts-footer__cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px}
.ud-ts-footer__col-title{margin:0 0 1rem;font-size:.82rem;font-weight:600;color:#fff}
.ud-ts-footer__col ul{list-style:none;margin:0;padding:0;display:grid;gap:.62rem}
.ud-ts-footer__col a{font-size:.78rem;color:var(--ts-soft);text-decoration:none}
.ud-ts-footer__col a:hover{color:#fff}
.ud-ts-footer__bottom{display:flex;align-items:flex-start;justify-content:space-between;gap:40px;margin-top:52px;padding-top:26px;border-top:1px solid var(--ts-line)}
.ud-ts-footer__copy{margin:0;font-size:.74rem;color:var(--ts-soft)}
.ud-ts-footer__disclaimer{margin:.7rem 0 0;max-width:78ch;font-size:.68rem;line-height:1.6;color:rgba(255,255,255,.36)}
.ud-ts-footer__links{list-style:none;display:flex;flex-wrap:wrap;gap:1.2rem;margin:1.2rem 0 0;padding:0}
.ud-ts-footer__links a{font-size:.72rem;color:var(--ts-soft);text-decoration:underline;text-underline-offset:3px}
.ud-ts-footer__links a:hover{color:#fff}
.ud-ts-footer__social{display:flex;gap:.9rem;flex:none}
.ud-ts-footer__social a{color:var(--ts-soft)}
.ud-ts-footer__social a:hover{color:#fff}

@container udpage (max-width: 1180px){
  .ud-ts-showcase__grid,.ud-ts-showcase__grid[data-count="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-ts-showcase__card:nth-child(2n+1){border-left:0}
  .ud-ts-showcase__card:nth-child(n+3){border-top:1px solid var(--ts-line)}
}

@container udpage (max-width: 900px){
  .ud-ts-nav__links{position:absolute;top:100%;left:0;right:0;display:none;flex-direction:column;align-items:flex-start;gap:0;background:var(--color-background,#fff);border-bottom:1px solid var(--ts-line);padding:8px 20px 16px;margin:0}
  .ud-ts-nav__links.is-open{display:flex}
  .ud-ts-nav__link{padding-block:10px;width:100%}
  .ud-ts-nav__toggle{display:inline-flex;margin-left:auto}
  .ud-ts-nav__actions{display:none}
  .ud-ts-showcase__grid,.ud-ts-showcase__grid[data-count="2"],.ud-ts-showcase__grid[data-count="4"]{grid-template-columns:1fr}
  .ud-ts-showcase__card+.ud-ts-showcase__card{border-left:0;border-top:1px solid var(--ts-line)}
  .ud-ts-showcase__card{padding:26px 24px 32px}
  .ud-ts-pillars__grid,.ud-ts-metrics__grid{grid-template-columns:1fr;gap:0}
  .ud-ts-pillars__col,.ud-ts-metrics__cell{padding:22px 0;border-left:0}
  .ud-ts-pillars__col+.ud-ts-pillars__col,.ud-ts-metrics__cell+.ud-ts-metrics__cell{border-top:1px solid var(--ts-line)}
  .ud-ts-split__grid,.ud-ts-principles__grid{grid-template-columns:1fr;gap:36px}
  .ud-ts-split__grid--reverse .ud-ts-split__copy{order:0}
  .ud-ts-pricing__grid{grid-template-columns:1fr}
  .ud-ts-tier+.ud-ts-tier{border-left:0;border-top:1px solid var(--ts-line)}
  .ud-ts-custom__list{grid-template-columns:1fr}
  .ud-ts-benefits__grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px}
  .ud-ts-footer__top{grid-template-columns:1fr;gap:36px}
  .ud-ts-footer__cols{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-ts-footer__bottom{flex-direction:column;gap:24px}
}

@container udpage (max-width: 560px){
  .ud-ts-benefits__grid{grid-template-columns:1fr}
  .ud-ts-footer__cols{grid-template-columns:1fr}
  .ud-ts-custom{flex-direction:column;align-items:flex-start;gap:24px}
}

/* ------------------------------------------------------------------- Quarry
 * Cool off-white grounds, deep brand-coloured bands, and one theme accent used
 * as a marker highlight and as blocky pixel art. Uppercase grotesk headings set
 * tight over a mono micro-label system. Every colour resolves from the theme
 * tokens, so recolouring the whole family is a Theme settings change.
 */
.ud-qr{
  --qr-ink:var(--ud-fg,var(--color-text,#101418));
  --qr-soft:var(--ud-muted,var(--color-muted,#5c6b78));
  --qr-accent:var(--color-accent,#7dd3fc);
  --qr-brand:var(--color-primary,#0369a1);
  --qr-deep:var(--color-secondary,#082f49);
  --qr-paper:var(--color-background,#f2f5f8);
  --qr-line:color-mix(in srgb,var(--color-text,#101418) 14%,transparent);
  --qr-card:var(--color-surface,#ffffff);
  /* Text drawn ON the accent colour. The dark scopes below flip --qr-ink to
     white; this one must keep following the theme, so it is never overridden. */
  --qr-on-accent:var(--color-text,#101418);
}
.ud-qr-title{font-family:var(--font-heading,Archivo,system-ui,sans-serif);font-weight:var(--font-heading-weight,700);text-transform:uppercase;letter-spacing:-.02em;line-height:1.06;text-wrap:balance;margin:0}
.ud-qr-mark{background:var(--qr-accent);color:var(--qr-ink);padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.ud-qr-eyebrow{display:flex;align-items:center;gap:.5rem;margin:0 0 1.1rem;font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--qr-soft)}
.ud-qr-eyebrow__dot{width:7px;height:7px;background:var(--qr-accent);flex:none}
.ud-qr-lead{margin:1.2rem 0 0;max-width:60ch;font-size:.95rem;line-height:1.7;color:var(--qr-soft)}
.ud-qr-head{margin:0 0 46px;max-width:70ch}
.ud-qr-head--center{margin-inline:auto;text-align:center}
.ud-qr-tick{width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;background:var(--qr-accent);color:var(--qr-ink);flex:none;margin-top:.15rem}

.ud-qr-btn{display:inline-flex;align-items:center;gap:.6rem;padding:.72rem 1.15rem;border-radius:var(--radius-button,4px);font-family:var(--font-body,system-ui,sans-serif);font-size:.85rem;font-weight:600;line-height:1;text-decoration:none;border:1px solid transparent;transition:background .18s ease,color .18s ease,border-color .18s ease}
.ud-qr-btn__arrow{font-size:.9em;line-height:1}
.ud-qr-btn--solid{background:var(--qr-brand);color:#fff;border-color:var(--qr-brand)}
.ud-qr-btn--solid:hover{background:color-mix(in srgb,var(--qr-brand) 84%,#000)}
.ud-qr-btn--accent{background:var(--qr-accent);color:var(--qr-on-accent);border-color:var(--qr-accent)}
.ud-qr-btn--accent:hover{background:color-mix(in srgb,var(--qr-accent) 86%,#fff)}
.ud-qr-btn--outline{background:transparent;color:var(--qr-ink);border-color:var(--qr-line)}
.ud-qr-btn--outline:hover{border-color:var(--qr-ink)}
.ud-qr-btn--ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.34)}
.ud-qr-btn--ghost:hover{border-color:#fff;background:rgba(255,255,255,.08)}

.ud-qr-brand{display:inline-flex;align-items:center;gap:.55rem;font-family:var(--font-heading,Archivo,system-ui,sans-serif);font-size:1.05rem;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:inherit;text-decoration:none}
.ud-qr-brand__mark{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;background:var(--qr-brand);color:var(--qr-accent);flex:none}

/* pixel art */
.ud-qr-pixels{display:grid;grid-template-columns:repeat(var(--qr-pixel-cols,8),1fr);gap:4px;width:100%;max-width:420px;aspect-ratio:auto}
.ud-qr-pixels__cell{aspect-ratio:1;background:transparent}
.ud-qr-pixels__cell.is-accent{background:var(--qr-accent)}
.ud-qr-pixels__cell.is-deep{background:color-mix(in srgb,var(--qr-accent) 40%,transparent)}

/* navbar — floating white bar, sticky */
.ud-qr-nav{padding-block:16px;background:transparent;font-family:var(--font-body,system-ui,sans-serif)}
.ud-qr-nav--sticky.ud-qr-nav--sticky{position:sticky;top:0;z-index:60}
.ud-qr-nav__bar{display:flex;align-items:center;gap:2rem;position:relative;background:var(--qr-card);border:1px solid var(--qr-line);padding:10px 10px 10px 18px}
.ud-qr-nav__links{display:flex;align-items:center;gap:1.4rem;margin-inline:auto}
.ud-qr-nav__link{display:inline-flex;align-items:center;gap:.25rem;color:var(--color-text,#101418);font-size:.86rem;font-weight:500;text-decoration:none;opacity:.86}
.ud-qr-nav__link:hover{opacity:1}
.ud-qr-nav__actions{display:flex;align-items:center;gap:1.1rem}
.ud-qr-nav__login{color:var(--color-text,#101418);font-size:.86rem;font-weight:500;text-decoration:none;opacity:.86}
.ud-qr-nav__login:hover{opacity:1}
.ud-qr-nav__toggle{display:none;background:none;border:0;color:inherit;padding:6px;cursor:pointer}

/* hero */
.ud-qr-hero{overflow:hidden}
.ud-qr-hero__grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:64px;align-items:center}
.ud-qr-hero .ud-qr-eyebrow{color:rgba(255,255,255,.66)}
.ud-qr-hero__title{font-size:var(--ud-heading-size,clamp(2.2rem,3.4cqi + 1rem,3.5rem));color:#fff}
.ud-qr-hero__lead{margin:1.5rem 0 0;max-width:52ch;font-size:.95rem;line-height:1.7;color:rgba(255,255,255,.78)}
.ud-qr-hero__cta{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2.1rem}
.ud-qr-hero__art{justify-self:end;max-width:460px}

/* logo rail */
.ud-qr-logos{padding-block:52px}
.ud-qr-logos__label{margin:0 0 24px;font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--qr-soft)}
.ud-qr-logos__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:18px 56px}
.ud-qr-logos__name{font-family:var(--font-heading,Archivo,system-ui,sans-serif);font-size:1.25rem;font-weight:600;letter-spacing:-.01em;color:var(--qr-ink);opacity:.34}
.ud-qr-logos__img{height:26px;width:auto;object-fit:contain;opacity:.45}

/* key figures */
.ud-qr-stats__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.ud-qr-stats__grid[data-count="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-qr-stats__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-qr-stats__card{background:var(--qr-card);border:1px solid var(--qr-line);padding:22px 22px 26px;display:flex;flex-direction:column;min-width:0}
.ud-qr-stats__index{font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--qr-soft)}
.ud-qr-stats__value{display:block;margin-top:1.6rem;font-family:var(--font-heading,Archivo,system-ui,sans-serif);font-size:2.6rem;font-weight:700;letter-spacing:-.045em;line-height:1;color:var(--qr-brand)}
.ud-qr-stats__title{margin:.9rem 0 .4rem;font-size:.92rem;font-weight:600;letter-spacing:-.01em;color:var(--qr-ink)}
.ud-qr-stats__text{margin:0;font-size:.82rem;line-height:1.6;color:var(--qr-soft)}

/* split panel */
.ud-qr-split__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:64px;align-items:center}
.ud-qr-split__grid--reverse .ud-qr-split__copy{order:2}
.ud-qr-split__title{font-size:clamp(1.7rem,2.2cqi + .8rem,2.4rem)}
.ud-qr-split__list{list-style:none;margin:1.8rem 0 0;padding:0;display:grid;gap:.85rem}
.ud-qr-split__list li,.ud-qr-pillars__list li{display:flex;align-items:flex-start;gap:.7rem;font-size:.88rem;line-height:1.6;color:var(--qr-ink)}
.ud-qr-split__cta{margin-top:2rem}
.ud-qr-split__media{border:1px solid var(--qr-line);background:var(--qr-card)}

/* layered pillars */
.ud-qr-pillars__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px}
.ud-qr-pillars__title{font-size:clamp(1.7rem,2.2cqi + .8rem,2.3rem)}
.ud-qr-pillars__list{list-style:none;margin:1.8rem 0 0;padding:0;display:grid;gap:.85rem}
.ud-qr-pillars__cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-content:start}
.ud-qr-layer{background:var(--qr-card);border:1px solid var(--qr-line);padding:20px 20px 24px;min-width:0}
.ud-qr-layer--accent{background:var(--qr-accent);border-color:var(--qr-accent)}
.ud-qr-layer--deep{background:var(--qr-deep);border-color:var(--qr-deep)}
.ud-qr-layer--deep .ud-qr-layer__title{color:#fff}
.ud-qr-layer--deep .ud-qr-layer__text{color:rgba(255,255,255,.72)}
.ud-qr-layer--deep .ud-qr-layer__index{color:var(--qr-accent)}
.ud-qr-layer__index{display:block;font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:10px;letter-spacing:.16em;color:var(--qr-soft)}
.ud-qr-layer__title{margin:1.3rem 0 .45rem;font-size:.98rem;font-weight:600;letter-spacing:-.01em;color:var(--qr-ink)}
.ud-qr-layer__text{margin:0;font-size:.82rem;line-height:1.6;color:var(--qr-soft)}

/* numbered cards */
.ud-qr-steps__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.ud-qr-steps__grid[data-count="1"]{grid-template-columns:minmax(0,1fr)}
.ud-qr-steps__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-qr-steps__grid[data-count="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.ud-qr-step{background:var(--qr-card);border:1px solid var(--qr-line);padding:24px 24px 28px;min-width:0}
.ud-qr-step__index{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--qr-accent);color:var(--qr-ink);font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:11px;font-weight:600}
.ud-qr-step__title{margin:1.5rem 0 .55rem;font-size:1.02rem;font-weight:600;letter-spacing:-.015em;color:var(--qr-ink)}
.ud-qr-step__text{margin:0;font-size:.85rem;line-height:1.65;color:var(--qr-soft)}

/* comparison table */
.ud-qr-compare{--qr-line:rgba(255,255,255,.16);--qr-ink:#fff;--qr-soft:rgba(255,255,255,.64)}
.ud-qr-compare .ud-qr-eyebrow{color:var(--qr-accent)}
.ud-qr-compare__title{font-size:clamp(1.7rem,2.2cqi + .8rem,2.4rem);color:#fff;max-width:26ch}
.ud-qr-compare__panel{margin-top:2.6rem;background:rgba(0,0,0,.24);border:1px solid var(--qr-line);padding:26px}
.ud-qr-compare__intro{margin:0 0 1.6rem;font-size:.95rem;color:#fff}
.ud-qr-compare__scroll{overflow-x:auto}
.ud-qr-compare__table{width:100%;border-collapse:collapse;font-size:.82rem;min-width:640px}
.ud-qr-compare__table th,.ud-qr-compare__table td{text-align:left;padding:14px 16px;vertical-align:top;border-bottom:1px solid var(--qr-line)}
.ud-qr-compare__table thead th{font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.ud-qr-compare__table tbody th{font-weight:600;color:#fff;width:22%}
.ud-qr-compare__table tbody td{color:rgba(255,255,255,.74)}
.ud-qr-compare__table td p,.ud-qr-compare__table td span{margin:0}
.ud-qr-compare__col--accent{background:var(--qr-accent)}
.ud-qr-compare__table thead th.ud-qr-compare__col--accent{color:var(--qr-on-accent)}
.ud-qr-compare__table tbody td.ud-qr-compare__col--accent{color:var(--qr-on-accent);font-weight:500}

/* lime quote band */
.ud-qr-quote__band{position:relative;background:var(--qr-accent);padding:56px 48px;overflow:hidden}
.ud-qr-quote__art{position:absolute;right:-40px;bottom:-40px;width:300px;opacity:.35}
.ud-qr-quote__art .ud-qr-pixels__cell.is-accent{background:color-mix(in srgb,var(--qr-on-accent) 22%,transparent)}
.ud-qr-quote__art .ud-qr-pixels__cell.is-deep{background:color-mix(in srgb,var(--qr-on-accent) 10%,transparent)}
.ud-qr-quote__card{position:relative;z-index:1;max-width:620px;background:var(--qr-card);border:1px solid color-mix(in srgb,var(--qr-on-accent) 12%,transparent);padding:28px 30px 30px}
.ud-qr-quote__badge{display:inline-block;margin-bottom:1.3rem;padding:.35rem .75rem;background:var(--qr-deep);color:#fff;font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:10px;letter-spacing:.12em;text-transform:uppercase}
.ud-qr-quote__text{margin:0;font-family:var(--font-heading,Archivo,system-ui,sans-serif);font-size:1.22rem;font-weight:500;line-height:1.45;letter-spacing:-.015em;color:var(--qr-ink)}
.ud-qr-quote__by{margin:1.4rem 0 0;display:flex;flex-direction:column;gap:.15rem}
.ud-qr-quote__by strong{font-size:.85rem;color:var(--qr-ink)}
.ud-qr-quote__by span{font-size:.8rem;color:var(--qr-soft)}

/* ecosystem grid */
.ud-qr-directory__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.ud-qr-directory__grid[data-count="1"]{grid-template-columns:minmax(0,1fr)}
.ud-qr-directory__grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-qr-directory__grid[data-count="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-qr-tool{background:var(--qr-card);border:1px solid var(--qr-line);padding:20px 20px 22px;display:flex;flex-direction:column;min-width:0}
.ud-qr-tool__mark{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;background:var(--qr-brand);color:var(--qr-accent);flex:none}
.ud-qr-tool__title{margin:1.2rem 0 .45rem;font-size:.98rem;font-weight:600;letter-spacing:-.01em;color:var(--qr-ink)}
.ud-qr-tool__text{margin:0 0 1.4rem;font-size:.8rem;line-height:1.6;color:var(--qr-soft)}
.ud-qr-tool__tag{margin-top:auto;align-self:flex-start;padding:.28rem .55rem;border:1px solid var(--qr-line);font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--qr-soft)}
.ud-qr-directory__cta{margin-top:26px}

/* faq */
.ud-qr-faq__grid{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);gap:64px;align-items:start}
.ud-qr-faq__title{font-size:clamp(1.6rem,2cqi + .7rem,2.1rem)}
.ud-qr-faq__lead{margin:1.1rem 0 1.8rem;font-size:.88rem;line-height:1.65;color:var(--qr-soft)}
.ud-qr-faq__row{background:var(--qr-card);border:1px solid var(--qr-line);margin-bottom:10px}
.ud-qr-faq__q{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:17px 20px;cursor:pointer;list-style:none;font-size:.9rem;font-weight:500;color:var(--qr-ink)}
.ud-qr-faq__q::-webkit-details-marker{display:none}
.ud-qr-faq__sign{position:relative;width:13px;height:13px;flex:none}
.ud-qr-faq__sign::before,.ud-qr-faq__sign::after{content:"";position:absolute;background:var(--qr-ink);transition:transform .2s ease}
.ud-qr-faq__sign::before{top:6px;left:0;width:13px;height:1.5px}
.ud-qr-faq__sign::after{left:6px;top:0;width:1.5px;height:13px}
.ud-qr-faq__row[open] .ud-qr-faq__sign::after{transform:scaleY(0)}
.ud-qr-faq__a{margin:0;padding:0 20px 20px;max-width:70ch;font-size:.85rem;line-height:1.7;color:var(--qr-soft)}

/* cta band */
.ud-qr-ctaband__band{position:relative;background:var(--qr-brand);padding:56px 48px;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:center}
.ud-qr-ctaband .ud-qr-eyebrow{color:var(--qr-accent)}
.ud-qr-ctaband__copy{position:relative;z-index:1;max-width:34ch}
.ud-qr-ctaband__title{font-size:clamp(1.7rem,2.2cqi + .8rem,2.3rem);color:#fff}
.ud-qr-ctaband__text{margin:1.1rem 0 1.9rem;font-size:.9rem;line-height:1.65;color:rgba(255,255,255,.76)}
.ud-qr-ctaband__art{width:260px;justify-self:end}

/* contact */
.ud-qr-contact__grid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:64px;align-items:start}
.ud-qr-contact__chip{display:inline-flex;align-items:center;gap:.5rem;padding:.45rem .8rem;background:var(--qr-card);border:1px solid var(--qr-line);font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--qr-ink)}
.ud-qr-contact__title{margin:1.6rem 0 0;font-size:clamp(2rem,2.8cqi + .9rem,3rem)}
.ud-qr-contact__lead{margin:1.2rem 0 0;max-width:42ch;font-size:.95rem;line-height:1.7;color:var(--qr-soft)}
.ud-qr-contact__card{background:var(--qr-card);border:1px solid var(--qr-line);padding:28px 30px 30px}
/* The shared PublicForm markup: .ud-form > .ud-field > .ud-input, plus .ud-btn. */
.ud-qr-contact__card .ud-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ud-qr-contact__card .ud-field{display:grid;gap:.4rem;min-width:0;font-size:.78rem;color:var(--qr-soft)}
.ud-qr-contact__card .ud-field:has(textarea),
.ud-qr-contact__card .ud-field:has(input[name="company"]),
.ud-qr-contact__card .ud-btn,
.ud-qr-contact__card .ud-form__status{grid-column:1 / -1}
.ud-qr-contact__card .ud-input{width:100%;padding:.72rem .85rem;border:1px solid var(--qr-line);border-radius:0;background:var(--qr-card);font-family:var(--font-body,system-ui,sans-serif);font-size:.88rem;color:var(--qr-ink)}
.ud-qr-contact__card .ud-input:focus{border-color:var(--qr-brand)}
.ud-qr-contact__card .ud-input::placeholder{color:color-mix(in srgb,var(--qr-soft) 72%,transparent)}
.ud-qr-contact__card textarea.ud-input{min-height:180px;resize:vertical}
.ud-qr-contact__card .ud-btn{width:100%;justify-content:center;background:var(--qr-brand);color:#fff;border:1px solid var(--qr-brand);border-radius:var(--radius-button,4px);padding:.85rem 1.2rem;font-weight:600;font-size:.9rem}
.ud-qr-contact__card .ud-btn:hover{background:color-mix(in srgb,var(--qr-brand) 84%,#000)}

/* mega footer */
.ud-qr-footer{padding-block:72px 32px}
.ud-qr-footer__top{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,3fr);gap:56px}
.ud-qr-footer__tagline{margin:1.3rem 0 0;max-width:34ch;font-size:.85rem;line-height:1.6;color:var(--qr-soft)}
.ud-qr-footer__social{display:flex;gap:.5rem;margin-top:1.4rem}
.ud-qr-footer__social a{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--qr-line);color:var(--qr-ink)}
.ud-qr-footer__social a:hover{background:var(--qr-accent);border-color:var(--qr-accent)}
.ud-qr-footer__copy{margin:1.4rem 0 0;font-size:.76rem;color:var(--qr-soft)}
.ud-qr-footer__art{margin-top:2.6rem;max-width:210px}
.ud-qr-footer__cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:36px 28px}
.ud-qr-footer__col-title{margin:0 0 1.1rem;font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--qr-soft)}
.ud-qr-footer__col ul{list-style:none;margin:0;padding:0;display:grid;gap:.65rem}
.ud-qr-footer__col a{font-size:.82rem;line-height:1.4;color:var(--qr-ink);text-decoration:none}
.ud-qr-footer__col a:hover{color:var(--qr-brand);text-decoration:underline;text-underline-offset:3px}
.ud-qr-footer__bottom{display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;margin-top:56px;padding-top:26px;border-top:1px solid var(--qr-line)}
.ud-qr-footer__badges{display:flex;gap:.7rem;flex-wrap:wrap}
.ud-qr-badge{display:inline-flex;align-items:center;justify-content:center;text-align:center;width:64px;height:64px;border:1px solid var(--qr-line);border-radius:50%;font-family:var(--font-mono,JetBrains Mono,ui-monospace,monospace);font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:var(--qr-soft);padding:6px;line-height:1.3}
.ud-qr-footer__legal{list-style:none;display:flex;flex-wrap:wrap;gap:1.4rem;margin:0;padding:0}
.ud-qr-footer__legal a{font-size:.76rem;color:var(--qr-soft);text-decoration:none}
.ud-qr-footer__legal a:hover{color:var(--qr-ink);text-decoration:underline;text-underline-offset:3px}

@container udpage (max-width: 1080px){
  .ud-qr-stats__grid,.ud-qr-directory__grid,.ud-qr-directory__grid[data-count="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-qr-steps__grid,.ud-qr-steps__grid[data-count="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-qr-footer__cols{grid-template-columns:repeat(3,minmax(0,1fr))}
}

@container udpage (max-width: 900px){
  .ud-qr-nav__links{position:absolute;top:100%;left:0;right:0;display:none;flex-direction:column;align-items:flex-start;gap:0;background:var(--qr-card);border:1px solid var(--qr-line);border-top:0;padding:8px 18px 16px;margin:0;z-index:5}
  .ud-qr-nav__links.is-open{display:flex}
  .ud-qr-nav__link{padding-block:10px;width:100%}
  .ud-qr-nav__toggle{display:inline-flex;margin-left:auto}
  .ud-qr-nav__actions{display:none}
  .ud-qr-hero__grid,.ud-qr-split__grid,.ud-qr-pillars__grid,.ud-qr-faq__grid,.ud-qr-contact__grid{grid-template-columns:1fr;gap:38px}
  .ud-qr-split__grid--reverse .ud-qr-split__copy{order:0}
  .ud-qr-hero__art{justify-self:start;max-width:320px}
  .ud-qr-ctaband__band{grid-template-columns:1fr;padding:40px 28px}
  .ud-qr-ctaband__art{justify-self:start;width:200px}
  .ud-qr-quote__band{padding:36px 26px}
  .ud-qr-footer__top{grid-template-columns:1fr;gap:40px}
  .ud-qr-footer__cols{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-qr-footer__bottom{flex-direction:column;align-items:flex-start;gap:26px}
}

@container udpage (max-width: 620px){
  .ud-qr-stats__grid,.ud-qr-steps__grid,.ud-qr-directory__grid,.ud-qr-pillars__cards{grid-template-columns:1fr}
  .ud-qr-footer__cols{grid-template-columns:1fr}
  .ud-qr-contact__card{padding:22px 20px 24px}
  .ud-qr-contact__card .ud-form{grid-template-columns:1fr}
}

/* =================================================================== meridian
   Near-white pages, two-tone headlines fading black to grey, pastel gradient
   mesh behind product imagery, a lavender band for company pages and an
   inkwell-dark band for enterprise sections.
   Heading resets use :where() so a single-class rule can still override them.
*/
.ud-md{--md-ink:var(--color-text,#0a0a0b);--md-muted:var(--color-muted,#8e8e98);--md-body:color-mix(in srgb,var(--md-ink) 74%,transparent);--md-line:color-mix(in srgb,var(--md-ink) 11%,transparent);--md-tint:var(--color-surface,#f5f5fb);--md-lilac:color-mix(in srgb,var(--color-accent,#8ea2f5) 46%,#fff);--md-dark:var(--color-secondary,#0b1020);--md-r:14px;color:var(--md-body);font-family:var(--font-body,inherit);font-size:14.5px;line-height:1.6}
.ud-md :where(h1,h2,h3,h4){margin:0;font-family:var(--font-heading,inherit);color:var(--md-ink);letter-spacing:-.025em;font-weight:var(--heading-weight,600)}
.ud-md :where(p){margin:0}
.ud-md :where(ul){margin:0;padding:0;list-style:none}
.ud-md :where(a){color:inherit;text-decoration:none}

.ud-md-title{font-size:clamp(26px,3.6cqi,42px);line-height:1.14;display:grid;gap:1px}
.ud-md-title--xl{font-size:clamp(32px,5cqi,60px)}
.ud-md-title__a{display:block;color:var(--md-ink)}
.ud-md-title__b{display:block;color:var(--md-muted)}
.ud-md-eyebrow{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--md-muted)}
.ud-md-lead{max-width:56ch;color:var(--md-body);font-size:14.5px;line-height:1.65}
.ud-md-head{display:grid;gap:14px;justify-items:start}
.ud-md-head--center{justify-items:center;text-align:center}
.ud-md-head--center .ud-md-lead{margin-inline:auto}

.ud-md-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:999px;font-size:13.5px;font-weight:500;line-height:1.35;transition:background .16s ease,border-color .16s ease,color .16s ease,transform .12s ease}
.ud-md-btn:active{transform:translateY(1px)}
.ud-md-btn--dark{background:var(--md-ink);color:#fff}
.ud-md-btn--dark:hover{background:color-mix(in srgb,var(--md-ink) 86%,#fff)}
.ud-md-btn--outline{background:#fff;color:var(--md-ink);border:1px solid var(--md-line)}
.ud-md-btn--outline:hover{border-color:color-mix(in srgb,var(--md-ink) 22%,transparent)}
.ud-md-btn--light{background:#fff;color:var(--md-ink)}
.ud-md-buttons{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.ud-md-head--center+.ud-md-buttons{justify-content:center}

.ud-md-link{display:inline-flex;align-items:center;gap:5px;color:var(--md-ink);font-size:13px;font-weight:500}
.ud-md-link:hover{color:var(--md-body)}

.ud-md-logo{display:inline-flex;align-items:baseline;gap:7px;color:var(--md-ink);font-weight:700;font-size:19px;letter-spacing:-.03em}
.ud-md-logo__dot{width:15px;height:15px;border-radius:999px;background:currentColor;flex:none;align-self:center}
.ud-md-logo__note{font-size:11px;font-weight:400;color:var(--md-muted);letter-spacing:0}
.ud-md-logo--light{color:#fff}
.ud-md-logo__img{position:relative;display:inline-flex}

.ud-md-ticks{display:grid;gap:8px}
.ud-md-ticks li{display:flex;align-items:flex-start;gap:8px;font-size:13.5px;color:var(--md-body)}
.ud-md-ticks svg{color:var(--md-ink);flex:none;margin-top:3px}

/* pastel gradient mesh behind product imagery */
.ud-md-mesh{position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit}
.ud-md-mesh--violet{background:radial-gradient(60% 70% at 22% 22%,color-mix(in srgb,var(--color-primary,#6d5ef0) 34%,#fff),transparent 70%),radial-gradient(55% 62% at 79% 32%,color-mix(in srgb,var(--color-accent,#8ea2f5) 30%,#fff),transparent 72%),linear-gradient(140deg,color-mix(in srgb,var(--color-primary,#6d5ef0) 14%,#fff),color-mix(in srgb,var(--color-accent,#8ea2f5) 7%,#fff))}
.ud-md-mesh--rose{background:radial-gradient(60% 70% at 22% 22%,color-mix(in srgb,var(--color-accent,#f0709e) 32%,#fff),transparent 70%),radial-gradient(55% 62% at 79% 32%,color-mix(in srgb,var(--color-primary,#f0996d) 28%,#fff),transparent 72%),linear-gradient(140deg,color-mix(in srgb,var(--color-accent,#f0709e) 14%,#fff),color-mix(in srgb,var(--color-primary,#f0996d) 7%,#fff))}
.ud-md-mesh--sky{background:radial-gradient(60% 70% at 22% 22%,color-mix(in srgb,var(--color-accent,#6d9df0) 32%,#fff),transparent 70%),radial-gradient(55% 62% at 79% 32%,color-mix(in srgb,var(--color-primary,#6d5ef0) 28%,#fff),transparent 72%),linear-gradient(140deg,color-mix(in srgb,var(--color-accent,#6d9df0) 14%,#fff),color-mix(in srgb,var(--color-primary,#6d5ef0) 7%,#fff))}
.ud-md-mesh--mint{background:radial-gradient(60% 70% at 22% 22%,color-mix(in srgb,var(--color-accent,#39cf9a) 32%,#fff),transparent 70%),radial-gradient(55% 62% at 79% 32%,color-mix(in srgb,var(--color-primary,#5ec2f0) 28%,#fff),transparent 72%),linear-gradient(140deg,color-mix(in srgb,var(--color-accent,#39cf9a) 14%,#fff),color-mix(in srgb,var(--color-primary,#5ec2f0) 7%,#fff))}
.ud-md-mesh--lilac{background:radial-gradient(60% 70% at 22% 22%,color-mix(in srgb,var(--color-primary,#8b74ef) 28%,#fff),transparent 70%),radial-gradient(55% 62% at 79% 32%,color-mix(in srgb,var(--color-accent,#c974ef) 26%,#fff),transparent 72%),linear-gradient(140deg,color-mix(in srgb,var(--color-primary,#8b74ef) 14%,#fff),color-mix(in srgb,var(--color-accent,#c974ef) 7%,#fff))}

/* ---- navbar */
.ud-md-nav{position:relative;z-index:60;background:var(--color-background,#fff);border-bottom:1px solid var(--md-line)}
.ud-md-nav--sticky.ud-md-nav--sticky{position:sticky;top:0}
.ud-md-nav__bar{display:flex;align-items:center;gap:20px;padding-block:14px}
.ud-md-nav__links{display:flex;align-items:center;gap:22px;margin-inline:auto}
.ud-md-nav__link{display:inline-flex;align-items:center;gap:4px;font-size:13.5px;color:var(--md-ink)}
.ud-md-nav__link:hover{color:var(--md-body)}
.ud-md-nav__end{display:flex;align-items:center;gap:14px}
.ud-md-nav__plain{font-size:13.5px;color:var(--md-ink)}
.ud-md-nav__toggle{display:none;place-items:center;width:40px;height:40px;margin-right:-8px;border:0;border-radius:10px;background:transparent;color:inherit;cursor:pointer}
.ud-md-nav__toggle:hover{background:var(--md-tint)}
/* Only visible once the row collapses into the drawer. */
.ud-md-nav__drawerlink{display:none;font-size:14px;color:var(--md-ink);padding-block:6px}

/* ---- hero */
.ud-md-hero{padding-block:0}
.ud-md-hero__grid{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:0}
/* The hero bleeds full width, so the copy column is pushed right until its left edge lands on the same gutter as the navbar inside .ud-container. */
.ud-md-hero__copy{display:grid;gap:16px;justify-items:start;padding-block:clamp(48px,7cqi,104px);padding-inline-end:clamp(20px,4cqi,48px);width:100%;max-width:calc(var(--ud-max,1160px) / 2 - clamp(20px,4cqi,40px));margin-left:auto}
.ud-md-hero__panel{position:relative;overflow:hidden;min-height:min(560px,60cqi);display:grid;place-items:center;padding:34px}
.ud-md-hero__img{position:relative;z-index:1;width:100%}
.ud-md-hero__img img{border-radius:10px;box-shadow:0 30px 70px -40px color-mix(in srgb,var(--md-ink) 50%,transparent)}

/* ---- page header */
.ud-md-pagehead--lilac{background:var(--md-lilac)}
.ud-md-pagehead--tint{background:var(--md-tint)}
.ud-md-pagehead .ud-md-buttons{justify-content:center;margin-top:18px}

/* ---- logo rail */
.ud-md-logos{padding-block:26px;border-block:1px solid var(--md-line)}
.ud-md-logos__title{text-align:center;color:var(--md-muted);font-size:12.5px;margin-bottom:14px}
/* The rail scrolls left forever. Two identical tracks sit side by side and both slide one track-width, so the seam never shows. */
.ud-md-logos__viewport{display:flex;overflow-x:auto;scrollbar-width:none}
.ud-md-logos__viewport::-webkit-scrollbar{display:none}
.ud-md-logos__viewport.is-scrolling{overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
.ud-md-logos__rail{display:flex;align-items:center;gap:46px;padding-inline:23px;flex:none}
.ud-md-logos__viewport:not(.is-scrolling) .ud-md-logos__rail{padding-inline:clamp(20px,4cqi,40px)}
/* Each track must span at least the viewport: translating one track-width only hides the seam when that width covers the visible strip. */
.ud-md-logos__viewport.is-scrolling .ud-md-logos__rail{min-width:100%;justify-content:space-around;animation:ud-md-marquee var(--md-marquee,34s) linear infinite}
.ud-md-logos__ghost{display:inline-flex;align-items:center}
.ud-md-logos__viewport.is-scrolling:hover .ud-md-logos__rail{animation-play-state:paused}
@keyframes ud-md-marquee{from{transform:translateX(0)}to{transform:translateX(-100%)}}
@media (prefers-reduced-motion:reduce){.ud-md-logos__viewport.is-scrolling .ud-md-logos__rail{animation:none}.ud-md-logos__viewport.is-scrolling{overflow-x:auto;mask-image:none}}
.ud-md-logos__word{flex:none;font-size:17px;font-weight:600;color:var(--md-ink);letter-spacing:-.02em;opacity:.78}
.ud-md-logos__img{flex:none;width:96px}

/* ---- bento */
.ud-md-bento__grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px;margin-top:42px}
.ud-md-bento__card{grid-column:span 2;display:flex;flex-direction:column;gap:6px;padding:22px;border:1px solid var(--md-line);border-radius:var(--md-r);background:var(--md-tint);transition:border-color .18s ease,transform .18s ease}
.ud-md-bento__card:hover{border-color:color-mix(in srgb,var(--md-ink) 20%,transparent);transform:translateY(-2px)}
.ud-md-bento__card.is-wide{grid-column:span 4}
.ud-md-bento__title{font-size:15px;font-weight:600}
.ud-md-bento__text{font-size:12.5px;color:var(--md-body);line-height:1.55}
.ud-md-bento__frame{position:relative;overflow:hidden;border-radius:10px;margin-top:14px;min-height:168px;display:grid;place-items:center;padding:16px}
.ud-md-bento__frame img{position:relative;z-index:1;border-radius:8px}

/* ---- stats */
.ud-md-stats--tint{background:var(--md-tint)}
.ud-md-stats--dark{background:var(--md-dark)}
.ud-md-stats__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;text-align:center;padding-block:8px}
.ud-md-stat__value{font-size:clamp(24px,3.2cqi,34px);font-weight:600;color:var(--md-ink);letter-spacing:-.03em}
.ud-md-stat__label{margin-top:3px;font-size:12.5px;color:var(--md-muted)}
.ud-md-stats--dark .ud-md-stat__value{color:#fff}
.ud-md-stats--dark .ud-md-stat__label{color:rgba(255,255,255,.7)}

/* ---- case tiles */
.ud-md-cases__top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:24px}
.ud-md-cases__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.ud-md-case{display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:var(--md-r);min-height:300px;background:var(--md-tint);color:var(--md-ink);transition:transform .18s ease}
.ud-md-case:hover{transform:translateY(-3px)}
.ud-md-case__brand{font-size:15px;font-weight:700;letter-spacing:-.02em}
.ud-md-case__text{font-size:12.5px;line-height:1.5}
.ud-md-case__img{margin-top:auto}
.ud-md-case__img img{border-radius:8px}

/* ---- split */
.ud-md-split__grid{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center}
.ud-md-split__copy{display:grid;gap:16px;justify-items:start}
.ud-md-split--reverse .ud-md-split__frame{order:-1}
.ud-md-split__frame{position:relative;overflow:hidden;border-radius:var(--md-r);min-height:300px;display:grid;place-items:center;padding:26px}
.ud-md-split__frame img{position:relative;z-index:1;border-radius:10px}

/* ---- pillars */
.ud-md-pillars__grid{display:grid;grid-template-columns:repeat(var(--ud-cols,4),minmax(0,1fr));gap:14px;margin-top:34px;text-align:left}
.ud-md-pillars__grid[data-cols="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.ud-md-pillars__grid[data-cols="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.ud-md-pillar{display:grid;gap:8px;align-content:start;padding:22px;border:1px solid var(--md-line);border-radius:var(--md-r);background:var(--color-background,#fff);transition:border-color .18s ease}
.ud-md-pillar:hover{border-color:color-mix(in srgb,var(--md-ink) 20%,transparent)}
.ud-md-pillar__icon{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--md-tint);color:var(--md-ink)}
.ud-md-pillar__title{font-size:14px;font-weight:600}
.ud-md-pillar__text{font-size:12.5px;color:var(--md-body);line-height:1.55}

/* ---- pricing */
.ud-md-pricing__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ud-md-plan{display:grid;gap:12px;align-content:start;padding:26px;border:1px solid var(--md-line);border-radius:var(--md-r);background:#fff}
.ud-md-plan--outlined{border-color:var(--md-ink)}
.ud-md-plan__name{font-size:24px;font-weight:600}
.ud-md-plan__text{font-size:13px;color:var(--md-body);line-height:1.6}
.ud-md-plan__tiers{display:grid;gap:0;border-top:1px solid var(--md-line)}
.ud-md-plan__tiers li{display:block;padding-block:10px;border-bottom:1px solid var(--md-line);font-size:13px}
.ud-md-plan__tierview{display:flex;align-items:center;justify-content:space-between;gap:12px}
.ud-md-plan__tierview strong{font-weight:600;color:var(--md-ink)}
.ud-md-plan__tierline{display:none}
.ud-editable .ud-md-plan__tierline,.ud-md-plan__tierline.ud-editable{display:block}
.ud-editable~.ud-md-plan__tierview{display:none}
.ud-md-plan .ud-md-btn{justify-content:center;margin-top:4px}
.ud-md-plan__note{text-align:center;font-size:11.5px;color:var(--md-muted)}

/* ---- comparison matrix */
.ud-md-matrix{padding:34px;border-radius:20px;background:var(--md-dark);color:#fff}
.ud-md-matrix__title{margin-bottom:22px;text-align:center}
.ud-md-matrix__title .ud-md-title__a{color:#fff}
.ud-md-matrix__title .ud-md-title__b{color:rgba(255,255,255,.6)}
.ud-md-matrix__scroll{overflow-x:auto}
.ud-md-matrix__table{width:100%;border-collapse:collapse;font-size:12.5px}
.ud-md-matrix__table th,.ud-md-matrix__table td{padding:11px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.86);font-weight:400}
.ud-md-matrix__table thead th{color:#fff;font-weight:600;font-size:12px}
.ud-md-matrix__group th{background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;font-weight:600}
.ud-md-matrix__cell{text-align:center;width:130px}
.ud-md-matrix__dot{display:inline-block;width:9px;height:9px;border-radius:999px;background:var(--color-accent,#8ea2f5)}
.ud-md-matrix__none{display:inline-block;width:9px;height:1px;background:rgba(255,255,255,.25)}
.ud-md-matrix__note{font-size:11.5px;color:rgba(255,255,255,.7)}
.ud-md-matrix__rowline{display:none}
.ud-md-matrix__rowline.ud-editable{display:block}
.ud-md-matrix__rowline.ud-editable~.ud-md-matrix__rowview{display:none}

/* ---- faq */
.ud-md-faq__list{width:100%;max-width:760px;margin:30px auto 0;text-align:left}
.ud-md-faq__row{border-bottom:1px solid var(--md-line)}
.ud-md-faq__head{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:18px 0;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:left}
.ud-md-faq__q{font-size:14px;font-weight:600;color:var(--md-ink)}
.ud-md-faq__sign{color:var(--md-muted);flex:none}
.ud-md-faq__a{padding-bottom:18px;font-size:13.5px;color:var(--md-body);line-height:1.7}

/* ---- resources */
.ud-md-resources__list{display:grid;gap:34px;margin-top:38px;text-align:left}
.ud-md-resource{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.ud-md-resource.is-reverse .ud-md-resource__img{order:1}
.ud-md-resource__img img{border-radius:10px}
.ud-md-resource__copy{display:grid;gap:12px;justify-items:start}
.ud-md-resource__title{font-size:22px;font-weight:600}
.ud-md-resource__text{font-size:13.5px;color:var(--md-body);line-height:1.65}

/* ---- open positions */
.ud-md-positions__list{width:100%;max-width:860px;margin:30px auto 0;display:grid;gap:26px;text-align:left}
.ud-md-positions__dept{font-size:13.5px;font-weight:600;margin-bottom:6px}
.ud-md-position{display:block;padding-block:13px;border-top:1px solid var(--md-line);font-size:13.5px}
.ud-md-position__view{display:flex;align-items:center;justify-content:space-between;gap:14px}
.ud-md-position__title{color:var(--md-ink)}
.ud-md-position__place{display:inline-flex;align-items:center;gap:8px;color:var(--md-muted);font-size:12.5px}
.ud-md-position__line{display:none}
.ud-md-position__line.ud-editable{display:block}
.ud-md-position__line.ud-editable~.ud-md-position__view{display:none}

/* ---- statement band */
.ud-md-band--lilac{background:var(--md-lilac)}
.ud-md-band--tint{background:var(--md-tint)}
.ud-md-band--dark{background:var(--md-dark)}
.ud-md-band--dark .ud-md-title__a{color:#fff}
.ud-md-band--dark .ud-md-title__b,.ud-md-band--dark .ud-md-lead{color:rgba(255,255,255,.72)}
.ud-md-band .ud-md-buttons{justify-content:center;margin-top:16px}

/* ---- closing cta */
.ud-md-cta{background:var(--md-tint)}
.ud-md-cta .ud-md-buttons{justify-content:center;margin-top:18px}

/* ---- long copy */
.ud-md-rich__body{font-size:14px;line-height:1.75;color:var(--md-body)}
.ud-md-rich__body h2{margin:28px 0 10px;font-size:22px;font-weight:600}
.ud-md-rich__body h3{margin:22px 0 8px;font-size:16px;font-weight:600}
.ud-md-rich__body p{margin:0 0 13px}
.ud-md-rich__body a{color:var(--md-ink);text-decoration:underline}

/* ---- stepped contact */
.ud-md-contact__panel{width:100%;max-width:570px;margin:34px auto 0;text-align:left}
.ud-md-steps{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:14px;margin-bottom:26px}
.ud-md-step{display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:2px solid var(--md-line);font-size:12.5px;color:var(--md-muted)}
.ud-md-step.is-active{border-color:var(--md-ink);color:var(--md-ink)}
.ud-md-step__dot{width:12px;height:12px;border-radius:999px;border:1.5px solid currentColor;flex:none}
.ud-md-step.is-active .ud-md-step__dot{border-color:var(--md-ink)}
.ud-md-contact__panel .ud-form{display:grid;gap:16px}
.ud-md-contact__fine{margin-top:14px;font-size:11.5px;color:var(--md-muted)}

/* ---- footer */
.ud-md-footer{padding-block:56px 30px;background:var(--color-background,#fff);border-top:1px solid var(--md-line)}
.ud-md-footer__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) 1.2fr;gap:28px}
.ud-md-footer h3{margin-bottom:14px;font-size:12.5px;font-weight:600;color:var(--md-ink)}
.ud-md-footer__col ul{display:grid;gap:9px}
.ud-md-footer__col a{font-size:12.5px;color:var(--md-body)}
.ud-md-footer__col a:hover{color:var(--md-ink)}
.ud-md-footer__brand{display:grid;gap:12px;align-content:start;justify-items:start}
.ud-md-footer__tagline{font-size:13px;color:var(--md-body);max-width:24ch}
.ud-md-footer__social{display:flex;gap:12px;color:var(--md-body)}
.ud-md-footer__social a:hover{color:var(--md-ink)}
.ud-md-footer__copy{font-size:11.5px;color:var(--md-muted)}

@container udpage (max-width:900px){
  .ud-md-hero__grid,.ud-md-split__grid,.ud-md-resource{grid-template-columns:1fr}
  .ud-md-split--reverse .ud-md-split__frame,.ud-md-resource.is-reverse .ud-md-resource__img{order:0}
  .ud-md-hero__panel{min-height:340px}
  .ud-md-bento__card,.ud-md-bento__card.is-wide{grid-column:span 3}
  .ud-md-cases__grid,.ud-md-pillars__grid,.ud-md-pillars__grid[data-cols="3"]{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-md-footer__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ud-md-nav__links{display:none}
  .ud-md-nav__links.is-open{display:flex;position:absolute;top:100%;left:12px;right:12px;margin-top:6px;flex-direction:column;align-items:stretch;gap:2px;padding:12px;border-radius:12px;background:var(--color-background,#fff);border:1px solid var(--md-line);box-shadow:0 18px 40px -28px color-mix(in srgb,var(--md-ink) 60%,transparent);z-index:70}
  .ud-md-nav__links.is-open .ud-md-nav__link{padding-block:8px}
  .ud-md-nav__links.is-open .ud-md-nav__drawerlink{display:block}
  .ud-md-nav__toggle{display:inline-grid}
  /* The wordmark note and the plain Docs link both live in the drawer at this
     width; keeping them in the row leaves no room for the primary action. */
  .ud-md-logo__note{display:none}
  .ud-md-nav__plain{display:none}
  .ud-md-nav__bar{gap:12px}
}
@container udpage (max-width:600px){
  .ud-md-bento__card,.ud-md-bento__card.is-wide{grid-column:span 6}
  .ud-md-stats__grid,.ud-md-cases__grid,.ud-md-pillars__grid,.ud-md-pillars__grid[data-cols="2"],.ud-md-pricing__grid,.ud-md-footer__grid{grid-template-columns:1fr}
  .ud-md-steps{grid-auto-flow:row}
  .ud-md-matrix{padding:20px}
}


`

/**
 * Injects the shared block stylesheet. Server-safe: renders a plain <style> tag,
 * so it works in Next.js Server Components and in the builder canvas alike.
 */
export function BlockStyles() {
  return <style data-uidesired-blocks="1" dangerouslySetInnerHTML={{ __html: blockCss }} />
}
