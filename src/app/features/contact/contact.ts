import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContactForm } from '../../shared/components/contact-form/contact-form';
import { SectionShell } from '../../shared/components/section-shell/section-shell';
import { CONTACT_CHANNELS } from '../home/home.content';

@Component({
  selector: 'app-contact',
  imports: [ContactForm, FontAwesomeModule, SectionShell],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly channels = CONTACT_CHANNELS;
}
