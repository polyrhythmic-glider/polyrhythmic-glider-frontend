import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { EcommerceCheckoutStore } from './ecommerce-checkout.store';
import type { CheckoutStep } from './ecommerce-checkout.store';

@Component({
  selector: 'app-ecommerce',
  imports: [RouterOutlet],
  templateUrl: './ecommerce.html',
  styleUrl: './ecommerce.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ecommerce {
  readonly store = inject(EcommerceCheckoutStore);
  private readonly router = inject(Router);

  readonly selectedVariant = this.store.selectedVariant;
  readonly cartEntries = this.store.cartEntries;
  readonly cartCount = this.store.cartCount;
  readonly subtotalCents = this.store.subtotalCents;
  readonly shippingCents = this.store.shippingCents;
  readonly totalCents = this.store.totalCents;
  readonly deliveryMethod = this.store.deliveryMethod;
  readonly paymentMethod = this.store.paymentMethod;
  readonly stepItems = computed(() => this.store.stepItems());
  readonly currentStep = this.store.currentStep;
  readonly canContinueFromFooter = computed(() =>
    this.store.canProceedFromStep(this.currentStep()),
  );
  readonly continueHint = computed(() =>
    this.canContinueFromFooter() ? '' : this.store.validationMessageForStep(this.currentStep()),
  );
  readonly secondaryLabel = computed(() => {
    switch (this.currentStep()) {
      case 'selection':
        return '';
      case 'personal':
      case 'delivery':
      case 'summary':
      case 'payment':
        return 'Indietro';
      case 'thanks':
        return "Torna all'inizio";
    }
  });
  readonly continueLabel = computed(() => {
    switch (this.currentStep()) {
      case 'selection':
        return 'Continua';
      case 'personal':
        return 'Continua';
      case 'delivery':
        return 'Riepilogo';
      case 'summary':
        return 'Pagamento';
      case 'payment':
        return 'Conferma';
      case 'thanks':
        return '';
    }
  });
  readonly showContinueButton = computed(() => this.currentStep() !== 'thanks');
  readonly showSecondaryButton = computed(() => this.currentStep() !== 'selection');

  goToStep(stepId: 'selection' | 'personal' | 'delivery' | 'summary' | 'payment' | 'thanks'): void {
    this.store.setCurrentStep(stepId);
    void this.router.navigate(['/ecommerce', this.store.slugForStep(stepId)]);
  }

  continueFromFooter(): void {
    if (!this.canContinueFromFooter()) {
      this.store.markStepTouched(this.currentStep());
      return;
    }

    switch (this.currentStep()) {
      case 'selection':
        this.goToStep('personal');
        return;
      case 'personal':
        this.goToStep('delivery');
        return;
      case 'delivery':
        this.goToStep('summary');
        return;
      case 'summary':
        this.goToStep('payment');
        return;
      case 'payment':
        this.goToStep('thanks');
        return;
      case 'thanks':
        return;
    }
  }

  secondaryAction(): void {
    switch (this.currentStep()) {
      case 'selection':
        return;
      case 'personal':
        this.goToStep('selection');
        return;
      case 'delivery':
        this.goToStep('personal');
        return;
      case 'summary':
        this.goToStep('delivery');
        return;
      case 'payment':
        this.goToStep('summary');
        return;
      case 'thanks':
        this.goToStep('selection');
        return;
    }
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
}
