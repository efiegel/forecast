import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FavoritesComponent } from './favorites/favorites.component';
import { ResultsComponent } from './results/results.component';
import { SearchComponent } from './search/search.component';
import { DailyModalComponent } from './daily-modal/daily-modal.component';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';

import { ModalModule } from 'ngx-bootstrap/modal';

// import { BsModalService } from 'ngx-bootstrap/modal';
// import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

// import { TabModule } from 'angular-tabs-component';
// import { MatTabsModule } from '@angular/material/tabs';
 
// import { NgbdTypeaheadBasic } from './app.component';

// import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import { MatAutocompleteModule, MatInputModule } from '@angular/material';
// import {MatAutocompleteModule} from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    FavoritesComponent,
    ResultsComponent,
    SearchComponent,
    DailyModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TabsModule.forRoot(),
    ChartsModule,
    ModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ DailyModalComponent ]
})
export class AppModule {}
// export class NgbdTypeaheadBasicModule {}
