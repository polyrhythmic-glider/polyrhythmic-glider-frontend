import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-participation-archive',
  imports: [RouterLink],
  templateUrl: './participation-archive.html',
  styleUrl: '../participation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipationArchive {
  readonly eventDateLabel = '28.04.2026';
}
