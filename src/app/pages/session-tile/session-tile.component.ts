import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingSession, TradingSessionStatus } from '../../models/trading-session';
import { FormatDatePipe } from '../../pipes/format-date.pipe';

@Component({
  selector: 'app-session-tile',
  standalone: true,
  imports: [CommonModule, FormatDatePipe],
  templateUrl: './session-tile.component.html',
  styleUrl: './session-tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionTileComponent {
  protected readonly TradingSessionStatus = TradingSessionStatus;
  
  session = input.required<TradingSession>();

  protected readonly statusClass = computed(() => {
    const status = this.session().status;
    switch (status) {
      case TradingSessionStatus.Active:
        return 'bg-green-100 text-green-800';
      case TradingSessionStatus.Scheduled:
        return 'bg-blue-100 text-blue-800';
      case TradingSessionStatus.Completed:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  });
}
