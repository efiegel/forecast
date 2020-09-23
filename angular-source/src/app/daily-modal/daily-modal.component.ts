import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-daily-modal',
  templateUrl: './daily-modal.component.html',
  styleUrls: ['./daily-modal.component.css']
})
export class DailyModalComponent implements OnInit {

  title;
  city;
  temp;
  status;
  icon;
  precip;
  rainchance;
  wind;
  humidity;
  visibility;
  
  constructor(
    public modalRef: BsModalRef
  ) { }

  ngOnInit() {
  }

}
