import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Participation } from './participation';

describe('Participation', () => {
  let fixture: ComponentFixture<Participation>;
  let component: Participation;
  let element: HTMLElement;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Participation] }).compileComponents();
    fixture = TestBed.createComponent(Participation);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function submitEvent(): Event {
    const event = new Event('submit', { cancelable: true });
    Object.defineProperty(event, 'target', { value: element.querySelector('form') });
    return event;
  }

  function fillCommonFields(): void {
    component.form.patchValue({ name: '  Alex  ', arrivalTime: '19:30', consent: true });
  }

  function submittedPayload(): URLSearchParams {
    return new URLSearchParams(fetchMock.mock.calls[0][1]?.body?.toString());
  }

  it('keeps registration fields hidden until the selected rules are understood', () => {
    expect(element.querySelector('input[name="name"]')).toBeNull();
    component.selectJam('audio');
    fixture.detectChanges();
    expect(element.textContent).toContain('Regolamento Jam Audio');
    expect(element.querySelector('input[name="name"]')).toBeNull();

    component.answerRules(false);
    fixture.detectChanges();
    expect(element.querySelector('video')).not.toBeNull();
    expect(element.querySelector('button[type="submit"]')).toBeNull();

    component.answerRules(null);
    fixture.detectChanges();
    expect(element.querySelector('video')).toBeNull();
    component.answerRules(true);
    fixture.detectChanges();
    expect(element.querySelector('input[name="instrument"]')).not.toBeNull();
    expect(element.querySelector('textarea[name="videoEquipment"]')).toBeNull();
  });

  it('requires fresh confirmation and removes audio data when switching to video', () => {
    component.selectJam('audio');
    component.answerRules(true);
    fillCommonFields();
    component.form.patchValue({ instrument: 'Synth', effectDetails: 'Delay' });
    expect(component.form.valid).toBe(true);

    component.selectJam('video');
    fixture.detectChanges();
    expect(component.rulesChoice()).toBeNull();
    expect(component.form.controls.instrument.value).toBe('');
    expect(component.form.controls.effectDetails.value).toBe('');
    expect(component.form.controls.instrument.disabled).toBe(true);
    expect(component.form.valid).toBe(true);
    expect(element.querySelector('input[name="name"]')).toBeNull();

    component.answerRules(true);
    fixture.detectChanges();
    expect(element.querySelector('input[name="instrument"]')).toBeNull();
    expect(element.querySelector('textarea[name="videoEquipment"]')).not.toBeNull();
  });

  it('rejects incomplete data and never submits without rules confirmation', async () => {
    component.selectJam('audio');
    component.answerRules(true);
    fillCommonFields();
    component.form.patchValue({ name: '   ', instrument: '   ' });
    await component.submit(submitEvent());
    fixture.detectChanges();
    expect(element.textContent).toContain('Inserisci il tuo nome.');
    expect(element.textContent).toContain('Indica la macchina o il setup che userai.');

    component.form.patchValue({ name: 'Alex', instrument: 'Synth' });
    component.answerRules(false);
    await component.submit(submitEvent());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the audio registration to Netlify and shows thanks only after success', async () => {
    component.selectJam('audio');
    component.answerRules(true);
    fillCommonFields();
    component.form.patchValue({ instrument: ' Synth ', effectDetails: ' Delay ' });
    fixture.detectChanges();
    await component.submit(submitEvent());
    fixture.detectChanges();

    expect(fetchMock).toHaveBeenCalledWith(
      '/__forms.html',
      expect.objectContaining({ method: 'POST' }),
    );
    const payload = submittedPayload();
    expect(payload.get('form-name')).toBe(component.formName);
    expect(payload.get('eventDate')).toBe('2026-11-04');
    expect(payload.get('eventLocation')).toBe('MUGA · Ferrara');
    expect(payload.get('jamType')).toBe('audio');
    expect(payload.get('rulesConfirmed')).toBe('accepted');
    expect(payload.get('name')).toBe('Alex');
    expect(payload.get('arrivalTime')).toBe('19:30');
    expect(payload.get('instrument')).toBe('Synth');
    expect(payload.get('effectDetails')).toBe('Delay');
    expect(payload.has('videoEquipment')).toBe(false);
    expect(element.textContent).toContain('Grazie! Ci vediamo presto <3');
    expect(element.querySelector('form')).toBeNull();
  });

  it('accepts video participants using the available controllers without audio fields', async () => {
    component.selectJam('video');
    component.answerRules(true);
    fillCommonFields();
    fixture.detectChanges();
    await component.submit(submitEvent());

    const payload = submittedPayload();
    expect(payload.get('jamType')).toBe('video');
    expect(payload.get('videoEquipment')).toBe('');
    expect(payload.has('instrument')).toBe(false);
    expect(payload.has('effectDetails')).toBe(false);
    expect(component.submissionStatus()).toBe('success');
  });

  it('preserves the entered video setup on failure so the submission can be retried', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }));
    component.selectJam('video');
    component.answerRules(true);
    fillCommonFields();
    component.form.controls.videoEquipment.setValue('Laptop con visual');
    fixture.detectChanges();
    await component.submit(submitEvent());
    fixture.detectChanges();

    expect(component.submissionStatus()).toBe('error');
    expect(component.form.controls.videoEquipment.value).toBe('Laptop con visual');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Invio non riuscito');

    await component.submit(submitEvent());
    expect(component.submissionStatus()).toBe('success');
    expect(submittedPayload().get('videoEquipment')).toBe('Laptop con visual');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('prevents duplicate submissions while the request is pending', async () => {
    let resolveResponse: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      }),
    );
    component.selectJam('video');
    component.answerRules(true);
    fillCommonFields();
    fixture.detectChanges();

    const submission = component.submit(submitEvent());
    component.selectJam('audio');
    await component.submit(submitEvent());
    expect(component.selectedJam()).toBe('video');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveResponse(new Response('', { status: 200 }));
    await submission;
    expect(component.isSubmitting()).toBe(false);
  });

  it('uses labelled native radio controls and updates the selected path', () => {
    const radio = element.querySelector<HTMLInputElement>('#jam-video');
    expect(radio?.type).toBe('radio');
    expect(radio?.name).toBe('jamType');
    expect(element.querySelector(`#${radio?.getAttribute('aria-labelledby')}`)?.textContent).toBe(
      'Jam Video',
    );
    radio?.click();
    fixture.detectChanges();
    expect(component.selectedJam()).toBe('video');
    expect(element.querySelector('[aria-current="step"]')?.textContent).toContain(
      'Leggi le regole',
    );
  });

  it('focuses the error summary and lets its links focus the invalid field', async () => {
    component.selectJam('audio');
    component.answerRules(true);
    fixture.detectChanges();
    await component.submit(submitEvent());
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement?.id).toBe('participation-errors');
    const summary = element.querySelector('#participation-errors');
    expect(summary?.querySelectorAll('a').length).toBe(4);
    summary?.querySelector<HTMLAnchorElement>('a[href="/partecipa#participation-name"]')?.click();
    expect(document.activeElement?.id).toBe('participation-name');

    component.form.controls.name.setValue('Alex');
    fixture.detectChanges();
    expect(summary?.querySelector('a[href="/partecipa#participation-name"]')).toBeNull();
  });

  it('moves focus to the newly opened details and the final confirmation', async () => {
    component.selectJam('video');
    component.answerRules(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('details-title');

    fillCommonFields();
    await component.submit(submitEvent());
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('registration-title');
    expect(element.querySelector('[role="status"]')?.textContent).toBe('Iscrizione completata.');
  });

  it('connects field hints and validation messages to their controls', async () => {
    component.selectJam('video');
    component.answerRules(true);
    fixture.detectChanges();
    await component.submit(submitEvent());
    fixture.detectChanges();

    const controls = element.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[required], textarea',
    );
    for (const control of controls) {
      expect(element.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
      for (const id of control.getAttribute('aria-describedby')?.split(' ') ?? []) {
        expect(element.querySelector(`#${id}`)).not.toBeNull();
      }
    }
    expect(element.querySelector('#participation-name')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('label[for="participation-equipment"]')?.textContent).toContain(
      'Facoltativo',
    );
  });

  it('does not autoplay the interlude when reduced motion is requested', () => {
    component.prefersReducedMotion.set(true);
    component.selectJam('video');
    component.answerRules(false);
    fixture.detectChanges();
    const video = element.querySelector('video');
    expect(video?.autoplay).toBe(false);
    expect(video?.controls).toBe(false);
    expect(element.querySelector('.participation-video-actions')?.textContent).toContain(
      'Riproduci il video',
    );
    expect(video?.loop).toBe(true);
  });

  it('provides keyboard-operable pause and audio controls for the interlude', async () => {
    component.selectJam('video');
    component.answerRules(false);
    fixture.detectChanges();
    const video = element.querySelector('video')!;
    const pause = vi
      .spyOn(video, 'pause')
      .mockImplementation(() => video.dispatchEvent(new Event('pause')));
    Object.defineProperty(video, 'paused', { configurable: true, value: false });
    video.dispatchEvent(new Event('play'));
    fixture.detectChanges();

    const pauseButton = element.querySelector<HTMLButtonElement>(
      '.participation-video-actions button',
    );
    expect(pauseButton?.textContent).toContain('Metti in pausa');
    pauseButton?.click();
    fixture.detectChanges();
    expect(pause).toHaveBeenCalledOnce();
    expect(pauseButton?.textContent).toContain('Riproduci il video');

    component.toggleVideoAudio();
    fixture.detectChanges();
    expect(video.muted).toBe(true);
    expect(
      element.querySelector('.participation-video-actions button[aria-pressed="true"]')
        ?.textContent,
    ).toContain('Attiva audio');
  });
});
