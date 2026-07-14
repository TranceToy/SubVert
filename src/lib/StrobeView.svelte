<script>
  import { FLASH_MS } from './strobe.svelte.js';

  let { strobe } = $props();
  let flashing = $state(false);

  $effect(() => {
    if (!strobe.playing) return;

    let timeoutId;

    function scheduleNext() {
      const min = Math.min(strobe.gapMinMs, strobe.gapMaxMs);
      const max = Math.max(strobe.gapMinMs, strobe.gapMaxMs);
      const gap = min + Math.random() * (max - min);
      timeoutId = setTimeout(flash, gap);
    }

    function flash() {
      flashing = true;
      timeoutId = setTimeout(endFlash, FLASH_MS);
    }

    function endFlash() {
      flashing = false;
      scheduleNext();
    }

    scheduleNext();

    return () => {
      clearTimeout(timeoutId);
      flashing = false;
    };
  });
</script>

{#if flashing}
  <div class="strobe" style:opacity={strobe.intensity} style:background={strobe.color}></div>
{/if}

<style>
  .strobe {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
</style>
