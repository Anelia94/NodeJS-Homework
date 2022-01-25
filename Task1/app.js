const API_KEY = '68ddb3f373ff46108ba73018222501';
const URL = 'http://api.weatherapi.com/v1';
const FILE_NAME = '/current.json';
fs = require('fs');
http = require('http');

const cityName = getCityNameFromFile('./config.json');
const fileDescriptor = fs.openSync("output.txt", "r+");

const currentWeatherfullUrl = `${URL}${FILE_NAME}?key=${API_KEY}&q=${cityName}`;
http.get(currentWeatherfullUrl, (res) => {

    let data = "";
    res.on("data", (chunk) => {
        // Data is being received in chunks, we add it to the data variable to save it
        data += chunk;
    })
    res.on("end", () => {
        // all data has been received, now we can parse it and are done
        const parsedData = JSON.parse(data);
        const localtime = parsedData.location.localtime;
        const weather = parsedData.current.temp_c;

        const message = getInformationAboutLocalTimeAndWeather(localtime, weather);
        fs.writeSync(fileDescriptor, message);

        const jsonMessage = JSON.stringify(message);
        console.log(message);

        http.createServer(function (req, res) {
            res.write(jsonMessage);
            res.end();
        }).listen(3000);

    });
});





function getCityNameFromFile(fileName) {
    const text = fs.readFileSync(fileName, 'utf8')
    const cityObj = JSON.parse(text);
    const cityName = cityObj.city;
    return cityName;
}

function getInformationAboutLocalTimeAndWeather(localtime, weather) {
    return `Localtime: ${localtime}, Weather: ${weather}`;
}