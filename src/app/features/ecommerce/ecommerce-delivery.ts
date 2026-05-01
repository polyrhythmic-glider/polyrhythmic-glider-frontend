import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcommerceCheckoutStore } from './ecommerce-checkout.store';

@Component({
  selector: 'app-ecommerce-delivery',
  imports: [ReactiveFormsModule],
  templateUrl: './ecommerce-delivery.html',
  styleUrl: './ecommerce-page-frame.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceDelivery {
  readonly store = inject(EcommerceCheckoutStore);
  private readonly router = inject(Router);
  readonly form = this.store.checkoutForm;
  readonly isControlInvalid = this.store.isControlInvalid.bind(this.store);

  constructor() {
    this.store.setCurrentStep('delivery');
  }

  back(): void {
    this.store.setCurrentStep('personal');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('personal')]);
  }

  continue(): void {
    this.store.setCurrentStep('summary');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('summary')]);
  }
}
