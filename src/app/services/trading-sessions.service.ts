import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { TradingSession } from '../models/trading-session';

@Injectable({
  providedIn: 'root'
})
export class TradingSessionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5160/api/TradingSessions';

  getSessions(): Observable<TradingSession[]> {
    return this.http.get<TradingSession[]>(this.apiUrl);
  }

  getSession(id: number): Observable<TradingSession> {
    return this.http.get<TradingSession>(`${this.apiUrl}/${id}`);
  }
}
