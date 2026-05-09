export class BinauralBeats {
  carrierHz = $state(120);
  beatHz = $state(6);
  volume = $state(0.3);
  playing = $state(false);

  audioEl = null;

  #ctx = null;
  #leftOsc = null;
  #rightOsc = null;
  #gain = null;
  #streamDest = null;

  start() {
    this.#ctx = new AudioContext();

    this.#gain = this.#ctx.createGain();
    this.#gain.gain.value = this.volume;

    this.#streamDest = this.#ctx.createMediaStreamDestination();
    this.#gain.connect(this.#streamDest);

    const leftPan = this.#ctx.createStereoPanner();
    leftPan.pan.value = -1;
    leftPan.connect(this.#gain);

    const rightPan = this.#ctx.createStereoPanner();
    rightPan.pan.value = 1;
    rightPan.connect(this.#gain);

    this.#leftOsc = this.#ctx.createOscillator();
    this.#leftOsc.type = 'sine';
    this.#leftOsc.frequency.value = this.carrierHz;
    this.#leftOsc.connect(leftPan);
    this.#leftOsc.start();

    this.#rightOsc = this.#ctx.createOscillator();
    this.#rightOsc.type = 'sine';
    this.#rightOsc.frequency.value = this.carrierHz + this.beatHz;
    this.#rightOsc.connect(rightPan);
    this.#rightOsc.start();

    this.audioEl.srcObject = this.#streamDest.stream;
    this.audioEl.play();

    this.playing = true;
  }

  stop() {
    this.#leftOsc?.stop();
    this.#rightOsc?.stop();
    this.#ctx?.close();
    this.#ctx = this.#leftOsc = this.#rightOsc = this.#gain = this.#streamDest = null;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.srcObject = null;
    }
    this.playing = false;
  }

  toggle() {
    if (this.playing) this.stop();
    else this.start();
  }

  applyParams() {
    if (this.#leftOsc) this.#leftOsc.frequency.value = this.carrierHz;
    if (this.#rightOsc) this.#rightOsc.frequency.value = this.carrierHz + this.beatHz;
    if (this.#gain) this.#gain.gain.value = this.volume;
  }
}
