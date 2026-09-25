<div align="center">

# 🌧️ Weather Dashboard
### *Real-Time Weather Forecasting with a Modern Glassmorphism Experience*

<img src="./assets/weather-demo.gif" alt="Weather Dashboard Demo" width="100%">

<br>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API-orange?style=for-the-badge)
![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![Responsive](https://img.shields.io/badge/Responsive-Yes-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<br>

🌦️ ☁️ 🌧️ ⛈️ ❄️ 🌤️

</div>

---

## ✨ Overview

Weather Dashboard is a modern weather application that provides 
real-time weather information through an immersive 
glassmorphism-inspired interface.

Built using JavaScript and the OpenWeatherMap API, the application 
combines dynamic weather visuals, responsive design, and intuitive 
interactions to create a premium user experience.

🔗 **[Live Demo](https://weatheringboard.netlify.app)**

---

## 🌟 Features

### 🔍 Search Weather Worldwide
- Search by city name
- Real-time weather retrieval
- Instant API-powered updates
- Last 3 searches saved for quick access

### 🌡️ Live Weather Metrics
- Current Temperature
- Feels Like Temperature
- Humidity Levels
- Wind Speed
- Weather Conditions

### 🎨 Dynamic Experience
- Weather-specific Unsplash backgrounds
- Modern glassmorphism cards
- Responsive design (desktop dashboard + mobile card)
- Smooth pop-up card animations on every search

### ⚡ User-Friendly Features
- °C ↔ °F Unit Toggle
- 📌 Pin up to 5 Saved Locations
- 📍 Current Location via Geolocation
- Dynamic Weather Condition Messages
- Last Updated Timestamp
- Toast notifications (no browser alerts)

### 🔒 Secure Deployment
- API key hidden via Netlify Functions
- Environment variables — key never exposed in source code

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,javascript,git,github,netlify" />
</p>

| Technology          | Purpose                        |
| ------------------- | ------------------------------ |
| HTML5               | Structure                      |
| CSS3                | Styling & Animations           |
| JavaScript (ES6+)   | Application Logic              |
| Fetch API           | Data Retrieval                 |
| Async/Await         | Asynchronous API Calls         |
| Local Storage       | Search History & Saved Cities  |
| OpenWeatherMap API  | Weather Data                   |
| Netlify Functions   | Secure API Key Proxy           |
| Netlify Hosting     | Deployment                     |

---

## 📸 Dashboard Highlights

<div align="center">
  <h3>🖥️ Desktop View</h3>
  <img src="./assets/images/desktop-screenshot.png" alt="Desktop Weather Dashboard" width="100%">
  <br><br>
  <h3>📱 Mobile View</h3>
  <img src="./assets/images/mobile-screenshot.png.jpeg" alt="Mobile Weather Dashboard" width="45%">
</div>

### 💎 Glassmorphism Design
Elegant translucent cards with depth and clarity.

### 🌧 Dynamic Weather Backgrounds
Unsplash photos adapt automatically to live weather conditions —
clear sky, rain, thunderstorm, snow, mist and more.

### 📍 Saved Locations
Pin up to 5 frequently searched cities for quick one-click access.

### 🕘 Search History
Last 3 searched cities saved — click any to instantly reload.

### 🌡 Real-Time Insights
Temperature, humidity, wind speed, and feels-like at a glance.

### 📱 Fully Responsive
Desktop shows a full immersive dashboard.
Mobile shows a compact glassmorphism dashboard layout.

---

## 🚀 Installation (Local)

```bash
git clone https://github.com/soumi-saha12/weather_app.git
cd weather_app
```

Open with VS Code Live Server:
```bash
index.html → Right click → Open with Live Server
```

---

## 🔑 API Setup (Local)

Get your free API key from:
https://openweathermap.org/api

Add your key in `script.js`:
```javascript
const API_KEY = "YOUR_API_KEY";
```

---

## ☁️ Deployment (Netlify)

This project is deployed with the API key secured via 
Netlify Functions so it is never exposed in the frontend code.

**Steps:**
1. Push repo to GitHub
2. Connect to Netlify → Import from GitHub
3. Add environment variable in Netlify dashboard:
   - Key: `OPENWEATHER_API_KEY`
   - Value: your API key
4. Deploy — Netlify auto-builds

The app fetches weather through:
```
/.netlify/functions/weather?city=Kolkata&unit=metric
```

---

## 📂 Project Structure

```
weather-dashboard/
│
├── index.html
├── style.css
├── script.js
├── netlify.toml
│
├── netlify/
│   └── functions/
│       └── weather.js
│
├── assets/
│   ├── weather-demo.gif
│   ├── images/
│   └── icons/
│
└── README.md
```

---

## 🎯 Skills Demonstrated

✨ API Integration & JSON Parsing  
✨ Async/Await & Fetch API  
✨ DOM Manipulation & Event Handling  
✨ Local Storage (history + saved cities)  
✨ Responsive Design (desktop + mobile)  
✨ UI/UX Design & Glassmorphism  
✨ Error Handling & Loading States  
✨ Secure API Proxying via Netlify Functions  
✨ Git & GitHub Version Control  
✨ Netlify Deployment  

---

<div align="center">

### 🌙 Built with code, clouds, and coffee ☕

### Made by [Soumi Saha](https://soumi-saha.netlify.app)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/soumi-saha-523bba318)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/soumi-saha12)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-FF4FA3?style=for-the-badge)](https://soumi-saha.netlify.app)

</div>
