import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { identityGuard } from './core/identity/identity.guard';
import { Home } from './features/home/home';
import { getEffectiveHostname } from './shared/utils/host.utils';

function artHostRootMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 0 || typeof window === 'undefined') {
    return null;
  }

  return getEffectiveHostname() === 'art.polyglider.com' ? { consumed: segments } : null;
}

function blogHostRootMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 0 || typeof window === 'undefined') {
    return null;
  }

  return getEffectiveHostname() === 'blog.polyglider.com' ? { consumed: segments } : null;
}

function blogHostPostMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 1 || typeof window === 'undefined') {
    return null;
  }

  if (getEffectiveHostname() !== 'blog.polyglider.com') {
    return null;
  }

  return {
    consumed: segments,
    posParams: {
      slug: segments[0],
    },
  };
}

function shopHostRootMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length !== 0 || typeof window === 'undefined') {
    return null;
  }

  return getEffectiveHostname() === 'shop.polyglider.com' ? { consumed: segments } : null;
}

export const routes: Routes = [
  {
    matcher: artHostRootMatcher,
    loadComponent: () => import('./features/art/art').then((m) => m.Art),
    canActivate: [identityGuard],
    data: {
      seo: {
        title: 'Art | Polyrhythmic Glider',
        description:
          'Sezione artistica di Polyrhythmic Glider dedicata a mostra digitale, video, moving image e archivio curatoriale.',
        keywords: [
          'art',
          'digital exhibition',
          'mostra digitale',
          'video art',
          'moving image',
          'polyrhythmic glider',
        ],
      },
    },
  },
  {
    matcher: blogHostRootMatcher,
    loadComponent: () => import('./features/blog/blog').then((m) => m.Blog),
    canActivate: [identityGuard],
    data: {
      seo: {
        title: 'Blog | Polyrhythmic Glider',
        description:
          'Polyblog raccoglie appunti di Polyrhythmic Glider su ricerca sonora, documentazione, sistemi aperti e processi condivisi.',
        keywords: [
          'polyblog',
          'polyrhythmic glider',
          'ricerca sonora',
          'documentazione',
          'sistemi aperti',
        ],
      },
    },
  },
  {
    matcher: blogHostPostMatcher,
    loadComponent: () => import('./features/blog-post/blog-post').then((m) => m.BlogPost),
    canActivate: [identityGuard],
    data: {
      seo: {
        title: 'Blog | Polyrhythmic Glider',
        description:
          'Appunto del Polyblog di Polyrhythmic Glider su ricerca sonora, documentazione e processi condivisi.',
        keywords: [
          'polyblog',
          'polyrhythmic glider',
          'processo',
          'documentazione',
          'ricerca sonora',
        ],
      },
    },
  },
  {
    matcher: shopHostRootMatcher,
    loadComponent: () => import('./features/shop/shop').then((m) => m.Shop),
    canActivate: [identityGuard],
    data: {
      seo: {
        title: 'Shop | Polyrhythmic Glider',
        description:
          'Shop editoriale di Polyrhythmic Glider: mockup storefront per drop, capsule, oggetti e release narrative.',
        keywords: [
          'shop',
          'polyrhythmic glider',
          'editorial commerce',
          'drops',
          'capsule',
          'mock storefront',
        ],
      },
    },
  },
  {
    path: '',
    component: Home,
    data: {
      seo: {
        title: 'Polyrhythmic Glider | Musica, codice ed esperimenti digitali',
        description:
          'Polyrhythmic Glider è uno spazio per musica, codice ed esperimenti digitali tra ricerca sonora, documentazione e sistemi aperti.',
        keywords: [
          'polyrhythmic glider',
          'musica',
          'codice',
          'esperimenti digitali',
          'ricerca sonora',
        ],
      },
    },
  },
  {
    path: 'experimental',
    loadComponent: () => import('./features/experimental/experimental').then((m) => m.Experimental),
    data: {
      seo: {
        title: 'Experimental | Polyrhythmic Glider',
        description:
          'Sandbox di live coding per pattern ritmici, sketch veloci e workflow da performance dentro Polyrhythmic Glider.',
        keywords: ['live coding', 'strudel', 'pattern ritmici', 'performance', 'experimental'],
      },
    },
  },
  {
    path: 'snake',
    loadComponent: () => import('./features/snake/snake').then((m) => m.Snake),
    data: {
      seo: {
        title: 'Snake | Polyrhythmic Glider',
        description:
          'Versione browser di Snake con controlli da tastiera e touch, punteggio live e loop di gioco essenziale.',
        keywords: ['snake game', 'browser game', 'angular game', 'interactive experiment'],
      },
    },
  },
  {
    path: 'game-of-life',
    loadComponent: () => import('./features/game-of-life/game-of-life').then((m) => m.GameOfLife),
    data: {
      seo: {
        title: 'Game of Life | Polyrhythmic Glider',
        description:
          'Esperimento visivo dedicato al Game of Life di Conway con simulazione animata e background generativo.',
        keywords: [
          'game of life',
          'conway',
          'cellular automaton',
          'generative art',
          'visual experiment',
        ],
      },
    },
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
    data: {
      seo: {
        title: 'Login | Polyrhythmic Glider',
        description:
          'Accesso con Netlify Identity per entrare nelle aree riservate di Polyrhythmic Glider.',
        keywords: ['login', 'netlify identity', 'authentication'],
        robots: 'noindex,nofollow',
      },
    },
  },
  {
    path: 'partecipa',
    loadComponent: () =>
      import('./features/participation/participation').then((m) => m.Participation),
    data: {
      seo: {
        title: 'Partecipa | BYOS! an electronic synth jam',
        description:
          'Landing page dedicata alla synth jam BYOS! con form di partecipazione per raccogliere presenza, setup e intenzioni musicali.',
        keywords: ['byos', 'synth jam', 'electronic jam', 'partecipazione', 'polyrhythmic glider'],
      },
    },
  },
  {
    path: 'links',
    loadComponent: () => import('./features/links/links').then((m) => m.Links),
    data: {
      seo: {
        title: 'Links | Polyrhythmic Glider',
        description:
          'Pagina essenziale con i link principali di Polyrhythmic Glider: sito, evento BYOS e Instagram.',
        keywords: ['links', 'polyrhythmic glider', 'byos', 'instagram'],
      },
    },
  },
  {
    path: 'l',
    redirectTo: 'links',
    pathMatch: 'full',
  },
  {
    path: 'radio',
    loadComponent: () => import('./features/radio/radio').then((m) => m.Radio),
    data: {
      seo: {
        title: 'Radio | Polyrhythmic Glider',
        description: 'Canale radio sperimentale con player audio live e prova locale video.',
        keywords: ['radio', 'live stream', 'audio', 'video', 'polyrhythmic glider'],
        robots: 'noindex,nofollow',
      },
    },
  },
  {
    path: 'ecommerce',
    pathMatch: 'full',
    redirectTo: 'ecommerce/selezione',
  },
  {
    path: 'ecommerce',
    loadComponent: () => import('./features/ecommerce/ecommerce').then((m) => m.Ecommerce),
    children: [
      {
        path: 'selezione',
        loadComponent: () =>
          import('./features/ecommerce/ecommerce-selection').then((m) => m.EcommerceSelection),
      },
      {
        path: 'dati-personali',
        loadComponent: () =>
          import('./features/ecommerce/ecommerce-personal').then((m) => m.EcommercePersonal),
      },
      {
        path: 'consegna',
        loadComponent: () =>
          import('./features/ecommerce/ecommerce-delivery').then((m) => m.EcommerceDelivery),
      },
      {
        path: 'riepilogo',
        loadComponent: () =>
          import('./features/ecommerce/ecommerce-summary-page').then((m) => m.EcommerceSummaryPage),
      },
      {
        path: 'pagamento',
        loadComponent: () =>
          import('./features/ecommerce/ecommerce-payment').then((m) => m.EcommercePayment),
      },
      {
        path: 'grazie',
        loadComponent: () =>
          import('./features/ecommerce/ecommerce-thanks').then((m) => m.EcommerceThanks),
      },
    ],
    data: {
      seo: {
        title: 'Ecommerce | Checkout mockup',
        description:
          'Checkout mockup single-product con varianti vinile, dati personali, consegna e pagamento simulato.',
        keywords: ['ecommerce', 'vinyl', 'single product', 'limited edition', 'checkout mockup'],
      },
    },
  },
  {
    path: 'cookie-policy',
    loadComponent: () =>
      import('./features/cookie-policy/cookie-policy').then((m) => m.CookiePolicy),
    data: {
      seo: {
        title: 'Cookie Policy | Polyrhythmic Glider',
        description:
          'Informativa cookie di Polyrhythmic Glider: solo cookie tecnici necessari, Netlify Identity per l&apos;autenticazione e analytics privacy-friendly senza profilazione.',
        keywords: [
          'cookie policy',
          'privacy',
          'simple analytics',
          'netlify identity',
          'cookie tecnici',
        ],
      },
    },
  },
  {
    path: 'toast',
    loadComponent: () => import('./features/toast/toast').then((m) => m.Toast),
    data: {
      seo: {
        title: 'Toast | Polyrhythmic Glider',
        description:
          'Laboratorio interno per provare notifiche toast, durata, ritardo, persistenza, stacking e varianti visive.',
        keywords: ['toast', 'notification', 'ui test', 'polyrhythmic glider'],
        robots: 'noindex,nofollow',
      },
    },
  },
  {
    path: 'hacker-manifesto',
    loadComponent: () =>
      import('./features/hacker-manifesto/hacker-manifesto').then((m) => m.HackerManifesto),
    data: {
      seo: {
        title: 'The Hacker Manifesto | Polyrhythmic Glider',
        description:
          'Pagina nascosta dedicata al manifesto di The Mentor con originale Phrack e traduzione italiana di FiloSottile.',
        keywords: ['hacker manifesto', 'the mentor', 'phrack', 'filosottile'],
        robots: 'noindex,nofollow',
      },
    },
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
    canActivate: [identityGuard],
    data: {
      seo: {
        title: 'Admin | Polyrhythmic Glider',
        description: 'Area amministrativa privata accessibile solo dopo autenticazione.',
        keywords: ['admin', 'private area', 'authentication'],
        robots: 'noindex,nofollow',
      },
    },
  },
  {
    path: '403',
    loadComponent: () => import('./features/forbidden/forbidden').then((m) => m.Forbidden),
    data: {
      seo: {
        title: '403 | Polyrhythmic Glider',
        description: 'Pagina di accesso negato per aree riservate di Polyrhythmic Glider.',
        keywords: ['403', 'forbidden', 'access denied', 'polyrhythmic glider'],
        robots: 'noindex,nofollow',
      },
    },
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    data: {
      seo: {
        title: '404 | Polyrhythmic Glider',
        description: 'Pagina non trovata su Polyrhythmic Glider.',
        keywords: ['404', 'not found', 'polyrhythmic glider'],
        robots: 'noindex,nofollow',
      },
    },
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    data: {
      seo: {
        title: '404 | Polyrhythmic Glider',
        description: 'Pagina non trovata su Polyrhythmic Glider.',
        keywords: ['404', 'not found', 'polyrhythmic glider'],
        robots: 'noindex,nofollow',
      },
    },
  },
];
