import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { TradingSession } from '../../models/trading-session';
import { SessionTileComponent } from '../session-tile/session-tile.component';
import { TradingSessionsService } from '../../services/trading-sessions.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SessionTileComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly tradingSessionsService = inject(TradingSessionsService);

  protected readonly sessions = toSignal(
    this.tradingSessionsService.getSessions(),
    { initialValue: [] as TradingSession[] }
  );
}
