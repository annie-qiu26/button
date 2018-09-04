/**
 * Initial setup for ipAddress object in firebase and functions
 * to increment visit and client clicks count
 */
var visits = null;
var clientClicks = null;
var ipAddress = null;

var numIpAddresses = null;
var numLessAddresses = null;

var button = document.getElementById("clicks");

var setInitialStats = (incrementVisits) => {
    firebase.database().ref('ipAddresses/' + ipAddress + '/visits').once('value').then(function(snapshot){
        visits = snapshot.val();
        incrementVisits();
    });

    firebase.database().ref('ipAddresses/' + ipAddress + '/clicks').once('value').then(function(snapshot){
        clientClicks = snapshot.val();
        button.innerHTML = clientClicks;
    });

    firebase.database().ref('ipAddresses').orderByChild('clicks').on('value', function(snapshot) {
        var addresses = snapshot.val();
    
        numIpAddresses = Object.keys(addresses).length;
        numLessAddresses = Object.keys(addresses).filter(key => addresses[key]["clicks"] < addresses[ipAddress]["clicks"]).length;
    
        document.getElementById("percentile").innerHTML = "You're in the " + (numLessAddresses * 100 / (numIpAddresses - 1)).toFixed(2) + " percentile";
    });
};

var incrementVisits = () => { 
    firebase.database().ref('ipAddresses/' + ipAddress + '/visits').set(
        visits = (visits + 1) || 1
    );
};

var incrementClientClicks = () => {
    clientClicks += 1;
    firebase.database().ref('ipAddresses/' + ipAddress + '/clicks').set(
        clicks = clientClicks
    );

    button.innerHTML = clientClicks;
}

/**
 * Getting ip address of client who visited and incrementing
 * visit count
 */
var request = new XMLHttpRequest();
var API_URL = 'https://api.ipdata.co/ip?api-key=4d52639d5af7770d42c53fe002b5b0ec80922dd9ac4fe84de2bbe35c';

request.open('GET', API_URL);

request.setRequestHeader('Accept', 'application/json');

request.onreadystatechange = function () {
 if (this.readyState === 4) {
    ipAddress = this.responseText.replace(/\./g, '-');
    setInitialStats(incrementVisits);
 }
};

request.send();


/**
 * Initial setup to get reference for firebase value of totalClicks
 */
var clicksRef = firebase.database().ref("clicks");

clicksRef.once('value').then(function(snapshot){
    document.getElementById("totalClicks").innerHTML = snapshot.val() + " Worldwide Clicks";
});

clicksRef.on("value", function(snapshot) {
    document.getElementById("totalClicks").innerHTML = snapshot.val() + " Worldwide Clicks";
});

/**
 * Function used to increment the click count and sets the value
 * in Firebase database
 */
var incrementClicks = () => {
    var clicks = parseInt(document.getElementById("totalClicks").innerHTML);
    clicks += 1;
    
    // Update counts in databse and html
    clicksRef.set(clicks = clicks);

    incrementClientClicks();
};

/**
 * Function for button click
 */
var button = document.querySelector('.button');

button.addEventListener("mousedown", function() {
    incrementClicks();
});

button.addEventListener("touchstart", function(e) {
    e.preventDefault();
    incrementClicks();
});

/**
 * Functions to change the color of the button
 */
var buttonColor = window.getComputedStyle(button, null).getPropertyValue("background-color");
console.log(buttonColor);


// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
var interpolateColor = function(color1, color2, factor) {
    if (arguments.length < 3) { factor = 0.5; }
    var result = color1.slice();
    for (var i=0;i<3;i++) {
      result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
    }
    return result;
};
