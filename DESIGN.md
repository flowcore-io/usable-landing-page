---
name: Usable
description: Organisation-owned knowledge base and memory layer for AI tools.
colors:
  orange: "#fcaf2a"
  orange-dark: "#e09d1f"
  blue: "#347cbf"
  blue-light: "#93c5fd"
  neutral-50: "#f8fafc"
  neutral-200: "#e2e8f0"
  neutral-300: "#cbd5e1"
  neutral-400: "#94a3b8"
  neutral-600: "#64748b"
  neutral-900: "#1c2f40"
  success: "#10b981"
  warning: "#f59e0b"
  error: "#ef4444"
typography:
  display:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.1em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  2xl: "1.5rem"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
  32: "8rem"
  40: "10rem"
  48: "12rem"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.neutral-50}"
    rounded: "{rounded.lg}"
    padding: "1rem 2rem"
  button-secondary:
    backgroundColor: "{colors.neutral-50}"
    textColor: "{colors.orange}"
    rounded: "{rounded.lg}"
    padding: "1rem 2rem"
  badge-orange:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.neutral-900}"
    rounded: "{rounded.full}"
    padding: "0.25rem 1rem"
  card:
    backgroundColor: "{colors.neutral-50}"
    textColor: "{colors.neutral-900}"
    rounded: "{rounded.xl}"
    padding: "3rem"
---

# Design System: Usable

## 1. Overview

**Creative North Star: "Owned Memory, Visible Current"**

Usable is a brand site for an AI memory product, but it should not feel like generic AI infrastructure. The current system uses a dark sea-texture scene, blue navigation, warm orange actions, and the nudibranch mascot to make organisational memory feel owned, alive, and distinct.

The page rhythm alternates transparent sections over the texture with frosted dark overlays. This gives the site depth while keeping the content grounded. The strongest interface pattern is contrast: dark oceanic brand atmosphere, then blunt, high-contrast orange calls to action.

**Key Characteristics:**
- Dark, texture-led brand environment with light content and glass overlays.
- Orange is the action and emphasis color.
- Blue is navigation, links, focus, and trust support.
- Rounded controls and cards, but not pill-shaped everywhere.
- Practical marketing copy, with technical specificity kept below core value.

## 2. Colors

The palette is a committed blue/orange brand system over a dark blue-neutral base.

