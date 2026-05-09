export class Messages {
  messages = $state([]);
  folderName = $state('');
  playing = $state(false);
  intervalMinMs = $state(3000);
  intervalMaxMs = $state(10000);
  durationMs = $state(100);

  toggle() {
    this.playing = !this.playing;
  }

  async pickFolder() {
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    } catch {
      return;
    }

    const found = [];
    for await (const [name, handle] of dirHandle) {
      if (handle.kind !== 'file') continue;
      const ext = name.split('.').pop().toLowerCase();
      if (ext !== 'txt') continue;
      const file = await handle.getFile();
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) found.push(trimmed);
      }
    }

    this.messages = found;
    this.folderName = dirHandle.name;
  }
}
