// Add your free OpenWeatherMap API key below: https://openweathermap.org/api
const API_KEY = "1d92b0147efbed676504be28213e45ee";
const BASE = "https://api.openweathermap.org/data/2.5";
const $ = (id) => document.getElementById(id);
const weatherEmoji = (main, icon = "") => {
  const m = (main || "").toLowerCase();
  if (m.includes("thunder")) return "⛈️";
  if (m.includes("drizzle") || m.includes("rain")) return "🌧️";
  if (m.includes("snow")) return "❄️";
  if (m.includes("mist") || m.includes("fog") || m.includes("haze") || m.includes("smoke")) return "🌫️";
  if (m.includes("cloud")) return "☁️";
  return icon.endsWith("n") ? "🌙" : "☀️";
};
const time = (unix, offset = 0) => new Date((unix + offset) * 1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",timeZone:"UTC"});
const dayName = (date) => new Date(date).toLocaleDateString([], {weekday:"short",timeZone:"UTC"});
const setText = (id, value) => { $(id).textContent = value; };
function setNotice(message, type="") { const el=$("notice"); el.textContent=message; el.className=`notice ${type}`; }
function uvDescription(value){ if(value<=2)return "Low exposure"; if(value<=5)return "Moderate exposure"; if(value<=7)return "High exposure"; if(value<=10)return "Very high exposure"; return "Extreme exposure"; }
function windDirection(deg){return ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg/45)%8]+" wind";}
async function request(url){const res=await fetch(url);const data=await res.json();if(!res.ok)throw new Error(data.message||"Weather request failed");return data;}
async function loadWeather(query){
  if(!API_KEY || API_KEY.includes("YOUR_")){setNotice("Add your OpenWeatherMap API key in script.js to load live weather.","error");return;}
  setNotice("Fetching live weather…");
  try{
    const current=await request(`${BASE}/weather?${query}&units=metric&appid=${API_KEY}`);
    const forecast=await request(`${BASE}/forecast?lat=${current.coord.lat}&lon=${current.coord.lon}&units=metric&appid=${API_KEY}`);
    renderCurrent(current,forecast); renderForecast(forecast,current.timezone||0);
    // UV data is available through OpenWeatherMap One Call 3.0 on eligible API plans.
    try{const one=await request(`https://api.openweathermap.org/data/3.0/onecall?lat=${current.coord.lat}&lon=${current.coord.lon}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${API_KEY}`);setText("uv",Math.round(one.current.uvi*10)/10);setText("uvLabel",uvDescription(one.current.uvi));}catch{setText("uv","—");setText("uvLabel","One Call 3.0 required");}
    const now=new Date();setText("updatedAt",`UPDATED ${now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`);
    setNotice("Weather updated successfully.","success");
  }catch(error){setNotice(error.message+". Check your city name, API key, and API activation.","error");}
}
function renderCurrent(data,forecast){
  const w=data.weather?.[0]||{};const today=forecast.list.slice(0,8);const highs=today.map(x=>x.main.temp_max),lows=today.map(x=>x.main.temp_min);
  setText("placeName",`${data.name}, ${data.sys.country}`);setText("dateLine",new Date().toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"}));
  $("weatherArt").textContent=weatherEmoji(w.main,w.icon);setText("temperature",`${Math.round(data.main.temp)}°`);setText("condition",w.description||w.main||"—");setText("highLow",`H: ${Math.round(Math.max(...highs))}°  ·  L: ${Math.round(Math.min(...lows))}°`);
  setText("feelsLike",`${Math.round(data.main.feels_like)}°`);setText("humidity",data.main.humidity);setText("wind",Math.round(data.wind.speed*3.6));setText("windDirection",windDirection(data.wind.deg||0));setText("pressure",data.main.pressure);setText("visibility",(data.visibility/1000).toFixed(1));setText("clouds",data.clouds.all);
  setText("sunrise",time(data.sys.sunrise,data.timezone));setText("sunset",time(data.sys.sunset,data.timezone));
  const daylight=data.sys.sunset-data.sys.sunrise;const progress=Math.max(0,Math.min(1,(Date.now()/1000-data.sys.sunrise)/daylight));$("sunBall").style.left=`${7+progress*138}px`;
  const main=(w.main||"").toLowerCase();document.body.dataset.weather=main;$("skyBand").style.background=main.includes("rain")||main.includes("storm")?"linear-gradient(90deg,#263a58,#6d8da9,#263a58)":main.includes("cloud")?"linear-gradient(90deg,#354b62,#a4b8c6,#354b62)":"linear-gradient(90deg,#172a48,#73c9d5,#a5e4c7,#f2c77d,#172a48)";
}
function renderForecast(data,offset){
  const hours=data.list.slice(0,8);$("hourlyList").innerHTML=hours.map((item,i)=>`<div class="hour-item"><div class="hour-time">${i===0?"NOW":time(item.dt,offset)}</div><div class="hour-icon">${weatherEmoji(item.weather[0].main,item.weather[0].icon)}</div><div class="hour-temp">${Math.round(item.main.temp)}°</div><div class="hour-rain">${Math.round((item.pop||0)*100)}% rain</div></div>`).join("");
  const groups={};for(const item of data.list){const key=new Date((item.dt+offset)*1000).toISOString().slice(0,10);(groups[key]??=[]).push(item);}
  const days=Object.entries(groups).slice(1,6);$("dailyList").innerHTML=days.map(([date,items])=>{const noon=items.reduce((a,b)=>Math.abs(new Date((a.dt+offset)*1000).getUTCHours()-12)<Math.abs(new Date((b.dt+offset)*1000).getUTCHours()-12)?a:b);const hi=Math.max(...items.map(x=>x.main.temp_max));const lo=Math.min(...items.map(x=>x.main.temp_min));return `<div class="day-item"><div class="day-icon">${weatherEmoji(noon.weather[0].main,noon.weather[0].icon)}</div><div class="day-copy"><div class="day-name">${dayName(date)}</div><div class="day-desc">${noon.weather[0].description}</div></div><div class="day-temps">${Math.round(hi)}° <span>${Math.round(lo)}°</span></div></div>`;}).join("")||'<div class="empty-state">Forecast unavailable.</div>';
}
$("searchForm").addEventListener("submit",e=>{e.preventDefault();const city=$("cityInput").value.trim();if(city)loadWeather(`q=${encodeURIComponent(city)}`);});
$("locationButton").addEventListener("click",()=>{if(!navigator.geolocation){setNotice("Geolocation is not supported by this browser.","error");return;}setNotice("Finding your location…");navigator.geolocation.getCurrentPosition(p=>loadWeather(`lat=${p.coords.latitude}&lon=${p.coords.longitude}`),e=>setNotice(e.message||"Location permission was denied.","error"),{enableHighAccuracy:true,timeout:12000});});
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("skyline-theme",document.body.classList.contains("light")?"light":"dark");});
if(localStorage.getItem("skyline-theme")==="light")document.body.classList.add("light");
