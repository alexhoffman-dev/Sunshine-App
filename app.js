// this API end point wants to be passed a lat and long coordinate 
// i.e. https://api.weather.gov/points/{lat},{lon}
const weatherAPI = 'https://api.weather.gov/points/'; 
// Geocoding API endpoint needs requests to follow this pattern: 
const geoCodingAPIkey = '121c73b526be40d5ae4173c60efd311a'; 
let userAddress;
let geoCodingAPIForwardEndpoint = `https://api.geoapify.com/v1/geocode/search?text=address&format=json&apiKey=${geoCodingAPIkey}`
let userCity; 
let userLatitude; 
let userLongitude;

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
const closestSunshineLocaton = document.getElementById('closest-sunshine-location'); 

// ARM BUTTONS 
findSunButton.addEventListener('click', initSunshineSearch);
geolocateButton.addEventListener('click', geolocateUser);
manualAddressInput.addEventListener('search', findManualCoordinates);


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
    //let coordinates = await APIResults.result.addressMatches[0].coordinates
    //displayCoordinates(coordinates);
}

async function initSunshineSearch(event) {
    transitionBackground();
    let isSunny = await isSunnyAtCoords();
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


//  TO D0 
// - FIX GEOCODING API FOR MANUAL ADDRESS ENTRY 
// - DESIGN UI FOR 'FAVORITED' LOCATIONS 
// - 