# Forecast

This Angular web app fetches and displays weather forecast data. Node.js backend.

## Deployed application
http://forecast.us-west-1.elasticbeanstalk.com

![Current Weather](https://user-images.githubusercontent.com/39208323/95343648-a35a6580-086d-11eb-8196-88a0ab90d358.png)

![Weekly Weather](https://user-images.githubusercontent.com/39208323/95343822-cf75e680-086d-11eb-89d5-4a091d1a90ab.png)

## Running locally
### Development server
Run `ng serve` or `node server.js` for a dev server. Navigate to `http://localhost:8081/`.

### Build
From within the `angular-source directory`, Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--watch` flag to automatically rebuild when source files change. Use the `--prod` flag for a production build.

## APIs used
* Dark Sky for weather data
* Google places autocomplete for location search
* Google geocoding to convert locations into latitude/longitude coordinates
* Google custom search to get an image of searched city (for a background in the app)