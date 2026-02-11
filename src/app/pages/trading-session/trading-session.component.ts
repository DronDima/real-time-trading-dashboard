import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { TradingSessionStatus } from '../../models/trading-session';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { getStatusClass } from '../../utils/trading-session.utils';
import { RootState } from '../../store/root.state';
import {
  selectCurrentSessionViewModel,
  selectSessionError,
  selectSessionLoading
} from '../../store/trading-session/trading-session.selectors';

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

  private readonly store = inject(Store<RootState>);


  protected readonly session = toSignal(this.store.select(selectCurrentSessionViewModel), {
    initialValue: null
  });

  protected readonly isLoading = toSignal(this.store.select(selectSessionLoading), {
    initialValue: false
  });

  protected readonly error = toSignal(this.store.select(selectSessionError), {
    initialValue: null
  });

  protected readonly statusClass = computed(() => getStatusClass(this.session()?.status));
}
