import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export type DeliveryMethod = 'courier' | 'pickup';
export type PaymentMethod = 'stripe' | 'paypal';
export type CheckoutStep = 'selection' | 'personal' | 'delivery' | 'summary' | 'payment' | 'thanks';

export interface VinylVariant {
  readonly id: 'standard' | 'blue' | 'red';
  readonly name: string;
  readonly edition: string;
  readonly priceCents: number;
  readonly colorLabel: string;
  readonly stockLabel: string;
  readonly description: string;
  readonly accent: string;
  readonly discStart: string;
  readonly discEnd: string;
  readonly details: readonly string[];
}

export interface StepConfig {
  readonly id: CheckoutStep;
  readonly slug: string;
  readonly label: string;
}

function relaxedEmailValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value.trim();

  if (!value) {
    return { required: true };
  }

  return /.+@.+\..+/.test(value) ? null : { email: true };
}

type CheckoutControlName =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'recipientName'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'postalCode'
  | 'country'
  | 'deliveryMethod'
  | 'deliveryNotes'
  | 'paymentMethod';

const VINYL_VARIANTS: readonly VinylVariant[] = [
  {
    id: 'standard',
    name: 'Vinile nero',
    edition: 'Standard edition',
    priceCents: 2400,
    colorLabel: 'Black',
    stockLabel: 'Disponibile',
    description:
      'Pressing standard su vinile nero con sleeve matte, inner sleeve e insert stampato.',
    accent: 'rgba(244, 244, 247, 0.92)',
    discStart: '#f7f7fb',
    discEnd: '#424554',
    details: ['Sleeve matte', 'Insert incluso', 'Spedizione in 48h'],
  },
  {
    id: 'blue',
    name: 'Edizione limitata blu',
    edition: 'Blue limited edition',
    priceCents: 3200,
    colorLabel: 'Blue',
    stockLabel: '32 copie',
    description: 'Vinile translucido blu con obi strip numerata e artwork alternativo.',
    accent: 'rgba(112, 214, 255, 0.96)',
    discStart: '#9de7ff',
    discEnd: '#2563eb',
    details: ['Numerata', 'Artwork alternativo', 'Drop limitato'],
  },
  {
    id: 'red',
    name: 'Edizione limitata rossa',
    edition: 'Red collector edition',
    priceCents: 3600,
    colorLabel: 'Red',
    stockLabel: '16 copie',
    description: 'Pressing rosso traslucido con inner sleeve stampata e cartolina inclusa.',
    accent: 'rgba(255, 92, 92, 0.96)',
    discStart: '#ff8a8a',
    discEnd: '#b91c1c',
    details: ['Collector run', 'Cartolina inclusa', 'Batch ultra limitato'],
  },
];

export const CHECKOUT_STEPS: readonly StepConfig[] = [
  { id: 'selection', slug: 'selezione', label: 'Selezione' },
  { id: 'personal', slug: 'dati-personali', label: 'Dati personali' },
  { id: 'delivery', slug: 'consegna', label: 'Consegna' },
  { id: 'summary', slug: 'riepilogo', label: 'Riepilogo' },
  { id: 'payment', slug: 'pagamento', label: 'Pagamento' },
  { id: 'thanks', slug: 'grazie', label: 'Grazie' },
];

@Injectable({ providedIn: 'root' })
export class EcommerceCheckoutStore {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly variants = VINYL_VARIANTS;
  readonly selectedVariantId = signal<VinylVariant['id']>('blue');
  readonly currentStep = signal<CheckoutStep>('selection');
  readonly selectedDeliveryMethod = signal<DeliveryMethod>('courier');
  readonly selectedPaymentMethod = signal<PaymentMethod>('stripe');
  readonly cart = signal<Record<VinylVariant['id'], number>>({
    standard: 0,
    blue: 0,
    red: 0,
  });

  readonly checkoutForm = this.formBuilder.group({
    fullName: ['', Validators.required],
    email: ['', [relaxedEmailValidator]],
    phone: [''],
    recipientName: [''],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['Italia', Validators.required],
    deliveryMethod: ['courier' as DeliveryMethod, Validators.required],
    deliveryNotes: [''],
    paymentMethod: ['stripe' as PaymentMethod, Validators.required],
  });
  private readonly formStateVersion = toSignal(
    merge(this.checkoutForm.valueChanges, this.checkoutForm.statusChanges).pipe(
      startWith(null),
      map(() => Date.now()),
    ),
    { initialValue: Date.now() },
  );

  readonly selectedVariant = computed(
    () =>
      this.variants.find((variant) => variant.id === this.selectedVariantId()) ?? this.variants[0],
  );

