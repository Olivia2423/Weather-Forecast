import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import moment from 'moment';
import VisitedCities from './about/VisitedCities';

const apiKey = 'a9705771638482913dc883adef2ed0d8';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const flagUrl = 'http://openweathermap.org/images/flags/';

const Pagination = ({ citiesPerPage, totalCities, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalCities / citiesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <button onClick={() => paginate(number)} className="page-link">
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const DetailedWeatherInfo = ({ city }) => {
  return (
    <div className="detailed-weather-info">
      <h2>Detailed Weather Information for {city.name}, {city.sys && city.sys.country}</h2>
      <p>Weather: {city.weather[0].description}</p>
      <p>Temperature: {city.main.temp}°C</p>
      <p>Max Temperature: {city.main.temp_max}°C</p>
      <p>Min Temperature: {city.main.temp_min}°C</p>
      <p>Wind Speed: {city.wind.speed} m/s</p>
      <p>Humidity: {city.main.humidity}%</p>
      <p>Pressure: {city.main.pressure} hPa</p>
      <p>Sunrise: {moment.unix(city.sys.sunrise).format('HH:mm:ss')}</p>
      <p>Sunset: {moment.unix(city.sys.sunset).format('HH:mm:ss')}</p>
      <p>Last Updated: {moment.unix(city.dt).format('LLLL')}</p>
    </div>
  );
};

const Home = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [citiesPerPage] = useState(3);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    getWeatherByLocation();
  }, []);

  const getWeatherByLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `${apiUrl}?lat=${latitude}&lon=${longitude}&APPID=${apiKey}&units=metric`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          if (response.ok) {
            setWeatherData([data]);
          } else {
            setError(data.message);
          }
        } catch (error) {
          setError('Error fetching weather data.');
        }
      },
      (error) => {
        setError('Error getting your location.');
      }
    );
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;

    const url = `${apiUrl}?q=${searchQuery}&APPID=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (weatherData.length === citiesPerPage) {
          setWeatherData([...weatherData, data]);
          setCurrentPage(Math.ceil((weatherData.length + 1) / citiesPerPage));
        } else {
          setWeatherData([...weatherData, data]);
        }
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error fetching weather data.');
    }
  };

  const displayWeather = () => {
    if (weatherData.length > 0) {
      return weatherData.map((city) => (
        <div key={city.id} className="card mt-4" onClick={() => setSelectedCity(city)}>
          <div className="card-body">
            <h5 className="card-title">
              {city.sys && city.sys.country && (
                <img src={`${flagUrl}${city.sys.country.toLowerCase()}.png`} alt="Country Flag" />
              )}
              <p>
                {city.name}, {city.sys && city.sys.country}
              </p>
            </h5>
            <p>{moment().format('dddd DD, MMMM YYYY HH:mm:ss')}</p>
            <p>{city.weather[0].description}</p>
            <p>
              {city.main.temp}°C temperature from {city.main.temp_min} to {city.main.temp_max}°C, wind{' '}
              {city.wind.speed} m/s, clouds {city.clouds.all}%, {city.main.pressure} hpa
            </p>
            {city.coord && (
              <p>Geo coords [{city.coord.lat}, {city.coord.lon}]</p>
            )}
          </div>
        </div>
      ));
    }
  };

  const indexOfLastCity = currentPage * citiesPerPage;
  const indexOfFirstCity = indexOfLastCity - citiesPerPage;
  const currentCities = weatherData.slice(indexOfFirstCity, indexOfLastCity);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <h1>Weather In Your City</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city name or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div id="weatherInfo" className="mt-4">
          {displayWeather()}
          <Pagination
            citiesPerPage={citiesPerPage}
            totalCities={weatherData.length}
            paginate={paginate}
          />
        </div>
      )}
      {selectedCity && (
        <div className="city-details">
          <DetailedWeatherInfo city={selectedCity} />
        </div>
      )}
      <VisitedCities />
    </div>
  );
};

export default Home;
