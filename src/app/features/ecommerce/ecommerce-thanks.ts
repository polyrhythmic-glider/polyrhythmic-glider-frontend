import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EcommerceCheckoutStore } from './ecommerce-checkout.store';

@Component({
  selector: 'app-ecommerce-thanks',
  templateUrl: './ecommerce-thanks.html',
  styleUrl: './ecommerce-page-frame.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceThanks {
  readonly store = inject(EcommerceCheckoutStore);
  private readonly router = inject(Router);
  readonly form = this.store.checkoutForm;
  readonly deliveryMethod = this.store.deliveryMethod;
  readonly paymentMethod = this.store.paymentMethod;

  constructor() {
    this.store.setCurrentStep('thanks');
  }

  restart(): void {
    this.store.setCurrentStep('selection');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('selection')]);
  }
}
