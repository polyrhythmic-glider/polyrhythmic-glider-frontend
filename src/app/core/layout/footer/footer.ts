import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NAV_ITEMS } from '../navigation/nav-items';

interface ResourceLink {
  readonly label: string;
  readonly path?: string;
  readonly externalHref?: string;
  readonly eyebrow: string;
  readonly description: string;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
  readonly navItems = NAV_ITEMS;
  readonly resources: ResourceLink[] = [
    {
      label: 'BYOS!',
      path: '/partecipa',
      eyebrow: 'Jam',
      description:
        'BYOS! 2.0: jam audio e video il 4 novembre 2026 al MUGA. Regolamento e iscrizioni.',
    },
    {
      label: 'Live coding sandbox',
      path: '/experimental',
      eyebrow: 'Studio',
      description: 'Ambiente Strudel per pattern ritmici, sketch performativi e prove rapide.',
    },
    {
      label: 'Game of Life',
      path: '/game-of-life',
      eyebrow: 'Simulazione',
      description: 'Esperimento visuale con automa cellulare e background generativo dedicato.',
    },
    {
      label: 'Cookie policy',
      path: '/cookie-policy',
      eyebrow: 'Legal',
      description: 'Informativa essenziale su cookie tecnici e analytics privacy-friendly.',
    },
  ];

  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);

  scrollToTop(event?: Event): void {
    event?.preventDefault();

    this.router.navigateByUrl('/').then(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }
}
