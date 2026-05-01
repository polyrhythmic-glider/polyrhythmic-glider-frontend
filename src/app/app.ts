import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Background } from './core/layout/background/background';
import { CookieNotice } from './core/layout/cookie-notice/cookie-notice';
import { GameOfLifeBackground } from './core/layout/game-of-life-background/game-of-life-background';
import { Header } from './core/layout/header/header';
import { IdentityService } from './core/identity/identity.service';
import { SeoService } from './core/seo/seo.service';
import { ToastHost } from './core/toast/toast-host';
import type { SeoData } from './shared/models/seo.models';
import { getEffectiveHostname } from './shared/utils/host.utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Background, GameOfLifeBackground, CookieNotice, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly effectiveHostname = getEffectiveHostname();
  private readonly isArtHost = this.effectiveHostname === 'art.polyglider.com';
  private readonly isShopHost = this.effectiveHostname === 'shop.polyglider.com';
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly identityService = inject(IdentityService);
  private readonly seoService = inject(SeoService);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly isGameOfLifeRoute = computed(() => this.currentUrl().startsWith('/game-of-life'));
  readonly isRadioRoute = computed(() => this.currentUrl().startsWith('/radio'));
  readonly isLinksRoute = computed(() => this.currentUrl().startsWith('/links'));
  readonly isEcommerceRoute = computed(() => this.currentUrl().startsWith('/ecommerce'));
  readonly isArtRoute = computed(
    () => this.currentUrl().startsWith('/art') || (this.isArtHost && this.currentUrl() === '/'),
  );
  readonly isShopRoute = computed(
    () => this.currentUrl().startsWith('/shop') || (this.isShopHost && this.currentUrl() === '/'),
  );

  formatVolumeValue(volume: number | string): string {
    const normalizedVolume = Math.min(1, Math.max(0, Number(volume) / 0.2));
    return `Volume ${Math.round(normalizedVolume * 100)} percento`;
  }

  setBackgroundVolume(event: Event, background: Background): void {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    background.setVolume(input.value);
  }

  constructor() {
    if (this.redirectIdentityHashToLogin()) {
      return;
    }

    this.identityService.init();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const activeRoute = this.getLeafRoute(this.activatedRoute);
        const seo = activeRoute.snapshot.data['seo'] as SeoData | undefined;

        this.seoService.updatePage(seo, this.getCanonicalPath());
      });
  }

  private redirectIdentityHashToLogin(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const { hash, pathname, search } = window.location;
    const hasIdentityToken =
      hash.includes('confirmation_token=') ||
      hash.includes('recovery_token=') ||
      hash.includes('invite_token=') ||
      hash.includes('email_change_token=') ||
      hash.includes('access_token=');

    if (!hasIdentityToken || pathname === '/login') {
      return false;
    }

    window.location.replace(`/login${search}${hash}`);
    return true;
  }

  private getLeafRoute(route: ActivatedRoute): ActivatedRoute {
    let currentRoute = route;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    return currentRoute;
  }

  private getCanonicalPath(): string {
    const [path] = this.router.url.split('?');
    return path.split('#')[0] || '/';
  }
}
