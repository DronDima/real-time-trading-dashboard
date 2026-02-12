import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Offer } from '../../../models/offer';
import { FormatDatePipe } from '../../../pipes/format-date.pipe';
import { OfferPriceComponent } from '../offer-price/offer-price.component';
import { OfferVolumeComponent } from '../offer-volume/offer-volume.component';

@Component({
  selector: 'app-offer-row',
  standalone: true,
  imports: [FormatDatePipe, OfferPriceComponent, OfferVolumeComponent],
  templateUrl: './offer-row.component.html',
  styleUrl: './offer-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferRowComponent {
  offer = input.required<Offer>();
  priceIndicator = input<'up' | 'down' | null>(null);
}
