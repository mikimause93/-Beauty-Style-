# Beauty & Style — Premium Beauty Platform

A complete, professional **Beauty & Style** web platform built with HTML, CSS, and JavaScript. No build tools or dependencies required — open any HTML file directly in a browser.

## 🌟 Features

| Feature | Description |
|---|---|
| **Home / Landing** | Hero section, services overview, featured products, booking CTA, gallery, team, testimonials, blog highlights, newsletter |
| **Services** | Full catalog with filter tabs, service options with durations and pricing, direct booking links |
| **Online Booking** | 3-step booking wizard — service selection, stylist + time picker, personal details form |
| **Beauty Shop** | Product grid with category filters, search, sorting, quick-view modal, add to cart, wishlist |
| **Gallery / Portfolio** | Masonry layout, category filters, lightbox modal with booking CTA |
| **Team Profiles** | Detailed expert cards with certifications, stats, specialties, booking buttons |
| **Blog** | Featured article, 6-column article grid, sidebar with categories, popular posts |
| **About Us** | Company story, core values, milestone timeline, awards & recognition |
| **Contact** | Contact form, opening hours, map placeholder, social links |
| **Login** | Email/password form, social sign-in buttons, password toggle |
| **Register** | Registration form with real-time password strength indicator |
| **User Profile** | Dashboard, appointments history, orders, wishlist, account settings |

## 🗂 Project Structure

```
/
├── index.html              # Main landing page
├── css/
│   ├── style.css           # Main stylesheet (CSS variables, components, layout)
│   └── responsive.css      # Responsive breakpoints (mobile, tablet, desktop)
├── js/
│   ├── main.js             # Core JS (navbar, scroll, filters, wishlist, cart, toast)
│   ├── booking.js          # Booking wizard logic
│   └── shop.js             # Shop search, sorting, quick view
└── pages/
    ├── services.html       # Services catalog
    ├── booking.html        # Appointment booking wizard
    ├── shop.html           # Product shop with filters
    ├── gallery.html        # Portfolio gallery (masonry layout)
    ├── team.html           # Team member profiles
    ├── blog.html           # Blog articles with sidebar
    ├── about.html          # About / company story
    ├── contact.html        # Contact form & info
    ├── login.html          # Sign in page
    ├── register.html       # Account creation page
    └── profile.html        # User account dashboard
```

## 🎨 Design System

- **Primary Color:** `#C9A96E` (Gold/Champagne)
- **Accent:** `#E8A0B4` (Rose Pink)
- **Dark:** `#2C2C2C` (Charcoal)
- **Background:** `#FAF8F6` (Warm White)
- **Typography:** Playfair Display (headings) + Lato (body)
- **Fully responsive** — mobile, tablet, desktop
- **Accessible** — ARIA roles, keyboard navigation, screen reader support

## 🚀 Getting Started

No installation or build tools required.

**Option 1 — Open directly:**
```bash
open index.html
```

**Option 2 — Local server (recommended for full functionality):**
```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080` in your browser.

## 📦 Tech Stack

- **HTML5** — Semantic markup, ARIA accessibility
- **CSS3** — Custom properties, CSS Grid, Flexbox, animations
- **Vanilla JavaScript** — No frameworks, no dependencies
- **Google Fonts** — Playfair Display + Lato

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

