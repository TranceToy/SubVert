<script>
  import { onMount, onDestroy } from 'svelte';

  const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp']);
  const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'oga', 'm4a', 'mp4', 'aac', 'flac', 'opus', 'webm']);
  const CHANNEL_PANS = [-1, 0, 1];

  // --- Config ---
  let slideInterval = $state(1);
  let carrierHz = $state(120);
  let beatHz = $state(6);
  let volume = $state(0.3);
  let spiralSpeed = $state(0.3);
  let spiralColor = $state('#ffffff');
  let spiralOpacity = $state(0.2);
  let spiralTurns = $state(15);
  let showSettings = $state(false);

  // --- Slide state ---
  let slides = $state([]); // array of { name, url }
  let currentSlide = $state(0);
  let folderName = $state('');

  // --- Audio state ---
  let isPlaying = $state(false);

  // --- Suggestions state ---
  let suggestionClips = $state([]); // array of { name, buffer }
  let suggestionsFolderName = $state('');
  let suggestionsPlaying = $state(false);
  let suggestionsVolume = $state(0.5);
  let gapMinSecs = $state(2);
  let gapMaxSecs = $state(10);

  // --- DOM refs ---
  let canvas;

  // --- Audio internals ---
  let audioCtx = null;
  let leftOsc = null;
  let rightOsc = null;
  let gainNode = null;

  // --- Suggestions internals ---
  let suggestionsCtx = null;
  let suggestionsGain = null;
  let channelStates = null; // array of { panner, queue, source, timeoutId } while playing

  // --- Animation internals ---
  let rafId = null;
  let rotation = 0;
  let prevTime = null;

  // Pure: compute spiral points for a given arm
  function spiralPoints(turns, maxR, steps = 700) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2;
      const r = (i / steps) * maxR;
      pts.push([r * Math.cos(t), r * Math.sin(t)]);
    }
    return pts;
  }

  // I/O: draw spiral path onto canvas context
  function renderSpiral(ctx, w, h) {
    const maxR = Math.hypot(w, h) / 2;
    const pts = spiralPoints(spiralTurns, maxR);

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = spiralColor;
    ctx.globalAlpha = spiralOpacity;
    ctx.lineWidth = maxR / (spiralTurns * 2);
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = spiralColor;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function animate(ts) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;

    if (prevTime !== null) {
      rotation += spiralSpeed * ((ts - prevTime) / 1000) * Math.PI * 2;
    }
    prevTime = ts;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rotation);
    renderSpiral(ctx, w, h);
    ctx.restore();

    rafId = requestAnimationFrame(animate);
  }

  // --- Audio ---
  function startAudio() {
    audioCtx = new AudioContext();

    gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioCtx.destination);

    const leftPan = audioCtx.createStereoPanner();
    leftPan.pan.value = -1;
    leftPan.connect(gainNode);

    const rightPan = audioCtx.createStereoPanner();
    rightPan.pan.value = 1;
    rightPan.connect(gainNode);

    leftOsc = audioCtx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.value = carrierHz;
    leftOsc.connect(leftPan);
    leftOsc.start();

    rightOsc = audioCtx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.value = carrierHz + beatHz;
    rightOsc.connect(rightPan);
    rightOsc.start();
  }

  function stopAudio() {
    leftOsc?.stop();
    rightOsc?.stop();
    audioCtx?.close();
    audioCtx = leftOsc = rightOsc = gainNode = null;
  }

  function toggleAudio() {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
    isPlaying = !isPlaying;
  }

  // --- Suggestions ---
  function shuffledIndices(n) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function randomGapMs(minSecs, maxSecs) {
    const lo = Math.min(minSecs, maxSecs);
    const hi = Math.max(minSecs, maxSecs);
    return (lo + Math.random() * (hi - lo)) * 1000;
  }

  function getOrCreateSuggestionsCtx() {
    if (suggestionsCtx) return suggestionsCtx;
    suggestionsCtx = new AudioContext();
    suggestionsGain = suggestionsCtx.createGain();
    suggestionsGain.gain.value = suggestionsVolume;
    suggestionsGain.connect(suggestionsCtx.destination);
    return suggestionsCtx;
  }

  function scheduleNextOnChannel(channel) {
    if (!channelStates) return;
    if (channel.queue.length === 0) {
      channel.queue = shuffledIndices(suggestionClips.length);
    }
    const idx = channel.queue.shift();
    const clip = suggestionClips[idx];

    const source = suggestionsCtx.createBufferSource();
    source.buffer = clip.buffer;
    source.connect(channel.panner);
    source.onended = () => {
      if (!channelStates) return;
      if (channel.source !== source) return;
      channel.source = null;
      const gapMs = randomGapMs(gapMinSecs, gapMaxSecs);
      channel.timeoutId = setTimeout(() => {
        channel.timeoutId = null;
        scheduleNextOnChannel(channel);
      }, gapMs);
    };
    channel.source = source;
    source.start();
  }

  function startSuggestions() {
    if (suggestionClips.length === 0) return;
    const ctx = getOrCreateSuggestionsCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const states = [];
    for (const pan of CHANNEL_PANS) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      panner.connect(suggestionsGain);
      const channel = { panner, queue: [], source: null, timeoutId: null };
      states.push(channel);
    }
    channelStates = states;

    for (const channel of channelStates) {
      scheduleNextOnChannel(channel);
    }
    suggestionsPlaying = true;
  }

  function stopSuggestions() {
    if (!channelStates) return;
    for (const channel of channelStates) {
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
    channelStates = null;
    suggestionsPlaying = false;
  }

  function toggleSuggestions() {
    if (suggestionsPlaying) {
      stopSuggestions();
    } else {
      startSuggestions();
    }
  }

  $effect(() => {
    const hz = carrierHz;
    const beat = beatHz;
    if (leftOsc) leftOsc.frequency.value = hz;
    if (rightOsc) rightOsc.frequency.value = hz + beat;
  });

  $effect(() => {
    const vol = volume;
    if (gainNode) gainNode.gain.value = vol;
  });

  $effect(() => {
    const vol = suggestionsVolume;
    if (suggestionsGain) suggestionsGain.gain.value = vol;
  });

  // --- Slideshow timer ---
  $effect(() => {
    const interval = slideInterval * 100;
    const count = slides.length;

    const id = setInterval(() => {
      if (slides.length > 1) {
        currentSlide = (currentSlide + 1) % slides.length;
      }
    }, interval);

    return () => clearInterval(id);
  });

  // --- Filesystem ---
  async function pickFolder() {
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    } catch {
      // user cancelled
      return;
    }

    // Revoke previous object URLs
    for (const slide of slides) {
      URL.revokeObjectURL(slide.url);
    }

    const found = [];
    for await (const [name, handle] of dirHandle) {
      if (handle.kind !== 'file') continue;
      const ext = name.split('.').pop().toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      const file = await handle.getFile();
      const url = URL.createObjectURL(file);
      found.push({ name, url });
    }

    found.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    slides = found;
    currentSlide = 0;
    folderName = dirHandle.name;
  }

  async function pickSuggestionsFolder() {
    let dirHandle;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    } catch {
      // user cancelled
      return;
    }

    if (suggestionsPlaying) stopSuggestions();

    const ctx = getOrCreateSuggestionsCtx();
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
        // unreadable / unsupported codec — skip
        continue;
      }
      const clip = { name, buffer };
      found.push(clip);
    }

    found.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    suggestionClips = found;
    suggestionsFolderName = dirHandle.name;
  }

  // --- Resize ---
  function handleResize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  onMount(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', handleResize);
    rafId = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    cancelAnimationFrame(rafId);
    stopAudio();
    if (suggestionsPlaying) stopSuggestions();
    suggestionsCtx?.close();
    suggestionsCtx = suggestionsGain = null;
    window.removeEventListener('resize', handleResize);
    for (const slide of slides) {
      URL.revokeObjectURL(slide.url);
    }
  });

  const beatPresets = [
    { label: 'Delta', hz: 2, desc: '0.5–4 Hz' },
    { label: 'Theta', hz: 6, desc: '4–8 Hz' },
    { label: 'Alpha', hz: 10, desc: '8–13 Hz' },
    { label: 'Beta', hz: 20, desc: '13–30 Hz' },
    { label: 'Gamma', hz: 40, desc: '30–100 Hz' },
  ];
