export class Strobe {
  freqHz = $state(10);
  intensity = $state(1.0);
  playing = $state(false);

  toggle() {
    this.playing = !this.playing;
  }
}
