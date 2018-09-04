/**
 * Initial setup for ipAddress object in firebase and functions
 * to increment visit and client clicks count
 */
var visits = null;
var clientClicks = null;
var ipAddress = null;

var numIpAddresses = null;
var numLessAddresses = null;

var setInitialStats = (incrementVisits) => {
    firebase.database().ref('ipAddresses/' + ipAddress + '/visits').once('value').then(function(snapshot){
        visits = snapshot.val();
        incrementVisits();
    });

    firebase.database().ref('ipAddresses/' + ipAddress + '/clicks').once('value').then(function(snapshot){
        clientClicks = snapshot.val();
        document.getElementById("clicks").innerHTML = clientClicks;

        firebase.database().ref('ipAddresses').orderByChild('clicks').on('value', function(snapshot) {
            var addresses = snapshot.val();

            numIpAddresses = Object.keys(addresses).length;
            console.log(Object.keys(addresses).map(key => addresses[key]));
            numLessAddresses = Object.keys(addresses).filter(key => addresses[key]["clicks"] < addresses[ipAddress]["clicks"]).length;
            console.log(numIpAddresses);
            console.log(numLessAddresses);

            document.getElementById("percentile").innerHTML = "You're in the " + (numLessAddresses * 100 / (numIpAddresses - 1)).toFixed(2) + " percentile";
        });
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

    document.getElementById("clicks").innerHTML = clientClicks;
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

    document.getElementById("totalClicks").innerHTML = clicks + " Worldwide Clicks";
    incrementClientClicks();
};

/**
 * Function to calculate the percentile
 */
var ipAddressesRef = firebase.database().ref('ipAddresses').orderByChild('clicks').endAt(clientClicks);
// firebase.database().ref('ipAddresses').orderByChild('clicks').endAt(clientClicks);.on('value', function(snapshot) {
//     console.log(snapshot.val());
//     console.log(Object.keys(snapshot.val()).length);
// });

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