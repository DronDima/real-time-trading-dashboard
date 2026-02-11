import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { TradingSessionStatus } from '../../models/trading-session';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { TradingSessionsService } from '../../services/trading-sessions.service';
import { getStatusClass } from '../../utils/trading-session.utils';

@Component({
  selector: 'app-trading-session',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatDatePipe],
  templateUrl: './trading-session.component.html',
  styleUrl: './trading-session.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradingSessionComponent {
  protected readonly TradingSessionStatus = TradingSessionStatus;

  private readonly route = inject(ActivatedRoute);
  private readonly tradingSessionsService = inject(TradingSessionsService);

  protected readonly session = toSignal(
    this.route.params.pipe(
      switchMap(params => this.tradingSessionsService.getSession(+params['id']))
    )
  );

  protected readonly statusClass = computed(() => getStatusClass(this.session()?.status));
}
