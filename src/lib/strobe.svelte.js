export const FLASH_MS = 50;

export class Strobe {
  gapMinMs = $state(300);
  gapMaxMs = $state(1500);
  intensity = $state(1.0);
  color = $state('#ffffff');
  playing = $state(false);

  toggle() {
    this.playing = !this.playing;
  }
}
