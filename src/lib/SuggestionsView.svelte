<script>
  import { onDestroy } from 'svelte';

  let { suggestions } = $props();
  let audioEl;

  $effect(() => {
    suggestions.audioEl = audioEl;
  });

  $effect(() => {
    suggestions.applyParams();
  });

  onDestroy(() => suggestions.destroy());
</script>

<!-- Hidden audio sink: routes Web Audio output through a real <audio> element
     so Chromium keeps the page audible when the screen is locked. -->
<audio bind:this={audioEl} playsinline></audio>
