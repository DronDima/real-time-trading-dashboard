import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { HubConnectionState } from '@microsoft/signalr';

import { TradingSessionStatus } from '../../models/trading-session';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { getStatusClass } from '../../utils/trading-session.utils';
import {
  SortColumn,
  SortDirection,
  filterAndSortOffers,
  getNextSortState
} from '../../utils/offer-filter-sort.utils';
import { RootState } from '../../store/root.state';
import {
  selectCurrentSessionViewModel,
  selectSessionError,
  selectSessionLoading,
  selectWebSocketStatus
} from '../../store/trading-session/trading-session.selectors';
import { OfferRowComponent } from './offer-row/offer-row.component';

const INDICATOR_DURATION_MS = 2000;

@Component({
  selector: 'app-trading-session',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatDatePipe, OfferRowComponent],
  templateUrl: './trading-session.component.html',
  styleUrl: './trading-session.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradingSessionComponent {
  protected readonly TradingSessionStatus = TradingSessionStatus;

  private readonly store = inject(Store<RootState>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly indicatorTimeoutsByOfferId = new Map<
    number,
    ReturnType<typeof setTimeout>
  >();

  protected readonly session = toSignal(this.store.select(selectCurrentSessionViewModel), {
    initialValue: null
  });

  protected readonly isLoading = toSignal(this.store.select(selectSessionLoading), {
    initialValue: false
  });

  protected readonly error = toSignal(this.store.select(selectSessionError), {
    initialValue: null
  });

  private readonly webSocketStatus = toSignal(this.store.select(selectWebSocketStatus), {
    initialValue: HubConnectionState.Disconnected
  });

  protected readonly isWebSocketOnline = computed(
    () => this.webSocketStatus() === HubConnectionState.Connected
  );

  protected readonly statusClass = computed(() => getStatusClass(this.session()?.status));

  private readonly previousPrices = signal<Record<number, number>>({});
  protected readonly priceChangeIndicators = signal<Record<number, 'up' | 'down'>>({});

  protected readonly sortColumn = signal<SortColumn | null>(null);
  protected readonly sortDirection = signal<SortDirection>(null);
  protected readonly filterText = signal<string>('');

  protected readonly filteredAndSortedOffers = computed(() => {
    const sess = this.session();
    if (!sess?.offers?.length) return [];

    const res = filterAndSortOffers(
      sess.offers,
      this.filterText(),
      this.sortColumn(),
      this.sortDirection()
    );
    console.log(res);

    return res;
  });

  protected getPriceIndicator(offerId: number): 'up' | 'down' | null {
    return this.priceChangeIndicators()[offerId] ?? null;
  }

  protected onSort(column: SortColumn): void {
    const nextState = getNextSortState(
      this.sortColumn(),
      this.sortDirection(),
      column
    );
    this.sortColumn.set(nextState.column);
    this.sortDirection.set(nextState.direction);
  }

  protected getSortIndicator(column: SortColumn): 'asc' | 'desc' | null {
    if (this.sortColumn() === column) {
      return this.sortDirection();
    }
    return null;
  }

  protected onFilterChange(value: string): void {
    this.filterText.set(value);
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.indicatorTimeoutsByOfferId.forEach(t => clearTimeout(t));
      this.indicatorTimeoutsByOfferId.clear();
    });

    effect(() => {
      const sess = this.session();
      if (!sess?.offers?.length) return;

      const prev = untracked(() => this.previousPrices());
      const newPrev = { ...prev };
      const indicatorUpdates: Record<number, 'up' | 'down'> = {};

      for (const offer of sess.offers) {
        const oldPrice = prev[offer.id];
        if (oldPrice !== undefined && oldPrice !== offer.price) {
          indicatorUpdates[offer.id] = offer.price > oldPrice ? 'up' : 'down';
          const existing = this.indicatorTimeoutsByOfferId.get(offer.id);
          if (existing) clearTimeout(existing);
          const t = setTimeout(() => {
            this.indicatorTimeoutsByOfferId.delete(offer.id);
            this.priceChangeIndicators.update(m => {
              const next = { ...m };
              delete next[offer.id];
              return next;
            });
          }, INDICATOR_DURATION_MS);
          this.indicatorTimeoutsByOfferId.set(offer.id, t);
        }
        newPrev[offer.id] = offer.price;
      }

      if (Object.keys(indicatorUpdates).length > 0) {
        this.priceChangeIndicators.update(m => ({ ...m, ...indicatorUpdates }));
      }
      untracked(() => this.previousPrices.set(newPrev));
    });
  }
}
