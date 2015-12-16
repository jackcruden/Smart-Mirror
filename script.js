// For Google Maps
var map;
var geocoder;

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
        // Let's define our first command. First the text we expect, and then the function it should call
        var commands = {
            'help': function() {
                $('#fullscreen').css('display', 'none');
                $('#speech').html('Try some of these...<br>' +
                    '"<b>Show me a map of</b> New Plymouth"<br>' +
                    '"Zoom in" / "Zoom out"<br>' +
                    '"<b>Dismiss</b>" to return to this screen<br>' +
                    '');
            },
            'dismiss': function() {
                $('#speech').html('For a list of commands just say "<b>help</b>".');
                $('#fullscreen').css('display', 'none');
            },
            'show me a map of *location': showMap,
            'zoom in': function() {
                console.log('Zooming in...');
                map.setZoom(map.zoom + 2);
            },
            'zoom out': function() {
                console.log('Zooming out...');
                map.setZoom(map.zoom - 2);
            }
        };

        // Add our commands to annyang
        annyang.addCommands(commands);

        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start();

        console.log('Listening...');
    }
}

function showMap(location) {
    console.log('Showing map of ' + location);

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

    // Display the map
    $('#fullscreen').css('display', 'block');
}

$(document).ready(function() {
    time();
    date();
    weather();
    startListening();
});