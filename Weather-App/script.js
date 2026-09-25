/**
 * Weather App - Dashboard & Mobile Card Orchestrator (ES6+)
 */

// API Configuration
const FUNCTION_URL = "/.netlify/functions/weather";
let currentUnit = "metric";
let currentCity = "";
let isLoading = false;
let lastWeatherData = null;
let lastWeatherDataUnit = "metric";

// Background Images Map (Unsplash, by weather condition)
const bgImages = {
    clear: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1600&q=80",
    clouds: "https://images.unsplash.com/photo-1499956827185-0d63ee78a910?w=1600&q=80",
    rain: "https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1600&q=80",
    drizzle: "https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1600&q=80",
    thunderstorm: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1600&q=80",
    snow: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1600&q=80",
    mist: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=1600&q=80",
    default: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1600&q=80"
};

// Condition Descriptions Map
const conditionComments = {
    clear: "Perfect clear skies ahead. Enjoy the sunshine!",
    clouds: "Expect overcast skies. Mildly cloudy today.",
    rain: "Expect wet conditions. Carry an umbrella.",
    drizzle: "Light rain showers expected. Stay prepared.",
    thunderstorm: "Thunderstorms nearby. Remain indoors if possible.",
    snow: "Winter conditions. Dress warmly and drive safe.",
    mist: "Reduced visibility due to mist or fog.",
    default: "Local weather conditions update."
};

// DOM References - Desktop Layout
const bgLayer = document.querySelector(".bg-layer");
const dConditionTitle = document.querySelector(".condition-title");
const dConditionDesc = document.querySelector(".condition-desc");
const dWeatherTag = document.querySelector(".weather-tag");
const dCityLabel = document.querySelector(".city-label");
const dTempDisplay = document.querySelector(".temp-display");
const dWeatherIconImg = document.querySelector(".icon-row img");
const heroIcon = document.querySelector(".hero-icon");
const dIconCondition = document.querySelector(".icon-condition");
const dDetailItems = document.querySelectorAll(".detail-card .detail-item .d-value");
const dStatItems = document.querySelectorAll(".bottom-stats .stat-item .stat-value");
const dLastUpdated = document.querySelector(".last-updated");
const dSearchInput = document.querySelector(".search-input");
const dSearchBtn = document.querySelector(".search-btn");
const dUnitToggle = document.querySelector(".main-card .unit-toggle");
const dGeoBtn = document.querySelector(".sidebar .geo-btn");
const dHistoryDropdown = document.querySelector(".search-history-dropdown");
const dLoadingSpinner = document.querySelector(".loading-spinner");
const dErrorMsg = document.querySelector(".error-msg");
const contentGrid = document.querySelector(".content-grid");

// DOM References - Mobile Layout
const mSearchInput = document.querySelector("#mobile-search-input");
const mSearchBtn = document.querySelector(".m-search-btn");
const mGeoBtn = document.querySelector(".geo-btn-mobile");
const mHistoryDropdown = document.querySelector("#mobile-history-dropdown");
const mLoadingSpinner = document.querySelector("#mobile-loading");
const mErrorMsg = document.querySelector("#mobile-error");

