import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { TradingSessionComponent } from './components/trading-session/trading-session.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'session/:id',
    component: TradingSessionComponent
  }
];
