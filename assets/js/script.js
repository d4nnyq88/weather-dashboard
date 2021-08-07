var historyEl = document.getElementById('history');
var searchInputEl = document.getElementById('search-input');
var searchButtonEl = document.getElementById('search-button');
var currentCityEl = document.getElementById('current-city');
var currentyTempEl = document.getElementById('current-temp');
var currentyWindEl = document.getElementById('current-wind');
var currentyHumidityEl = document.getElementById('current-humidity');
var currentyUviEl = document.getElementById('current-uvi');
var uviValueEl = document.getElementById('uvi-value');
var forecastDataSection = document.querySelector('.forecast-data');

var apiUrl = "https://api.openweathermap.org";
const appId = "971216a37d6d8963b0824cde5c5d2a68";

function displaySavedLocations() {
    var locations = localStorage.getItem("savedLocations");
    if (locations) {
        var parsedLocations = JSON.parse(locations);
        parsedLocations.forEach(function (item) {
            createHistoryButton(item);
        });
    }
}

function createHistoryButton(location) {
    var listItem = document.createElement('li');
    var content = `<button data-location="${location}">${location}</button>`;
    listItem.innerHTML = content;
    historyEl.append(listItem);
}

function updateContentPane(event) {
    var buttonClicked = event.target;
    var location = buttonClicked.getAttribute("data-location");
    forecastDataSection.innerHTML = '';
    // currentCityEl.textContent = location;
    var url = `${apiUrl}/data/2.5/weather?q=${location}&units=imperial&appid=${appId}`;
    fetch(url).then(function (response) {
            if (!response.ok) {
                console.log(response.status);
            }
            return response.json();
        })
        .then(function (data) {            
            if (data.count === 0) {

                window.alert("this is not a valid location");
            }
            handleSuccessfulLocationFetch(data, location);
        })
        .catch(function () {
            window.alert('Something went wrong');
        })
}

function setLocalStorage(location) {
    var locations = localStorage.getItem("savedLocations");
    var parsedLocations = [];

    if (locations) {
        parsedLocations = JSON.parse(locations);        
    } 
    var hasLocation = parsedLocations.some(function(loc) {
        return loc.toLowerCase() === location.toLowerCase()
    })
        
    if (!hasLocation) {
        parsedLocations.push(location);
        localStorage.setItem("savedLocations", JSON.stringify(parsedLocations));
    }
}

function convertDate(unixDate) {
    var convertedDate;
    const unixTimestamp = unixDate;
    const milliseconds = unixTimestamp * 1000;
    const dateObject = new Date(milliseconds);
    var month = dateObject.toLocaleString("en-US", {month: "numeric"}) // 12
    var day = dateObject.toLocaleString("en-US", {day: "numeric"}) // 9
    var year = dateObject.toLocaleString("en-US", {year: "numeric"}) // 2019
    return convertedDate = month + '/' + day + '/' + year;
}

function handleSuccessfulLocationFetch(data, location) {
    //add the button to the history ul
    createHistoryButton(location);
    //add location to local storage
    setLocalStorage(location);
    //update the main content area
    var unixDate = data.dt;
    convertedDate = convertDate(unixDate);

    var weatherIcon = data.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/w/" + weatherIcon + ".png";
    var weatherIconEl = document.createElement('img');
    weatherIconEl.setAttribute('id','weather-icon');
    weatherIconEl.setAttribute('src', iconUrl);

    var currentCity = data.name;
    currentCityEl.textContent = currentCity + ' ' + convertedDate;
    currentCityEl.appendChild(weatherIconEl);
    
    var currentTemp = data.main.temp;
    currentyTempEl.textContent = "Temp: "+ currentTemp + "°F";

    var currentWind = data.wind.speed;
    currentyWindEl.textContent = "Wind: " + currentWind +'MPH';
    
    var currentHumidity = data.main.humidity;
    currentyHumidityEl.textContent = "Humidity: " + currentHumidity +'%';

    var latitude = data.coord.lat;
    var longitude = data.coord.lon;

    //fetch the 5 day forecast
    getFiveDayForecast(latitude, longitude)
    //https://api.openweathermap.org/data/2.5/onecall?lat=33.749&lon=-84.388&units=imperial&exclude=hourly,minutely,alerts&appid=971216a37d6d8963b0824cde5c5d2a68
}