// Initialize application listeners
document.addEventListener("DOMContentLoaded", () => {
    const storedCity = localStorage.getItem("lastCity");
    if (storedCity && (storedCity.includes("Coord") || storedCity.includes("["))) {
        localStorage.removeItem("lastCity");
    }

    // Desktop search bindings
    if (dSearchBtn) {
        dSearchBtn.addEventListener("click", () => fetchWeather(dSearchInput.value, currentUnit));
    }
    if (dSearchInput) {
        dSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                fetchWeather(dSearchInput.value, currentUnit);
            }
        });
        dSearchInput.addEventListener("focus", () => renderDropdown("desktop"));
    }

    // Mobile search bindings
    if (mSearchBtn) {
        mSearchBtn.addEventListener("click", () => fetchWeather(mSearchInput.value, currentUnit));
    }
    if (mSearchInput) {
        mSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                fetchWeather(mSearchInput.value, currentUnit);
            }
        });
        mSearchInput.addEventListener("focus", () => renderDropdown("mobile"));
    }

    // Geolocation bindings
    if (dGeoBtn) {
        dGeoBtn.addEventListener("click", handleGeolocation);
    }
    if (mGeoBtn) {
        mGeoBtn.addEventListener("click", handleGeolocation);
    }

    // Unit toggles
    if (dUnitToggle) {
        dUnitToggle.addEventListener("click", toggleUnit);
    }
    const mobileToggles = document.querySelectorAll(".m-unit-toggle-btn, .m-unit-toggle");
    mobileToggles.forEach(toggle => {
        toggle.addEventListener("click", toggleUnit);
    });

    if (dHistoryDropdown) {
        dHistoryDropdown.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    // Click outside to dismiss dropdowns
    document.addEventListener("click", (e) => {
        const isDesktopInput = e.target === dSearchInput;
        const isDesktopDropdown = dHistoryDropdown && dHistoryDropdown.contains(e.target);
        const isMobileInput = e.target === mSearchInput;
        const isMobileDropdown = mHistoryDropdown && mHistoryDropdown.contains(e.target);

        if (!isDesktopInput && !isDesktopDropdown && dHistoryDropdown) {
            dHistoryDropdown.classList.remove("visible");
        }
        if (!isMobileInput && !isMobileDropdown && mHistoryDropdown) {
            mHistoryDropdown.classList.remove("visible");
        }
    });

    // Load last searched city
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity && !lastCity.includes("Coord") && !lastCity.includes("[")) {
        if (dSearchInput) dSearchInput.value = lastCity;
        if (mSearchInput) mSearchInput.value = lastCity;
        fetchWeather(lastCity, currentUnit);
    } else {
        // Default fallback to look premium on start
        fetchWeather("London", currentUnit);
    }

    renderSavedLocations();

    // Wire up pin buttons inside DOMContentLoaded
    const pinBtn = document.querySelector(".pin-btn");
    if (pinBtn) {
        pinBtn.addEventListener("click", () => handlePinClick(false));
    }

    const mPinBtn = document.querySelector(".m-pin-btn");
    if (mPinBtn) {
        mPinBtn.addEventListener("click", () => handlePinClick(true));
    }
});

/**
 * 1. Fetch weather by City name
 */
async function fetchWeather(city, unit) {
    if (isLoading) return;
    if (!city || !city.trim()) return;
    isLoading = true;

    showLoadingStates();

    try {
        let data;
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "[::1]" || window.location.port === "3000") {
            data = {
                name: city,
                sys: { country: "US" },
                weather: [{ main: "Clouds", description: "scattered clouds", icon: "03d" }],
                main: { temp: unit === "metric" ? 22 : 72, feels_like: unit === "metric" ? 21 : 70, humidity: 64 },
                wind: { speed: unit === "metric" ? 5 : 11 }
            };
        } else {
            const response = await fetch(
                `${FUNCTION_URL}?city=${encodeURIComponent(city.trim())}&unit=${unit}`
            );
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("404");
                }
                throw new Error("API_ERROR");
            }
            data = await response.json();
        }

        displayWeather(data);
        saveToHistory(data.name);
        localStorage.setItem("lastCity", data.name);
    } catch (error) {
        currentCity = "";
        if (error.message === "404") {
            showError("City not found. Please check the spelling.");
        } else {
            showError("Something went wrong. Try again.");
        }
    } finally {
        isLoading = false;
        hideLoadingStates();
    }
}

/**
 * 2. Display Weather details in desktop + mobile views
 */
