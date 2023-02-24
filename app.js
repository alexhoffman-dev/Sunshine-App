// this API end point wants to be passed a lat and long coordinate 
// i.e. https://api.weather.gov/points/{lat},{lon}
const weatherAPI = 'https://api.weather.gov/points/'; 
// Geocoding API endpoint needs requests to follow this pattern: 
// need to find a new one that uses https protocol 
const geoCodingAPI = '';
let userCity; 
let userLatitude; 
let userLongitude;


// LINK DOM ELEMENTS 
const addressInput = document.getElementById('adress-input');
const findSunButton = document.getElementById('find-sun-button');
const addressContainer = document.getElementById('address-query');
const locationQueryContainer = document.getElementById('current-location-query');
const latLongContainer = document.getElementById('location-display');
const geolocateButton = document.getElementById('geolocate-button');
const locationStatusText = document.getElementById('status');
const latDisplay = document.getElementById('lat-display');
const longDisplay = document.getElementById('long-display');
const userLocationContainer = document.getElementById('user-location-container'); 
const closestSunshineLocaton = document.getElementById('closest-sunshine-location'); 

// ARM BUTTONS 
findSunButton.addEventListener('click', initSunshineSearch);
geolocateButton.addEventListener('click', geolocateUser);
addressInput.addEventListener('search', findManualCoordinates);


async function geolocateUser() {
    locationStatusText.innerText = 'Locating...';
    navigator.geolocation.getCurrentPosition((position) => {
        displayCoordinates(position.coords.latitude, position.coords.longitude);
      }, manaullyEnterLocation);
}

function manaullyEnterLocation() {
    locationStatusText.innerText = 'Geolocation is not supported on your device...';
    document.getElementById('address-query').classList.remove('hidden');
    geolocateButton.classList.add('hidden');
}

async function findManualCoordinates(event) {
    let searchValue = event.target.value.toUpperCase();
    let stringSearchValue = searchValue.replaceAll(' ','+')
    if (stringSearchValue == '') {
        console.error('You need to enter a valid address')
        return
    } 
    let APISearch = await fetch(`${geoCodingAPI.replace('search',stringSearchValue)}`, {referrerPolicy: 'unsafe-url' 
}); 
    let APIResults = await APISearch.json();
    console.log(APIResults);
    let coordinates = await APIResults.result.addressMatches[0].coordinates
    displayCoordinates(coordinates);
}

async function initSunshineSearch(event) {
    transitionBackground();
    let isSunny = await isSunnyAtCoords();
    debugger;
    if (isSunny) {
        closestSunshineLocaton.innerHTML = userCity;
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
    // in an Ulam Spiral shape to find a truthy 'SUN' value in that points forecast JSON
    while (timer < 20 && !isSunny) {
        
        if (!changeY) {
            X = isPositive ? X + 0.5 : X - 0.5;
            stepAmount++
        } else {
            Y = isPositive ? Y + 0.5 : Y - 0.5;
            stepAmount++
        }
        isSunny = isSunnyAtCoords(X , Y); 
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
            closestSunshineLocaton.innerHTML = `Coordinates: ${X}, ${Y} `;
            document.getElementById('maps-link').href = `https://www.google.com/maps/search/?api=1&query=${X}%2C${Y}`
        };
        if (timer === 20) {
            closestSunshineLocaton.innerHTML = 'not a lick of sunshine nearby'
        }
    }

}

async function isSunnyAtCoords(lat = userLatitude, long = userLongitude) {
    let APISearch = await fetch(`${weatherAPI}${lat},${long}`);
    let APIResults = await APISearch.json();
    let userLocationForeacstURL = APIResults.properties.forecast //url for next api crunch 
    if (lat === userLatitude) {
        displayCurrentLocation(APIResults.properties.relativeLocation.properties);
    }; 
    return findSunshine(userLocationForeacstURL);
}

//returns an object boolean
async function findSunshine(forecastURL) {
    let APISearch = await fetch(forecastURL); 
    let APIResults = await APISearch.json(); 
    let variable = APIResults.properties.periods[0].detailedForecast.toUpperCase();
    return variable.includes("SUN")
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

function displayCoordinates(X , Y) {
    if (typeof X != typeof Y || typeof X != 'number' ) {
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

function transitionBackground() {
    document.body.style.backgroundImage = 'url(img/Sunny.png)'; 
    document.body.style.backgroundColor = 'white'; 
    findSunButton.classList.add('hidden');
}
