const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';
const WEATHER_API_KEY = 'b2aafc06eab67e4df2e33d694a4665d4';
const BASE_GEOLOCATION_URL = 'https://us1.locationiq.com/v1/search.php';
const GEOLOCATION_API_KEY = 'pk.52d2a9358410a86399480729eadd7197';

let cityName = 'Mumbai';

const timeElement = document.getElementById('time');
const amPmElement = document.getElementById('am-pm');
const dateElement = document.querySelector('.date');
const searchBtn = document.getElementById('search-btn');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const windSpeedElement = document.getElementById('wind-speed');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');


initializa();

function initializa() {
  setInterval(() => {
    const currentTime = new Date();
    let hours = currentTime.getHours();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours > 12 ? hours % 12 : hours;
    const minutes = currentTime.getMinutes();
    const day = days[currentTime.getDay()];
    const month = months[currentTime.getMonth()]
    const date = currentTime.getDate();
  
    timeElement.innerText = `${hours}:${minutes}`;
    amPmElement.innerText = amPm;
    dateElement.innerText = `${day}, ${date} ${month}`;
  }, 1000);

  fetchWeatherData();

}


async function fetchWeatherData() {
  const locationUrl = `${BASE_GEOLOCATION_URL}?key=${GEOLOCATION_API_KEY}&q=${cityName}&format=json&limit=1`;
  let latitide = null;
  let longitude = null;
  
  await fetch(locationUrl)
    .then(res => res.json())
    .then(data => {
      console.log(data[0].lat);
      latitide = data[0].lat;
      longitude = data[0].lon;
    })
  
  console.log('latitide= ',latitide, ' longitude= ',longitude);
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
}

function setTableData(currentData) {
  const {humidity, pressure, wind_speed, sunrise,sunset} = currentData;
  humidityElement.innerText = `${humidity} %`;
  pressureElement.innerText = `${pressure} hPa` ;
  windSpeedElement.innerText = `${wind_speed} mt/s`;

  sunriseTime = window.moment(sunrise*1000).format('hh:mm a');
  sunriseElement.innerText = sunriseTime;

  sunsetTime = window.moment(sunset*1000).format('hh:mm a');
  sunsetElement.innerText = sunsetTime;
}

function setForecastData(dailyData) {
  console.log('Daily Data: ', dailyData);
  const otherWeatherCardList = document.querySelectorAll('.weather-card');
  const iconImgList = document.querySelectorAll('.weather-icon');
  
  dailyData.forEach((item, index) => {
    console.log('Icon val= ', item.weather[0].icon);
    if(index === 0) {
      iconImgList[index].src = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
      iconImgList[index].style.width = '150px';
      iconImgList[index].style.height = '150px';
      const currentWeatherCard = document.querySelector('.card-info');
      currentWeatherCard.querySelector('.day').innerText = moment(item.dt * 1000).format('dddd');
      currentWeatherCard.querySelectorAll('.temp')[0].innerText = `Night - ${item.feels_like.night} ${String.fromCharCode(176)} C`;
      currentWeatherCard.querySelectorAll('.temp')[1].innerText = `Day - ${item.feels_like.day} ${String.fromCharCode(176)} C`;

    } else {
      otherWeatherCardList[index-1].querySelector('.day').innerText = moment(item.dt * 1000).format('ddd');
      otherWeatherCardList[index-1].querySelector('.temp.night').innerText = `Night - ${item.feels_like.night} ${String.fromCharCode(176)} C`;
      otherWeatherCardList[index-1].querySelector('.temp.day-temp').innerText = `Day - ${item.feels_like.day} ${String.fromCharCode(176)} C`;
      iconImgList[index].src = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    }
  });
}