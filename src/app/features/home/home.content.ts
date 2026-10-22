import { faGithub, faInstagram, faSoundcloud } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import type { ContactChannel, FeatureCard } from '../../shared/models/content.models';

export const HERO_TERMINAL_COMMAND_GROUPS = [
  [
    'ls -lah ./stems',
    'ffprobe -hide_banner modular-session.wav',
    'ffmpeg -i modular-session.wav -af loudnorm -ar 48000 master.wav',
    'sox take.wav -n spectrogram -o take.png',
    'rg "bpm|swing|patch" session-notes.md',
    'git diff --word-diff patches/',
    'tmux attach -t live-set',
    'ssh synth-lab@remote-rack',
  ],
  [
    'python -m jupyter lab --no-browser',
    'torchrun --nproc_per_node=8 train.py --config configs/long-context.yaml',
    'python -m pytest tests/test_attention.py -k flash',
    'python scripts/eval.py --benchmark mmlu --ckpt checkpoints/latest',
    'tensorboard --logdir runs/research',
    'python scripts/ablate.py --rope-theta 500000 --group rmsnorm',
    'git diff research/optimizer-ablation.md',
    'python scripts/export_metrics.py --run runs/research/latest',
  ],
  [
    'ng build --configuration production --stats-json',
    'ng test --watch=false --code-coverage',
    'npx playwright test --project=chromium',
    'docker compose up api postgres redis',
    'node --watch api/server.mjs',
    'psql "$DATABASE_URL" -c "select version();"',
    'redis-cli --scan --pattern "session:*"',
    'curl -s http://localhost:3000/api/health',
  ],
];

export const ABOUT_PILLARS: FeatureCard[] = [
  {
    eyebrow: 'Process',
    title: 'Condividiamo il processo',
    description:
      'Rendere visibili configurazioni, passaggi e strumenti significa restituire controllo e trasformare il lavoro in linguaggio condivisibile.',
  },
  {
    eyebrow: 'Documentation',
    title: "La documentazione è parte dell'opera",
    description:
      'Ogni sistema o esperimento deve restare leggibile, tracciabile e riutilizzabile: se non è documentato, non può davvero evolvere.',
  },
  {
    eyebrow: 'Archive',
    title: 'Un archivio vivo',
    description:
      'Non una raccolta statica di output, ma una rete di materiali, processi e connessioni pronti a essere riattivati e reinterpretati.',
  },
  {
    eyebrow: 'Responsibility',
    title: 'Spazio condiviso, responsabilità comune',
    description:
      'Ogni ambiente esiste attraverso il comportamento di chi lo attraversa: apertura, cura e responsabilità sono parte della struttura.',
  },
];

export const ABOUT_MANIFESTO_CARDS: FeatureCard[] = [
  {
    eyebrow: '',
    title: 'Condividiamo il processo.',
    description:
      "Non esiste creazione senza trasparenza, né evoluzione senza possibilità di replicare, osservare, modificare. Rendere visibile ciò che accade dietro le quinte significa restituire controllo, trasformare strumenti in linguaggio, e linguaggio in infrastruttura. La conoscenza non è un sottoprodotto: è parte integrante dell'opera.",
  },
  {
    eyebrow: '',
    title: "La documentazione è parte dell'opera.",
    description:
      'Ogni sistema, ogni esperimento, ogni configurazione è un nodo leggibile, tracciabile, trasmissibile. Non come archivio morto, ma come struttura attiva, consultabile e riutilizzabile. Se qualcosa non è documentato, non esiste davvero: non può essere compreso, né evoluto, né condiviso.',
  },
  {
    eyebrow: '',
    title: 'Un archivio vivo.',
    description:
      'Un insieme di materiali, processi e relazioni che si trasformano nel tempo. Un database che non conserva soltanto risultati, ma connessioni: tra idee, strumenti, persone. Un sistema in cui ogni contributo non è isolato, ma entra in una rete più ampia, pronta a essere riattivata, modificata, reinterpretata.',
  },
  {
    eyebrow: '',
    title: 'Interfaccia, nodo, protocollo.',
    description:
      "L'essere umano non è solo autore, ma nodo. Il codice non è solo esecuzione, ma protocollo. Le interazioni non sono casuali, ma forme di sincronizzazione. Ci muoviamo all'interno di sistemi in cui la distinzione tra tecnico e creativo perde significato, e dove la costruzione diventa essa stessa espressione.",
  },
  {
    eyebrow: '',
    title: 'Responsabilità comune.',
    description:
      'Ogni ambiente, fisico o digitale, esiste attraverso il comportamento di chi lo attraversa. La qualità di ciò che accade dipende dalla cura, dal rispetto e dalla consapevolezza collettiva. Non esiste libertà senza responsabilità, né apertura senza attenzione.',
  },
  {
    eyebrow: '',
    title: 'Ciò che regge nel tempo.',
    description:
      "Rifiutiamo la superficialità del segnale fine a sé stesso, l'estetica come distrazione, la complessità simulata. Cerchiamo invece strutture leggibili, intenzionali, essenziali. Non ciò che colpisce immediatamente, ma ciò che regge nel tempo.",
  },
  {
    eyebrow: '',
    title: 'Una struttura aperta.',
    description:
      'In questo contesto prende forma Polyrhythmic Glider: un laboratorio indipendente di ricerca sonora e tecnologica, un ambiente operativo in cui sistemi umani e macchine collaborano, si sincronizzano, evolvono. Non un gruppo, ma una struttura aperta. Non un evento, ma un processo continuo.',
  },
  {
    eyebrow: '',
    title: 'Un sistema attraversato.',
    description:
      "Un'infrastruttura decentralizzata dove segnali non standardizzati possono emergere, essere osservati, documentati e condivisi. Un sistema in cui la creazione non è mai isolata, ma sempre parte di una rete più ampia. Un sistema che esiste solo finché viene attraversato, utilizzato, modificato.",
  },
];

export const CONTACT_CHANNELS: ContactChannel[] = [
  // {
  //   label: 'Email',
  //   value: 'info@polyglider.com',
  //   href: 'mailto:info@polyglider.com',
  //   description: 'Per collaborazioni, processi condivisi, ricerca e attivazioni dirette.',
  //   icon: faEnvelope,
  // },
  {
    label: 'GitHub',
    value: 'github.com/polyrhythmic-glider',
    href: 'https://github.com/polyrhythmic-glider',
    description:
      'Dove puoi trovare alcuni dei nostri esperimenti, compresi quelli che funzionano al primo tentativo.',
    icon: faGithub,
    external: true,
  },
  {
    label: 'Instagram',
    value: '@polyglider',
    href: 'https://instagram.com/polyglider',
    description:
      "Dove puoi trovare i nostri eventi, qualche news e sicuramente un po' di shitposting.",
    icon: faInstagram,
    external: true,
  },
  // {
  //   label: 'Sound',
  //   value: 'SoundCloud / Radio',
  //   href: 'https://soundcloud.com/polyglider',
  //   description: 'Ricerca sonora, bozze, archivi temporanei e segnali in transito.',
  //   icon: faSoundcloud,
  //   external: true,
  // },
];
