import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingSession, TradingSessionStatus } from '../../models/trading-session';
import { SessionTileComponent } from '../session-tile/session-tile.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SessionTileComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  protected readonly sessions = signal<TradingSession[]>([
    {
      id: 1,
      name: 'Morning Session',
      startTime: '2026-02-11T09:00:00Z',
      endTime: '2026-02-11T12:00:00Z',
      status: TradingSessionStatus.Active,
      products: ['Grain', 'Oil', 'Gold'],
      createdAt: '2026-02-11T08:00:00Z'
    },
    {
      id: 2,
      name: 'Afternoon Session',
      startTime: '2026-02-11T13:00:00Z',
      endTime: '2026-02-11T17:00:00Z',
      status: TradingSessionStatus.Scheduled,
      products: ['Silver', 'Copper'],
      createdAt: '2026-02-11T08:00:00Z'
    },
    {
      id: 3,
      name: 'Evening Session',
      startTime: '2026-02-10T18:00:00Z',
      endTime: '2026-02-10T22:00:00Z',
      status: TradingSessionStatus.Completed,
      products: ['Platinum', 'Palladium'],
      createdAt: '2026-02-10T08:00:00Z'
    }
  ]);
}
