# Usable Landing Page

A beautiful, responsive landing page for Usable - the shared memory platform for development teams. Built with vanilla HTML, CSS, and JavaScript following Orlando's design philosophy and BEM methodology.

## 🎨 Design Features

- **Usable Nudibranch Mascot**: Custom CSS art featuring the friendly sea slug character with distinctive blue and orange color scheme
- **Responsive Design**: Mobile-first approach with fluid typography and flexible layouts
- **Dark/Light Theme**: Theme switching with localStorage persistence and system preference detection
- **Accessibility-First**: WCAG 2.1 AA+ compliance with keyboard navigation and screen reader support
- **Performance Optimized**: Vanilla technologies only, no frameworks or heavy dependencies

## 🚀 Quick Start

1. **Clone or download** the project files
2. **Open `index.html`** in your web browser
3. **Start developing** - no build process required!

## 📁 Project Structure

```
usable-landing-page/
├── index.html              # Main landing page
├── styles/
│   └── main.css           # Complete stylesheet with design system
├── scripts/
│   ├── main.js            # Main JavaScript functionality
│   └── theme.js           # Theme switching system
└── README.md              # This file
```

## 🎯 Key Sections

- **Hero Section**: Features the Usable nudibranch mascot with main value proposition
- **Target Audience**: Perfect for development teams of all sizes
- **Problem/Solution**: The lost context problem and Usable's solution
- **Knowledge Organization**: Fragment types and customization
- **How It Works**: Three simple steps to get started
- **Platform Features**: Complete team knowledge platform capabilities
- **Integration**: Connect with your favorite tools
- **Pricing**: Owner-centric pricing that scales
- **FAQ**: Frequently asked questions
- **Call to Action**: Ready to get started

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563eb` (Royal Blue from antennae)
- **Primary Orange**: `#f97316` (Vibrant Orange from patterns)
- **Light Blue**: `#87ceeb` (Sky Blue background)
- **White**: `#ffffff` (Pure white body)

### Typography
- **Font Family**: Inter (with system font fallbacks)
- **Fluid Typography**: Responsive font sizes using CSS clamp()
- **Font Weights**: Light (300) to Extrabold (800)

### Spacing System
- **Base Unit**: 4px (0.25rem)
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px

## 🔧 Technical Features

### CSS Architecture
- **BEM Methodology**: Block__Element--Modifier naming convention
- **CSS Custom Properties**: Theme variables for consistent design
- **Mobile-First**: Responsive design starting from mobile
- **Grid & Flexbox**: Modern layout techniques

### JavaScript Features
- **Theme Management**: Light/dark mode with localStorage
- **Smooth Scrolling**: Anchor link navigation
- **Mobile Menu**: Responsive navigation with animations
- **FAQ Accordion**: Interactive FAQ section
- **Accessibility**: Keyboard navigation and ARIA support

### Performance
- **No Dependencies**: Pure vanilla technologies
- **Optimized Assets**: Minimal file sizes
- **Progressive Enhancement**: Works without JavaScript
- **Print Styles**: Optimized for printing

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Accessibility**: Screen readers, keyboard navigation, high contrast mode

## 🎨 Customization

### Colors
Update the CSS custom properties in `styles/main.css`:

```css
:root {
  --color-primary-blue: #2563eb;
  --color-primary-orange: #f97316;
  --color-primary-light-blue: #87ceeb;
}
```

### Typography
Modify font variables:

```css
:root {
  --font-family-primary: 'Your Font', sans-serif;
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
}
```

### Spacing
Adjust the spacing scale:

```css
:root {
  --spacing-4: 1rem;      /* 16px */
  --spacing-8: 2rem;      /* 32px */
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: ≥ 1024px

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG 2.1 AA+ compliant
- **Reduced Motion**: Respects user preferences

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:

- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Push to a repository
- **AWS S3**: Upload files to S3 bucket

### Local Development
Run a local server for development:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

## 🎨 Orlando's Design Philosophy

This landing page follows Orlando's design principles:

- **Consistency First**: Maintained design system across all components
- **Simplicity Over Complexity**: Clean, focused design without unnecessary effects
- **Accessibility First**: WCAG 2.1 AA+ compliance from the start
- **Vanilla Technologies Only**: No frameworks, just pure HTML, CSS, and JavaScript
- **Mobile-First Approach**: Design for mobile, enhance for larger screens
- **Performance Conscious**: Optimized for speed and user experience

## 📄 License

This project is created for Usable. All rights reserved.

## 🤝 Contributing

This is a static landing page project. For modifications:

1. Edit the HTML structure in `index.html`
2. Update styles in `styles/main.css`
3. Modify functionality in `scripts/` files
4. Test across different devices and browsers
5. Ensure accessibility compliance

---

**Built with ❤️ using Orlando's design philosophy and BEM methodology**

