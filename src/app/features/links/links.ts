import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface LinkEntry {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly note: string;
}

declare global {
  interface Window {
    sa_event?: (eventName: string, payload?: Record<string, string | number | boolean>) => void;
  }
}

@Component({
  selector: 'app-links',
  templateUrl: './links.html',
  styleUrl: './links.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Links {
  private readonly document = inject(DOCUMENT);

  readonly title = 'Polyglider';
  readonly bio =
    'Musica, codice ed esperimenti digitali. Qui sotto trovi i link principali, tutti in un posto solo.';
  readonly links: readonly LinkEntry[] = [
    {
      id: 'site',
      label: 'Sito',
      href: 'https://polyglider.com/',
      note: 'Per entrare nel sito principale e vedere tutto il progetto',
    },
    {
      id: 'byos',
      label: 'Evento BYOS',
      href: '/partecipa',
      note: 'BYOS! 2.0 · 4 novembre 2026 al MUGA · Iscriviti alla jam audio o video',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://instagram.com/polyglider',
      note: 'Per seguire aggiornamenti, immagini e cose in movimento',
    },
  ];

  registerLinkEvent(link: LinkEntry): void {
    this.sendAnalyticsEvent(link);
  }

  private sendAnalyticsEvent(link: LinkEntry): void {
    const win = this.document.defaultView;

    if (!win?.sa_event) {
      return;
    }

    win.sa_event('links_click', {
      link_id: link.id,
      link_label: link.label,
      link_href: link.href,
    });
  }
}
