import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable()
export class DataService {
  public location;
  constructor() { 
    this.location = new BehaviorSubject(null);
  }
}