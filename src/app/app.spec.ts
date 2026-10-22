import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => null,
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the app shell', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('polyrhythmic');
    expect(compiled.querySelector('.brand')?.textContent).toContain('glider');
    expect(compiled.querySelector('.audio-button')?.textContent).toContain('Play');
  });

  it('should switch to the Game of Life background on the dedicated route', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    await fixture.whenStable();
    await router.navigateByUrl('/game-of-life');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-game-of-life-background')).not.toBeNull();
    expect(compiled.querySelector('.audio-button')).toBeNull();
  });

  it('should hide background audio controls on the participation route', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    await fixture.whenStable();
    await router.navigateByUrl('/partecipa');
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('.audio-controls')).toBeNull();
  });

  afterAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: originalGetContext,
    });
  });
});
