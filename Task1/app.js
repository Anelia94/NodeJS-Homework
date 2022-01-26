/* eslint-disable no-undef */
const fs = require('fs');
const http = require('http');
let nodemailer = require('nodemailer');
const configJson = require('./config.json');
require('dotenv').config({ debug: true, override: false });
const cityName = configJson.city;
const API_KEY = "68ddb3f373ff46108ba73018222501";
const URL = "http://api.weatherapi.com/v1";
const FILE_NAME = "/current.json";

const fileDescriptor = fs.openSync("output.txt", "r+");

const currentWeatherfullUrl = `${URL}${FILE_NAME}?key=${API_KEY}&q=${cityName}`;

http.get(currentWeatherfullUrl, (res) => {
    let data = "";
    res.on("data", (chunk) => {
        // Data is being received in chunks, we add it to the data variable to save it
        data += chunk;
    });
    res.on("end", () => {
        // all data has been received, now we can parse it and are done
        const parsedData = JSON.parse(data);
        const localtime = parsedData.location.localtime;
        const weather = parsedData.current.temp_c;

        const message = `Localtime: ${localtime}, Weather: ${weather}`;
        fs.writeSync(fileDescriptor, message);

        const jsonMessage = JSON.stringify(message);
        console.log(message);

        const receiver = configJson.email;
        const email = process.env.USER_EMAIL;
        const password = process.env.PASSWORD;
        sendEmail(receiver, message,email,password);

        http.createServer(function (req, res) {
            res.write(jsonMessage);
            res.end();
        }).listen(3000);
    });
});

function sendEmail(receiver, message,email,password) {
    console.log(email,password);
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: password,
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