  readonly cartEntries = computed(() =>
    this.variants
      .map((variant) => ({
        variant,
        quantity: this.cart()[variant.id],
      }))
      .filter((entry) => entry.quantity > 0),
  );

  readonly cartCount = computed(() =>
    this.cartEntries().reduce((total, entry) => total + entry.quantity, 0),
  );

  readonly subtotalCents = computed(() =>
    this.cartEntries().reduce(
      (total, entry) => total + entry.variant.priceCents * entry.quantity,
      0,
    ),
  );

  readonly deliveryMethod = computed(() => this.selectedDeliveryMethod());

  readonly paymentMethod = computed(() => this.selectedPaymentMethod());

  readonly shippingCents = computed(() => (this.cartCount() > 0 ? 900 : 0));

  readonly totalCents = computed(() => this.subtotalCents() + this.shippingCents());
  readonly selectedVariantQuantity = computed(() => this.cart()[this.selectedVariant().id]);

  selectVariant(variantId: VinylVariant['id']): void {
    this.selectedVariantId.set(variantId);
  }

  addSelectedToCart(): void {
    this.increment(this.selectedVariant().id);
  }

  increment(variantId: VinylVariant['id']): void {
    this.cart.update((cart) => ({
      ...cart,
      [variantId]: cart[variantId] + 1,
    }));
  }

  decrement(variantId: VinylVariant['id']): void {
    this.cart.update((cart) => ({
      ...cart,
      [variantId]: Math.max(0, cart[variantId] - 1),
    }));
  }

  setDeliveryMethod(method: DeliveryMethod): void {
    this.selectedDeliveryMethod.set(method);
    this.checkoutForm.controls.deliveryMethod.setValue(method);
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
    this.checkoutForm.controls.paymentMethod.setValue(method);
  }

  setCurrentStep(step: CheckoutStep): void {
    this.currentStep.set(step);
  }

  stepItems() {
    return CHECKOUT_STEPS.map((step, index) => ({
      ...step,
      index: index + 1,
      isActive: this.currentStep() === step.id,
      isComplete: CHECKOUT_STEPS.findIndex((item) => item.id === this.currentStep()) > index,
    }));
  }

  slugForStep(step: CheckoutStep): string {
    return CHECKOUT_STEPS.find((item) => item.id === step)?.slug ?? 'selezione';
  }

  stepFromSlug(stepSlug: string | null): CheckoutStep {
    return CHECKOUT_STEPS.find((item) => item.slug === stepSlug)?.id ?? 'selection';
  }

  formatPrice(priceCents: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceCents / 100);
  }

  isControlInvalid(controlName: CheckoutControlName): boolean {
    const control = this.checkoutForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  canProceedFromStep(step: CheckoutStep): boolean {
    this.formStateVersion();

    switch (step) {
      case 'selection':
        return this.cartCount() > 0;
      case 'personal':
        return this.checkoutForm.controls.fullName.valid && this.checkoutForm.controls.email.valid;
      case 'delivery':
        return (
          this.checkoutForm.controls.addressLine1.valid &&
          this.checkoutForm.controls.city.valid &&
          this.checkoutForm.controls.postalCode.valid &&
          this.checkoutForm.controls.country.valid
        );
      case 'summary':
        return this.cartCount() > 0;
      case 'payment':
        return !!this.paymentMethod();
      case 'thanks':
        return true;
    }
  }

  validationMessageForStep(step: CheckoutStep): string {
    switch (step) {
      case 'selection':
        return 'Seleziona almeno un vinile per continuare';
      case 'personal':
        return 'Compila nome completo ed email valida';
      case 'delivery':
        return 'Completa indirizzo, citta, CAP e paese';
      case 'summary':
        return 'Il carrello e vuoto';
      case 'payment':
        return 'Seleziona un metodo di pagamento';
      case 'thanks':
        return '';
    }
  }

  markStepTouched(step: CheckoutStep): void {
    switch (step) {
      case 'personal':
        this.checkoutForm.controls.fullName.markAsTouched();
        this.checkoutForm.controls.email.markAsTouched();
        this.checkoutForm.controls.fullName.updateValueAndValidity();
        this.checkoutForm.controls.email.updateValueAndValidity();
        return;
      case 'delivery':
        this.checkoutForm.controls.addressLine1.markAsTouched();
        this.checkoutForm.controls.city.markAsTouched();
        this.checkoutForm.controls.postalCode.markAsTouched();
        this.checkoutForm.controls.country.markAsTouched();
        this.checkoutForm.controls.addressLine1.updateValueAndValidity();
        this.checkoutForm.controls.city.updateValueAndValidity();
        this.checkoutForm.controls.postalCode.updateValueAndValidity();
        this.checkoutForm.controls.country.updateValueAndValidity();
        return;
      default:
        return;
    }
  }
}
