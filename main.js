/**
 * Initial setup for ipAddress object in firebase and functions
 * to increment visit and client clicks count
 */
var visits = null;
var clientClicks = null;
var ipAddress = null;

var numIpAddresses = null;
var numLessAddresses = null;

var button = document.getElementById("button");
var clickCount = document.getElementById("clicks");

var setInitialStats = (incrementVisits) => {
    firebase.database().ref('ipAddresses/' + ipAddress + '/visits').once('value').then(function(snapshot){
        visits = snapshot.val();
        incrementVisits();
    });

    firebase.database().ref('ipAddresses/' + ipAddress + '/clicks').once('value').then(function(snapshot){
        clientClicks = snapshot.val();
        clickCount.innerHTML = clientClicks;
    });

    firebase.database().ref('ipAddresses').orderByChild('clicks').on('value', function(snapshot) {
        var addresses = snapshot.val();

        numIpAddresses = Object.keys(addresses).length;
        numLessAddresses = Object.keys(addresses).filter(key => addresses[key]["clicks"] < addresses[ipAddress]["clicks"]).length;

        document.getElementById("percentile").innerHTML = "You're in the " + (numLessAddresses * 100 / (numIpAddresses - 1)).toFixed(2) + " percentile";
    });

};

/*
* Incrementing functions (for visits and clicks)
*/
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

    clickCount.innerHTML = clientClicks;
};

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

    redness += 0.1;
    newColor = lerpColor(green, red, redness);
    button.style.backgroundColor = newColor;
    button.style.color = lerpColor(newColor, black, 0.25);

    incrementClientClicks();
};

/**
 * Functions to change the color of the button
 */
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var buttonColor = window.getComputedStyle(button, null).getPropertyValue("background-color");
buttonColor = buttonColor.substring(4, buttonColor.length - 1).split(',').map(key => Number(key));
buttonColor = rgbToHex(buttonColor[0], buttonColor[1], buttonColor[2]);

var green = "#4CAF50";
var red = "#E03C1F";
var black = "#000000";
var redness = 0;

var decreaseColor = () => {
    var newColor = lerpColor(green, red, redness);
    redness *= 0.95;
    button.style.backgroundColor = newColor;
    button.style.color = lerpColor(newColor, black, 0.25);
    setTimeout(decreaseColor, 50);
};

setTimeout(decreaseColor, 50);


/**
 * A linear interpolator for hexadecimal colors
 * @param {String} a
 * @param {String} b
 * @param {Number} amount
 * @example
 * // returns #7F7F7F
 * lerpColor('#000000', '#ffffff', 0.5)
 * @returns {String}
 */
function lerpColor(a, b, amount) { 

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

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
