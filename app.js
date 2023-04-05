// this API end point wants to be passed a lat and long coordinate 
// i.e. https://api.weather.gov/points/{lat},{lon}
const weatherAPI = 'https://api.weather.gov/points/'; 
// Geocoding API endpoint needs requests to follow this pattern: 
const geoCodingAPIkey = '121c73b526be40d5ae4173c60efd311a'; 
let userAddress;
let userCity; 
let userLatitude; 
let userLongitude;
let geoCodingAPIForwardEndpoint = `https://api.geoapify.com/v1/geocode/search?text=address&format=json&apiKey=${geoCodingAPIkey}`;

// LINK DOM ELEMENTS 
const manualAddressInput = document.getElementById('adress-input');
const findSunButton = document.getElementById('find-sun-button');
const addressContainer = document.getElementById('address-query');
const locationQueryContainer = document.getElementById('current-location-query');
const latLongContainer = document.getElementById('location-display');
const geolocateButton = document.getElementById('geolocate-button');
const locationStatusText = document.getElementById('status');
const latDisplay = document.getElementById('lat-display');
const longDisplay = document.getElementById('long-display');
const userLocationContainer = document.getElementById('user-location-container'); 
const closestSunshineLocation = document.getElementById('closest-sunshine-location'); 

// ARM BUTTONS 
findSunButton.addEventListener('click', initSunshineSearch);
geolocateButton.addEventListener('click', geolocateUser);
manualAddressInput.addEventListener('search', findManualCoordinates);

// Uses the navigatorAPI to try and get user's location.
// If successful, displays user coords and sets userLatitude & userLongitude.
// If unsuccessful, shows a form to manually enter address. Upon submission, calls GeoCoding API to get coords from address.
// In either case, Find Sunshine button is eventually shown.
async function geolocateUser() {
    locationStatusText.innerText = 'Locating...';
    navigator.geolocation.getCurrentPosition((position) => {
        displayCoordinates(position.coords.latitude, position.coords.longitude);
    }, manuallyEnterLocation);
}

function displayCoordinates(X, Y) {
    if (typeof X != typeof Y || typeof X != 'number') {
        return
    }
    locationQueryContainer.classList.add('hidden');
    latLongContainer.classList.remove('hidden');
    findSunButton.classList.remove('hidden');
    latDisplay.innerText = `X: ${X}`;
    longDisplay.innerText = `Y: ${Y}`;
    userLatitude = X.toFixed(4);
    userLongitude = Y.toFixed(4);
}

function manuallyEnterLocation() {
    locationStatusText.innerText = 'Geolocation is not supported on your device...';
    document.getElementById('address-query').classList.remove('hidden');
    geolocateButton.classList.add('hidden');
}

async function findManualCoordinates(event) {
    let searchValue = event.target.value.toUpperCase().replaceAll(' ','%20');
    let sanitizedQuery = searchValue.replaceAll(',','%2C');
    if (sanitizedQuery == '') {
        console.error('You need to enter a valid address')
        return
    } 
    let userAddress = geoCodingAPIForwardEndpoint.replace('address',`${sanitizedQuery}`);
    console.log(userAddress);
    let APISearch = await fetch(`${userAddress}`); 
    let APIResults = await APISearch.json();
    console.log(APIResults);
    userLatitude = APIResults.results[0].lat; 
    userLongitude = APIResults.results[0].lon;
    displayCoordinates(userLatitude, userLongitude);
}

// This method 
async function initSunshineSearch(event) {
    transitionBackground();
    let isSunny = await isSunnyAtCoords();
    if (isSunny) {
        closestSunshineLocation.innerHTML = userCity;
        return;
    } 
    let X = parseFloat(userLatitude);
    let Y = parseFloat(userLongitude); 
    let pathDistance = 1;
    let stepAmount = 0; 
    let isPositive = true; 
    let changeY = false;
    let timer = 0;  
    // this logic takes our starting X, Y coordinates and increments on them .5 degrees at a time
    // in an Ulam Spiral shape to find a truthy 'SUN' value in that points' forecast JSON
    // Timer initially set to 20 
    while (timer < 20 && !isSunny) {
        if (!changeY) {
            X = isPositive ? X + 0.5 : X - 0.5;
            stepAmount++
        } else {
            Y = isPositive ? Y + 0.5 : Y - 0.5;
            stepAmount++
        }
        isSunny = await isSunnyAtCoords(X , Y); 
        if (stepAmount === pathDistance) {
            if (changeY) {
                pathDistance++; 
                isPositive = !isPositive; 
            }
            stepAmount = 0; 
            changeY = !changeY; 
        } 
        timer++;
        if (isSunny) {
            //debugger;
            closestSunshineLocation.innerHTML = `Coordinates: ${X}, ${Y} `;
            document.getElementById('maps-link').href = `https://www.google.com/maps/search/?api=1&query=${X}%2C${Y}`
        };
        if (timer === 20) {
            closestSunshineLocation.innerHTML = 'not a lick of sunshine nearby'
        }
    }

}

async function isSunnyAtCoords(lat = userLatitude, long = userLongitude) {
    let response = await fetch(`${weatherAPI}${lat},${long}`);
    let parsedResponse = await response.json();
    let userLocationForecastURL = parsedResponse.properties.forecast // url for next api crunch 
    if (lat === userLatitude && long === userLongitude) {
        displayCurrentLocation(parsedResponse.properties.relativeLocation.properties);
    }; 
    return isSunnyAtGridPoint(userLocationForecastURL);
}

async function isSunnyAtGridPoint(forecastURL) {
    let response = await fetch(forecastURL);
    let parsedResponse = await response.json();
    console.log(parsedResponse);
    // [0] index of parsedResponse accesses the current weather data, where [1] returns weather data for 
    // the next time period ie. this afternoon, evening, or tonight. 
    let variable = parsedResponse.properties.periods[0].detailedForecast.toUpperCase();
    let isSunny = variable.includes("SUN");
    return isSunny;
}

function displayCurrentLocation(locationObject) {
    if (typeof locationObject != 'object') {
        return
    }; 
    let {city, state} = locationObject;
    userCity = `${city}, ${state}`
    userLocationContainer.classList.remove('hidden'); 
    document.getElementById('city').innerHTML = `${city}`
    document.getElementById('state').innerHTML = `${state}`
}

function transitionBackground() {
    document.body.style.backgroundImage = 'url(img/Sunny.png)'; 
    document.body.style.backgroundColor = 'white'; 
    findSunButton.classList.add('hidden');
}


//  ***** TO D0 *****
// - DESIGN UI FOR 'FAVORITED' LOCATIONS + log in + simple back end for storing locations
// - FIX TRY/RETRY ASYNC CALL @ isSunnyAtCoords
//  ***** TO D0 *****
