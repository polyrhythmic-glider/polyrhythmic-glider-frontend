import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type JamType = 'audio' | 'video';

interface JamOption {
  readonly value: JamType;
  readonly label: string;
  readonly description: string;
  readonly rules: readonly { readonly title: string; readonly description: string }[];
}

@Component({
  selector: 'app-participation',
  imports: [ReactiveFormsModule],
  templateUrl: './participation.html',
  styleUrl: './participation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Participation {
  readonly formName = 'byos-2-participation-2026-11-04';
  readonly eventDateLabel = '04.11.2026';
  readonly jamOptions: readonly JamOption[] = [
    {
      value: 'audio',
      label: 'Jam Audio',
      description: 'Synth, macchine ed effetti. Anche live coding con Strudel.',
      rules: [
        {
          title: 'Staff e assistenza',
          description:
            "L'Audio Admin gestisce il mixer e le componenti fondamentali della jam. I membri di Polyrhythmic Glider ti aiutano durante il setup: chiedi a loro se hai problemi tecnici.",
        },
        {
          title: 'Un setup essenziale',
          description:
            "Porta al massimo una macchina e un effetto, con tutto il necessario per i collegamenti interni, al mixer (preferibilmente in mono) e all'interfaccia MIDI che fornirà il clock. Se possibile, porta anche una ciabatta per la corrente.",
        },
        {
          title: 'Arrivo e inserimento',
          description:
            'Non è possibile inserirsi senza fermare la musica. Quando arrivi, cerca lo staff per organizzare il tuo ingresso nella jam in maniera fluida.',
        },
        {
          title: 'Live coding',
          description:
            'In questa edizione sarà presente anche un computer per il live coding con Strudel.',
        },
        {
          title: 'Ascolta e lascia spazio',
          description:
            "La jam è di tutti. Sii gentile con l'Admin, lo staff e gli altri partecipanti. Ascolta e inserisciti dove senti che manca qualcosa, senza sovrastare gli altri o cercare di prendere il controllo.",
        },
      ],
    },
    {
      value: 'video',
      label: 'Jam Video',
      description: 'Visual, controller MIDI e proiezioni. Puoi portare il tuo setup video.',
      rules: [
        {
          title: 'Visual e controller',
          description:
            'Il Video Admin gestisce la proiezione, le fonti video e gli effetti. Saranno disponibili diversi controller MIDI per modificare le visual in tempo reale.',
        },
        {
          title: 'Il tuo setup, se vuoi',
          description:
            'Puoi portare il tuo setup video. I membri di Polyrhythmic Glider ti aiutano durante il setup: chiedi a loro se hai problemi tecnici.',
        },
        {
          title: 'Uno spazio condiviso',
          description:
            "La jam è di tutti. Sii gentile con l'Admin, i membri di Polyrhythmic Glider e gli altri partecipanti.",
        },
      ],
    },
  ];

  private readonly formBuilder = inject(FormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly motionPreference =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  readonly interludeVideo = viewChild<ElementRef<HTMLVideoElement>>('interludeVideo');
  readonly prefersReducedMotion = signal(this.motionPreference?.matches ?? false);
  readonly isVideoPlaying = signal(false);
  readonly isVideoMuted = signal(false);
  readonly videoPlaybackError = signal(false);
  readonly attemptedSubmit = signal(false);

  readonly selectedJam = signal<JamType | null>(null);
  readonly rulesChoice = signal<boolean | null>(null);
  readonly isSubmitting = signal(false);
  readonly submissionStatus = signal<'idle' | 'success' | 'error'>('idle');
  readonly activeJam = computed(() =>
    this.jamOptions.find((option) => option.value === this.selectedJam()),
  );
  readonly activeStep = computed(() =>
    !this.selectedJam() ? 1 : this.rulesChoice() === true ? 3 : 2,
  );
  readonly stepAnnouncement = computed(() => {
    if (this.isSubmitting()) return 'Invio dell’iscrizione in corso.';
    if (this.submissionStatus() === 'success') return 'Iscrizione completata.';
    if (this.rulesChoice() === false)
      return 'Intermezzo video. Puoi metterlo in pausa o tornare al regolamento.';
    if (this.rulesChoice() === true) return 'Regolamento confermato. Completa i tuoi dati.';
    return this.activeJam()
      ? `${this.activeJam()?.label} selezionata. Leggi il regolamento qui sotto.`
      : '';
  });
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/)]],
    arrivalTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
    instrument: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/\S/)]],
    effectDetails: [{ value: '', disabled: true }],
    videoEquipment: [{ value: '', disabled: true }],
    consent: [false, [Validators.requiredTrue]],
  });
  private readonly formEvents = toSignal(this.form.events);
  readonly validationErrors = computed(() => {
    this.formEvents();
    if (!this.attemptedSubmit()) return [];

    return [
      {
        control: this.form.controls.name,
        id: 'participation-name',
        message: 'Inserisci il tuo nome.',
      },
      {
        control: this.form.controls.arrivalTime,
        id: 'participation-arrival',
        message: 'Indica un orario di arrivo valido.',
      },
      {
        control: this.form.controls.instrument,
        id: 'participation-instrument',
        message: 'Indica la macchina o il setup che userai.',
      },
      {
        control: this.form.controls.consent,
        id: 'participation-consent',
        message: 'Conferma il consenso per inviare l’iscrizione.',
      },
    ].filter(({ control }) => control.enabled && control.invalid);
  });

  constructor() {
    const preference = this.motionPreference;
    if (preference) {
      const updatePreference = (event: MediaQueryListEvent): void => {
        this.prefersReducedMotion.set(event.matches);
        if (event.matches) this.interludeVideo()?.nativeElement.pause();
      };
      preference.addEventListener('change', updatePreference);
      this.destroyRef.onDestroy(() => preference.removeEventListener('change', updatePreference));
    }
  }

  selectJam(jam: JamType): void {
    if (this.isSubmitting() || this.selectedJam() === jam) {
      return;
    }

    this.selectedJam.set(jam);
    this.rulesChoice.set(null);
    this.submissionStatus.set('idle');
    this.attemptedSubmit.set(false);

    const { instrument, effectDetails, videoEquipment } = this.form.controls;
    for (const control of [instrument, effectDetails, videoEquipment]) {
      control.reset();
      control.disable();
    }

    if (jam === 'audio') {
      instrument.enable();
      effectDetails.enable();
    } else {
      videoEquipment.enable();
    }
  }

  answerRules(understood: boolean | null): void {
    if (this.isSubmitting()) {
      return;
    }

    this.rulesChoice.set(understood);
    this.submissionStatus.set('idle');
    this.isVideoPlaying.set(false);
    this.isVideoMuted.set(false);
    this.videoPlaybackError.set(false);
    this.focusAfterRender(
      understood === true
        ? '#details-title'
        : understood === false
          ? '#interlude-title'
          : '#rules-title',
    );
  }

  focusField(event: Event, id: string): void {
    event.preventDefault();
    this.host.nativeElement.querySelector<HTMLElement>(`#${id}`)?.focus();
  }

  async toggleVideoPlayback(): Promise<void> {
    const video = this.interludeVideo()?.nativeElement;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    try {
      await video.play();
      this.videoPlaybackError.set(false);
    } catch {
      this.videoPlaybackError.set(true);
    }
  }

  toggleVideoAudio(): void {
    const video = this.interludeVideo()?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
    this.isVideoMuted.set(video.muted);
  }

  async submit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.isSubmitting() || this.submissionStatus() === 'success') {
      return;
    }

    const jam = this.selectedJam();
    if (!jam || this.rulesChoice() !== true || this.form.invalid) {
      this.form.markAllAsTouched();
      this.attemptedSubmit.set(true);
      this.focusAfterRender('#participation-errors');
      return;
    }

    const formElement = event.target;
    if (!(formElement instanceof HTMLFormElement)) {
      this.submissionStatus.set('error');
      this.focusAfterRender('#participation-submit-error');
      return;
    }

    const payload = new URLSearchParams({
      'form-name': this.formName,
      eventDate: '2026-11-04',
      eventLocation: 'MUGA · Ferrara',
      jamType: jam,
      rulesConfirmed: 'accepted',
      name: this.form.controls.name.value.trim(),
      arrivalTime: this.form.controls.arrivalTime.value,
      consent: 'accepted',
      'bot-field': new FormData(formElement).get('bot-field')?.toString() ?? '',
    });

    if (jam === 'audio') {
      payload.set('instrument', this.form.controls.instrument.value.trim());
      payload.set('effectDetails', this.form.controls.effectDetails.value.trim());
    } else {
      payload.set('videoEquipment', this.form.controls.videoEquipment.value.trim());
    }

    this.isSubmitting.set(true);
    this.submissionStatus.set('idle');

    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });

      if (!response.ok) {
        throw new Error('Participation form submission failed');
      }

      this.submissionStatus.set('success');
      this.attemptedSubmit.set(false);
      this.form.reset();
      this.focusAfterRender('#registration-title');
    } catch {
      this.submissionStatus.set('error');
      this.focusAfterRender('#participation-submit-error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private focusAfterRender(selector: string): void {
    if (this.destroyRef.destroyed) {
      return;
    }
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus();
      },
      { injector: this.injector },
    );
  }
}
