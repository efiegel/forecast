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
          labelString: 'Time'
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
            labelString: 'Time'
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

    // var time = JSON.parse(sessionStorage.current)['time'];
    // console.log(time)
    // var date_obj = new Date(time * 1000);
    // var h = date_obj.getHours();
    for (i = 0; i < 24; i++) {
      var value = JSON.parse(sessionStorage.current)['hourly']['data'][i][this.weatherSelect['value']]*this.weatherSelect['scalefactor']
      var time = JSON.parse(sessionStorage.current)['hourly']['data'][i]['time']

      // let options = {
      //   timeZone: JSON.parse(sessionStorage.current)['timezone'],
      //   year: 'numeric',
      //   month: 'numeric',
      //   day: 'numeric',
      //   hour: 'numeric',
      //   minute: 'numeric',
      //   second: 'numeric',
      // },
      // formatter = new Intl.DateTimeFormat([], options);
      // // console.log(formatter.format(new Date()));
      // var date_obj = formatter.format(new Date(time * 1000));

      var date_obj = new Date(time * 1000);
      var hr = date_obj.toLocaleString('en-EN', {hour: '2-digit',   hour12: true, timeZone: JSON.parse(sessionStorage.current)['timezone']})
      // var hr = date_obj.getHours();
      // hr = (hr + 11) % 12 + 1;
      // console.log(time)

      // this.hr_labels.push(String(i))
      this.hr_labels.push(String(hr))
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
      var date = String(m + 1) + '/' + String(d) + '/' + String(y);      
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
    // var seal_url = `http_req?url=https://www.googleapis.com/customsearch/v1?q=${String(state_code)}%20State%20Seal%26cx=015445644856242596630:frbn8uolt9t%26imgSize=huge%26num=1%26searchType=image%26key=AIzaSyBDublwvjEnfwS2njzo9L__2fF3ZZ0w_IY`

    var seal_url = `http_req?url=https://www.googleapis.com/customsearch/v1?q=${String(sessionStorage.city)}%26cx=015445644856242596630:frbn8uolt9t%26imgSize=huge%26num=1%26searchType=image%26key=AIzaSyBDublwvjEnfwS2njzo9L__2fF3ZZ0w_IY`
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
    await this.weatherHTTP(weatherApiUrl, state_code);
    
    // console.log('after weatherHTTP')


    // HARDCODED JSON FOR TESTING
    // LA https://api.darksky.net/forecast/52431f2a8bae2608e2e97cf1e1cf199c/34.0308,-118.473
    // TIME FOR CURRENT JSON OBJ 1573935180

    // sessionStorage.setItem('current', json_current);
    // sessionStorage.setItem('seal', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Seal_of_New_York.svg/2000px-Seal_of_New_York.svg.png');
    
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
      // console.log('is this url trouble?')
      // console.log(url)
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
