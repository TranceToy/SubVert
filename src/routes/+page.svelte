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
  import SlideshowSettings from '$lib/SlideshowSettings.svelte';

  import SpiralView from '$lib/SpiralView.svelte';
  import SpiralSettings from '$lib/SpiralSettings.svelte';

  import StrobeView from '$lib/StrobeView.svelte';
  import StrobeSettings from '$lib/StrobeSettings.svelte';

  import BinauralView from '$lib/BinauralView.svelte';
  import BinauralSettings from '$lib/BinauralSettings.svelte';

  import SuggestionsView from '$lib/SuggestionsView.svelte';
  import SuggestionsSettings from '$lib/SuggestionsSettings.svelte';

  import MessagesView from '$lib/MessagesView.svelte';
  import MessagesSettings from '$lib/MessagesSettings.svelte';

  import AccordionRow from '$lib/AccordionRow.svelte';

  const slideshow = new Slideshow();
  const spiral = new Spiral();
  const strobe = new Strobe();
  const binaural = new BinauralBeats();
  const suggestions = new Suggestions();
  const messages = new Messages();

  let showSettings = $state(true);
  let openRow = $state('slideshow');
  let pausedFromMediaSession = { binaural: false, suggestions: false };

  function toggleRow(name) {
    openRow = openRow === name ? null : name;
  }

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

      <div class="rows">
        <AccordionRow
          title="Slideshow"
          playing={slideshow.playing}
          canPlay={slideshow.slides.length > 0}
          onToggle={() => slideshow.toggle()}
          expanded={openRow === 'slideshow'}
          onHeaderClick={() => toggleRow('slideshow')}
        >
          <SlideshowSettings {slideshow} />
        </AccordionRow>

        <AccordionRow
          title="Suggestions"
          playing={suggestions.playing}
          canPlay={suggestions.clips.length > 0}
          onToggle={() => suggestions.toggle()}
          expanded={openRow === 'suggestions'}
          onHeaderClick={() => toggleRow('suggestions')}
        >
          <SuggestionsSettings {suggestions} />
        </AccordionRow>

        <AccordionRow
          title="Messages"
          playing={messages.playing}
          canPlay={messages.messages.length > 0}
          onToggle={() => messages.toggle()}
          expanded={openRow === 'messages'}
          onHeaderClick={() => toggleRow('messages')}
        >
          <MessagesSettings {messages} />
        </AccordionRow>

        <AccordionRow
          title="Binaural Beats"
          playing={binaural.playing}
          onToggle={() => binaural.toggle()}
          expanded={openRow === 'binaural'}
          onHeaderClick={() => toggleRow('binaural')}
        >
          <BinauralSettings {binaural} />
        </AccordionRow>

        <AccordionRow
          title="Spiral"
          playing={spiral.playing}
          onToggle={() => spiral.toggle()}
          expanded={openRow === 'spiral'}
          onHeaderClick={() => toggleRow('spiral')}
        >
          <SpiralSettings {spiral} />
        </AccordionRow>

        <AccordionRow
          title="Strobe"
          playing={strobe.playing}
          onToggle={() => strobe.toggle()}
          expanded={openRow === 'strobe'}
          onHeaderClick={() => toggleRow('strobe')}
        >
          <StrobeSettings {strobe} />
        </AccordionRow>
      </div>
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
    padding: 1.25rem 0 1.25rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem;
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

  .rows {
    display: flex;
    flex-direction: column;
    padding: 0 0.6rem;
  }

  /* Shared label/range styles inside accordion bodies. */
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
