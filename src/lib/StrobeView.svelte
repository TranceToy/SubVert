<script>
  let { strobe } = $props();
  let flashing = $state(false);

  $effect(() => {
    if (!strobe.playing) return;

    let timeoutId;

    function scheduleNext() {
      timeoutId = setTimeout(flash, strobe.gapMs);
    }

    function flash() {
      flashing = true;
      timeoutId = setTimeout(endFlash, strobe.flashMs);
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
