import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EcommerceCheckoutStore } from './ecommerce-checkout.store';

@Component({
  selector: 'app-ecommerce-summary-page',
  templateUrl: './ecommerce-summary-page.html',
  styleUrl: './ecommerce-page-frame.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceSummaryPage {
  readonly store = inject(EcommerceCheckoutStore);
  private readonly router = inject(Router);

  readonly cartEntries = this.store.cartEntries;
  readonly deliveryMethod = this.store.deliveryMethod;
  readonly subtotalCents = this.store.subtotalCents;
  readonly shippingCents = this.store.shippingCents;
  readonly totalCents = this.store.totalCents;
  readonly form = this.store.checkoutForm;

  constructor() {
    this.store.setCurrentStep('summary');
  }

  increment(variantId: 'standard' | 'blue' | 'red'): void {
    this.store.increment(variantId);
  }

  decrement(variantId: 'standard' | 'blue' | 'red'): void {
    this.store.decrement(variantId);
  }

  formatPrice(priceCents: number): string {
    return this.store.formatPrice(priceCents);
  }

  back(): void {
    this.store.setCurrentStep('delivery');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('delivery')]);
  }

  continue(): void {
    this.store.setCurrentStep('payment');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('payment')]);
  }
}