function displayWeather(data) {
    lastWeatherData = data;
    lastWeatherDataUnit = currentUnit;
    const name = data.name;
    const country = data.sys.country;
    const mainCondition = data.weather[0].main;
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const temp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    currentCity = name;
    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";

    let windLabel;
    if (currentUnit === "metric") {
        windLabel = (windSpeed * 3.6).toFixed(1) + " km/h";
    } else {
        windLabel = windSpeed.toFixed(1) + " mph";
    }

    const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const conditionKey = mainCondition.toLowerCase();
    const bgURL = bgImages[conditionKey] || bgImages.default;

    // Show/hide result sections
    if (contentGrid) contentGrid.style.display = "grid";
    
    const mWeatherDisplayNew = document.querySelector(".m-top-info");
    const mDetailCardNew = document.querySelector(".m-detail-card");
    const mStatsRowNew = document.querySelector(".m-stats-row");
    const mConditionTitleNew = document.querySelector(".m-condition-title");
    const mConditionDescNew = document.querySelector(".m-condition-desc");
    const mConditionIconRowNew = document.querySelector(".m-condition-icon-row");
    const mWeatherTagNew = document.querySelector(".m-weather-tag");
    const mEmojiNew = document.querySelector(".m-emoji");
    const mUpdatedNew = document.querySelector(".m-updated");

    if (mWeatherDisplayNew) mWeatherDisplayNew.style.display = "block";
    if (mDetailCardNew) mDetailCardNew.style.display = "flex";
    if (mStatsRowNew) mStatsRowNew.style.display = "flex";
    if (mConditionTitleNew) mConditionTitleNew.style.display = "block";
    if (mConditionDescNew) mConditionDescNew.style.display = "block";
    if (mConditionIconRowNew) mConditionIconRowNew.style.display = "flex";
    if (mWeatherTagNew) mWeatherTagNew.style.display = "inline-block";
    if (mEmojiNew) mEmojiNew.style.display = "block";
    if (mUpdatedNew) mUpdatedNew.style.display = "block";

    const animatedEls = document.querySelectorAll(
        ".main-card, .detail-card, .condition-title, .condition-desc, .weather-tag, .bottom-stats, .stat-item, " +
        ".m-top-info, .m-detail-card, .m-condition-title, .m-condition-desc, .m-condition-icon-row, .m-weather-tag, .m-stats-row, .m-stat-item"
    );
    animatedEls.forEach(el => {
        el.style.animation = "none";
        el.offsetHeight; // force reflow
        el.style.animation = "";
    });

    // Hide error elements
    if (dErrorMsg) dErrorMsg.classList.remove("visible");
    if (mErrorMsg) mErrorMsg.classList.remove("visible");

    // Update background image
    setBackground(bgURL);

    // Update Desktop Details
    if (dConditionTitle) {
        dConditionTitle.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    }
    if (dWeatherTag) {
        dWeatherTag.textContent = "Weather Forecast";
    }

    const descriptions = {
        clear: "Perfect weather for outdoor activities.",
        clouds: "A calm and comfortable day ahead.",
        rain: "Don't forget your umbrella today.",
        drizzle: "Light rain expected. Stay dry.",
        thunderstorm: "Stay indoors if possible. Storm ahead.",
        snow: "Bundle up — it's cold and snowy outside.",
        mist: "Visibility may be reduced. Drive carefully.",
        fog: "Dense fog advisory. Take it slow.",
        default: "Stay prepared for changing conditions."
    };
    const currentDescText = descriptions[mainCondition.toLowerCase()] || descriptions.default;

    if (dConditionDesc) {
        dConditionDesc.textContent = currentDescText;
    }
    const weatherEmojis = {
        "01d": "☀️", "01n": "🌙",
        "02d": "⛅", "02n": "⛅",
        "03d": "☁️", "03n": "☁️",
        "04d": "☁️", "04n": "☁️",
        "09d": "🌧️", "09n": "🌧️",
        "10d": "🌦️", "10n": "🌧️",
        "11d": "⛈️", "11n": "⛈️",
        "13d": "❄️", "13n": "❄️",
        "50d": "🌫️", "50n": "🌫️"
    };

    const emoji = weatherEmojis[icon] || "🌤️";

    document.querySelectorAll(".weather-emoji")
        .forEach(el => el.textContent = emoji);

    if (dCityLabel) {
        dCityLabel.textContent = `📍 ${name}, ${country}`;
    }
    if (dTempDisplay) {
        dTempDisplay.textContent = `${Math.round(temp)}${unitSymbol}`;
    }
    if (dIconCondition) {
        dIconCondition.textContent = description;
    }

    // detail-card items: feels like, humidity, wind
    if (dDetailItems && dDetailItems.length >= 3) {
        dDetailItems[0].textContent = windLabel;
        dDetailItems[1].textContent = `${humidity}%`;
        dDetailItems[2].textContent = `${Math.round(feelsLike)}${unitSymbol}`;
    }

    // bottom-stats items: wind, humidity, feels like
    if (dStatItems && dStatItems.length >= 3) {
        dStatItems[0].textContent = windLabel;
        dStatItems[1].textContent = `${humidity}%`;
        dStatItems[2].textContent = `${Math.round(feelsLike)}${unitSymbol}`;
    }

    const updateTimeStr = `Updated at ${getCurrentFormattedTime()}`;
    if (dLastUpdated) {
        dLastUpdated.textContent = updateTimeStr;
    }

    // Update Mobile Details
    const mCondVal = document.getElementById("m-condition-val");
    if (mCondVal) {
        mCondVal.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    }
    const mDescVal = document.getElementById("m-desc-val");
    if (mDescVal) {
        mDescVal.textContent = currentDescText;
    }
    const mCityVal = document.getElementById("m-city-val");
    if (mCityVal) {
        mCityVal.textContent = `📍 ${name}, ${country}`;
    }
    const mTempVal = document.getElementById("m-temp-val");
    if (mTempVal) {
        mTempVal.textContent = `${Math.round(temp)}${unitSymbol}`;
    }
    const mWindVal = document.getElementById("m-wind-val");
    if (mWindVal) {
        mWindVal.textContent = windLabel;
    }
    const mHumidityVal = document.getElementById("m-humidity-val");
    if (mHumidityVal) {
        mHumidityVal.textContent = `${humidity}%`;
    }
    const mFeelsVal = document.getElementById("m-feels-val");
    if (mFeelsVal) {
        mFeelsVal.textContent = `${Math.round(feelsLike)}${unitSymbol}`;
    }
    const mWindVal2 = document.getElementById("m-wind-val-2");
    if (mWindVal2) {
        mWindVal2.textContent = windLabel;
    }
    const mHumidityVal2 = document.getElementById("m-humidity-val-2");
    if (mHumidityVal2) {
        mHumidityVal2.textContent = `${humidity}%`;
    }
    const mFeelsVal2 = document.getElementById("m-feels-val-2");
    if (mFeelsVal2) {
        mFeelsVal2.textContent = `${Math.round(feelsLike)}${unitSymbol}`;
    }
    const mIconConditionVal = document.getElementById("m-icon-condition-val");
    if (mIconConditionVal) {
        mIconConditionVal.textContent = description;
    }
    const mUpdatedVal = document.getElementById("m-updated-val");
    if (mUpdatedVal) {
        mUpdatedVal.textContent = updateTimeStr;
    }
    const mWeatherTag = document.getElementById("m-weather-tag");
    if (mWeatherTag) {
        mWeatherTag.textContent = "Weather Forecast";
    }

    // Sync input values
    if (dSearchInput) dSearchInput.value = `${name}, ${country}`;
    if (mSearchInput) mSearchInput.value = `${name}, ${country}`;
}

