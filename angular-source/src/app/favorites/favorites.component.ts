import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  constructor() { }

  // favorites_data = JSON.parse(sessionStorage.favorites).data
  favorites = JSON.parse(sessionStorage.favorites);
  favorites_data = this.favorites.data;

  removeRow(id) {
    // console.log(element)
    // console.log(id)
    // console.log(this.favorites_data[id - 1])
    for(let i = 0; i < this.favorites_data.length; ++i){
      if (this.favorites_data[i].id === id) {
          this.favorites_data[i].id = i + 1;
          this.favorites.data[i].id = i + 1;
          this.favorites_data.splice(i,1);
          

          for(let j = i; j < this.favorites_data.length; ++j){
                this.favorites_data[j].id = j + 1;
                this.favorites.data[j].id = j + 1;
            }

      }
    }

    // var row = element.rowIndex
    // console.log(row)
    // var favorites = JSON.parse(sessionStorage.favorites);
    // delete favorites.data[row]
    sessionStorage.favorites = JSON.stringify(this.favorites)
  }

  ngOnInit() {
  }

}
