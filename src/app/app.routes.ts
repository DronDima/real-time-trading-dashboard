import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { TradingSessionComponent } from './pages/trading-session/trading-session.component';

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
