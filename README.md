# Skyline — Live Weather

A responsive weather dashboard recreated from the supplied Skyline reference page. Built with HTML, CSS and vanilla JavaScript.

## Features
- Search weather by city
- Browser geolocation
- Current temperature, condition, feels-like, high/low
- Sunrise/sunset display and sun-path indicator
- Humidity, wind, pressure, visibility, UV index and cloud cover
- 3-hourly forecast and 5-day outlook
- Light/dark theme and responsive mobile layout

## Run it
1. Get an API key from https://openweathermap.org/api
2. Open `script.js` and replace `YOUR_OPENWEATHERMAP_API_KEY` with your key.
3. Start a local server from this folder:
   - PowerShell: `py -m http.server 5500`
   - Or use VS Code Live Server.
4. Visit `http://localhost:5500`.

Current weather and 5-day forecast use OpenWeatherMap's standard endpoints. UV index uses One Call 3.0, which may require a separately enabled/eligible API plan; the rest of the dashboard works without it.

Geolocation requires localhost or HTTPS. The API key is visible in browser code, so use this client-only setup for personal/demo use; use a backend proxy for a public production deployment.
