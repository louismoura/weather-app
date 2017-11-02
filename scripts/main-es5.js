'use strict';

var app = document.querySelector('.app');
var appForm = document.querySelector('.search-form');
var apiKey = '73855c7abb85af3fe9e6ae926705ff06';
var appPrint = document.querySelector('.weather-info-container');
var formInput = document.querySelector('.search-form-input');

function fetchAutocomplete(e) {
  //IF ENTER IS PRESSED RETRUN
  if (e.which == 13) return;
  var inputValue = this.value.trim();
  var autocompleteList = document.querySelector('.autocomplete-list');

  if (inputValue.length < 3) return;

  fetch('https://api.openweathermap.org/data/2.5/find?q=' + inputValue + '&APPID=' + apiKey).then(function (res) {
    return res.json();
  }).then(function (data) {

    var cityList = data.list.map(function (city) {
      return '<li class=\'autocomplete-list-item\' data-id=' + city.id + '>\n            ' + city.name + ', ' + city.sys.country + '\n          </li>';
    }).join('');

    autocompleteList.innerHTML = cityList;
  }).then(function () {
    var autocompleteCity = document.querySelectorAll('.autocomplete-list-item');
    autocompleteCity.forEach(function (city) {
      city.addEventListener('click', fetchWeatherData);
    });
  });
}

function fetchWeatherData(e) {
  e.preventDefault();
  var id = void 0;
  var autocompleteListContainer = document.querySelector('.autocomplete-list');
  if (e.type == 'submit') {
    var autoCompliteListItems = document.querySelectorAll('.autocomplete-list-item');

    if (autoCompliteListItems.length != 0) {
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

  fetch('https://api.openweathermap.org/data/2.5/weather?id=' + id + '&APPID=' + apiKey).then(function (res) {
    return res.json();
  }).then(function (data) {
    var updateTime = moment.unix(data.dt).format('h:mm a');
    var cloudsClass = void 0;
    if (data.clouds.all < 10) {
      cloudsClass = 'one-num';
    } else if (data.clouds.all >= 10 && data.clouds.all != 100) {
      cloudsClass = 'two-num';
    } else {
      cloudsClass = 'tree-num';
    }

    var dataToPrint = '\n          <div class="main-icon-container">\n            <i class=\'wi wi-owm-' + data.weather[0].id + ' main-icon\'></i>\n          </div>\n          <div class="current-weather">\n            <div class="current-temp">\n              <span class="current-temp-info"><i class=\'wi wi-thermometer thermometr-icon\'></i>' + (data.main.temp - 273.15).toFixed(1) + '<i class=\'wi wi-degrees\'></i></span>\n              <p class="weather-text">Current temp.</p>\n            </div>\n            <div class="humidity-info">\n              <span class="weather-info">' + data.main.humidity + ' <i class=\'wi wi-humidity humidity-icon\'></i></span>\n              <p class="weather-text">Humidity</p>\n            </div>\n            <div class="pressure-info">\n              <span class="weather-info">' + data.main.pressure + ' hPa</span>\n              <p class="weather-text">Pressure</p>\n            </div>\n          </div>\n          <p class=\'update-time\'>Last update ' + updateTime + '</p>\n          <div class="clouds col-1-3">\n            <div class="clouds-icon-container">\n              <i class="wi wi-cloud clouds-icon"></i>\n              <span class="clouds-info-messure ' + cloudsClass + '">' + data.clouds.all + '</span>\n              <span class="clouds-info-prec">%</span>\n            </div>\n            <p class="weather-text">Cloudiness</p>\n          </div>\n          <div class="wind-status col-1-3">\n            <i class="wi wi-wind towards-0-deg wind-status-icon" style="transform: rotate(' + data.wind.deg + 'deg)"></i>\n            <p class="weather-text">Wind direction</p>\n          </div>\n          <div class="wind-speed col-1-3">\n            <div class="wind-speed-icon-container">\n              <i class="wi wi-strong-wind wind-speed-icon"></i>\n              <span class="wind-messure">' + data.wind.speed + 'm/s</span>\n            </div>\n            <p class="weather-text">Wind speed</p>\n          </div>\n          <div class="forecast-container">\n            <h2 class="forecast-title">Forecast for next 5 days</h2>\n            <div class="forecast-days"></div>\n          </div>\n        ';

    appPrint.innerHTML = dataToPrint;
    formInput.value = data.name + ', ' + data.sys.country;
  }).then(function () {

    var forecastContainer = document.querySelector('.forecast-days');

    fetch('http://api.openweathermap.org/data/2.5/forecast?id=' + id + '&APPID=' + apiKey).then(function (res) {
      return res.json();
    }).then(function (data) {
      var daysFiltered = data.list.filter(function (item) {
        return item.dt_txt.split(' ')[1] == '12:00:00';
      });
      var dayList = daysFiltered.map(function (day) {
        var dayOfWeek = moment.unix(day.dt).format('dddd');
        return '<div class="forecast-day">\n                  <p class="dayOfWeek">' + dayOfWeek + '</p>\n                  <i class=\'wi wi-owm-' + day.weather[0].id + ' daily-weather-icon\'></i>\n                  <p class="day-temp">' + (day.main.temp - 273.15).toFixed(1) + '<i class=\'wi wi-degrees\'></i></p>\n                </div>';
      }).join('');
      forecastContainer.innerHTML = dayList;
    });
  }).catch(function (err) {
    console.log(err);
    if (!!err) {
      autocompleteList.innerHTML = "<li class='search-error'>No locations were found that would meet the criteria</li>";
    }
  });
}

function fetchCityData() {
  var dataKey = this.dataset.key;

  formInput.value = '';
  this.offsetParent.style.display = 'none';

  fetch('http://dataservice.accuweather.com/currentconditions/v1/' + dataKey + '?apikey=' + apiKey + '&details=True', {
    method: 'get',
    headers: {
      'Accept-Encoding': 'gzip'
    }
  }).then(function (res) {
    return res.json().then(function (data) {
      console.log(data);
    });
  });
}

formInput.addEventListener('keyup', fetchAutocomplete);
appForm.addEventListener('submit', fetchWeatherData);
//# sourceMappingURL=main-es5.js.map