/**
 * 3. Display error message in both layouts
 */
function showError(message) {
    const formattedMsg = `❌ ${message}`;

    if (dErrorMsg) {
        dErrorMsg.textContent = formattedMsg;
        dErrorMsg.classList.add("visible");
    }
    if (mErrorMsg) {
        mErrorMsg.innerHTML = `<span>❌</span> <span>${message}</span>`;
        mErrorMsg.classList.add("visible");
    }

    // Hide result panels
    if (contentGrid) contentGrid.style.display = "none";
    const mWeatherDisplayNew = document.querySelector(".m-top-info");
    const mDetailCardNew = document.querySelector(".m-detail-card");
    const mStatsRowNew = document.querySelector(".m-stats-row");
    const mConditionTitleNew = document.querySelector(".m-condition-title");
    const mConditionDescNew = document.querySelector(".m-condition-desc");
    const mConditionIconRowNew = document.querySelector(".m-condition-icon-row");
    const mWeatherTagNew = document.querySelector(".m-weather-tag");
    const mEmojiNew = document.querySelector(".m-emoji");
    const mUpdatedNew = document.querySelector(".m-updated");

    if (mWeatherDisplayNew) mWeatherDisplayNew.style.display = "none";
    if (mDetailCardNew) mDetailCardNew.style.display = "none";
    if (mStatsRowNew) mStatsRowNew.style.display = "none";
    if (mConditionTitleNew) mConditionTitleNew.style.display = "none";
    if (mConditionDescNew) mConditionDescNew.style.display = "none";
    if (mConditionIconRowNew) mConditionIconRowNew.style.display = "none";
    if (mWeatherTagNew) mWeatherTagNew.style.display = "none";
    if (mEmojiNew) mEmojiNew.style.display = "none";
    if (mUpdatedNew) mUpdatedNew.style.display = "none";
}

