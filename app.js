// this API end point wants to be passed a lat and long coordinate 
// i.e. https://api.weather.gov/points/{lat},{lon}
const weatherAPI = 'https://api.weather.gov/points/'; 
// Geocoding API endpoint needs requests to follow this pattern: 
//
const geoCodingAPI = 'http://api.positionstack.com/v1/forward?access_key=eb0bd6dd816e31fec0f0c93cf1c99cad&query=search&output=json'; 

// LINK DOM ELEMENTS 
const addressInput = document.getElementById('adress-input');
const findSunButton = document.getElementById('find-sun-button');
const addressContainer = document.getElementById('address-query')

// ARM BUTTONS 
findSunButton.addEventListener('click', doThisOnClick)
addressInput.addEventListener('search', findCoordinates)

async function findCoordinates(event) {
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

function displayCoordinates(coordinates) {
    const latDisplay = document.getElementById('lat-display');
    const longDisplay = document.getElementById('long-display');
    if (typeof coordinates != "object") {
        console.error('the coordinates are not an object')
        return;
    }
    let {X , Y} = coordinates;
    

}



function doThisOnClick(event) {
    // get user location 
    console.log('this button works!')
}

// find users lat and long 
//  - either using the html geolocating api or a form input + geocoding API 