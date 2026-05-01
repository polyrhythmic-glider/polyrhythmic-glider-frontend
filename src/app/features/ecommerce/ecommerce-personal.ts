import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EcommerceCheckoutStore } from './ecommerce-checkout.store';

@Component({
  selector: 'app-ecommerce-personal',
  imports: [ReactiveFormsModule],
  templateUrl: './ecommerce-personal.html',
  styleUrl: './ecommerce-page-frame.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommercePersonal {
  readonly store = inject(EcommerceCheckoutStore);
  private readonly router = inject(Router);
  readonly form = this.store.checkoutForm;
  readonly isControlInvalid = this.store.isControlInvalid.bind(this.store);

  constructor() {
    this.store.setCurrentStep('personal');
  }

  back(): void {
    this.store.setCurrentStep('selection');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('selection')]);
  }

  continue(): void {
    this.store.setCurrentStep('delivery');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('delivery')]);
  }
}