/**
 * 4. Update background layer image
 */
function setBackground(url) {
    if (bgLayer) {
        bgLayer.style.backgroundImage = `url('${url}')`;
        bgLayer.style.backgroundColor = "#1a1a2e";
        bgLayer.style.backgroundSize = "cover";
        bgLayer.style.backgroundPosition = "center";
    }
    const mBgLayer = document.querySelector(".m-bg-layer");
    if (mBgLayer) {
        mBgLayer.style.backgroundImage = `url('${url}')`;
        mBgLayer.style.backgroundSize = "cover";
        mBgLayer.style.backgroundPosition = "center";
    }
}

/**
 * 5. Unit toggling controller
 */
function toggleUnit() {
    currentUnit = currentUnit === "metric" ? "imperial" : "metric";
    const labelText = currentUnit === "metric" ? "°F" : "°C";

    const toggles = document.querySelectorAll(".unit-toggle, .m-unit-toggle-btn");
    toggles.forEach(toggle => {
        toggle.textContent = `Switch to ${labelText}`;
    });

    if (lastWeatherData) {
        // Convert the stored weather data in-place
        if (currentUnit === "imperial" && lastWeatherDataUnit === "metric") {
            lastWeatherData.main.temp = (lastWeatherData.main.temp * 9 / 5) + 32;
            lastWeatherData.main.feels_like = (lastWeatherData.main.feels_like * 9 / 5) + 32;
            lastWeatherData.wind.speed = lastWeatherData.wind.speed * 2.23694;
            lastWeatherDataUnit = "imperial";
        } else if (currentUnit === "metric" && lastWeatherDataUnit === "imperial") {
            lastWeatherData.main.temp = (lastWeatherData.main.temp - 32) * 5 / 9;
            lastWeatherData.main.feels_like = (lastWeatherData.main.feels_like - 32) * 5 / 9;
            lastWeatherData.wind.speed = lastWeatherData.wind.speed / 2.23694;
            lastWeatherDataUnit = "metric";
        }

        displayWeather(lastWeatherData);
    } else if (currentCity) {
        fetchWeather(currentCity, currentUnit);
    }
}

/**
 * 6. Retrieve Geolocation and query OWM Coordinates
 */
