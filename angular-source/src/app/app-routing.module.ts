import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { ResultsComponent } from './results/results.component';

// const routes: Routes = [];
// MAKE PATH TO SEARCH BE GET PATH
const routes: Routes = [
  // {
  //   path: '',
  //   component: AppComponent,
  //   children: [
  //     {
  //       path: 'favorites',
  //       pathMatch: 'full',
  //       redirectTo: 'favorites'
  //     }]
  // }
  {
          path: 'favorites',
          pathMatch: 'full',
          component: FavoritesComponent
          // redirectTo: 'favorites'
        },
        {
          path: 'results',
          // pathMatch: 'full',
          component: ResultsComponent
          // redirectTo: 'favorites'
        }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