</script>

<div class="app">
  <!-- Slideshow background -->
  <div class="slideshow">
    {#if slides.length === 0}
      <div class="empty-state">
        <p>Pick a folder of images to begin</p>
      </div>
    {:else}
      {#each slides as slide, i}
        <img
          src={slide.url}
          alt={slide.name}
          class="slide"
          class:active={i === currentSlide}
        />
      {/each}
    {/if}
  </div>

  <!-- Spiral canvas overlay -->
  <canvas bind:this={canvas} class="spiral"></canvas>

  <!-- Bottom HUD -->
  <div class="hud-zone">
    <div class="hud">
      <button class="btn-primary" onclick={toggleAudio}>
        {isPlaying ? '⏹ Stop' : '▶ Play'} Binaural Beats
      </button>
      {#if isPlaying}
        <div class="now-playing">
          🎧 {carrierHz} Hz carrier · {beatHz} Hz beat
        </div>
      {/if}
      {#if suggestionClips.length > 0}
        <button class="btn-primary" onclick={toggleSuggestions}>
          {suggestionsPlaying ? '⏹ Stop' : '▶ Play'} Suggestions
        </button>
      {/if}
    </div>
  </div>

  <!-- Settings toggle -->
  <div class="settings-zone">
    <button class="btn-settings" onclick={() => showSettings = !showSettings} title="Settings">
      ⚙
    </button>
  </div>

  <!-- Settings panel -->
  {#if showSettings}
    <aside class="settings">
      <header class="settings-header">
        <h2>Settings</h2>
        <button class="btn-close" onclick={() => showSettings = false}>✕</button>
      </header>

      <!-- Slideshow section -->
      <section>
        <h3>Slideshow</h3>

        <button class="btn-folder" onclick={pickFolder}>
          📁 {folderName ? `Folder: ${folderName}` : 'Pick Image Folder…'}
        </button>

        {#if slides.length > 0}
          <div class="slide-nav">
            <button onclick={() => currentSlide = (currentSlide - 1 + slides.length) % slides.length}>‹</button>
            <span>{currentSlide + 1} / {slides.length} — {slides[currentSlide]?.name}</span>
            <button onclick={() => currentSlide = (currentSlide + 1) % slides.length}>›</button>
          </div>
        {/if}

        <label>
          <span>Interval: <strong>{slideInterval}s</strong></span>
          <input type="range" min="1" max="60" step="1" bind:value={slideInterval} />
        </label>
      </section>

      <!-- Suggestions section -->
      <section>
        <h3>Suggestions</h3>

        <button class="btn-folder" onclick={pickSuggestionsFolder}>
          🎵 {suggestionsFolderName ? `Folder: ${suggestionsFolderName} (${suggestionClips.length})` : 'Pick Audio Folder…'}
        </button>

        <label>
          <span>Volume: <strong>{Math.round(suggestionsVolume * 100)}%</strong></span>
          <input type="range" min="0" max="1" step="0.01" bind:value={suggestionsVolume} />
        </label>

        <label>
          <span>Min gap: <strong>{gapMinSecs}s</strong></span>
          <input type="range" min="0" max="30" step="0.5" bind:value={gapMinSecs} />
        </label>

        <label>
          <span>Max gap: <strong>{gapMaxSecs}s</strong></span>
          <input type="range" min="0" max="60" step="0.5" bind:value={gapMaxSecs} />
        </label>
      </section>

      <!-- Binaural beats section -->
      <section>
        <h3>Binaural Beats</h3>
        <p class="note">🎧 Requires stereo headphones</p>

        <label>
          <span>Beat frequency: <strong>{beatHz} Hz</strong></span>
          <input type="range" min="0.5" max="50" step="0.5" bind:value={beatHz} />
        </label>

        <div class="presets">
          {#each beatPresets as p}
            <button
              class="preset"
              class:active={beatHz === p.hz}
              onclick={() => beatHz = p.hz}
            >
              {p.label}
              <small>{p.desc}</small>
            </button>
          {/each}
        </div>

        <label>
          <span>Carrier: <strong>{carrierHz} Hz</strong></span>
          <input type="range" min="80" max="500" step="5" bind:value={carrierHz} />
        </label>

        <label>
          <span>Volume: <strong>{Math.round(volume * 100)}%</strong></span>
          <input type="range" min="0" max="1" step="0.01" bind:value={volume} />
        </label>
      </section>

      <!-- Spiral section -->
      <section>
        <h3>Spiral</h3>

        <label>
          <span>Speed: <strong>{spiralSpeed.toFixed(2)} rev/s</strong></span>
          <input type="range" min="0.02" max="3" step="0.02" bind:value={spiralSpeed} />
        </label>

        <label>
          <span>Turns: <strong>{spiralTurns}</strong></span>
          <input type="range" min="2" max="15" step="1" bind:value={spiralTurns} />
        </label>

        <label>
          <span>Opacity: <strong>{spiralOpacity}</strong></span>
          <input type="range" min="0.1" max="1" step="0.05" bind:value={spiralOpacity} />
        </label>

        <label class="label-row">
          <span>Color:</span>
          <input type="color" bind:value={spiralColor} />
          <code>{spiralColor}</code>
        </label>
      </section>
    </aside>
  {/if}
</div>

<style>
  .app {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  /* Slideshow */
  .slideshow {
    position: absolute;
    inset: 0;
  }

  .slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0;
  }

  .slide.active {
    opacity: 1;
  }

  .empty-state {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-size: 1.1rem;
  }

  /* Spiral */
  .spiral {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* HUD */
  .hud-zone {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 10rem;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .hud-zone .hud {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .hud-zone:hover .hud {
    opacity: 1;
  }

  .btn-primary {
    padding: 0.7rem 1.5rem;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 999px;
    font-size: 1rem;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: rgba(0, 0, 0, 0.85);
  }

  .now-playing {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.65);
    background: rgba(0, 0, 0, 0.45);
    padding: 0.2rem 0.75rem;
    border-radius: 999px;
    backdrop-filter: blur(6px);
  }

  /* Settings zone + button */
  .settings-zone {
    position: absolute;
    top: 0;
    right: 0;
    width: 8rem;
    height: 8rem;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
  }

  .btn-settings {
    margin: 1.25rem;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.25);
    font-size: 1.2rem;
    cursor: pointer;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, opacity 0.3s ease;
    opacity: 0;
  }

  .settings-zone:hover .btn-settings {
    opacity: 1;
  }

  .btn-settings:hover {
    background: rgba(0, 0, 0, 0.85);
  }

  /* Settings panel */
  .settings {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 340px;
    max-width: 100vw;
    background: rgba(8, 8, 12, 0.93);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    overflow-y: auto;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .settings-header h2 {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .btn-close {
    background: none;
    border: none;
    color: #666;
    font-size: 1.1rem;
    cursor: pointer;
    line-height: 1;
  }

  .btn-close:hover {
    color: #ccc;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    padding-bottom: 0.4rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.88rem;
    color: #aaa;
  }

  label strong {
    color: #eee;
  }

  input[type="range"] {
    width: 100%;
    accent-color: #00ffaa;
  }

  .label-row {
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
  }

  .label-row code {
    font-size: 0.8rem;
    color: #888;
  }

  .note {
    font-size: 0.78rem;
    color: #666;
    font-style: italic;
  }

  /* Beat presets */
  .presets {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .preset {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.35rem 0.6rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: #bbb;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .preset:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .preset.active {
    background: rgba(0, 255, 170, 0.15);
    border-color: rgba(0, 255, 170, 0.5);
    color: #00ffaa;
  }

  .preset small {
    font-size: 0.62rem;
    color: #666;
  }

  .preset.active small {
    color: #55cc99;
  }

  /* Folder button */
  .btn-folder {
    padding: 0.55rem 0.9rem;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: #ccc;
    font-size: 0.88rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }

  .btn-folder:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  /* Slide navigation */
  .slide-nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #777;
  }

  .slide-nav span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slide-nav button {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    color: #aaa;
    font-size: 1rem;
    padding: 0.1rem 0.5rem;
    cursor: pointer;
    flex-shrink: 0;
  }

  .slide-nav button:hover {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