function handleGeolocation() {
    if (!navigator.geolocation) {
        showError("Could not get your location.");
        return;
    }

    if (dGeoBtn) dGeoBtn.classList.add("loading");
    if (mGeoBtn) mGeoBtn.classList.add("loading");
    showLoadingStates();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                let data;
                if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "[::1]" || window.location.port === "3000") {
                    data = {
                        name: "Current Location",
                        sys: { country: "US" },
                        weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
                        main: { temp: currentUnit === "metric" ? 25 : 77, feels_like: currentUnit === "metric" ? 24 : 75, humidity: 55 },
                        wind: { speed: currentUnit === "metric" ? 3 : 7 }
                    };
                } else {
                    const response = await fetch(
                        `${FUNCTION_URL}?lat=${lat}&lon=${lon}&unit=${currentUnit}`
                    );
                    if (!response.ok) throw new Error("API_ERROR");
                    data = await response.json();
                }

                displayWeather(data);
                saveToHistory(data.name);
                localStorage.setItem("lastCity", data.name);
            } catch (e) {
                showError("Could not get your location.");
            } finally {
                if (dGeoBtn) dGeoBtn.classList.remove("loading");
                if (mGeoBtn) mGeoBtn.classList.remove("loading");
                hideLoadingStates();
            }
        },
        () => {
            if (dGeoBtn) dGeoBtn.classList.remove("loading");
            if (mGeoBtn) mGeoBtn.classList.remove("loading");
            hideLoadingStates();
            showError("Could not get your location.");
        }
    );
}

/**
 * 7. History management: save search term
 */
function saveToHistory(city) {
    let history = getHistory();
    // Case-insensitive deduplication
    history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
    history.unshift(city);
    history = history.slice(0, 3);
    localStorage.setItem("cityHistory", JSON.stringify(history));
}

function getHistory() {
    const str = localStorage.getItem("cityHistory");
    try {
        let cityHistory = str ? JSON.parse(str) : [];
        cityHistory = cityHistory.filter(c =>
            !c.includes("Coord") && !c.includes("[")
        );
        return cityHistory.slice(0, 3);
    } catch (e) {
        return [];
    }
}

/**
 * 8. Render Dropdown history list
 */
function renderDropdown(type) {
    const history = getHistory();
    if (history.length === 0) return;

    if (type === "desktop" && dHistoryDropdown) {
        dHistoryDropdown.innerHTML = "";
        history.forEach(city => {
            const div = document.createElement("div");
            div.className = "history-item";
            div.textContent = city;
            div.onmousedown = (e) => {
                e.stopPropagation();
                const selectedCity = div.textContent.trim();
                if (dSearchInput) dSearchInput.value = selectedCity;
                if (mSearchInput) mSearchInput.value = selectedCity;
                hideDropdowns();
                fetchWeather(selectedCity, currentUnit);
            };
            dHistoryDropdown.appendChild(div);
        });
        dHistoryDropdown.classList.add("visible");
    } else if (type === "mobile" && mHistoryDropdown) {
        mHistoryDropdown.innerHTML = "";
        history.forEach(city => {
            const div = document.createElement("div");
            div.className = "m-history-item";
            div.textContent = city;
            div.onmousedown = (e) => {
                e.stopPropagation();
                const selectedCity = div.textContent.trim();
                if (dSearchInput) dSearchInput.value = selectedCity;
                if (mSearchInput) mSearchInput.value = selectedCity;
                hideDropdowns();
                fetchWeather(selectedCity, currentUnit);
            };
            mHistoryDropdown.appendChild(div);
        });
        mHistoryDropdown.classList.add("visible");
    }
}

/**
 * Loading spinner helpers
 */
function showLoadingStates() {
    if (dLoadingSpinner) dLoadingSpinner.classList.add("visible");
    if (mLoadingSpinner) mLoadingSpinner.classList.add("visible");
    if (dErrorMsg) dErrorMsg.classList.remove("visible");
    if (mErrorMsg) mErrorMsg.classList.remove("visible");

    document.querySelectorAll("input, button").forEach(el => el.disabled = true);
}

function hideLoadingStates() {
    if (dLoadingSpinner) dLoadingSpinner.classList.remove("visible");
    if (mLoadingSpinner) mLoadingSpinner.classList.remove("visible");

    document.querySelectorAll("input, button").forEach(el => el.disabled = false);
}

/**
 * Format current local time HH:MM AM/PM
 */
function getCurrentFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = String(minutes).padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
}



