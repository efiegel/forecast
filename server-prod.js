//Importing dependencies
const express = require('express');
var path = require('path');
const cors = require('cors');
const request = require('request');

//Starting Express app
const app = express();

//Set the base path to the forecast dist folder
app.use(express.static(path.join(__dirname, 'angular-source/dist/forecast')));
app.use(cors());

app.get('/http_req', function(req, res) {
    const url = req.param('url');
    console.log(url);

    request.get(url, function (error, response, body) {
        console.log('ERR', error)
        console.log('RES', response)
        console.log('BODY', body)
        if (!error && response.statusCode == 200) {
          var info = JSON.parse(body)
          res.send(info);
        }
      })
});

//Any routes will be redirected to the angular app
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'angular-source/dist/forecast/index.html'));
});

//Starting server on port 8081
app.listen(8081, () => {
    console.log('Server started!');
    console.log('on port 8081');
});