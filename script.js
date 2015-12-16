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
    $.getJSON("http://api.openweathermap.org/data/2.5/forecast?q=Okato,NZ&units=metric&appid=0f171838ffe7d226be21b8e88ebc6956", function(data) {
        //console.log(data);

        // Assign data to variables
        var weatherIcon = 'images/' + codes[data.list[0].weather[0].icon] + '.png';
        var tempHigh = Math.round(data.list[0].main.temp_max);
        var tempLow = Math.round(data.list[0].main.temp_min);
        var weatherDescription = data.list[0].weather[0].description;

        $('#weather_now_icon').attr('src', weatherIcon);
        $('#weather_now_temp_high').html(tempHigh);
        $('#weather_now_temp_low').html(tempLow);
        $('#weather_now_description').html(weatherDescription);
    });

    // Update the display


    console.log('Finished updating weather.');
    setTimeout(weather, 1800000); // Every half hour
}

$(document).ready(function() {
    time();
    date();
    weather();
});