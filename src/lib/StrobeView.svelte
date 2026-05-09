<script>
  let { strobe } = $props();
</script>

{#if strobe.playing}
  <div
    class="strobe"
    style:animation-duration="{1 / strobe.freqHz}s"
    style:--strobe-opacity={strobe.intensity}
  ></div>
{/if}

<style>
  .strobe {
    position: absolute;
    inset: 0;
    background: #fff;
    opacity: 0;
    pointer-events: none;
    animation-name: strobe-flash;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  /* Square-wave strobe: full off for the first half of each cycle,
     full intensity for the second half. The 0.001% slivers force
     instant transitions instead of linear fades. */
  @keyframes strobe-flash {
    0%, 49.999% { opacity: 0; }
    50%, 100% { opacity: var(--strobe-opacity); }
  }
</style>
