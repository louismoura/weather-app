const apiKey = '73855c7abb85af3fe9e6ae926705ff06';
const apiKey2 = 'iNws003BsfzxWmZR16akCEz9FYqfOor3';
const appPrint = document.querySelector('.weather-info-container');
const formInput = document.querySelector('.search-form-input');
const form = document.querySelector('.search-form');
const autocompleteList = document.querySelector('.autocomplete-list');

function fetchAutocomplete(e){
  //IF KEY PRESSED IS LETTER KEY OR BACKSPACE, KEY 229 FOR VIRTUAL KEYBOARD ON SMARTPHONES/TABLETS
  const key = e.which || e.keyCode;
  if (!(key >= 65 && key <= 90 || key == 8 || key == 229)) return;
  const inputValue = this.value.trim();
  //CLEAR LIST
  autocompleteList.innerHTML = '';
  if(inputValue.length < 3) return;
  //LOADING
  autocompleteList.innerHTML = "<li class='autocomplete-list-item loading-list'><i class='wi wi-day-sunny loading-autocomplete'></i></li>";

  fetch(`https://api.openweathermap.org/data/2.5/find?q=${inputValue}&APPID=${apiKey}`, {
    'method': 'get'
  })
    .then(res => {
      if(res.ok){
        return res.json();
      } else {
        handleError();
      }
    })
    .then(data => {
      //IF THER IS NO DATA RETRUN
      if(!data.list.length) {
        autocompleteList.innerHTML = "<li class='error-info'>There is no such city</li>";
        return;
      }

      const cityArray = data.list.map(city => {
        const fechedData = fetch(`https://open.mapquestapi.com/geocoding/v1/reverse?key=${apiKey2}&location=${city.coord.lat},${city.coord.lon}&includeNearestIntersection=true`, {
          'method': 'get'
        })
        .then(res => {
          if(res.ok){
            return res.json();
          } else {
            handleError();
          }
        })
        .then(data => {
          const cityDataArrayItem = {
            location: data.results[0].locations[0],
            id: city.id
          };
          return cityDataArrayItem;
        })
        return fechedData;
      })
      return cityArray;
    })
    .then((data)=>{
      //IF THER IS NO DATA RETURN
      if(!data) return;

      Promise.all(data).then(values => {
        const arrayOfCities = values.map(cityData => {
          const cityAndCountryName = `<p class='autocomplete-list-cityCountry'>${cityData.location.adminArea5}, ${cityData.location.adminArea1}</p>`;
          const stateName = `<span class='autocomplete-list-state'>${cityData.location.adminArea3}</span>`;
         return(
         `<li class='autocomplete-list-item' data-id='${cityData.id}'>
            ${cityAndCountryName}${stateName}
          </li>`
         )
        }).join('');

        autocompleteList.innerHTML = arrayOfCities
      })
      .then(()=> {
        const autocompleteListItems = document.querySelectorAll('.autocomplete-list-item');

        autocompleteListItems.forEach( listItem => {
          listItem.addEventListener('click', fetchWeatherData);
        })
      })
      .catch(() => handleError);
    })
    .catch(() => handleError);
}


function fetchWeatherData(){
  const id = this.dataset.id;
  //CLEAR SEARCH RESULTS
  autocompleteList.innerHTML = '';
  //ADDD LOADING SCREEN
  appPrint.innerHTML = "<i class='loading wi wi-day-sunny'></i>";

  fetch(`https://api.openweathermap.org/data/2.5/weather?id=${id}&APPID=${apiKey}`, {
    'method': 'get'
  })
    .then(res => {
      if(res.ok){
        return res.json();
      } else {
        handleError();
      }
    })
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

        formInput.value = `${data.name}, ${data.sys.country}`;
        return dataToPrint;
      })
      .then(data => appPrint.innerHTML = data)
      .then(() => {

        const forecastContainer = document.querySelector('.forecast-days');

        fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${id}&APPID=${apiKey}`)
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
      .catch((err) => handleError);
}

function handleError(){
  autocompleteList.innerHTML = "<li class='fetch-error'>Something went wrong</li>"
}


formInput.addEventListener('keyup', fetchAutocomplete);
form.addEventListener('submit', (e) => e.preventDefault());
