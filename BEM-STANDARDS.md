# BEM Standards - Usable Landing Page

**Methodology**: Block Element Modifier (BEM)  
**Last Updated**: February 17, 2026  
**Maintained by**: Orlando

---

## 🎯 What is BEM?

BEM (Block Element Modifier) is a naming methodology for CSS classes that makes code more readable, maintainable, and scalable. It creates a clear relationship between HTML and CSS.

---

## 📐 BEM Naming Convention

### Basic Structure
```
.block__element--modifier
```

- **Block**: Standalone component (e.g., `.nav`, `.hero`, `.footer`)
- **Element**: Part of a block (e.g., `.nav__link`, `.hero__title`)
- **Modifier**: Variation or state (e.g., `.btn--primary`, `.nav__link--active`)

---

## 🏗️ Blocks in This Project

### Primary Blocks

| Block | Purpose | File |
|-------|---------|------|
| `.nav` | Navigation header | `navbar.css` |
| `.hero` | Hero section | `hero.css` |
| `.footer` | Footer section | `footer.css` |
| `.btn` | Button component | `main.css` |
| `.theme-toggle` | Theme switcher | `theme-toggle.css` |
| `.card` | Card component | `main.css` |
| `.bokeh` | Background circles | `bokeh.css` |

### Feature Blocks

| Block | Purpose | File |
|-------|---------|------|
| `.features` | Features section | `features.css` |
| `.integrations` | Integrations grid | `integrations.css` |
| `.cta` | Call-to-action | `cta.css` |
| `.faq` | FAQ accordion | `faq.css` |
| `.testimonials` | Testimonial cards | `testimonials.css` |
| `.pricing` | Pricing section | `pricing.css` |

---

## 🔍 BEM Examples

### ✅ Correct BEM Usage

**Navigation Example:**
```html
<nav class="nav">
  <div class="nav__container">
    <a href="/" class="nav__logo">
      <img src="logo.png" alt="Logo" class="nav__logo-img">
    </a>
    <div class="nav__menu">
      <a href="#" class="nav__link">Link</a>
      <a href="#" class="nav__link nav__link--active">Active Link</a>
    </div>
  </div>
</nav>
```

```css
/* Block */
.nav { }

/* Elements */
.nav__container { }
.nav__logo { }
.nav__logo-img { }
.nav__menu { }
.nav__link { }

/* Modifier */
.nav__link--active { }
```

**Button Example:**
```html
<button class="btn btn--primary">Primary Button</button>
<button class="btn btn--secondary">Secondary Button</button>
<button class="btn btn--large">Large Button</button>
<button class="btn btn--primary btn--large">Large Primary</button>
```

```css
/* Block */
.btn { }

/* Modifiers */
.btn--primary { }
.btn--secondary { }
.btn--large { }
```

**Card Example:**
```html
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Title</h3>
  </div>
  <div class="card__body">
    <p class="card__text">Content</p>
  </div>
  <div class="card__footer">
    <button class="card__button btn btn--primary">Action</button>
  </div>
</div>
```

---

### ❌ Common BEM Mistakes

**DON'T: Chain elements**
```html
<!-- Wrong: element inside element -->
<div class="nav__menu__item__link">Link</div>
```
```html
<!-- Correct: flat structure -->
<div class="nav__menu-item">
  <a class="nav__link">Link</a>
</div>
```

**DON'T: Use generic class names**
```html
<!-- Wrong: not BEM-compliant -->
<span class="brand-text">Usable</span>
```
```html
<!-- Correct: utility prefix or BEM block -->
<span class="u-brand-text">Usable</span>
```

**DON'T: Mix naming conventions**
```html
<!-- Wrong: camelCase in BEM -->
<div class="nav__menuItem">Link</div>
```
```html
<!-- Correct: kebab-case for multi-word -->
<div class="nav__menu-item">Link</div>
```

---

## 🛠️ Utility Classes

Utilities are prefixed with `u-` to distinguish them from BEM blocks:

### Text Utilities
```css
.u-text-center { text-align: center; }
.u-text-left { text-align: left; }
.u-text-right { text-align: right; }
```

### Brand Utilities
```css
.u-brand-text { 
  color: var(--color-orange);
  font-weight: 700;
}
```

### Accessibility Utilities
```css
.u-sr-only { 
  /* Screen reader only */
  position: absolute;
  width: 1px;
  height: 1px;
  ...
}
```

---

## 📏 Naming Rules

### Use kebab-case for multi-word names
```css
/* Correct */
.hero__title-accent { }
.nav__dropdown-menu { }
.footer__social-button { }

/* Incorrect */
.hero__titleAccent { }
.nav__dropdownMenu { }
.footer__socialButton { }
```

### Be descriptive but concise
```css
/* Good */
.nav__link { }
.hero__title { }
.footer__social-icon { }

/* Too generic */
.nav__item { }
.hero__text { }
.footer__icon { }

/* Too verbose */
.nav__navigation-link-element { }
.hero__main-title-heading { }
```

### Modifiers describe state or variation
```css
/* State modifiers */
.nav__link--active { }
.btn--disabled { }
.modal--open { }

/* Variation modifiers */
.btn--primary { }
.btn--secondary { }
.btn--large { }
.btn--small { }
```

---

## 🎨 Theme Support

### Use data attributes for themes
```css
/* Light mode (default) */
.nav {
  background: var(--color-white);
}

/* Dark mode */
[data-theme="dark"] .nav {
  background: var(--color-black);
}
```

### Theme-specific modifiers
```html
<img src="logo-light.png" class="nav__logo-img nav__logo-img--light">
<img src="logo-dark.png" class="nav__logo-img nav__logo-img--dark">
```

```css
.nav__logo-img--dark {
  display: none;
}

[data-theme="dark"] .nav__logo-img--light {
  display: none;
}

[data-theme="dark"] .nav__logo-img--dark {
  display: block;
}
```

---

## 📦 File Organization

### One block per file
```
styles/components/
├── navbar.css      # .nav block
├── hero.css        # .hero block
├── footer.css      # .footer block
├── buttons.css     # .btn block
└── cards.css       # .card block
```

### File header template
```css
/* ===================================
   COMPONENT: [Component Name]
   BEM Block: [block-name]
   Purpose: [Brief description]
   Dependencies: main.css for CSS variables
   =================================== */
```

---

## ✅ BEM Checklist

Before committing CSS:
- [ ] Block name is descriptive and standalone
- [ ] Elements use double underscore (`__`)
- [ ] Modifiers use double dash (`--`)
- [ ] No element chaining (`.block__el1__el2`)
- [ ] Multi-word names use kebab-case
- [ ] Utilities are prefixed with `u-`
- [ ] File header includes BEM block name
- [ ] Theme variants use `[data-theme]` attribute

---

## 🔧 Migration Guide

### Converting existing code to BEM:

**Before:**
```html
<div class="brand-text">Usable</div>
```

**After:**
```html
<span class="u-brand-text">Usable</span>
```

**Before:**
```html
<button class="theme-toggle desktop">Toggle</button>
```

**After:**
```html
<button class="theme-toggle theme-toggle--desktop">Toggle</button>
```

---

## 📚 Resources

- [BEM Official Documentation](https://en.bem.info/methodology/)
- [BEM 101 by CSS-Tricks](https://css-tricks.com/bem-101/)
- [BEM by Example](https://sparkbox.com/foundry/bem_by_example)

---

**Questions about BEM?**

Orlando is happy to review your code and provide BEM guidance!

---

*Last Updated: February 17, 2026*  
*Orlando - Senior Landing Page Designer & Frontend Engineer*
