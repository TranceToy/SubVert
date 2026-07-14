export class Strobe {
  gapMs = $state(100);
  flashMs = $state(50);
  intensity = $state(1.0);
  color = $state('#ffffff');
  playing = $state(false);

  toggle() {
    this.playing = !this.playing;
  }
}
