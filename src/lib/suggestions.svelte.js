import { shuffledIndices } from './util.js';

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'oga', 'm4a', 'mp4', 'aac', 'flac', 'opus', 'webm']);
const CHANNEL_PANS = [-1, 0, 1];

export class Suggestions {
  clips = $state([]);
  folderName = $state('');
  playing = $state(false);
  volume = $state(0.5);
  gapMinSecs = $state(2);
  gapMaxSecs = $state(10);

  audioEl = null;

  #ctx = null;
  #gain = null;
  #streamDest = null;
  #channels = null;

  #ensureCtx() {
    if (this.#ctx) return this.#ctx;
    this.#ctx = new AudioContext();
    this.#gain = this.#ctx.createGain();
    this.#gain.gain.value = this.volume;
    this.#streamDest = this.#ctx.createMediaStreamDestination();
    this.#gain.connect(this.#streamDest);
    return this.#ctx;
  }

  #randomGapMs() {
    const lo = Math.min(this.gapMinSecs, this.gapMaxSecs);
    const hi = Math.max(this.gapMinSecs, this.gapMaxSecs);
    return (lo + Math.random() * (hi - lo)) * 1000;
  }

  #scheduleNext(channel) {
    if (!this.#channels) return;
    if (channel.queue.length === 0) {
      channel.queue = shuffledIndices(this.clips.length);
    }
    const idx = channel.queue.shift();
    const clip = this.clips[idx];

    const source = this.#ctx.createBufferSource();
    source.buffer = clip.buffer;
    source.connect(channel.panner);
    source.onended = () => {
      if (!this.#channels) return;
      if (channel.source !== source) return;
      channel.source = null;
      const gapMs = this.#randomGapMs();
      channel.timeoutId = setTimeout(() => {
        channel.timeoutId = null;
        this.#scheduleNext(channel);
      }, gapMs);
    };
    channel.source = source;
    source.start();
  }

  start() {
    if (this.clips.length === 0) return;
    const ctx = this.#ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const channels = [];
    for (const pan of CHANNEL_PANS) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      panner.connect(this.#gain);
      channels.push({ panner, queue: [], source: null, timeoutId: null });
    }
    this.#channels = channels;

    for (const channel of this.#channels) {
      this.#scheduleNext(channel);
    }

    this.audioEl.srcObject = this.#streamDest.stream;
    this.audioEl.play();

    this.playing = true;
  }

  stop() {
    if (!this.#channels) return;
    for (const channel of this.#channels) {
      if (channel.timeoutId !== null) {
        clearTimeout(channel.timeoutId);
        channel.timeoutId = null;
      }
      if (channel.source) {
        channel.source.onended = null;
        channel.source.stop();
        channel.source = null;
      }
      channel.panner.disconnect();
    }
    this.#channels = null;

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
    if (this.#gain) this.#gain.gain.value = this.volume;
  }

  destroy() {
    if (this.playing) this.stop();
    this.#ctx?.close();
    this.#ctx = this.#gain = this.#streamDest = null;
  }

  async pickFolder() {
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    } catch {
      return;
    }

    if (this.playing) this.stop();

    const ctx = this.#ensureCtx();
    const found = [];
    for await (const [name, handle] of dirHandle) {
      if (handle.kind !== 'file') continue;
      const ext = name.split('.').pop().toLowerCase();
      if (!AUDIO_EXTENSIONS.has(ext)) continue;
      const file = await handle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      let buffer;
      try {
        buffer = await ctx.decodeAudioData(arrayBuffer);
      } catch {
        continue;
      }
      found.push({ name, buffer });
    }

    found.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    this.clips = found;
    this.folderName = dirHandle.name;
  }
}
