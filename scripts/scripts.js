const app = document.querySelector('.app');
const appForm = document.querySelector('.search-form');
const apiKey = '73855c7abb85af3fe9e6ae926705ff06';
const appPrint = document.querySelector('.weather-info-container');
const formInput = document.querySelector('.search-form-input');


function fetchAutocomplete(e){
  //IF ENTER IS PRESSED RETRUN
  if(e.which == 13) return
  const inputValue = this.value.trim();
  const autocompleteList = document.querySelector('.autocomplete-list');

  if(inputValue.length < 3) return;

  fetch(`http://api.openweathermap.org/data/2.5/find?q=${inputValue}&APPID=${apiKey}`)
    .then(res => res.json())
    .then(data => {

      const cityList = data.list.map(city => {
        return(
          `<li class='autocomplete-list-item' data-id=${city.id}>
            ${city.name}, ${city.sys.country}
          </li>`
        )
      }).join('');

      autocompleteList.innerHTML = cityList;
    })
    .then(() => {
      const autocompleteCity = document.querySelectorAll('.autocomplete-list-item');
      autocompleteCity.forEach(city => {
        city.addEventListener('click', fetchWeatherData);
      })
    })
}


function fetchWeatherData(e){
  e.preventDefault();
  let id;
  const autocompleteListContainer = document.querySelector('.autocomplete-list');
  if(e.type == 'submit'){
    const autoCompliteListItems = document.querySelectorAll('.autocomplete-list-item')

    if(autoCompliteListItems.length != 0){
      id = autoCompliteListItems[0].dataset.id;
      autocompleteListContainer.innerHTML = '';
    } else {
      autocompleteListContainer.innerHTML = "<li class='error-info'>There is no such city</li>";
      return;
    }

  } else {
    id = this.dataset.id;
    autocompleteListContainer.innerHTML = '';
  }

  fetch(`http://api.openweathermap.org/data/2.5/weather?id=${id}&APPID=${apiKey}`)
    .then(res => res.json())
    .then(data=> {
        const updateTime = moment.unix(data.dt).format('h:mm a')
        let cloudsClass;
        if(data.clouds.all < 10) {
          cloudsClass = 'one-num'
        } else if(data.clouds.all >= 10 && data.clouds.all != 100){
          cloudsClass = 'two-num'
        } else {
          cloudsClass = 'tree-num'
        }

        const dataToPrint = `
          <div class="main-icon-container">
            <i class='wi wi-owm-${data.weather[0].id} main-icon'></i>
          </div>
          <div class="current-weather">
            <div class="current-temp">
              <span class="current-temp-info"><i class='wi wi-thermometer thermometr-icon'></i>${(data.main.temp - 273.15).toFixed(1)}<i class='wi wi-degrees'></i></span>
              <p class="weather-text">Current temp.</p>
            </div>
            <div class="humidity-info">
              <span class="weather-info">${data.main.humidity} <i class='wi wi-humidity humidity-icon'></i></span>
              <p class="weather-text">Humidity</p>
            </div>
            <div class="pressure-info">
              <span class="weather-info">${data.main.pressure} hPa</span>
              <p class="weather-text">Pressure</p>
            </div>
          </div>
          <p class='update-time'>Last update ${updateTime}</p>
          <div class="clouds col-1-3">
            <div class="clouds-icon-container">
              <i class="wi wi-cloud clouds-icon"></i>
              <span class="clouds-info-messure ${cloudsClass}">${data.clouds.all}</span>
              <span class="clouds-info-prec">%</span>
            </div>
            <p class="weather-text">Cloudiness</p>
          </div>
          <div class="wind-status col-1-3">
            <i class="wi wi-wind towards-0-deg wind-status-icon" style="transform: rotate(${data.wind.deg}deg)"></i>
            <p class="weather-text">Wind direction</p>
          </div>
          <div class="wind-speed col-1-3">
            <div class="wind-speed-icon-container">
              <i class="wi wi-strong-wind wind-speed-icon"></i>
              <span class="wind-messure">${data.wind.speed}m/s</span>
            </div>
            <p class="weather-text">Wind speed</p>
          </div>
          <div class="forecast-container">
            <h2 class="forecast-title">Forecast for next 5 days</h2>
            <div class="forecast-days"></div>
          </div>
        `;

        appPrint.innerHTML = dataToPrint;
        formInput.value = `${data.name}, ${data.sys.country}`;
      }).then(() => {

        const forecastContainer = document.querySelector('.forecast-days');

        fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${id}&APPID=${apiKey}`)
          .then(res => res.json())
          .then(data => {
            const daysFiltered = data.list.filter(item => {
              return item.dt_txt.split(' ')[1] == '12:00:00';
            })
            const dayList = daysFiltered.map(day => {
              const dayOfWeek =  moment.unix(day.dt).format('dddd');
              return(
                `<div class="forecast-day">
                  <p class="dayOfWeek">${dayOfWeek}</p>
                  <i class='wi wi-owm-${day.weather[0].id} daily-weather-icon'></i>
                  <p class="day-temp">${(day.main.temp - 273.15).toFixed(1)}<i class='wi wi-degrees'></i></p>
                </div>`
              )
            }).join('');
            forecastContainer.innerHTML = dayList;
          })
      })
      .catch((err) => {
        console.log(err);
        if(!!err){
          autocompleteList.innerHTML = "<li class='search-error'>No locations were found that would meet the criteria</li>"
        }
      })
}

function fetchCityData() {
  const dataKey = this.dataset.key;

  formInput.value = '';
  this.offsetParent.style.display = 'none';


  fetch(`http://dataservice.accuweather.com/currentconditions/v1/${dataKey}?apikey=${apiKey}&details=True`, {
    method: 'get',
    headers: {
      'Accept-Encoding': 'gzip'
    }
  }).then(res => res.json()
    .then(data => {
      console.log(data);
    })
);
}


formInput.addEventListener('keyup', fetchAutocomplete);
appForm.addEventListener('submit', fetchWeatherData);
