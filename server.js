//Importing dependencies
const express = require('express');
var path = require('path');
const cors = require('cors');
const request = require('request');

//Starting Express app
const app = express();

// Import API keys
const fs = require('fs');
let data = fs.readFileSync('api_keys/keys.json');
let autocomplete_api_key = JSON.parse(data)['autocomplete'];
let customsearch_api_key = JSON.parse(data)['customsearch'];
let darksky_api_key = JSON.parse(data)['darksky'];
let geocode_api_key = JSON.parse(data)['geocode'];

//Set the base path to the forecast dist folder
app.use(express.static(path.join(__dirname, 'angular-source/dist/forecast')));
// app.use(express.static(path.join(__dirname, 'angular-source/src/index.html')));
app.use(cors());

app.get('/http_req', function(req, res) {
    let input_url = (req.query.url || req.body.url || req.params.url);
    let url = ''

    if (input_url.includes('AUTOCOMPLETE_API_KEY')) {
      url = input_url.replace('AUTOCOMPLETE_API_KEY', autocomplete_api_key);
    } else if (input_url.includes('CUSTOMSEARCH_API_KEY')) {
      url = input_url.replace('CUSTOMSEARCH_API_KEY', customsearch_api_key);
    } else if (input_url.includes('DARKSKY_API_KEY')) {
      url = input_url.replace('DARKSKY_API_KEY', darksky_api_key);
    } else if (input_url.includes('GEOCODE_API_KEY')) {
      url = input_url.replace('GEOCODE_API_KEY', geocode_api_key);
    } else {
      url = input_url;
    }

    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var info = JSON.parse(body)
          res.send(info);
        }
      })
});

//Any routes will be redirected to the angular app
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'angular-source/dist/forecast/index.html'));
    // res.sendFile(path.join(__dirname, 'angular-source/src/index.html'));
});

//Starting server on port 8081
app.listen(8081, () => {
    console.log('Server started!');
    console.log('on port 8081');
});