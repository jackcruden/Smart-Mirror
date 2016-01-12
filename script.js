var days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

function time() {
    console.log('Updating time...');

    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();

    if (m < 10) {
        m = "0" + m
    };

    document.getElementById('time_time').innerHTML = h + ":" + m;

    console.log('Finished updating time.');
    setTimeout(time, 10000); // Every second
}

function date() {
    console.log('Updating date...');

    var today = new Date();
    var day = today.getDay();
    var date = today.getDate();
    var month = today.getMonth();

    $('#time_date').html(days[day] + ", " + date + " " + months[month]);

    console.log('Finished updating date.');
    setTimeout(date, 60000); // Every minute
}

function weather() {
    console.log('Updating weather...');

    var codes = {
        '01d': 'sun',           '01n': 'moon',
        '02d': 'sun_cloud',     '02n': 'cloud',
        '03d': 'cloud',         '03n': 'cloud',
        '04d': 'cloud',         '04n': 'cloud',
        '09d': 'rain_light',    '09n': 'rain_light',
        '10d': 'sun_rain',      '10n': 'rain',
        '11d': 'thunder',       '11n': 'thunder',
        '13d': 'snow',          '13n': 'snow'
    };

    // Get the new weather info
    $.getJSON("http://api.openweathermap.org/data/2.5/forecast/daily?q=Okato,NZ&units=metric&cnt=5&appid=0f171838ffe7d226be21b8e88ebc6956", function(data) {
        //console.log(data);

        // Assign data to variables
        var weatherIcon = 'images/' + codes[data.list[0].weather[0].icon] + '.png';
        var tempHigh = Math.round(data.list[0].temp.max);
        var tempLow = Math.round(data.list[0].temp.min);
        var weatherDescription = data.list[0].weather[0].description;

        // Update the display
        $('#weather_now_icon').attr('src', weatherIcon);
        $('#weather_now_temp_high').html(tempHigh);
        $('#weather_now_temp_low').html(tempLow);
        $('#weather_now_description').html(weatherDescription);

        // Get and set day 1-3 data
        for (var i = 1; i < 4; i++) {
            // Get the day's data
            var dayData = data.list[i];

            // Get the placeholder
            var placeholder = $($('#weather_forecast').children()[i-1]);

            // Set the day of the week
            var timestamp = dayData.dt; // UNIX timestamp in seconds
            var date = new Date();
            date.setTime(timestamp*1000);
            $(placeholder.children()[0]).html(days[date.getDay()].substring(0, 3));

            // Set the icon
            var dayIcon = 'images/' + codes[dayData.weather[0].icon.substring(0,2)+'d'] + '.png';
            $(placeholder.children()[1]).attr('src', dayIcon);

            // Set the high
            var dayHigh = dayData.temp.max;
            $(placeholder.children()[2]).html(Math.round(dayHigh));

            // Set the low
            var dayLow = dayData.temp.min;
            $(placeholder.children()[3]).html(Math.round(dayLow));
        }
    });


    console.log('Finished updating weather.');
    setTimeout(weather, 1800000); // Every half hour
}

function startListening() {
    if (annyang) {
        var commands = {
            'hello': function() {
                $('#fullscreen').css('display', 'none');
                $('#speech_heading').html('Try some of these...');
                $('#speech_content').html(
                    '"<b>Show me a map of</b> New Plymouth"<br>' +
                    '"Zoom in" / "Zoom out"<br>' +
                    '"<b>Dismiss</b>" to return to this screen<br>' +
                    '"<b>Set a timer for</b> 5 <b>minutes</b>"<br>' +
                    '"<b>Stop the timer</b>"'
                );
                sfx.success();
                //console.log('Listening for command...');
                //startSpeech();
            },
            'dismiss': function() {
                $('#speech_heading').html('');
                $('#speech_content').html('For a list of commands just say "<b>hello</b>".');

                $('#fullscreen').remove();
                $('body').append('<div id="fullscreen"></div>');
                sfx.success();
            },
            'show me a map of *location': showMap,
            'zoom in': function() {
                console.log('Zooming in...');
                map.setZoom(map.zoom + 2);
                sfx.success();
            },
            'zoom out': function() {
                console.log('Zooming out...');
                map.setZoom(map.zoom - 2);
                sfx.success();
            },
            'set a timer for *minutes minute(s)': startTimer,
            'stop the timer': stopTimer
        };

        // Add our commands to annyang
        annyang.addCommands(commands);

        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start();

        console.log('Listening for "hello"...');
    }
}