### Primary
- **Usable Orange** (#fcaf2a): Primary actions, badges, hero accent text, icon blocks, and conversion moments.
- **Burnt Action Orange** (#e09d1f): Hover or deeper action state when a darker orange is needed.

### Secondary
- **Trust Blue** (#347cbf): Links, focus states, secondary accents, borders, and trust cues.
- **Bright Tool Blue** (#93c5fd): Dark-mode link and border support where normal blue needs more luminance.

### Neutral
- **Mist White** (#f8fafc): Main text on dark, light card surfaces, and on-accent text.
- **Slate Border** (#e2e8f0): Light-mode borders and quiet dividers.
- **Muted Slate** (#94a3b8): Disabled and low-emphasis UI.
- **Deep Memory Navy** (#1c2f40): Body background, dark surfaces, overlay tint, and primary text in light contexts.

### Named Rules

**The Orange Means Action Rule.** Orange is for primary CTAs, badges, feature icons, and key brand emphasis. Do not use it as ambient decoration.

**The Texture Needs Air Rule.** Alternate transparent sections with frosted sections. Do not stack glass panels directly unless the code includes an alternation guard.

## 3. Typography

**Display Font:** Hanken Grotesk with system sans fallbacks
**Body Font:** Hanken Grotesk with system sans fallbacks
**Label/Mono Font:** SF Mono, Fira Code, Fira Mono, Roboto Mono, Courier New

**Character:** The type system is blunt, digital, and work-focused. Hanken Grotesk carries most of the interface with a slightly more distinctive, Nordic-functional tone than default SaaS typography. Outfit appears only for the Usable wordmark and brand mentions.

### Hierarchy
- **Display** (800, `var(--text-6xl)` or hero clamp, 1.1): Hero statements and large page headers.
- **Headline** (800, `var(--text-5xl)`, 1.2): Section titles and major marketing breaks.
- **Title** (800, `var(--text-xl)`, 1.2): Card titles, feature names, product page modules.
- **Body** (400 to 500, `var(--text-base)` to `var(--text-xl)`, 1.6 to 1.7): Paragraphs and descriptions, max line length around 65 to 75ch for prose.
- **Label** (700, `var(--text-xs)` to `var(--text-sm)`, 0.05em to 0.1em): Badges, uppercase CTA labels, compact nav labels.

### Named Rules

**The One Sans Rule.** Use Hanken Grotesk for page UI and prose. Use Outfit only when the word "Usable" needs brand-logo tone.

## 4. Elevation

The system uses tonal layering first, shadows second. The default page depth comes from a fixed sea texture, dark overlay, transparent sections, and frosted sections. Cards use modest shadows in light contexts and heavier dark shadows only when they need to separate from dark surfaces.

### Shadow Vocabulary
- **Small Surface** (`0 1px 2px 0 var(--black-05)`): Subtle utility surfaces.
- **Card Lift** (`0 4px 16px var(--black-06)`): Light cards in feature, pricing, and use-case grids.
- **Dark Card Lift** (`0 12px 32px var(--black-30)`): Dark-mode cards on deep surfaces.
- **Navigation Lift** (`0 4px 30px var(--color-neutral-900-08)`): Fixed navigation separation.
- **Dropdown Lift** (`0 8px 24px var(--black-12)`): Menus above the nav and page content.

### Named Rules

**The Surface Before Shadow Rule.** Reach for overlay, tint, border, and section alternation before adding stronger shadows.

## 5. Components

### Buttons
- **Shape:** Rounded rectangle (`var(--radius-lg)`), larger hero/CTA buttons use `var(--radius-xl)`.
- **Primary:** Orange fill, Mist White or Deep Memory Navy text depending theme, uppercase label, 0.05em letter spacing, 2px border.
- **Secondary:** Light background, orange text and border, same uppercase treatment.
- **Hover / Focus:** Shine pseudo-element may sweep across primary/secondary buttons. Focus uses 3px Trust Blue outline with 2px offset.
- **Disabled:** Muted slate background and text with pointer interaction removed.

### Chips
- **Style:** Solid orange badges for feature labels and CTAs, blue-tinted badges for tags and categorisation.
- **State:** Use pill radius for badges and chips. Keep labels short and uppercase only for true labels.

### Cards / Containers
- **Corner Style:** `var(--radius-xl)` is the common card radius.
- **Background:** Light cards use translucent white. Dark cards use near-solid Deep Memory Navy.
- **Shadow Strategy:** Light cards use Card Lift. Dark cards use Dark Card Lift plus blue-light border.
- **Border:** Use blue at low opacity (`var(--color-blue-10)` or `var(--color-blue-light-18)`).
- **Internal Padding:** Feature cards use `var(--space-12)`, standard content cards use `var(--space-8)`.

### Inputs / Fields
- **Style:** Follow the button/card vocabulary: rounded, clear border, neutral surface.
- **Focus:** 3px Trust Blue outline, 2px offset.
- **Error / Disabled:** Use status red for error and muted slate for disabled states.

### Navigation
- **Style:** Fixed 60px top nav with Bright Tool Blue background in light mode and Deep Memory Navy in dark mode.
- **Menus:** Dropdowns use rounded containers, subtle borders, and menu lift shadow.
- **Mobile:** Collapses to mobile controls while keeping CTA and theme control visible.

## 6. Do's and Don'ts

Do lead with "Your own knowledge base" and organisational ownership.

Do keep orange rare enough that every orange element feels clickable, important, or brand-defining.

Do alternate transparent texture-forward sections with frosted dark sections.

Do use real customer logos and concrete proof when available.

Do preserve reduced-motion behavior and visible focus states.

Don't lead with MCP, RAG, vector databases, or architecture language above the fold.

Don't imply Usable thinks or decides.

Don't add side-stripe accent borders, gradient text, or decorative glass cards.

Don't use cards inside cards.

Don't let the sea texture reduce contrast behind text.
