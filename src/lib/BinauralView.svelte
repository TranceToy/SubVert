<script>
  import { onDestroy } from 'svelte';

  let { binaural } = $props();
  let audioEl;

  $effect(() => {
    binaural.audioEl = audioEl;
  });

  $effect(() => {
    binaural.applyParams();
  });

  onDestroy(() => {
    if (binaural.playing) binaural.stop();
  });
</script>

<!-- Hidden audio sink: routes Web Audio output through a real <audio> element
     so Chromium keeps the page audible when the screen is locked. -->
<audio bind:this={audioEl} playsinline></audio>
