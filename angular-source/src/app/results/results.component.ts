import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
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

  prog_bar;
  background_image;
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

    for (i = 0; i < 24; i++) {
      var value = JSON.parse(sessionStorage.current)['hourly']['data'][i][this.weatherSelect['value']]*this.weatherSelect['scalefactor']
      var time = JSON.parse(sessionStorage.current)['hourly']['data'][i]['time']

      var date_obj = new Date(time * 1000);
      var hr = date_obj.toLocaleString('en-EN', {hour: '2-digit',   hour12: true, timeZone: JSON.parse(sessionStorage.current)['timezone']})

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

  weatherHTTP(weatherApiUrl) {
    const url = `http_req?url=${weatherApiUrl}`;
    var t_day0 = Math.round(new Date().getTime() / 1000); // today
    let current = this.http.get(url);

    var background_image_url = `http_req?url=https://www.googleapis.com/customsearch/v1?q=${String(sessionStorage.city)}%26cx=015445644856242596630:frbn8uolt9t%26imgSize=huge%26num=1%26searchType=image%26key=AIzaSyBDublwvjEnfwS2njzo9L__2fF3ZZ0w_IY`
    var background_image = this.http.get(background_image_url);
    
    return forkJoin([
      current,
      background_image
    ])
    .toPromise()
    .then(results => {
      sessionStorage.setItem('current', JSON.stringify(results[0])); // could be localStorage.setItem(...);
      sessionStorage.setItem('background_image', String(results[1]['items'][0]['link'])); // NEED TO MAKE FIRST 0 AN 8
    });
  }

  async getWeather(weatherApiUrl) {
    this.prog_bar = true;
    await this.weatherHTTP(weatherApiUrl);

    this.background_image = sessionStorage.background_image;
    this.current = sessionStorage.current;
    this.prog_bar = false;

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

    this.makeChart()
    this.makeWeeklyChart()
  }

  ngOnInit() {      
    this.activatedRoute.queryParams.subscribe(params => {
      const url = params['url'];
      this.getWeather(url);
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
      this.openModal(info);
    }
  }
}
