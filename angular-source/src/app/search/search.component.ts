import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map
} from 'rxjs/operators';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router, private formBuilder: FormBuilder) {}

  myControl = new FormControl();
  // myForm;

  // baseWeatherUrl;

  activeTab;

  lat;
  lon;
  isChecked;

  input_street;
  input_city;
  input_state;
  street;
  city;
  state;
  stateCode;

  state_array: any[] = [
    { name: 'Alabama', abbr: 'AL' },
    { name: 'Alaska', abbr: 'AK' },
    { name: 'Arizona', abbr: 'AZ' },
    { name: 'Arkansas', abbr: 'AR' },
    { name: 'California', abbr: 'CA' },
    { name: 'Colorado', abbr: 'CO' },
    { name: 'Connecticut', abbr: 'CT' },
    { name: 'Delaware', abbr: 'DE' },
    { name: 'District of Columbia', abbr: 'DC' },
    { name: 'Florida', abbr: 'FL' },
    { name: 'Georgia', abbr: 'GA' },
    { name: 'Hawaii', abbr: 'HI' },
    { name: 'Idaho', abbr: 'ID' },
    { name: 'Illinois', abbr: 'IL' },
    { name: 'Indiana', abbr: 'IN' },
    { name: 'Iowa', abbr: 'IA' },
    { name: 'Kansas', abbr: 'KS' },
    { name: 'Kentucky', abbr: 'KY' },
    { name: 'Louisiana', abbr: 'LA' },
    { name: 'Maine', abbr: 'ME' },
    { name: 'Maryland', abbr: 'MD' },
    { name: 'Massachusetts', abbr: 'MA' },
    { name: 'Michigan', abbr: 'MI' },
    { name: 'Minnesota', abbr: 'MN' },
    { name: 'Mississippi', abbr: 'MS' },
    { name: 'Missouri', abbr: 'MO' },
    { name: 'Montana', abbr: 'MT' },
    { name: 'Nebraska', abbr: 'NE' },
    { name: 'Nevada', abbr: 'NV' },
    { name: 'New Hampshire', abbr: 'NH' },
    { name: 'New Jersey', abbr: 'NJ' },
    { name: 'New Mexico', abbr: 'NM' },
    { name: 'New York', abbr: 'NY' },
    { name: 'North Carolina', abbr: 'NC' },
    { name: 'North Dakota', abbr: 'ND' },
    { name: 'Ohio', abbr: 'OH' },
    { name: 'Oklahoma', abbr: 'OK' },
    { name: 'Oregon', abbr: 'OR' },
    { name: 'Pennsylvania', abbr: 'PA' },
    { name: 'Rhode Island', abbr: 'RI' },
    { name: 'South Carolina', abbr: 'SC' },
    { name: 'South Dakota', abbr: 'SD' },
    { name: 'Tennessee', abbr: 'TN' },
    { name: 'Texas', abbr: 'TX' },
    { name: 'Utah', abbr: 'UT' },
    { name: 'Vermont', abbr: 'VT' },
    { name: 'Virginia', abbr: 'VA' },
    { name: 'Washington', abbr: 'WA' },
    { name: 'West Virginia', abbr: 'WV' },
    { name: 'Wisconsin', abbr: 'WI' },
    { name: 'Wyoming', abbr: 'WY' }
  ];

  state_json = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District of Columbia": "DC",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
}

  // active_tab_results(activeTab){
  //   this.activeTab = activeTab;
  // }

  // active_tab_favorites(activeTab){
  //   this.activeTab = activeTab;
  // }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term =>
        this.http
          .get(
            // `http://localhost:8081/http_req?url=https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${String(
                `http_req?url=https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${String(
              term
            )}%26types=(cities)%26language=en%26key=AIzaSyCIQbfVrmF9sxufPX_Dv6pHTrlXRmAs_88`
            //)}%26types=(cities)%26language=en%26key=AIzaSyCIQbfVrmF9sxufPX_Dv6pHTrlXRmAs_88`
          )
          .pipe(
            map(response => {
              const predictionsData = response['predictions'];
              const predictions = predictionsData.map(data => {
                // return data['structured_formatting']['main_text'];
                return data['description'];
              });
              return predictions;
            })
          )
      )
    );

  validate() {
    // Validate form
    // ~ stuff ~

    // Get lat and lon from appropriate source
    if (this.isChecked) {
      // Use current location
      // console.log('use current location')
      return this.http
        .get('http://ip-api.com/json')
        .toPromise()
        .then(results => {
          this.lat = results['lat'];
          this.lon = results['lon'];
          this.city = results['city'];
          this.stateCode = results['region'];
          // console.log(this.stateCode)
        });
    } else {
      // Use form inputs
      // console.log('use form inputs')
      // this.stateCode = this.state_json[this.input_state['name']];
      this.city = this.input_city;
      // console.log(this.input_city)
      var my_key = 'AIzaSyC0aMY171XD6J1FCarvt_QPABrYP8DL714';
      var address = encodeURIComponent(this.input_city);
      // this.stateCode = 'WY';
      var url =
        // 'http://localhost:8081/http_req?url=https://maps.googleapis.com/maps/api/geocode/json?address=' +
        'http_req?url=https://maps.googleapis.com/maps/api/geocode/json?address=' +
        address +
        '%26key=' +
        my_key;
      console.log(url)
      return this.http
        .get(url)
        .toPromise()
        .then(results => {
          this.lat =
            results['results'][0]['geometry']['location']['lat'];
          this.lon =
            results['results'][0]['geometry']['location']['lng'];
          this.city =
            // results['results'][0]['address_components'][2]['long_name'];
            // results['results'][0]['address_components'][0]['long_name'];
            results['results'][0]['formatted_address'];
          this.stateCode = 
            results['results'][0]['address_components'][3]['short_name'];
            // 1 = street, 2 = neighborhood, 3 = locality
          // ^ results for city seem to be shifted 1 index from what I expected, i.e. using 1 instead of 2 for locality
          // see example here https://maps.googleapis.com/maps/api/geocode/json?address=happy,+Los%20Angeles,+AL&key=AIzaSyALcxzl0yaxt3NR4QugHZ10PoxTFI7Aj3Q
        });
    }
  }

  // how to do simultaneous api calls?
  // does that happen here, automatically, or can the 'onsubmit' call multiple functions?
  // probably want to have onSubmit do form checking (if not done elsewhere...) and then
  // call API-specific functions as appropriate
  // getWeather(lat, lon){
  //   var t_day0 = Math.round((new Date()).getTime() / 1000); // today
  //   var t_day1 = t_day0 + 1 * 24 * 60 * 60;
  //   var t_day2 = t_day0 + 2 * 24 * 60 * 60;
  //   var t_day3 = t_day0 + 3 * 24 * 60 * 60;
  //   var t_day4 = t_day0 + 4 * 24 * 60 * 60;
  //   var t_day5 = t_day0 + 5 * 24 * 60 * 60;
  //   var t_day6 = t_day0 + 6 * 24 * 60 * 60;

  //   // note location right now is localhost8081, but will probably have to change to URL on AWS
  //   let current = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)}`);
  //   let day0 = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)},${String(t_day0)}`);
  //   let day1 = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)},${String(t_day1)}`);
  //   let day2 = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)},${String(t_day2)}`);
  //   let day3 = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)},${String(t_day3)}`);
  //   let day4 = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)},${String(t_day4)}`);
  //   let day5 = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)},${String(t_day5)}`);
  //   let day6 = this.http.get(`http://localhost:8081/http_req?url=https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(lat)},${String(lon)},${String(t_day6)}`);

  //   forkJoin([current, day0, day1, day2, day3, day4, day5, day6]).subscribe(results => {
  //     sessionStorage.setItem('current', JSON.stringify(results[0])); // could be localStorage.setItem(...);
  //     sessionStorage.setItem('day0', JSON.stringify(results[1]));
  //     sessionStorage.setItem('day1', JSON.stringify(results[2]));
  //     sessionStorage.setItem('day2', JSON.stringify(results[3]));
  //     sessionStorage.setItem('day3', JSON.stringify(results[4]));
  //     sessionStorage.setItem('day4', JSON.stringify(results[5]));
  //     sessionStorage.setItem('day5', JSON.stringify(results[6]));
  //     sessionStorage.setItem('day6', JSON.stringify(results[7]));
  //   });
  // }

  public async onSubmit() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    // console.log('before')
    await this.validate();
    // console.log('after')
    // .then(() => {
      // console.log(this.stateCode)
    sessionStorage.setItem('stateCode', this.stateCode);
    sessionStorage.setItem('city', this.city);
    const baseWeatherUrl = `https://api.darksky.net/forecast/e4433104dfed88d14141beeb380c7258/${String(
      this.lat
    )},${String(this.lon)}`;
    // var mysite = 'http://localhost:4200/results?url='
    var mysite = 'results?url='
    sessionStorage.setItem('thisLink', encodeURI(mysite) + encodeURI(baseWeatherUrl));
    // console.log(baseWeatherUrl)
    // this.getWeather(this.lat, this.lon)
    // });
    this.activeTab = 'results';
    this.router.navigate([`/results`], {
      queryParams: { url: baseWeatherUrl }
    });
    
    // console.log(baseWeatherUrl)
  }

  // checkValue(isChecked: boolean) {
  checkValue() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    if (this.isChecked) {
      this.isChecked = false;
    } else {
      this.isChecked = true;
      this.input_city = '';
      this.input_street = '';
      this.input_state = '';
    }
  }

  onClear() {
    this.isChecked = false;
    this.input_city = '';
    this.input_street = '';
    this.input_state = '';
    this.activeTab = 'results';
    this.router.navigate(['']);
  }

  displayFavorites() {
    this.activeTab = 'favorites';
    this.router.navigate(['/favorites']);
  }

  displayResults() {
    this.activeTab = 'results';
    this.router.navigate(['/results']);
  }

  ngOnInit() {
    if (sessionStorage.getItem('favorites') === null) {
      sessionStorage.setItem('favorites', '{"data":[]}');
    }
    this.activeTab = 'results';
  }
}
