import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { FormControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {}

  myControl = new FormControl();

  activeTab;
  lat;
  lon;
  city;
  input_city;
  isChecked;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term =>
        this.http
          .get(`http_req?url=https://maps.googleapis.com/maps/api/place/autocomplete/json?input=
            ${String(term)}%26types=(cities)%26language=en%26key=AUTOCOMPLETE_API_KEY`
          )
          .pipe(
            map(response => {
              const predictionsData = response['predictions'];
              const predictions = predictionsData.map(data => {
                return data['description'];
              });
              return predictions;
            })
          )
      )
    );

  validate() {
    // Get lat and lon from appropriate source
    if (this.isChecked) {
      // Use current location
      return this.http
        .get('http://ip-api.com/json')
        .toPromise()
        .then(results => {
          this.lat = results['lat'];
          this.lon = results['lon'];
          this.city = results['city'] + ', ' + results['region'] + ', ' + results['countryCode'];
        });
    } else {
      this.city = this.input_city;
      var address = encodeURIComponent(this.city);
      var url = 'http_req?url=https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '%26key=GEOCODE_API_KEY';
      
      return this.http
        .get(url)
        .toPromise()
        .then(results => {
          this.lat =
            results['results'][0]['geometry']['location']['lat'];
          this.lon =
            results['results'][0]['geometry']['location']['lng'];
          this.city =
            results['results'][0]['formatted_address'];
        });
    }
  }

  public async onSubmit() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    await this.validate();

    this.dataService.location.next(this.city);
    const baseWeatherUrl = `https://api.darksky.net/forecast/DARKSKY_API_KEY/${String(this.lat)},${String(this.lon)}`;

    this.activeTab = 'results';
    this.router.navigate([`/results`], {
      queryParams: {url: baseWeatherUrl}
    });
  }

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
    }
  }

  onClear() {
    this.isChecked = false;
    this.input_city = '';
    this.activeTab = 'results';
    this.router.navigate(['']);
  }

  displayResults() {
    this.activeTab = 'results';
    this.router.navigate(['/results']);
  }

  ngOnInit() {
    this.activeTab = 'results';
  }
}
