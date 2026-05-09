export class Spiral {
  speed = $state(0.3);
  color = $state('#ffffff');
  opacity = $state(0.2);
  turns = $state(15);
  playing = $state(false);

  toggle() {
    this.playing = !this.playing;
  }
}