function hideDropdowns() {
    if (dHistoryDropdown) dHistoryDropdown.classList.remove("visible");
    if (mHistoryDropdown) mHistoryDropdown.classList.remove("visible");
}

// Saved locations stored in localStorage key "savedCities"
// Each entry: { name, country, temp, unit }

function getSavedCities() {
    try {
        return JSON.parse(localStorage.getItem("savedCities") || "[]");
    } catch { return []; }
}

function showPinFeedback(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

function getDisplayInfo(isMobile) {
    let cityLabelEl, tempEl;
    if (isMobile) {
        cityLabelEl = document.getElementById("m-city-val");
        tempEl = document.getElementById("m-temp-val");
    } else {
        cityLabelEl = document.querySelector(".city-label");
        tempEl = document.querySelector(".temp-display");
    }

    if (!cityLabelEl || !tempEl) return null;

    const fullText = cityLabelEl.textContent.replace("📍 ", "").trim();
    if (!fullText || fullText === "-" || fullText === "--") return null;

    const parts = fullText.split(", ");
    const cityName = parts[0] ? parts[0].trim() : "";
    const country = parts[1] ? parts[1].trim() : "";

    const tempText = tempEl.textContent.trim();
    if (tempText === "-" || tempText === "--" || tempText === "-°") return null;

    return { cityName, country, tempText };
}

function handlePinClick(isMobile) {
    const info = getDisplayInfo(isMobile);
    if (!info) {
        showPinFeedback("No weather data displayed to save.");
        return;
    }

    const { cityName, country, tempText } = info;
    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
    saveCityPin(cityName, country, tempText, unitSymbol);
}

function saveCityPin(name, country, temp, unitSymbol) {
    let saved = getSavedCities();
    // No duplicates
    if (saved.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        showPinFeedback("City already saved.");
        return;
    }
    // Max 5 pinned cities
    if (saved.length >= 5) {
        showPinFeedback("Max 5 locations saved.");
        return;
    }
    // Clean unit symbol and temp formatting
    const cleanUnitSymbol = unitSymbol.replace("°", "");
    const displayUnitSymbol = `°${cleanUnitSymbol}`;
    const cleanTemp = temp.replace("°", "").replace("C", "").replace("F", "").trim();

    saved.push({ name, country, temp: cleanTemp, unitSymbol: displayUnitSymbol });
    localStorage.setItem("savedCities", JSON.stringify(saved));
    renderSavedLocations();
    showPinFeedback("Location saved!");
}

function removeSavedCity(name) {
    let saved = getSavedCities().filter(
        c => c.name.toLowerCase() !== name.toLowerCase()
    );
    localStorage.setItem("savedCities", JSON.stringify(saved));
    renderSavedLocations();
}

function renderSavedLocations() {
    const lists = document.querySelectorAll(".saved-list");
    if (lists.length === 0) return;
    const saved = getSavedCities();

    lists.forEach(list => {
        if (saved.length === 0) {
            list.innerHTML = '<p class="saved-empty">No saved locations yet.</p>';
            return;
        }

        list.innerHTML = "";
        saved.forEach(city => {
            const item = document.createElement("div");
            item.className = "saved-city-item";
            item.innerHTML = `
          <span class="saved-city-name">📍 ${city.name}, ${city.country}</span>
          <span class="saved-city-temp">${city.temp}${city.unitSymbol}</span>
          <button class="saved-city-remove" title="Remove">✕</button>
        `;
            // Click city to fetch weather
            item.addEventListener("click", (e) => {
                if (e.target.classList.contains("saved-city-remove")) return;
                if (dSearchInput) dSearchInput.value = city.name;
                if (mSearchInput) mSearchInput.value = city.name;
                fetchWeather(city.name, currentUnit);
            });
            // Remove button
            item.querySelector(".saved-city-remove")
                .addEventListener("click", (e) => {
                    e.stopPropagation();
                    removeSavedCity(city.name);
                });
            list.appendChild(item);
        });
    });
}
