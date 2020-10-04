import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable()
export class DataService {
  public location;
  public background;
  public weather;
  constructor() { 
    this.location = new BehaviorSubject(null);
    this.background= new BehaviorSubject(null);
    this.weather = new BehaviorSubject(null);
  }
}