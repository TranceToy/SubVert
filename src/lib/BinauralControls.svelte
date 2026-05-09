<script>
  let { binaural } = $props();
</script>

<button class="btn-primary" onclick={() => binaural.toggle()}>
  {binaural.playing ? '⏹ Stop' : '▶ Play'} Binaural Beats
</button>
{#if binaural.playing}
  <div class="now-playing">
    🎧 {binaural.carrierHz} Hz carrier · {binaural.beatHz} Hz beat
  </div>
{/if}

<style>
  .now-playing {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.65);
    background: rgba(0, 0, 0, 0.45);
    padding: 0.2rem 0.75rem;
    border-radius: 999px;
    backdrop-filter: blur(6px);
  }
</style>
