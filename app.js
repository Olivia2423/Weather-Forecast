const apiKey = 'a9705771638482913dc883adef2ed0d8';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput = document.getElementById('cityInput');
const countryInput = document.getElementById('countryInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');

searchBtn.addEventListener('click', searchWeather);

async function searchWeather() {
    const city = cityInput.value.trim();
    const country = countryInput.value.trim();
    const url = `${apiUrl}?q=${city},${country}&APPID=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
        } else {
            displayError(data.message);
        }
    } catch (error) {
        displayError('Error fetching weather data.');
    }
}

//<p>It is {new Date().toLocaleTimeString()}.</p>


// Function to get weather based on user's current location
function getWeatherByLocation() {
    navigator.geolocation.getCurrentPosition(async position => {
        const { latitude, longitude } = position.coords;
        const url = `${apiUrl}?lat=${latitude}&lon=${longitude}&APPID=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                displayWeather(data);
            } else {
                displayError(data.message);
            }
        } catch (error) {
            displayError('Error fetching weather data.');
        }
    }, error => {
        displayError('Error getting your location.');
    });
}

window.addEventListener('load', () => {
    getWeatherByLocation();
});

// Function to display weather information
function displayWeather(data) {
    const countryCode = data.sys.country.toLowerCase(); 
    const flagClass = `flag-icon-${countryCode}`; 

    // Format the date and time using moment.js
    const dateAndTime = moment().format('dddd DD, MMMM YYYY HH:mm:ss');


    const weatherData = `
        <div class="card mt-4">
            <div class="card-body">
                <h5 class="card-title">
                    <span class="${flagClass} country-flag"></span>
                    <p>${data.name}, ${data.sys.country}</p> 
                </h5>
                <img src="https://flagsapi.com/${data.sys.country}/shiny/16.png" >
                <p>${dateAndTime}</P>
                <p>${data.weather[0].description}</p>
                <p>${data.main.temp}°C temperature from ${data.main.temp_min} to ${data.main.temp_max} °C, wind ${data.wind.speed} m/s, clouds ${data.clouds.all} %, ${data.main.pressure} hpa</p>
                <p>Geo coords [${data.coord.lat}, ${data.coord.lon}]</p>
            </div>
        </div>
    `;

    weatherInfo.insertAdjacentHTML('beforeend', weatherData);
}


function displayError(message) {
    weatherInfo.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
}
