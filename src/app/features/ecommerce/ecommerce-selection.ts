import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EcommerceCheckoutStore } from './ecommerce-checkout.store';

@Component({
  selector: 'app-ecommerce-selection',
  templateUrl: './ecommerce-selection.html',
  styleUrl: './ecommerce-page-frame.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceSelection {
  readonly store = inject(EcommerceCheckoutStore);
  private readonly router = inject(Router);

  readonly variants = this.store.variants;
  readonly selectedVariant = this.store.selectedVariant;
  readonly selectedVariantId = this.store.selectedVariantId;
  readonly cartCount = this.store.cartCount;

  constructor() {
    this.store.setCurrentStep('selection');
  }

  selectVariant(variantId: 'standard' | 'blue' | 'red'): void {
    this.store.selectVariant(variantId);
  }

  addSelectedToCart(): void {
    this.store.addSelectedToCart();
  }

  increment(variantId: 'standard' | 'blue' | 'red'): void {
    this.store.increment(variantId);
  }

  decrement(variantId: 'standard' | 'blue' | 'red'): void {
    this.store.decrement(variantId);
  }

  quantityFor(variantId: 'standard' | 'blue' | 'red'): number {
    return this.store.cart()[variantId];
  }

  formatPrice(priceCents: number): string {
    return this.store.formatPrice(priceCents);
  }

  continue(): void {
    this.store.setCurrentStep('personal');
    void this.router.navigate(['/ecommerce', this.store.slugForStep('personal')]);
  }
}
