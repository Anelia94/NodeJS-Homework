const API_KEY = '68ddb3f373ff46108ba73018222501';
const URL = 'http://api.weatherapi.com/v1';
const FILE_NAME = '/current.json';
fs = require('fs');
http = require('http');
nodemailer = require('nodemailer');

const cityName = getValueFromJSONFile('city', './config.json');

const fileDescriptor = fs.openSync("output.txt", "r+");

const currentWeatherfullUrl = `${URL}${FILE_NAME}?key=${API_KEY}&q=${cityName}`;

http.get(currentWeatherfullUrl, (res) => {
    let data = "";
    res.on("data", (chunk) => {
        // Data is being received in chunks, we add it to the data variable to save it
        data += chunk;
    })
        ; res.on("end", () => {
            // all data has been received, now we can parse it and are done
            const parsedData = JSON.parse(data);
            const localtime = parsedData.location.localtime;
            const weather = parsedData.current.temp_c;

            const message = getInformationAboutLocalTimeAndWeather(localtime, weather);
            fs.writeSync(fileDescriptor, message);

            const jsonMessage = JSON.stringify(message);
            console.log(message);

            const receiver = getValueFromJSONFile('email', './config.json');
            sendEmail(receiver, message);

            http.createServer(function (req, res) {
                res.write(jsonMessage);
                res.end();
            }).listen(3000);

        });
});


function getValueFromJSONFile(value, fileName) {
    const data = fs.readFileSync(fileName, 'utf8')
    const jsonData = JSON.parse(data);
    if (value === 'city') {
        const cityName = jsonData.city;
        return cityName;
    } else if (value === 'email') {
        const email = jsonData.email;
        return email;
    }
}

function getInformationAboutLocalTimeAndWeather(localtime, weather) {
    return `Localtime: ${localtime}, Weather: ${weather}`;
}

function sendEmail(receiver, message) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'nellyy.radeva@gmail.com',
            pass: 'ijtkwodpsdinomha'
        }
    });

    var mailOptions = {
        from: 'nellyy.radeva@gmail.com',
        to: receiver,
        subject: 'Localtime & Weather',
        text: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}