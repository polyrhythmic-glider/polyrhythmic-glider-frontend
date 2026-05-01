import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EcommerceCheckoutStore } from './ecommerce-checkout.store';

@Component({
  selector: 'app-ecommerce-payment',
  templateUrl: './ecommerce-payment.html',
  styleUrl: './ecommerce-page-frame.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommercePayment {
  readonly store = inject(EcommerceCheckoutStore);
  private readonly router = inject(Router);
  readonly paymentMethod = this.store.paymentMethod;

  constructor() {
    this.store.setCurrentStep('payment');
  }

  setPaymentMethod(method: 'stripe' | 'paypal'): void {
    this.store.setPaymentMethod(method);
  }

  back(): void {
    this.store.setCurrentStep('summary');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('summary')]);
  }

  continue(): void {
    this.store.setCurrentStep('thanks');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('thanks')]);
  }
}
