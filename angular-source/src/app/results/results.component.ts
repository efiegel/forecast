import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
// import { TabsComponent } from './tabs/tabs.component';
// import { TabModule } from 'angular-tabs-component';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DailyModalComponent } from '../daily-modal/daily-modal.component';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private modalService: BsModalService
  ) {}

  @(ViewChild as any)('tabset') tabset: TabsetComponent;

  cur_temp;
  cur_city;
  cur_tz;
  cur_status;
  cur_humidity;
  cur_pressure;
  cur_wind;
  cur_visibility;
  cur_cloud;
  cur_ozone;


  twitter;
  tweet;
  favorite;
  wishlist;

  stateCode;
  prog_bar;
  seal;
  current;
  hourly;
  weekly;

  modalRef: BsModalRef;
  
  weatherSelect = { name: 'Temperature', value: 'temperature', units: 'Farenheit', scalefactor: 1};
  weather_array: any[] = [
    { name: 'Temperature', value: 'temperature', units: 'Farenheit', scalefactor: 1},
    { name: 'Pressure', value: 'pressure', units: 'Millibars', scalefactor: 1},
    { name: 'Humidity', value: 'humidity', units: '% Humidity', scalefactor: 100},
    { name: 'Ozone', value: 'ozone', units: 'Dobson Units', scalefactor: 1},
    { name: 'Visibility', value: 'visibility', units: 'Miles (Maximum 10)', scalefactor: 1},
    { name: 'Wind Speed', value: 'windSpeed', units: 'Miles Per Hour', scalefactor: 1}
  ];

  // Hourly chart
  hr_title;
  hr_data;
  hr_labels;
  hr_legend;
  hr_type;
  hr_options = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Time difference from current hour'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Farenheit'
        }
      }]
    }
  };

      
  // yoyo = this;
  yoyo = 'blahhhh'

  // Weekly chart
  openModal_function;
  wk_data;
  wk_labels;
  wk_legend;
  wk_type;
  wk_title;
  wk_options = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Temperature in Farenheit'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Days'
        }
      }]
    },
    tooltips: {
      callbacks: {
            title: function(tooltipItems, data) {
              return '';
            },
            label: function(tooltipItem, data) {
              return data.labels[tooltipItem.index] + ": " + Math.round(data.datasets[0].data[tooltipItem.index][0]) + " to " + Math.round(data.datasets[0].data[tooltipItem.index][1]);
            }
          }
    },    
  };

  // AIzaSyBRnWd49kEXgp9sf2bJ2xP0xz4KEDVKgKs = API key for custom search
  // cx = 015445644856242596630:frbn8uolt9t
  // https://www.googleapis.com/customsearch/v1?q=[STATE]%20State%20Seal&cx=[YOUR_SEARCH_ENGINE_ID]&imgSize=huge&imgType=news&num=1&searchType=image&key=[YOUR_API_KEY]
  // https://www.googleapis.com/customsearch/v1?q=CA%20State%20Seal&cx=015445644856242596630:frbn8uolt9t&imgSize=huge&imgType=news&num=1&searchType=image&key=AIzaSyBRnWd49kEXgp9sf2bJ2xP0xz4KEDVKgKs

  makeChart(){
    this.hr_options = {
      scaleShowVerticalLines: false,
      responsive: true,
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Time difference from current hour'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: this.weatherSelect['units']
          }
        }]
      }
    };

    this.hr_type = 'line';
    this.hr_legend = true;
    this.hr_labels = []
    this.hr_title = this.weatherSelect['name'];
    var data_array = [];
    var i;
    for (i = 0; i < 24; i++) {
      var value = JSON.parse(sessionStorage.current)['hourly']['data'][i][this.weatherSelect['value']]*this.weatherSelect['scalefactor']
      this.hr_labels.push(String(i))
      data_array.push(value);
    }
    this.hr_data = [
      {data: data_array, label: this.weatherSelect['name']}
    ];
  }

  makeWeeklyChart(){
    this.wk_type = 'horizontalBar';
    this.wk_legend = true;
    this.wk_labels = []
    this.wk_title = this.weatherSelect['name'];
    this.wk_data = []
    var data_array = [];
    var i;
    for (i = 0; i < 7; i++) {
      var day = "day" + String(i)
      // var time = JSON.parse(sessionStorage.getItem(day))['currently']['time']
      // var t_low = JSON.parse(sessionStorage.getItem(day))['daily']['data'][0]['temperatureLow']
      // var t_high = JSON.parse(sessionStorage.getItem(day))['daily']['data'][0]['temperatureHigh']
      var time = JSON.parse(sessionStorage.current)['daily']['data'][i]['time'];
      var t_low = JSON.parse(sessionStorage.current)['daily']['data'][i]['temperatureLow']
      var t_high = JSON.parse(sessionStorage.current)['daily']['data'][i]['temperatureHigh']
      var date_obj = new Date(time * 1000);
      var d = date_obj.getDate();
      var m = date_obj.getMonth();
      var y = date_obj.getFullYear();
      var date = String(m) + '/' + String(d) + '/' + String(y);      
      this.wk_labels.push(date)
      data_array.push([t_low, t_high]);
    }

    this.wk_data = [
      {data: data_array, label: 'Day wise temperature range'}
    ];        
  }

  
  openModal = (info) => {
    this.modalRef = this.modalService.show(DailyModalComponent,  {
      initialState: {
        title: info['date'],
        city: info['city'],
        temp: info['temp'],
        status: info['status'],
        icon: info['icon'],
        precip: info['precip'],
        rainchance: info['chance'],
        wind: info['wind'],
        humidity: info['humidity'],
        visibility: info['visibility'],
        data: {}
      }
    });
  }

  // seriesSelected(selectedItem) {
  //   console.log(selectedItem)
  // }

  // selectHandler(selectedItem) {
  //   console.log(selectedItem)
  //   alert('A table row was selected');
  // }

  weatherHTTP(weatherApiUrl, state_code) {
    // this.prog_bar = true;
    // const url = `http://localhost:8081/http_req?url=${weatherApiUrl}`;
    const url = `http_req?url=${weatherApiUrl}`;
    
    // console.log(url)

    var t_day0 = Math.round(new Date().getTime() / 1000); // today
    // var t_day1 = t_day0 + 1 * 24 * 60 * 60;
    // var t_day2 = t_day0 + 2 * 24 * 60 * 60;
    // var t_day3 = t_day0 + 3 * 24 * 60 * 60;
    // var t_day4 = t_day0 + 4 * 24 * 60 * 60;
    // var t_day5 = t_day0 + 5 * 24 * 60 * 60;
    // var t_day6 = t_day0 + 6 * 24 * 60 * 60;

    // note location right now is localhost8081, but will probably have to change to URL on AWS
    let current = this.http.get(url);
    // let day0 = this.http.get(`${url},${String(t_day0)}`);
    // let day1 = this.http.get(`${url},${String(t_day1)}`);
    // let day2 = this.http.get(`${url},${String(t_day2)}`);
    // let day3 = this.http.get(`${url},${String(t_day3)}`);
    // let day4 = this.http.get(`${url},${String(t_day4)}`);
    // let day5 = this.http.get(`${url},${String(t_day5)}`);
    // let day6 = this.http.get(`${url},${String(t_day6)}`);
    // console.log(state_code)
    // var seal_url = `http://localhost:8081/http_req?url=https://www.googleapis.com/customsearch/v1?q=${String(state_code)}%20State%20Seal%26cx=015445644856242596630:frbn8uolt9t%26imgSize=huge%26imgType=news%26num=1%26searchType=image%26key=AIzaSyBDublwvjEnfwS2njzo9L__2fF3ZZ0w_IY`
    var seal_url = `http_req?url=https://www.googleapis.com/customsearch/v1?q=${String(state_code)}%20State%20Seal%26cx=015445644856242596630:frbn8uolt9t%26imgSize=huge%26num=1%26searchType=image%26key=AIzaSyBDublwvjEnfwS2njzo9L__2fF3ZZ0w_IY`
    // return this.http.get(seal_url).toPromise().then(result => console.log('result', result))

    // SET THIS BACK SEPT
    console.log('check this seal url')
    console.log(seal_url)
    var seal = this.http.get(seal_url);
    // var seal = 'yo'
    
    return forkJoin([
      current,
      // day0,
      // day1,
      // day2,
      // day3,
      // day4,
      // day5,
      // day6,
      seal
    ])
    .toPromise()
    .then(results => {
      // console.log('results', results);
      sessionStorage.setItem('current', JSON.stringify(results[0])); // could be localStorage.setItem(...);
      // sessionStorage.setItem('day0', JSON.stringify(results[1]));
      // sessionStorage.setItem('day1', JSON.stringify(results[2]));
      // sessionStorage.setItem('day2', JSON.stringify(results[3]));
      // sessionStorage.setItem('day3', JSON.stringify(results[4]));
      // sessionStorage.setItem('day4', JSON.stringify(results[5]));
      // sessionStorage.setItem('day5', JSON.stringify(results[6]));
      // sessionStorage.setItem('day6', JSON.stringify(results[7]));
      // console.log(results[0]);
      // sessionStorage.setItem('seal', JSON.stringify(results[0])); // NEED TO MAKE FIRST 0 AN 8
      // sessionStorage.setItem('seal', JSON.stringify(results[0]['items'][0]['link'])); // NEED TO MAKE FIRST 0 AN 8
      
      // SET THIS BACK SEPT
      sessionStorage.setItem('seal', String(results[1]['items'][0]['link'])); // NEED TO MAKE FIRST 0 AN 8
      // sessionStorage.setItem('seal', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Seal_of_New_York.svg/2000px-Seal_of_New_York.svg.png');
      // this.prog_bar = false;
    });
  }

  async getWeather(weatherApiUrl, state_code) {
    this.prog_bar = true;
    // console.log(state_code)
    // console.log('before weatherHTTP')
    // REAL VALUE BUT MAXES OUT API CALLS DURING DEBUGGING
    // await this.weatherHTTP(weatherApiUrl, state_code);
    
    // console.log('after weatherHTTP')


    // HARDCODED JSON FOR TESTING
    // LA https://api.darksky.net/forecast/52431f2a8bae2608e2e97cf1e1cf199c/34.0308,-118.473
    // TIME FOR CURRENT JSON OBJ 1573935180

    var json_current = `{"latitude":34.0308,"longitude":-118.473,"timezone":"America/Los_Angeles","currently":{"time":1573935197,"summary":"Clear","icon":"clear-day","nearestStormDistance":474,"nearestStormBearing":32,"precipIntensity":0,"precipProbability":0,"temperature":75.41,"apparentTemperature":75.41,"dewPoint":50.71,"humidity":0.42,"pressure":1014,"windSpeed":2.79,"windGust":6.74,"windBearing":231,"cloudCover":0,"uvIndex":4,"visibility":5.414,"ozone":287.5},"minutely":{"summary":"Clear for the hour.","icon":"clear-day","data":[{"time":1573935180,"precipIntensity":0,"precipProbability":0},{"time":1573935240,"precipIntensity":0,"precipProbability":0},{"time":1573935300,"precipIntensity":0,"precipProbability":0},{"time":1573935360,"precipIntensity":0,"precipProbability":0},{"time":1573935420,"precipIntensity":0,"precipProbability":0},{"time":1573935480,"precipIntensity":0,"precipProbability":0},{"time":1573935540,"precipIntensity":0,"precipProbability":0},{"time":1573935600,"precipIntensity":0,"precipProbability":0},{"time":1573935660,"precipIntensity":0,"precipProbability":0},{"time":1573935720,"precipIntensity":0,"precipProbability":0},{"time":1573935780,"precipIntensity":0,"precipProbability":0},{"time":1573935840,"precipIntensity":0,"precipProbability":0},{"time":1573935900,"precipIntensity":0,"precipProbability":0},{"time":1573935960,"precipIntensity":0,"precipProbability":0},{"time":1573936020,"precipIntensity":0,"precipProbability":0},{"time":1573936080,"precipIntensity":0,"precipProbability":0},{"time":1573936140,"precipIntensity":0,"precipProbability":0},{"time":1573936200,"precipIntensity":0,"precipProbability":0},{"time":1573936260,"precipIntensity":0,"precipProbability":0},{"time":1573936320,"precipIntensity":0,"precipProbability":0},{"time":1573936380,"precipIntensity":0,"precipProbability":0},{"time":1573936440,"precipIntensity":0,"precipProbability":0},{"time":1573936500,"precipIntensity":0,"precipProbability":0},{"time":1573936560,"precipIntensity":0,"precipProbability":0},{"time":1573936620,"precipIntensity":0,"precipProbability":0},{"time":1573936680,"precipIntensity":0,"precipProbability":0},{"time":1573936740,"precipIntensity":0,"precipProbability":0},{"time":1573936800,"precipIntensity":0,"precipProbability":0},{"time":1573936860,"precipIntensity":0,"precipProbability":0},{"time":1573936920,"precipIntensity":0,"precipProbability":0},{"time":1573936980,"precipIntensity":0,"precipProbability":0},{"time":1573937040,"precipIntensity":0,"precipProbability":0},{"time":1573937100,"precipIntensity":0,"precipProbability":0},{"time":1573937160,"precipIntensity":0,"precipProbability":0},{"time":1573937220,"precipIntensity":0,"precipProbability":0},{"time":1573937280,"precipIntensity":0,"precipProbability":0},{"time":1573937340,"precipIntensity":0,"precipProbability":0},{"time":1573937400,"precipIntensity":0,"precipProbability":0},{"time":1573937460,"precipIntensity":0,"precipProbability":0},{"time":1573937520,"precipIntensity":0,"precipProbability":0},{"time":1573937580,"precipIntensity":0,"precipProbability":0},{"time":1573937640,"precipIntensity":0,"precipProbability":0},{"time":1573937700,"precipIntensity":0,"precipProbability":0},{"time":1573937760,"precipIntensity":0,"precipProbability":0},{"time":1573937820,"precipIntensity":0,"precipProbability":0},{"time":1573937880,"precipIntensity":0,"precipProbability":0},{"time":1573937940,"precipIntensity":0,"precipProbability":0},{"time":1573938000,"precipIntensity":0,"precipProbability":0},{"time":1573938060,"precipIntensity":0,"precipProbability":0},{"time":1573938120,"precipIntensity":0,"precipProbability":0},{"time":1573938180,"precipIntensity":0,"precipProbability":0},{"time":1573938240,"precipIntensity":0,"precipProbability":0},{"time":1573938300,"precipIntensity":0,"precipProbability":0},{"time":1573938360,"precipIntensity":0,"precipProbability":0},{"time":1573938420,"precipIntensity":0,"precipProbability":0},{"time":1573938480,"precipIntensity":0,"precipProbability":0},{"time":1573938540,"precipIntensity":0,"precipProbability":0},{"time":1573938600,"precipIntensity":0,"precipProbability":0},{"time":1573938660,"precipIntensity":0,"precipProbability":0},{"time":1573938720,"precipIntensity":0,"precipProbability":0},{"time":1573938780,"precipIntensity":0,"precipProbability":0}]},"hourly":{"summary":"Clear throughout the day.","icon":"clear-day","data":[{"time":1573934400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":74.99,"apparentTemperature":74.99,"dewPoint":50.69,"humidity":0.43,"pressure":1014.2,"windSpeed":2.74,"windGust":6.64,"windBearing":228,"cloudCover":0,"uvIndex":4,"visibility":5.35,"ozone":287.2},{"time":1573938000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":76.75,"apparentTemperature":76.75,"dewPoint":51.02,"humidity":0.41,"pressure":1013.6,"windSpeed":3.01,"windGust":7.13,"windBearing":242,"cloudCover":0,"uvIndex":3,"visibility":6.361,"ozone":288.2},{"time":1573941600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":76.66,"apparentTemperature":76.66,"dewPoint":52.85,"humidity":0.44,"pressure":1013.5,"windSpeed":4.53,"windGust":9.23,"windBearing":258,"cloudCover":0,"uvIndex":2,"visibility":10,"ozone":288.5},{"time":1573945200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":76.04,"apparentTemperature":76.04,"dewPoint":54.3,"humidity":0.47,"pressure":1013.6,"windSpeed":5.99,"windGust":11.36,"windBearing":265,"cloudCover":0,"uvIndex":1,"visibility":10,"ozone":288.3},{"time":1573948800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":74.76,"apparentTemperature":74.76,"dewPoint":54.42,"humidity":0.49,"pressure":1013.4,"windSpeed":6.67,"windGust":12.46,"windBearing":257,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":287.3},{"time":1573952400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":71.89,"apparentTemperature":71.89,"dewPoint":53.9,"humidity":0.53,"pressure":1013.8,"windSpeed":5.75,"windGust":10.11,"windBearing":196,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":285.3},{"time":1573956000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":69.31,"apparentTemperature":69.31,"dewPoint":52.46,"humidity":0.55,"pressure":1014.3,"windSpeed":5.35,"windGust":8.64,"windBearing":94,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":282.5},{"time":1573959600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":67.06,"apparentTemperature":67.06,"dewPoint":52.04,"humidity":0.59,"pressure":1014.7,"windSpeed":4.02,"windGust":4.28,"windBearing":33,"cloudCover":0.01,"uvIndex":0,"visibility":10,"ozone":280},{"time":1573963200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":65.02,"apparentTemperature":65.02,"dewPoint":51.46,"humidity":0.61,"pressure":1015.1,"windSpeed":4.72,"windGust":5.22,"windBearing":22,"cloudCover":0.01,"uvIndex":0,"visibility":10,"ozone":278.3},{"time":1573966800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":64.09,"apparentTemperature":64.09,"dewPoint":50.89,"humidity":0.62,"pressure":1015.7,"windSpeed":4.41,"windGust":4.65,"windBearing":22,"cloudCover":0.01,"uvIndex":0,"visibility":10,"ozone":276.7},{"time":1573970400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":63.19,"apparentTemperature":63.19,"dewPoint":50.61,"humidity":0.64,"pressure":1016.1,"windSpeed":5.16,"windGust":5.82,"windBearing":37,"cloudCover":0.01,"uvIndex":0,"visibility":10,"ozone":275.4},{"time":1573974000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":62.16,"apparentTemperature":62.16,"dewPoint":49.76,"humidity":0.64,"pressure":1016.1,"windSpeed":5.84,"windGust":6.81,"windBearing":28,"cloudCover":0.01,"uvIndex":0,"visibility":10,"ozone":274.6},{"time":1573977600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":61.88,"apparentTemperature":61.88,"dewPoint":48.79,"humidity":0.62,"pressure":1015.7,"windSpeed":5.77,"windGust":6.1,"windBearing":21,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":274},{"time":1573981200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":61.75,"apparentTemperature":61.75,"dewPoint":47.09,"humidity":0.59,"pressure":1015.6,"windSpeed":5.81,"windGust":6.12,"windBearing":26,"cloudCover":0.01,"uvIndex":0,"visibility":10,"ozone":273.2},{"time":1573984800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":64.76,"apparentTemperature":64.76,"dewPoint":36.36,"humidity":0.35,"pressure":1015.5,"windSpeed":6.97,"windGust":8,"windBearing":12,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":271.8},{"time":1573988400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":64.22,"apparentTemperature":64.22,"dewPoint":36,"humidity":0.35,"pressure":1015.5,"windSpeed":7.59,"windGust":8.98,"windBearing":15,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":270.3},{"time":1573992000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":64.08,"apparentTemperature":64.08,"dewPoint":35.87,"humidity":0.35,"pressure":1015.5,"windSpeed":8.05,"windGust":9.77,"windBearing":17,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":268.9},{"time":1573995600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":63.62,"apparentTemperature":63.62,"dewPoint":35.87,"humidity":0.36,"pressure":1015.7,"windSpeed":8.21,"windGust":10.27,"windBearing":18,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":268},{"time":1573999200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":63.41,"apparentTemperature":63.41,"dewPoint":35.94,"humidity":0.36,"pressure":1015.8,"windSpeed":8.2,"windGust":10.6,"windBearing":21,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":267.3},{"time":1574002800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":64.6,"apparentTemperature":64.6,"dewPoint":36.34,"humidity":0.35,"pressure":1015.9,"windSpeed":8.02,"windGust":10.81,"windBearing":22,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":266.6},{"time":1574006400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":67.76,"apparentTemperature":67.76,"dewPoint":37.19,"humidity":0.32,"pressure":1016.1,"windSpeed":7.61,"windGust":11,"windBearing":21,"cloudCover":0,"uvIndex":1,"visibility":10,"ozone":265.8},{"time":1574010000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":72.11,"apparentTemperature":72.11,"dewPoint":37.98,"humidity":0.29,"pressure":1016.3,"windSpeed":7.06,"windGust":11.06,"windBearing":19,"cloudCover":0,"uvIndex":2,"visibility":10,"ozone":265},{"time":1574013600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":76.27,"apparentTemperature":76.27,"dewPoint":37.93,"humidity":0.25,"pressure":1016.3,"windSpeed":6.51,"windGust":10.66,"windBearing":23,"cloudCover":0,"uvIndex":3,"visibility":10,"ozone":264.1},{"time":1574017200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":79.81,"apparentTemperature":79.81,"dewPoint":36.55,"humidity":0.21,"pressure":1015.9,"windSpeed":6.09,"windGust":9.34,"windBearing":35,"cloudCover":0,"uvIndex":4,"visibility":10,"ozone":262.8},{"time":1574020800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":82.99,"apparentTemperature":82.99,"dewPoint":34.54,"humidity":0.18,"pressure":1015.1,"windSpeed":5.67,"windGust":7.59,"windBearing":46,"cloudCover":0,"uvIndex":4,"visibility":10,"ozone":261.6},{"time":1574024400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":84.94,"apparentTemperature":84.94,"dewPoint":32.93,"humidity":0.15,"pressure":1014.7,"windSpeed":5.33,"windGust":6.48,"windBearing":27,"cloudCover":0,"uvIndex":3,"visibility":10,"ozone":260.9},{"time":1574028000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":84.67,"apparentTemperature":84.67,"dewPoint":33.74,"humidity":0.16,"pressure":1014.4,"windSpeed":5.14,"windGust":6.81,"windBearing":3,"cloudCover":0,"uvIndex":2,"visibility":10,"ozone":261.5},{"time":1574031600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":83,"apparentTemperature":83,"dewPoint":35.57,"humidity":0.18,"pressure":1014.1,"windSpeed":5.06,"windGust":7.88,"windBearing":333,"cloudCover":0,"uvIndex":1,"visibility":10,"ozone":262.6},{"time":1574035200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":80.66,"apparentTemperature":80.66,"dewPoint":36.58,"humidity":0.21,"pressure":1014,"windSpeed":5.06,"windGust":8.39,"windBearing":316,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.4},{"time":1574038800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":78.15,"apparentTemperature":78.15,"dewPoint":36.02,"humidity":0.22,"pressure":1014.1,"windSpeed":4.99,"windGust":7.53,"windBearing":346,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.5},{"time":1574042400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":75.07,"apparentTemperature":75.07,"dewPoint":34.85,"humidity":0.23,"pressure":1014.5,"windSpeed":4.93,"windGust":6.07,"windBearing":18,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.2},{"time":1574046000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":72.82,"apparentTemperature":72.82,"dewPoint":33.87,"humidity":0.24,"pressure":1014.8,"windSpeed":5.02,"windGust":5.21,"windBearing":9,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.2},{"time":1574049600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":71.37,"apparentTemperature":71.37,"dewPoint":31.92,"humidity":0.23,"pressure":1015,"windSpeed":5.44,"windGust":5.5,"windBearing":10,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.5},{"time":1574053200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":70.12,"apparentTemperature":70.12,"dewPoint":29.54,"humidity":0.22,"pressure":1015.2,"windSpeed":6.02,"windGust":6.42,"windBearing":16,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":264},{"time":1574056800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":68.93,"apparentTemperature":68.93,"dewPoint":27.55,"humidity":0.21,"pressure":1015.3,"windSpeed":6.51,"windGust":7.19,"windBearing":21,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":264.2},{"time":1574060400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":67.81,"apparentTemperature":67.81,"dewPoint":26.49,"humidity":0.21,"pressure":1015.3,"windSpeed":6.75,"windGust":7.47,"windBearing":21,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.5},{"time":1574064000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":66.78,"apparentTemperature":66.78,"dewPoint":25.72,"humidity":0.21,"pressure":1015,"windSpeed":6.87,"windGust":7.58,"windBearing":19,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":262.5},{"time":1574067600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":65.97,"apparentTemperature":65.97,"dewPoint":25.28,"humidity":0.21,"pressure":1014.7,"windSpeed":7.01,"windGust":7.66,"windBearing":18,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":261.9},{"time":1574071200,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":65.39,"apparentTemperature":65.39,"dewPoint":24.76,"humidity":0.21,"pressure":1014.3,"windSpeed":7.15,"windGust":7.81,"windBearing":18,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":262.2},{"time":1574074800,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":64.53,"apparentTemperature":64.53,"dewPoint":24.59,"humidity":0.22,"pressure":1014,"windSpeed":7.29,"windGust":7.93,"windBearing":17,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":262.9},{"time":1574078400,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":64.19,"apparentTemperature":64.19,"dewPoint":24.72,"humidity":0.22,"pressure":1013.9,"windSpeed":7.38,"windGust":8,"windBearing":17,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.4},{"time":1574082000,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":63.48,"apparentTemperature":63.48,"dewPoint":25.17,"humidity":0.23,"pressure":1014,"windSpeed":7.48,"windGust":8.1,"windBearing":15,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":263.2},{"time":1574085600,"summary":"Clear","icon":"clear-night","precipIntensity":0,"precipProbability":0,"temperature":63.01,"apparentTemperature":63.01,"dewPoint":25.7,"humidity":0.24,"pressure":1014.1,"windSpeed":7.52,"windGust":8.14,"windBearing":15,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":262.7},{"time":1574089200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":63.99,"apparentTemperature":63.99,"dewPoint":26.86,"humidity":0.24,"pressure":1014.3,"windSpeed":7.16,"windGust":7.82,"windBearing":14,"cloudCover":0,"uvIndex":0,"visibility":10,"ozone":262.6},{"time":1574092800,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":67.36,"apparentTemperature":67.36,"dewPoint":28.69,"humidity":0.23,"pressure":1014.3,"windSpeed":6.03,"windGust":6.78,"windBearing":9,"cloudCover":0,"uvIndex":1,"visibility":10,"ozone":263.1},{"time":1574096400,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":72.27,"apparentTemperature":72.27,"dewPoint":30.65,"humidity":0.21,"pressure":1014.3,"windSpeed":4.52,"windGust":5.39,"windBearing":0,"cloudCover":0,"uvIndex":2,"visibility":10,"ozone":264},{"time":1574100000,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":76.65,"apparentTemperature":76.65,"dewPoint":31.76,"humidity":0.19,"pressure":1014,"windSpeed":3.48,"windGust":4.42,"windBearing":12,"cloudCover":0,"uvIndex":3,"visibility":10,"ozone":264.7},{"time":1574103600,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":79.78,"apparentTemperature":79.78,"dewPoint":31.3,"humidity":0.17,"pressure":1013.4,"windSpeed":3.25,"windGust":4.12,"windBearing":69,"cloudCover":0,"uvIndex":4,"visibility":10,"ozone":264.7},{"time":1574107200,"summary":"Clear","icon":"clear-day","precipIntensity":0,"precipProbability":0,"temperature":82.21,"apparentTemperature":82.21,"dewPoint":30.16,"humidity":0.15,"pressure":1012.3,"windSpeed":3.46,"windGust":4.22,"windBearing":167,"cloudCover":0,"uvIndex":4,"visibility":10,"ozone":264.5}]},"daily":{"summary":"Light rain on Wednesday and Thursday.","icon":"rain","data":[{"time":1573891200,"summary":"Clear throughout the day.","icon":"clear-day","sunriseTime":1573914540,"sunsetTime":1573951860,"moonPhase":0.65,"precipIntensity":0.0004,"precipIntensityMax":0.0019,"precipIntensityMaxTime":1573977000,"precipProbability":0.07,"precipType":"rain","temperatureHigh":77.38,"temperatureHighTime":1573939200,"temperatureLow":61.07,"temperatureLowTime":1573980120,"apparentTemperatureHigh":76.88,"apparentTemperatureHighTime":1573939200,"apparentTemperatureLow":61.56,"apparentTemperatureLowTime":1573980120,"dewPoint":49.77,"humidity":0.57,"pressure":1014.8,"windSpeed":3.57,"windGust":12.49,"windGustTime":1573948380,"windBearing":319,"cloudCover":0,"uvIndex":4,"uvIndexTime":1573933080,"visibility":7.612,"ozone":284.2,"temperatureMin":56.15,"temperatureMinTime":1573898520,"temperatureMax":77.38,"temperatureMaxTime":1573939200,"apparentTemperatureMin":56.64,"apparentTemperatureMinTime":1573898520,"apparentTemperatureMax":76.88,"apparentTemperatureMaxTime":1573939200},{"time":1573977600,"summary":"Clear throughout the day.","icon":"clear-day","sunriseTime":1574001000,"sunsetTime":1574038260,"moonPhase":0.69,"precipIntensity":0,"precipIntensityMax":0,"precipIntensityMaxTime":1573977600,"precipProbability":0,"temperatureHigh":85.56,"temperatureHighTime":1574025540,"temperatureLow":62.51,"temperatureLowTime":1574085240,"apparentTemperatureHigh":85.06,"apparentTemperatureHighTime":1574025540,"apparentTemperatureLow":63,"apparentTemperatureLowTime":1574085240,"dewPoint":35.16,"humidity":0.28,"pressure":1015.2,"windSpeed":6.35,"windGust":11.08,"windGustTime":1574009100,"windBearing":17,"cloudCover":0,"uvIndex":4,"uvIndexTime":1574019660,"visibility":10,"ozone":265.3,"temperatureMin":61.07,"temperatureMinTime":1573980120,"temperatureMax":85.56,"temperatureMaxTime":1574025540,"apparentTemperatureMin":61.56,"apparentTemperatureMinTime":1573980120,"apparentTemperatureMax":85.06,"apparentTemperatureMaxTime":1574025540},{"time":1574064000,"summary":"Clear throughout the day.","icon":"clear-day","sunriseTime":1574087460,"sunsetTime":1574124600,"moonPhase":0.73,"precipIntensity":0,"precipIntensityMax":0,"precipIntensityMaxTime":1574150400,"precipProbability":0,"temperatureHigh":83.97,"temperatureHighTime":1574111400,"temperatureLow":57.95,"temperatureLowTime":1574167920,"apparentTemperatureHigh":83.47,"apparentTemperatureHighTime":1574111400,"apparentTemperatureLow":58.44,"apparentTemperatureLowTime":1574167920,"dewPoint":32.52,"humidity":0.25,"pressure":1012.4,"windSpeed":5.22,"windGust":8.78,"windGustTime":1574121480,"windBearing":13,"cloudCover":0.09,"uvIndex":4,"uvIndexTime":1574106000,"visibility":10,"ozone":263.5,"temperatureMin":61.89,"temperatureMinTime":1574150400,"temperatureMax":83.97,"temperatureMaxTime":1574111400,"apparentTemperatureMin":62.38,"apparentTemperatureMinTime":1574150400,"apparentTemperatureMax":83.47,"apparentTemperatureMaxTime":1574111400},{"time":1574150400,"summary":"Possible drizzle overnight.","icon":"partly-cloudy-day","sunriseTime":1574173920,"sunsetTime":1574211000,"moonPhase":0.76,"precipIntensity":0.0012,"precipIntensityMax":0.0101,"precipIntensityMaxTime":1574236800,"precipProbability":0.3,"precipType":"rain","temperatureHigh":71.8,"temperatureHighTime":1574194140,"temperatureLow":54.71,"temperatureLowTime":1574257920,"apparentTemperatureHigh":71.3,"apparentTemperatureHighTime":1574194140,"apparentTemperatureLow":55.2,"apparentTemperatureLowTime":1574257920,"dewPoint":51.42,"humidity":0.68,"pressure":1007.3,"windSpeed":5.18,"windGust":10.2,"windGustTime":1574236800,"windBearing":132,"cloudCover":0.57,"uvIndex":3,"uvIndexTime":1574191980,"visibility":10,"ozone":273,"temperatureMin":56.9,"temperatureMinTime":1574234520,"temperatureMax":71.8,"temperatureMaxTime":1574194140,"apparentTemperatureMin":57.39,"apparentTemperatureMinTime":1574234520,"apparentTemperatureMax":71.3,"apparentTemperatureMaxTime":1574194140},{"time":1574236800,"summary":"Light rain throughout the day.","icon":"rain","sunriseTime":1574260380,"sunsetTime":1574297340,"moonPhase":0.8,"precipIntensity":0.0117,"precipIntensityMax":0.0303,"precipIntensityMaxTime":1574309700,"precipProbability":0.91,"precipType":"rain","temperatureHigh":61.44,"temperatureHighTime":1574281080,"temperatureLow":52.19,"temperatureLowTime":1574334900,"apparentTemperatureHigh":60.94,"apparentTemperatureHighTime":1574281080,"apparentTemperatureLow":52.68,"apparentTemperatureLowTime":1574334900,"dewPoint":51.78,"humidity":0.83,"pressure":1004.6,"windSpeed":6.15,"windGust":10.2,"windGustTime":1574237220,"windBearing":197,"cloudCover":0.43,"uvIndex":3,"uvIndexTime":1574279460,"visibility":9.974,"ozone":313.3,"temperatureMin":52.81,"temperatureMinTime":1574323200,"temperatureMax":61.44,"temperatureMaxTime":1574281080,"apparentTemperatureMin":53.3,"apparentTemperatureMinTime":1574323200,"apparentTemperatureMax":60.94,"apparentTemperatureMaxTime":1574281080},{"time":1574323200,"summary":"Possible light rain in the morning.","icon":"rain","sunriseTime":1574346840,"sunsetTime":1574383740,"moonPhase":0.84,"precipIntensity":0.0047,"precipIntensityMax":0.018,"precipIntensityMaxTime":1574334720,"precipProbability":0.79,"precipType":"rain","temperatureHigh":63.69,"temperatureHighTime":1574370360,"temperatureLow":48.85,"temperatureLowTime":1574431080,"apparentTemperatureHigh":63.19,"apparentTemperatureHighTime":1574370360,"apparentTemperatureLow":48.46,"apparentTemperatureLowTime":1574430720,"dewPoint":51.13,"humidity":0.83,"pressure":1011.3,"windSpeed":4.93,"windGust":7.79,"windGustTime":1574335260,"windBearing":117,"cloudCover":0.43,"uvIndex":3,"uvIndexTime":1574366100,"visibility":9.412,"ozone":280.7,"temperatureMin":51.82,"temperatureMinTime":1574409600,"temperatureMax":63.69,"temperatureMaxTime":1574370360,"apparentTemperatureMin":52.31,"apparentTemperatureMinTime":1574409600,"apparentTemperatureMax":63.19,"apparentTemperatureMaxTime":1574370360},{"time":1574409600,"summary":"Partly cloudy throughout the day.","icon":"partly-cloudy-day","sunriseTime":1574433300,"sunsetTime":1574470080,"moonPhase":0.87,"precipIntensity":0.0001,"precipIntensityMax":0.0002,"precipIntensityMaxTime":1574429400,"precipProbability":0.05,"precipType":"rain","temperatureHigh":66.98,"temperatureHighTime":1574456760,"temperatureLow":50.78,"temperatureLowTime":1574518740,"apparentTemperatureHigh":66.48,"apparentTemperatureHighTime":1574456760,"apparentTemperatureLow":51.27,"apparentTemperatureLowTime":1574518740,"dewPoint":50.04,"humidity":0.78,"pressure":1018.9,"windSpeed":3.57,"windGust":8.85,"windGustTime":1574471340,"windBearing":346,"cloudCover":0.45,"uvIndex":3,"uvIndexTime":1574452440,"visibility":10,"ozone":276.2,"temperatureMin":48.85,"temperatureMinTime":1574431080,"temperatureMax":66.98,"temperatureMaxTime":1574456760,"apparentTemperatureMin":48.46,"apparentTemperatureMinTime":1574430720,"apparentTemperatureMax":66.48,"apparentTemperatureMaxTime":1574456760},{"time":1574496000,"summary":"Partly cloudy throughout the day.","icon":"partly-cloudy-day","sunriseTime":1574519760,"sunsetTime":1574556480,"moonPhase":0.91,"precipIntensity":0,"precipIntensityMax":0.0003,"precipIntensityMaxTime":1574563740,"precipProbability":0.01,"temperatureHigh":71.13,"temperatureHighTime":1574543760,"temperatureLow":49.31,"temperatureLowTime":1574603520,"apparentTemperatureHigh":70.63,"apparentTemperatureHighTime":1574543760,"apparentTemperatureLow":47.67,"apparentTemperatureLowTime":1574603940,"dewPoint":44.27,"humidity":0.59,"pressure":1019,"windSpeed":4.42,"windGust":8.57,"windGustTime":1574556180,"windBearing":349,"cloudCover":0.57,"uvIndex":3,"uvIndexTime":1574538840,"visibility":10,"ozone":279.4,"temperatureMin":50.78,"temperatureMinTime":1574518740,"temperatureMax":71.13,"temperatureMaxTime":1574543760,"apparentTemperatureMin":51.27,"apparentTemperatureMinTime":1574518740,"apparentTemperatureMax":70.63,"apparentTemperatureMaxTime":1574543760}]},"flags":{"sources":["nwspa","cmc","gfs","hrrr","icon","isd","madis","nam","sref","darksky","nearest-precip"],"nearest-station":1.623,"units":"us"},"offset":-8}`;
    sessionStorage.setItem('current', json_current);
    sessionStorage.setItem('seal', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Seal_of_New_York.svg/2000px-Seal_of_New_York.svg.png');
    
    this.seal = sessionStorage.seal;
    this.current = sessionStorage.current;
    // console.log('this.seal', this.seal);

    this.prog_bar = false;
    // var current = JSON.parse(sessionStorage.current);
    // console.log(current)

    var current_weather_obj = JSON.parse(sessionStorage.current);
    this.cur_temp = Math.round(current_weather_obj['currently']['temperature']);
    this.cur_city = sessionStorage.city;
    this.cur_tz = current_weather_obj['timezone']
    this.cur_status = current_weather_obj['currently']['summary']
    this.cur_humidity = current_weather_obj['currently']['humidity']
    this.cur_pressure = current_weather_obj['currently']['pressure']
    this.cur_wind = current_weather_obj['currently']['windSpeed']
    this.cur_visibility = current_weather_obj['currently']['visibility']
    this.cur_cloud = current_weather_obj['currently']['cloudCover']
    this.cur_ozone = current_weather_obj['currently']['ozone']

    var msg = "The current temperature at " + String(this.cur_city) + " is " + String(this.cur_temp) + "°F. The weather conditions are " + String(this.cur_status) + ". #CSCI571WeatherSearch"
    this.tweet = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(msg);

    this.makeChart()
    this.makeWeeklyChart()
  }

  setFavorite() {
    // console.log("got clicked")
    var not_in_favs = true;
    var favorites_data = JSON.parse(sessionStorage.favorites).data;
    var i = 0;
    while((i < favorites_data.length) && (not_in_favs == true)){
      {
        if((favorites_data[i]['city'] == sessionStorage.city) && (favorites_data[i]['state'] == sessionStorage.stateCode)){
          not_in_favs = false;
        }
        i++
      }
    }

    if (not_in_favs) {
      this.favorite = 'star';
      var favorites = JSON.parse(sessionStorage.favorites);
      // console.log(favorites)
      favorites.data.push({'id': favorites.data.length + 1, 'image': sessionStorage.seal, 'city': sessionStorage.city, 'state': sessionStorage.stateCode, 'wishlist': 'restore_from_trash', 'link': sessionStorage.thisLink});
      sessionStorage.favorites = JSON.stringify(favorites)
    }
  }

  ngOnInit() {

    this.twitter = 'https://cfcdnpull-creativefreedoml.netdna-ssl.com/wp-content/uploads/2017/06/Twitter-featured.png';
    
    var not_in_favs = true;
    var favorites_data = JSON.parse(sessionStorage.favorites).data;
    var i = 0;
    while((i < favorites_data.length) && (not_in_favs == true)){
      {
        if((favorites_data[i]['city'] == sessionStorage.city) && (favorites_data[i]['state'] == sessionStorage.stateCode)){
          not_in_favs = false;
        }
        i++
      }
    }

    if (not_in_favs == true){
      this.favorite = 'star_border';
    } else {
      this.favorite = 'star';
    }
      
    this.activatedRoute.queryParams.subscribe(params => {
      const url = params['url'];
      console.log('is this url trouble?')
      console.log(url)
      // const state_code = 'CA'
      // NEED TO GET STATE CODE IN HERE FROM this.state_json[this.input_state['name']]
      this.getWeather(url, sessionStorage.stateCode);
      // this.makeChart()
      // this.makeWeeklyChart()
      // this.stateCode = sessionStorage.stateCode;
      // console.log('state', this.stateCode);
    });

    (this.wk_options as any).onClick = (event, item) => {
      var symbols = {
        'clear-day': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-12-512.png', 
        'clear-night': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-12-512.png',
        'rain': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-04-512.png',
        'snow': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-19-512.png',
        'sleet': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-07-512.png',
        'wind': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-27-512.png',
        'fog': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-28-512.png',
        'cloudy': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-01-512.png',
        'partly-cloudy-day': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-02-512.png',
        'partly-cloudy-night': 'https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-02-512.png'
      }
      // var data = JSON.parse(sessionStorage.getItem('day' + String(item[0]['_index'])))
      var data = JSON.parse(sessionStorage.current)['daily']['data'][item[0]['_index']];
      var prec_val = "Heavy";
      if (data["precipIntensity"] <=0.001 ) {
				prec_val = "0";
			} else if (data["precipIntensity"] <=0.015) {
				prec_val = "Very Light";
			} else if (data["precipIntensity"] <=0.05 ) {
				prec_val = "Light";
			} else if (data["precipIntensity"] <=0.1 ) {
				prec_val = "Moderate";
			} else {
				prec_val = "Heavy";
			}

      var info = {
        'date': item[0]['_model'].label,
        'city': sessionStorage.city,
        'temp': Math.round(data["temperatureHigh"]),
        'status': data["summary"],
        'icon': symbols[data["icon"]],
        'precip': prec_val,
        'chance': data["precipIntensity"]*100,
        'wind': data["windSpeed"],
        'humidity': Math.round(data["humidity"]*100),
        'visibility': data["visibility"]
    }
      // console.log(item);
      // console.log(sessionStorage.current)
      // this.openModal(item[0]['_model'].label);
      this.openModal(info);
    }
  }
}