function displayFiveDayForecast(data, location) {
    var currentUvi = data.current.uvi;
    currentyUviEl.textContent = "UV Index: " 
    uviValueEl.textContent = currentUvi;
    currentyUviEl.appendChild(uviValueEl);
    if (currentUvi < 3){
        uviValueEl.setAttribute("id", "favorable");
    } else if (currentUvi > 3 && currentUvi < 8) {
        uviValueEl.setAttribute("id", "moderate");
    } else if (currentUvi >= 8) {
        uviValueEl.setAttribute("id", "severe");
    }
    for (i=1; i < data.daily.length - 2; i++ ) {
        var forecastDate = data.daily[i].dt;
        var forecastTemp = data.daily[i].temp.day;
        var forecastWind = data.daily[i].wind_speed;
        var forecastHumidity = data.daily[i].humidity;
        convertedDate = convertDate(forecastDate);
        var forecastIcon = data.daily[i].weather[0].icon;
        var forecastIconUrl = "http://openweathermap.org/img/w/" + forecastIcon + ".png";
        
        var card = document.createElement("div");
        card.setAttribute("class", "card");
        forecastDataSection.appendChild(card);
        
        var cardBody = document.createElement("div")
        cardBody.setAttribute("class", "card-body");
        card.appendChild(cardBody);

        var cardTitle = document.createElement("h5");
        cardTitle.setAttribute("class", "card-title");
        cardTitle.textContent = convertedDate;
        cardBody.appendChild(cardTitle);

        var forecastIconEl = document.createElement('img');
        forecastIconEl.setAttribute("src", forecastIconUrl);
        cardBody.appendChild(forecastIconEl);

        var forecastList = document.createElement("dl")
        cardBody.appendChild(forecastList);
        
        var temp = document.createElement("dt");
        temp.textContent = "Temp:";
        forecastList.appendChild(temp);

        var tempContent = document.createElement("dd");
        tempContent.textContent = forecastTemp + "°F";
        forecastList.appendChild(tempContent);
        
        var wind = document.createElement("dt");
        wind.textContent = "Wind:";
        forecastList.appendChild(wind);

        var windContent = document.createElement("dd");
        windContent.textContent = forecastWind + " MPH";
        forecastList.appendChild(windContent);
        
        var humidity = document.createElement("dt");
        humidity.textContent = "Humidity:";
        forecastList.appendChild(humidity);

        var humidityContent = document.createElement("dd");
        humidityContent.textContent = forecastHumidity + "%";
        forecastList.appendChild(humidityContent);
    }
}

function getFiveDayForecast(latitude, longitude){
    var url = `${apiUrl}/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=imperial&exclude=hourly,minutely,alerts&appid=${appId}`;
    fetch(url).then(function (response) {
            if (!response.ok) {
                console.log(response.status);
            }
            return response.json();
        })
        .then(function (data) {            
            if (data.count === 0) {

                window.alert("this is not a valid location");
            }
            displayFiveDayForecast(data, location);
        })
        .catch(function () {
            window.alert('Something went wrong');
        })
}

function getLocation(event) {
    event.preventDefault();
    var location = searchInputEl.value;
    forecastDataSection.innerHTML = '';
    if (!location) {
        window.alert('Please enter a location.');
        return;
    }
    //api.openweathermap.org/data/2.5/find?q=London&appid=971216a37d6d8963b0824cde5c5d2a68

    var url = `${apiUrl}/data/2.5/weather?q=${location}&units=imperial&appid=${appId}`;
    fetch(url).then(function (response) {
            if (!response.ok) {
                console.log(response.status);
            }
            return response.json();
        })
        .then(function (data) {            
            if (data.count === 0) {

                window.alert("this is not a valid location");
            }
            handleSuccessfulLocationFetch(data, location);
        })
        .catch(function () {
            window.alert('Something went wrong');
        })
}


function setEventListeners() {
    historyEl.addEventListener('click', updateContentPane)
    searchButtonEl.addEventListener('click', getLocation);
}

function init() {
    setEventListeners();
    displaySavedLocations();
    forecastDataSection.innerHTML = '';
}

init();