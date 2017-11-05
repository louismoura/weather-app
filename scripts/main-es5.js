'use strict';

var apiKey = '73855c7abb85af3fe9e6ae926705ff06';
var apiKey2 = 'iNws003BsfzxWmZR16akCEz9FYqfOor3';
var appPrint = document.querySelector('.weather-info-container');
var formInput = document.querySelector('.search-form-input');
var form = document.querySelector('.search-form');
var autocompleteList = document.querySelector('.autocomplete-list');

function fetchAutocomplete(e) {
  //IF KEY PRESSED IS LETTER KEY OR BACKSPACE
  if (!(e.which >= 65 && e.which <= 90 || e.which == 8)) return;
  var inputValue = this.value.trim();
  //CLEAR LIST
  autocompleteList.innerHTML = '';
  if (inputValue.length < 3) return;
  //LOADING
  autocompleteList.innerHTML = "<li class='autocomplete-list-item loading-list'><i class='wi wi-day-sunny loading-autocomplete'></i></li>";

  fetch('https://api.openweathermap.org/data/2.5/find?q=' + inputValue + '&APPID=' + apiKey, {
    'method': 'get'
  }).then(function (res) {
    if (res.ok) {
      return res.json();
    } else {
      handleError();
    }
  }).then(function (data) {
    //IF THER IS NO DATA RETRUN
    if (!data.list.length) {
      autocompleteList.innerHTML = "<li class='error-info'>There is no such city</li>";
      return;
    }

    var cityArray = data.list.map(function (city) {
      var fechedData = fetch('http://open.mapquestapi.com/geocoding/v1/reverse?key=' + apiKey2 + '&location=' + city.coord.lat + ',' + city.coord.lon + '&includeNearestIntersection=true', {
        'method': 'get'
      }).then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          handleError();
        }
      }).then(function (data) {
        var cityDataArrayItem = {
          location: data.results[0].locations[0],
          id: city.id
        };
        return cityDataArrayItem;
      });
      return fechedData;
    });
    return cityArray;
  }).then(function (data) {
    //IF THER IS NO DATA RETURN
    if (!data) return;

    Promise.all(data).then(function (values) {
      var arrayOfCities = values.map(function (cityData) {
        var cityAndCountryName = '<p class=\'autocomplete-list-cityCountry\'>' + cityData.location.adminArea5 + ', ' + cityData.location.adminArea1 + '</p>';
        var stateName = '<span class=\'autocomplete-list-state\'>' + cityData.location.adminArea3 + '</span>';
        return '<li class=\'autocomplete-list-item\' data-id=\'' + cityData.id + '\'>\n            ' + cityAndCountryName + stateName + '\n          </li>';
      }).join('');

      autocompleteList.innerHTML = arrayOfCities;
    }).then(function () {
      var autocompleteListItems = document.querySelectorAll('.autocomplete-list-item');

      autocompleteListItems.forEach(function (listItem) {
        listItem.addEventListener('click', fetchWeatherData);
      });
    }).catch(function () {
      return handleError;
    });
  }).catch(function () {
    return handleError;
  });
}

function fetchWeatherData() {
  var id = this.dataset.id;
  //CLEAR SEARCH RESULTS
  autocompleteList.innerHTML = '';
  //ADDD LOADING SCREEN
  appPrint.innerHTML = "<i class='loading wi wi-day-sunny'></i>";

  fetch('https://api.openweathermap.org/data/2.5/weather?id=' + id + '&APPID=' + apiKey, {
    'method': 'get'
  }).then(function (res) {
    if (res.ok) {
      return res.json();
    } else {
      handleError();
    }
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

    formInput.value = data.name + ', ' + data.sys.country;
    return dataToPrint;
  }).then(function (data) {
    return appPrint.innerHTML = data;
  }).then(function () {

    var forecastContainer = document.querySelector('.forecast-days');

    fetch('https://api.openweathermap.org/data/2.5/forecast?id=' + id + '&APPID=' + apiKey).then(function (res) {
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
    return handleError;
  });
}

function handleError() {
  autocompleteList.innerHTML = "<li class='fetch-error'>Something went wrong</li>";
}

formInput.addEventListener('keyup', fetchAutocomplete);
form.addEventListener('submit', function (e) {
  return e.preventDefault();
});
//# sourceMappingURL=main-es5.js.map
