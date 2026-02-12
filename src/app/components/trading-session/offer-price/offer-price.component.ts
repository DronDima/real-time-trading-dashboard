import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-offer-price',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './offer-price.component.html',
  styleUrl: './offer-price.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferPriceComponent {
  price = input.required<number>();
  indicator = input<'up' | 'down' | null>(null);
}