function startSpeech() {
    if (!('webkitSpeechRecognition' in window)) {
        upgrade();
    } else {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        // Started
        recognition.onstart = function () {
            console.log('onstart');
            $('#speech_content').html('<i class="fa fa-microphone"></i>');
        };
        // Finished with result
        recognition.onresult = function (e) {
            console.log('onresult');

            // Cancel onend handler
            recognition.onend = null;
            console.log('transcript: ' + e.results[0][0].transcript);
            console.log('confidence: ' + e.results[0][0].confidence);
        };
        // Error
        recognition.onerror = function (e) {
            console.log('onerror %o', e);
        };
        // Finished with no result
        recognition.onend = function () {
            console.log('onend');
        };

        // Start listening
        recognition.start();
    }
}

var map;
var geocoder;

function showMap(location) {
    console.log('Showing map of ' + location);

    // Display the map
    $('#fullscreen').css('display', 'block');

    map = '';
    geocoder = '';

    map = new google.maps.Map(document.getElementById('fullscreen'), {
        center: {
            lat: 0,
            lng: 0
        },
        zoom: 13
    });

    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });

    sfx.success();
}

var timerRunning = false;
var timerMinutes = 0;
var timerSeconds = 0;
var timerTick;

function startTimer(minutes) {
    stopTimer();
    console.log('Starting timer for ' + minutes + ' minutes...');
    timerRunning = true;
    timerMinutes = minutes-1;
    if (timerRunning) tickTimer();
    sfx.success();
}

function tickTimer() {
    // Decrement seconds
    timerSeconds--;

    // Check if decrement minutes
    if (timerSeconds == 0 && timerMinutes > 0) {
        timerMinutes--;
    }
    // Loop seconds
    if (timerSeconds == -1) timerSeconds = 59;

    // Check if finished
    if (timerMinutes == 0 && timerSeconds == 0) {
        stopTimer();

        sfx.alarm();

        return;
    }

    // Run again
    timerTick = setTimeout(tickTimer, 1000); // Every second

    // Write to DOM
    $('#timer').html('Timer: ' + timerMinutes + ':' + timerSeconds + '....');
    $('#timer').css('display', 'block');
}

function stopTimer() {
    console.log('Stopping timer...');
    timerRunning = false;
    timerMinutes = 0;
    timerSeconds = 0;
    clearTimeout(timerTick);
    $('#timer').css('display', 'none');
    sfx.success();
}

var sfx;

$(document).ready(function() {
    time();
    date();
    weather();
    startListening();

    // Sound effects
    var library = {"success":{"Frequency":{"Start":1059.0593974478543,"ChangeSpeed":0.16908740682993084,"ChangeAmount":5.080829871818423,"Min":30,"Max":1641},"Volume":{"Sustain":0.04,"Decay":0.411,"Punch":0,"Master":1,"Attack":0.021},"Generator":{"Func":"sine","ASlide":0.02,"BSlide":0.02,"A":0,"B":0}},"fail":{"Frequency":{"Start":554,"ChangeSpeed":0.16908740682993084,"ChangeAmount":5.080829871818423,"Min":30,"Max":121},"Volume":{"Sustain":0.04,"Decay":0.411,"Punch":0,"Master":1,"Attack":0.021},"Generator":{"Func":"sine","ASlide":0.02,"BSlide":0.02,"A":0,"B":0}},"alarm":{"Frequency":{"Start":420,"ChangeSpeed":0.16908740682993084,"ChangeAmount":5.080829871818423,"Min":30,"Max":650},"Volume":{"Sustain":0.15,"Decay":1.991,"Punch":0,"Master":1,"Attack":0.021},"Generator":{"Func":"sine","ASlide":0.02,"BSlide":0.02,"A":0,"B":0}}};

    sfx = jsfx.Sounds(library);
});