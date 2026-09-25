# Beeskilled Web Development Internship

## Internship Overview

- **Organization:** Beeskilled
- **Role:** Web Development Intern
- **Duration:** 26 May 2026 – 7 July 2026

This repository consolidates the four web development projects developed during the Beeskilled Web Development Internship. Each project demonstrates core front-end engineering fundamentals, responsive design principles, clean architecture, and practical JavaScript implementations without relying on external UI frameworks.

---

## Projects

### 1. [Portfolio](./Portfolio/)
A personal portfolio website showcasing developer profile, skills, education, projects, achievements, and contact information.
- **Key Features:** Hero section with typewriter animation, glassmorphism sticky navigation bar, mobile-responsive menu, timeline view for education and experience, skills catalog, project highlights, and resume view/download.
- **Folder:** [`Portfolio/`](./Portfolio/)

### 2. [Weather App](./Weather-App/)
A real-time weather forecasting web application with an immersive glassmorphism interface.
- **Key Features:** Worldwide city search powered by the OpenWeatherMap API, current location weather via Geolocation API, detailed metrics (temperature, feels-like, humidity, wind speed), temperature unit toggle (°C/°F), condition-adaptive Unsplash background visuals, search history, and pinned locations persisted in `localStorage`. Includes a Netlify serverless function to securely proxy API requests.
- **Folder:** [`Weather-App/`](./Weather-App/)

### 3. [EduTrack](./EduTrack/)
A client-side Student Management Dashboard built with zero external dependencies and a warm editorial design system.
- **Key Features:** Full CRUD operations for student records via modal forms, persistent data storage using `localStorage`, sortable data table with search and grade badges, daily attendance roster tracker, assignment progress tracker with circular SVG indicators, analytics overview with animated line chart, one-click CSV export via the Blob API, and customizable theme accents.
- **Folder:** [`EduTrack/`](./EduTrack/)

### 4. [Gallery Grid](./Gallery-Grid/)
An interactive, minimalist image gallery grid featuring cinematic interactions and zero third-party dependencies.
- **Key Features:** Multi-breakpoint responsive grid layout, cinematic hover effects with subtle blur and scale transitions, immersive fullscreen lightbox with blurred backdrop and thumbnail strip, category filtering (All, Nature, Cosmic, Urban, Abstract), keyboard navigation (Arrow keys and Escape), touch swipe gesture handling on mobile, and a favorites system persisted via `localStorage`.
- **Folder:** [`Gallery-Grid/`](./Gallery-Grid/)

---

## Technologies Used

The projects across this repository utilize the following technologies:

- **Markup & Semantics:** HTML5 (semantic layouts, forms, modals, tables, SVG elements)
- **Styling & Layout:** CSS3 (CSS Grid, Flexbox, CSS Custom Properties/Tokens, Glassmorphism, CSS Transitions & Keyframe Animations, Responsive Media Queries)
- **Programming & Logic:** JavaScript (ES6+ modular scripting, DOM manipulation, Event Handling, Keyboard & Touch Events)
- **Web APIs & Storage:** `Fetch API`, `localStorage API`, `Blob API`, `Geolocation API`
- **External APIs & Backend:** OpenWeatherMap API, Netlify Functions (Node.js serverless proxy)
- **Typography & Icons:** Google Fonts (Inter, DM Serif Display, Syne, DM Sans), Font Awesome 6
- **Hosting & Deployment:** Netlify, Git & GitHub

---

## Repository Structure

```
web_dev_intern/
│
├── README.md
├── LICENSE
│
├── Portfolio/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── assets/
│   ├── LICENSE
│   └── README.md
│
├── Weather-App/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── assets/
│   ├── netlify/
│   ├── netlify.toml
│   └── README.md
│
├── EduTrack/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── screenshots/
│   ├── LICENSE
│   └── README.md
│
└── Gallery-Grid/
    ├── index.html
    ├── style.css
    ├── script.js
    ├── images/
    └── README.md
```

Each project is self-contained and can be run independently by opening its `index.html` in any modern web browser or via a local static development server (such as VS Code Live Server). Detailed run instructions and documentation are available in each project's respective `README.md`.
