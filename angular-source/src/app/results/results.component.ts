import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DailyModalComponent } from '../daily-modal/daily-modal.component';
import { DataService } from '../data.service'

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private modalService: BsModalService,
    private dataService: DataService
  ) {}

  @(ViewChild as any)('tabset') tabset: TabsetComponent;

  temp;
  city;
  tz;
  status;
  humidity;
  pressure;
  wind;
  visibility;
  cloud;
  ozone;

  prog_bar;
  background_image;
  weather_data;
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

  // Daily chart
  openModal_function;
  daily_data;
  daily_labels;
  daily_legend;
  daily_type;
  daily_title;
  daily_options = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Temperature (Farenheit)'
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

  makeHourlyChart(){
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

    var hourly = JSON.parse(this.weather_data)['hourly']['data']

    for (i = 0; i < 24; i++) {
      var value = hourly[i][this.weatherSelect['value']]*this.weatherSelect['scalefactor']
      var time = hourly[i]['time']
      var date_obj = new Date(time * 1000);
      var hr = date_obj.toLocaleString('en-EN', {hour: '2-digit',   hour12: true, timeZone: this.tz})

      this.hr_labels.push(String(hr))
      data_array.push(value);
    }
    
    this.hr_data = [
      {data: data_array, label: this.weatherSelect['name']}
    ];
  }

  makeDailyChart(){
    this.daily_type = 'horizontalBar';
    this.daily_legend = true;
    this.daily_labels = []
    this.daily_title = this.weatherSelect['name'];
    this.daily_data = []
    var data_array = [];
    var daily = JSON.parse(this.weather_data)['daily']['data'];
    var i;


    for (i = 0; i < 7; i++) {
      var time = daily[i]['time']
      var t_low = daily[i]['temperatureLow']
      var t_high = daily[i]['temperatureHigh']
      var date_obj = new Date(time * 1000);
      var d = date_obj.getDate();
      var m = date_obj.getMonth();
      var y = date_obj.getFullYear();
      var date = String(m + 1) + '/' + String(d) + '/' + String(y);      
      this.daily_labels.push(date)
      data_array.push([t_low, t_high]);
    }

    this.daily_data = [
      {data: data_array, label: 'Daily temperature range'}
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
    let weather = this.http.get(url);

    var background_image_url = `http_req?url=https://www.googleapis.com/customsearch/v1?q=${String(this.city)}%26cx=015445644856242596630:frbn8uolt9t%26imgSize=huge%26num=1%26searchType=image%26key=CUSTOMSEARCH_API_KEY`
    var background_image = this.http.get(background_image_url);
    
    return forkJoin([
      weather,
      background_image
    ])
    .toPromise()
    .then(results => {
      this.dataService.weather.next(JSON.stringify(results[0]));
      this.dataService.background.next(results[1]['items'][0]['link']);
    });
  }

  async getWeather(weatherApiUrl) {
    this.prog_bar = true;
    await this.weatherHTTP(weatherApiUrl);
    this.prog_bar = false;

    var data = JSON.parse(this.weather_data);
    this.temp = Math.round(data['currently']['temperature']);
    this.tz = data['timezone']
    this.status = data['currently']['summary']
    this.humidity = data['currently']['humidity']
    this.pressure = data['currently']['pressure']
    this.wind = data['currently']['windSpeed']
    this.visibility = data['currently']['visibility']
    this.cloud = data['currently']['cloudCover']
    this.ozone = data['currently']['ozone']

    this.makeHourlyChart()
    this.makeDailyChart()
  }

  ngOnInit() {   
    this.dataService.location.subscribe(data => {
      this.city = data
    });

    this.dataService.background.subscribe(data => {
      this.background_image= data
    });
    this.dataService.weather.subscribe(data => {
      this.weather_data = data
    });
    
    this.activatedRoute.queryParams.subscribe(params => {
      const url = params['url'];
      this.getWeather(url);
    });

    this.weatherSelect = this.weather_array[0];

    // Modal definition (popup from daily chart tab)
    (this.daily_options as any).onClick = (event, item) => {
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

      var data = JSON.parse(this.weather_data)['daily']['data'][item[0]['_index']];
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
        'city': this.city,
        'temp': Math.round(data["temperatureHigh"]),
        'status': data["summary"],
        'icon': symbols[data["icon"]],
        'precip': prec_val,
        'chance': Math.round(data["precipProbability"]*100),
        'wind': data["windSpeed"],
        'humidity': Math.round(data["humidity"]*100),
        'visibility': data["visibility"]
    }
      this.openModal(info);
    }
  }
}
