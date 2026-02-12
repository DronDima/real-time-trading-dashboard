import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-offer-volume',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './offer-volume.component.html',
  styleUrl: './offer-volume.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferVolumeComponent {
  volume = input.required<number>();
}
