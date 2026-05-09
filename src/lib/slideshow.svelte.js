import { shuffleInPlace } from './util.js';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp']);

export class Slideshow {
  slides = $state([]);
  currentSlide = $state(0);
  folderName = $state('');
  playing = $state(false);
  intervalMs = $state(500);

  toggle() {
    this.playing = !this.playing;
  }

  advance() {
    if (this.slides.length <= 1) return;
    if (this.currentSlide + 1 < this.slides.length) {
      this.currentSlide += 1;
    } else {
      this.slides = shuffleInPlace([...this.slides]);
      this.currentSlide = 0;
    }
  }

  prev() {
    if (this.slides.length === 0) return;
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  next() {
    if (this.slides.length === 0) return;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  revokeUrls() {
    for (const slide of this.slides) {
      URL.revokeObjectURL(slide.url);
    }
  }

  async pickFolder() {
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    } catch {
      return;
    }

    this.revokeUrls();

    const found = [];
    for await (const [name, handle] of dirHandle) {
      if (handle.kind !== 'file') continue;
      const ext = name.split('.').pop().toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      const file = await handle.getFile();
      const url = URL.createObjectURL(file);
      found.push({ name, url });
    }

    shuffleInPlace(found);

    this.slides = found;
    this.currentSlide = 0;
    this.folderName = dirHandle.name;
  }
}
