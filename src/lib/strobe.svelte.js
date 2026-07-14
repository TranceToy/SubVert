export class Strobe {
  gapMinMs = $state(300);
  gapMaxMs = $state(1500);
  flashMs = $state(50);
  intensity = $state(1.0);
  color = $state('#ffffff');
  playing = $state(false);

  toggle() {
    this.playing = !this.playing;
  }
}
