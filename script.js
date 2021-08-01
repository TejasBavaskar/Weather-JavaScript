const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';
const WEATHER_API_KEY = 'b2aafc06eab67e4df2e33d694a4665d4';
const BASE_GEOLOCATION_URL = 'https://us1.locationiq.com/v1/search.php';
const GEOLOCATION_API_KEY = 'pk.52d2a9358410a86399480729eadd7197';
const TIMEZONE_API_KEY = 'afnTwgLZEzCVdcbBhmRX';
const TIMEZONE_BASE_URL = 'https://timezoneapi.io/api/timezone';

let cityName = 'Mumbai';
let countryName = 'India';

const timeElement = document.getElementById('time');
const amPmElement = document.getElementById('am-pm');
const dateElement = document.querySelector('.date');
const cityNameElement = document.querySelector('.city-name');
const timezoneElement = document.querySelector('.timezone');
const searchBtn = document.getElementById('search-btn');
const searchBox = document.getElementById('search-box');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const windSpeedElement = document.getElementById('wind-speed');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const tempTableElement = document.getElementById('temp');

searchBtn.addEventListener('click', (event) => {
  event.preventDefault();
  console.log(searchBox.value);
  initializa(searchBox.value);
  searchBox.value = '';

})

initializa(cityName);

function initializa(cityName) {
  fetchWeatherData(cityName);
}

async function setDateTime(timezone) {
  const url = `${TIMEZONE_BASE_URL}/timezone/?${timezone}&token=${TIMEZONE_API_KEY}`;
  let dateTime = null;
  await fetch(url)
    .then(res => res.json())
    .then(data => {
      dateTime = data?.data?.datetime;
      console.log(dateTime);
    })
  
  let {hour_12_wilz, minutes, hour_am_pm, day_full, day, month_abbr} = dateTime;
  console.log(hour_12_wilz, minutes, hour_am_pm);

  timeElement.innerText = `${hour_12_wilz}:${minutes}`;
  amPmElement.innerText = hour_am_pm.toUpperCase();
  dateElement.innerText = `${day_full}, ${day} ${month_abbr}`;

  let newHours = parseInt(hour_12_wilz);
  let newMinutes = parseInt(minutes);
  let dayFullIndex = days.indexOf(parseInt(day_full));

  setInterval(() => {
    newMinutes++;
    newMinutes = newMinutes % 60;

    if(newMinutes === 0) {
      newHours++;
    }

    if(newMinutes === 0 && newHours === 0) {
      dayFullIndex = (dayFullIndex + 1)%7;
      day_full = days[dayFullIndex];
      day = parseInt(day)++;
      dateElement.innerText = `${day_full}, ${day} ${month_abbr}`;
    }
    
    newHours = newHours > 12 ? newHours%12 : newHours;
    const displayHours = newHours >= 10 ? newHours : '0'+newHours;
    const displayMinutes = newMinutes >= 10 ? newMinutes : '0'+newMinutes;
    const amPm = newHours >= 12 ? 'PM' : 'AM';

    timeElement.innerText = `${displayHours}:${displayMinutes}`;
    amPmElement.innerText = amPm;

  }, 1000 * 60);
}


async function fetchWeatherData(cityName) {
  const locationUrl = `${BASE_GEOLOCATION_URL}?key=${GEOLOCATION_API_KEY}&q=${cityName}&format=json&limit=1`;
  let latitide = null;
  let longitude = null;

  await fetch(locationUrl)
    .then(res => res.json())
    .then(data => {
      latitide = data[0].lat;
      longitude = data[0].lon;
      let country = data[0].display_name.split(' ');
      countryName = country[country.length-1];
      cityNameElement.innerText = `${cityName}, ${countryName}`;
    })
  
  const weatherUrl = `${WEATHER_BASE_URL}?lat=${latitide}&lon=${longitude}&exclude=hourly,minutely&appid=${WEATHER_API_KEY}&units=metric`;
  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      console.log('Weather Data: ', data);
      showWeatherData(data);
    })
}

function showWeatherData(data) {
  setTableData(data?.current);
  setForecastData(data?.daily);
  setDateTime(data?.timezone);
}

function setTableData(currentData) {
  const {humidity, pressure, wind_speed, sunrise,sunset, feels_like} = currentData;
  humidityElement.innerText = `${humidity} %`;
  pressureElement.innerText = `${pressure} hPa` ;
  windSpeedElement.innerText = `${wind_speed} mt/s`;
  tempTableElement.innerText  = `${feels_like} ${String.fromCharCode(176)}C`;

  sunriseTime = window.moment(sunrise*1000).format('hh:mm a');
  sunriseElement.innerText = sunriseTime;

  sunsetTime = window.moment(sunset*1000).format('hh:mm a');
  sunsetElement.innerText = sunsetTime;
}

function setForecastData(dailyData) {
  const otherWeatherCardList = document.querySelectorAll('.weather-card');
  const iconImgList = document.querySelectorAll('.weather-icon');
  
  dailyData.forEach((item, index) => {
    if(index === 0) {
      iconImgList[index].src = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
      iconImgList[index].style.width = '150px';
      iconImgList[index].style.height = '150px';
      const currentWeatherCard = document.querySelector('.card-info');
      currentWeatherCard.querySelector('.day').innerText = moment(item.dt * 1000).format('dddd');
      currentWeatherCard.querySelectorAll('.temp')[0].innerText = `Night - ${item.feels_like.night} ${String.fromCharCode(176)} C`;
      currentWeatherCard.querySelectorAll('.temp')[1].innerText = `Day - ${item.feels_like.day} ${String.fromCharCode(176)} C`;

    } else if(index <= 6) {
        otherWeatherCardList[index-1].querySelector('.day').innerText = moment(item.dt * 1000).format('ddd');
        otherWeatherCardList[index-1].querySelector('.temp.night').innerText = `Night - ${item.feels_like.night} ${String.fromCharCode(176)} C`;
        otherWeatherCardList[index-1].querySelector('.temp.day-temp').innerText = `Day - ${item.feels_like.day} ${String.fromCharCode(176)} C`;
        iconImgList[index].src = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    }
  });
}