<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  import { Slideshow } from '$lib/slideshow.svelte.js';
  import { Spiral } from '$lib/spiral.svelte.js';
  import { Strobe } from '$lib/strobe.svelte.js';
  import { BinauralBeats } from '$lib/binaural.svelte.js';
  import { Suggestions } from '$lib/suggestions.svelte.js';
  import { Messages } from '$lib/messages.svelte.js';

  import SlideshowView from '$lib/SlideshowView.svelte';
  import SlideshowControls from '$lib/SlideshowControls.svelte';
  import SlideshowSettings from '$lib/SlideshowSettings.svelte';

  import SpiralView from '$lib/SpiralView.svelte';
  import SpiralControls from '$lib/SpiralControls.svelte';
  import SpiralSettings from '$lib/SpiralSettings.svelte';

  import StrobeView from '$lib/StrobeView.svelte';
  import StrobeControls from '$lib/StrobeControls.svelte';
  import StrobeSettings from '$lib/StrobeSettings.svelte';

  import BinauralView from '$lib/BinauralView.svelte';
  import BinauralControls from '$lib/BinauralControls.svelte';
  import BinauralSettings from '$lib/BinauralSettings.svelte';

  import SuggestionsView from '$lib/SuggestionsView.svelte';
  import SuggestionsControls from '$lib/SuggestionsControls.svelte';
  import SuggestionsSettings from '$lib/SuggestionsSettings.svelte';

  import MessagesView from '$lib/MessagesView.svelte';
  import MessagesControls from '$lib/MessagesControls.svelte';
  import MessagesSettings from '$lib/MessagesSettings.svelte';

  const slideshow = new Slideshow();
  const spiral = new Spiral();
  const strobe = new Strobe();
  const binaural = new BinauralBeats();
  const suggestions = new Suggestions();
  const messages = new Messages();

  let showSettings = $state(true);
  let pausedFromMediaSession = { binaural: false, suggestions: false };

  $effect(() => {
    if (!('mediaSession' in navigator)) return;

    const labels = [];
    if (binaural.playing) labels.push('Binaural Beats');
    if (suggestions.playing) labels.push('Suggestions');

    if (labels.length === 0) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    const title = labels.join(' + ');
    const artworkUrl = `${base}/pwa512.png`;
    const artwork = [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }];
    const metadata = new MediaMetadata({ title, artist: 'SubVert', artwork });

    navigator.mediaSession.metadata = metadata;
    navigator.mediaSession.playbackState = 'playing';
  });

  function handleMediaSessionPause() {
    pausedFromMediaSession = { binaural: binaural.playing, suggestions: suggestions.playing };
    if (binaural.playing) binaural.toggle();
    if (suggestions.playing) suggestions.toggle();
  }

  function handleMediaSessionPlay() {
    if (pausedFromMediaSession.binaural && !binaural.playing) binaural.toggle();
    if (pausedFromMediaSession.suggestions && !suggestions.playing) suggestions.toggle();
    pausedFromMediaSession = { binaural: false, suggestions: false };
  }

  onMount(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('pause', handleMediaSessionPause);
      navigator.mediaSession.setActionHandler('play', handleMediaSessionPlay);
    }
  });
</script>

<div class="app">
  <SlideshowView {slideshow} />
  <SpiralView {spiral} />
  <StrobeView {strobe} />
  <BinauralView {binaural} />
  <SuggestionsView {suggestions} />
  <MessagesView {messages} />

  <!-- Bottom HUD -->
  <div
    class="hud-zone"
    class:idle={!slideshow.playing && !spiral.playing && !strobe.playing && !binaural.playing && !suggestions.playing && !messages.playing}
  >
    <div class="hud">
      <SlideshowControls {slideshow} />
      <SpiralControls {spiral} />
      <StrobeControls {strobe} />
      <BinauralControls {binaural} />
      <SuggestionsControls {suggestions} />
      <MessagesControls {messages} />
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

      <SlideshowSettings {slideshow} />
      <SuggestionsSettings {suggestions} />
      <MessagesSettings {messages} />
      <BinauralSettings {binaural} />
      <SpiralSettings {spiral} />
      <StrobeSettings {strobe} />
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

  .hud-zone:hover .hud,
  .hud-zone.idle .hud {
    opacity: 1;
  }

  /* Shared button styles used by HUD controls in child components */
  :global(.btn-primary) {
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

  :global(.btn-primary:hover) {
    background: rgba(0, 0, 0, 0.85);
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

  /* Section/control styles shared by every settings child component.
     Scoped to .settings so they only apply inside the panel. */
  .settings :global(section) {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .settings :global(h3) {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    padding-bottom: 0.4rem;
  }

  .settings :global(label) {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.88rem;
    color: #aaa;
  }

  .settings :global(label strong) {
    color: #eee;
  }

  .settings :global(input[type="range"]) {
    width: 100%;
    accent-color: #00ffaa;
  }

  .settings :global(.btn-folder) {
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

  .settings :global(.btn-folder:hover) {
    background: rgba(255, 255, 255, 0.12);
  }
</style>
