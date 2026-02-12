import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { RootState } from '../../store/root.state';
import {
  selectSessionsList,
  selectSessionsListLoading,
  selectSessionsListError
} from '../../store/trading-session/trading-session.selectors';
import { TradingSessionActions } from '../../store/trading-session/trading-session.actions';
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
  private readonly store = inject(Store<RootState>);

  protected readonly sessions = toSignal(this.store.select(selectSessionsList), {
    initialValue: []
  });

  protected readonly isLoading = toSignal(this.store.select(selectSessionsListLoading), {
    initialValue: false
  });

  protected readonly error = toSignal(this.store.select(selectSessionsListError), {
    initialValue: null
  });

  constructor() {
    this.store.dispatch(TradingSessionActions.loadSessions());
  }
}
