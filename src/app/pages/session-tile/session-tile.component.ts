import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TradingSession, TradingSessionStatus } from '../../models/trading-session';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { getStatusClass } from '../../utils/trading-session.utils';

@Component({
  selector: 'app-session-tile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatDatePipe],
  templateUrl: './session-tile.component.html',
  styleUrl: './session-tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionTileComponent {
  protected readonly TradingSessionStatus = TradingSessionStatus;
  
  session = input.required<TradingSession>();

  protected readonly statusClass = computed(() => getStatusClass(this.session().status));
}
