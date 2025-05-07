const apiKey = 'ce94ab23acdb19b9f7a4ca2bdf000c0e';
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const weatherImg = document.getElementById('weather-img');
const temp = document.getElementById('temp');
const cityName = document.getElementById('city-name');
const forecastContainer = document.getElementById('forecast-container');

// Event listeners
searchBtn.addEventListener('click', () => {
    if (searchInput.value.trim() !== '') {
        getWeatherAndPollutionData(searchInput.value);
    }
});

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && searchInput.value.trim() !== '') {
        getWeatherAndPollutionData(searchInput.value);
    }
});

// Get default weather for London when the page loads
window.addEventListener('load', () => {
    getWeatherAndPollutionData('London');
});

// Function to fetch weather and pollution data
async function getWeatherAndPollutionData(city) {
    try {
        // Fetch city coordinates first
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const geoData = await geoResponse.json();
        
        if (geoData.length === 0) {
            alert('City not found. Please try again.');
            return;
        }
        
        const { lat, lon } = geoData[0];
        
        // Fetch current weather data
        const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Fetch 5-day forecast data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();
        
        // Display weather data
        displayCurrentWeather(currentWeatherData);
        displayForecast(forecastData);
        
        // Fetch and display pollution data
        try {
            const pollutionResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
            const pollutionData = await pollutionResponse.json();
            displayPollutionForecast(pollutionData);
        } catch (pollutionError) {
            console.error('Error fetching pollution data:', pollutionError);
            // If pollution data fails, still show weather data
            displayPollutionError();
        }
        
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Function to display current weather data
function displayCurrentWeather(data) {
    const temperature = Math.round(data.main.temp);
    const weatherCondition = data.weather[0].main;
    
    temp.innerHTML = `${temperature}°C`;
    cityName.innerHTML = data.name;
    
    // Set weather image based on condition
    setWeatherImage(weatherCondition);
}

// Function to set weather image
function setWeatherImage(condition) {
    switch(condition) {
        case 'Clear':
            weatherImg.src = 'images/clear.png';
            break;
        case 'Clouds':
            weatherImg.src = 'images/clouds.png';
            break;
        case 'Drizzle':
            weatherImg.src = 'images/drizzle.png';
            break;
        case 'Mist':
            weatherImg.src = 'images/mist.png';
            break;
        case 'Rain':
            weatherImg.src = 'images/rain.png';
            break;
        case 'Snow':
            weatherImg.src = 'images/snow.png';
            break;
        default:
            weatherImg.src = 'images/clouds.png';
    }
}

// Function to display 5-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    const dailyForecasts = [];
    const currentDate = new Date().getDate();
    
    // Get one forecast per day (at 12:00)
    for (let i = 0; i < data.list.length; i++) {
        const forecastDate = new Date(data.list[i].dt * 1000);
        const forecastDay = forecastDate.getDate();
        const forecastHour = forecastDate.getHours();
        
        // Skip current day and get forecasts for 12:00
        if (forecastDay !== currentDate && forecastHour === 12 && dailyForecasts.length < 5) {
            dailyForecasts.push(data.list[i]);
        }
    }
    
    // Create forecast cards
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const condition = forecast.weather[0].main;
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        
        let imgSrc;
        switch(condition) {
            case 'Clear':
                imgSrc = 'images/clear.png';
                break;
            case 'Clouds':
                imgSrc = 'images/clouds.png';
                break;
            case 'Drizzle':
                imgSrc = 'images/drizzle.png';
                break;
            case 'Mist':
                imgSrc = 'images/mist.png';
                break;
            case 'Rain':
                imgSrc = 'images/rain.png';
                break;
            case 'Snow':
                imgSrc = 'images/snow.png';
                break;
            default:
                imgSrc = 'images/clouds.png';
        }
        
        forecastCard.innerHTML = `
            <div class="forecast-date">${day}</div>
            <img src="${imgSrc}" alt="${condition}">
            <div class="forecast-temp">${temp}°C</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Function to display error message when pollution data can't be fetched
function displayPollutionError() {
    // Create pollution section if it doesn't exist
    let pollutionSection = document.querySelector('.pollution-forecast');
    if (!pollutionSection) {
        pollutionSection = document.createElement('div');
        pollutionSection.className = 'pollution-forecast';
        document.querySelector('.container').appendChild(pollutionSection);
    }
    
    pollutionSection.innerHTML = `
        <h3>Air Quality Forecast</h3>
        <div class="pollution-cards-container">
            <div class="pollution-error">
                <p>Air quality data is currently unavailable. Please try again later.</p>
            </div>
        </div>
    `;
}

// Function to display pollution forecast
function displayPollutionForecast(pollutionData) {
    // Create pollution section if it doesn't exist
    let pollutionSection = document.querySelector('.pollution-forecast');
    if (!pollutionSection) {
        pollutionSection = document.createElement('div');
        pollutionSection.className = 'pollution-forecast';
        document.querySelector('.container').appendChild(pollutionSection);
    }
    
    if (!pollutionData || !pollutionData.list || pollutionData.list.length === 0) {
        pollutionSection.innerHTML = `
            <h3>Air Quality Forecast</h3>
            <div class="pollution-cards-container">
                <div class="pollution-error">
                    <p>Air quality data is currently unavailable for this location.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Clear previous content and create header
    pollutionSection.innerHTML = `
        <h3>Air Quality Forecast</h3>
        <div class="pollution-cards-container" id="pollution-container"></div>
    `;
    
    const pollutionContainer = document.getElementById('pollution-container');
    
    // Get data for next 3 days
    const today = new Date();
    const dataPoints = [];
    
    // Find data points for next 3 days
    for (let i = 0; i < 3; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i + 1);
        targetDate.setHours(12, 0, 0, 0);
        
        // Find the closest data point to noon for each day
        let closestPoint = null;
        let minTimeDiff = Infinity;
        
        for (const point of pollutionData.list) {
            const pointDate = new Date(point.dt * 1000);
            const timeDiff = Math.abs(pointDate - targetDate);
            
            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestPoint = point;
            }
        }
        
        if (closestPoint) {
            dataPoints.push({
                date: new Date(closestPoint.dt * 1000),
                data: closestPoint
            });
        }
    }
    
    // Create cards for each day
    dataPoints.forEach(point => {
        const card = document.createElement('div');
        card.className = 'pollution-card';
        
        // Format date
        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(point.date);
        const dayMonth = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(point.date);
        
        // Get AQI (Air Quality Index) and determine status
        const aqi = point.data.main.aqi;
        let aqiText, aqiClass;
        
        switch(aqi) {
            case 1:
                aqiText = 'Good';
                aqiClass = 'aqi-good';
                break;
            case 2:
                aqiText = 'Fair';
                aqiClass = 'aqi-fair';
                break;
            case 3:
                aqiText = 'Moderate';
                aqiClass = 'aqi-moderate';
                break;
            case 4:
                aqiText = 'Poor';
                aqiClass = 'aqi-poor';
                break;
            case 5:
                aqiText = 'Very Poor';
                aqiClass = 'aqi-very-poor';
                break;
            default:
                aqiText = 'Unknown';
                aqiClass = '';
        }
        
        // Get components
        const components = point.data.components;
        
        // Create card content
        card.innerHTML = `
            <div class="pollution-date">${dayName}, ${dayMonth}</div>
            <div class="pollution-aqi ${aqiClass}">
                <span class="aqi-label">AQI: </span>
                <span class="aqi-value">${aqiText}</span>
            </div>
            <div class="pollution-details">
                <div class="pollutant"><span>PM2.5:</span> ${components.pm2_5.toFixed(1)} μg/m³</div>
                <div class="pollutant"><span>PM10:</span> ${components.pm10.toFixed(1)} μg/m³</div>
                <div class="pollutant"><span>NO₂:</span> ${components.no2.toFixed(1)} μg/m³</div>
                <div class="pollutant"><span>O₃:</span> ${components.o3.toFixed(1)} μg/m³</div>
            </div>
        `;
        
        pollutionContainer.appendChild(card);
    });
}
