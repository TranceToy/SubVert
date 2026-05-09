<script>
  let { strobe } = $props();
</script>

<p class="note">⚠ May trigger seizures in people with photosensitive epilepsy</p>

<label>
  <span>Frequency: <strong>{strobe.freqHz} Hz</strong></span>
  <input type="range" min="0.5" max="30" step="0.5" bind:value={strobe.freqHz} />
</label>

<label>
  <span>Intensity: <strong>{Math.round(strobe.intensity * 100)}%</strong></span>
  <input type="range" min="0" max="1" step="0.05" bind:value={strobe.intensity} />
</label>

<style>
  .note {
    font-size: 0.78rem;
    color: #aa6666;
    font-style: italic;
  }
</style>
