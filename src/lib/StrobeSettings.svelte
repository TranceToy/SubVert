<script>
  let { strobe } = $props();
</script>

<p class="note">⚠ May trigger seizures in people with photosensitive epilepsy</p>

<label>
  <span>Min gap: <strong>{strobe.gapMinMs} ms</strong></span>
  <input type="range" min="100" max="5000" step="50" bind:value={strobe.gapMinMs} />
</label>

<label>
  <span>Max gap: <strong>{strobe.gapMaxMs} ms</strong></span>
  <input type="range" min="100" max="5000" step="50" bind:value={strobe.gapMaxMs} />
</label>

<label>
  <span>Intensity: <strong>{Math.round(strobe.intensity * 100)}%</strong></span>
  <input type="range" min="0" max="1" step="0.05" bind:value={strobe.intensity} />
</label>

<label class="label-row">
  <span>Color:</span>
  <input type="color" bind:value={strobe.color} />
  <code>{strobe.color}</code>
</label>

<style>
  .note {
    font-size: 0.78rem;
    color: #aa6666;
    font-style: italic;
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
</style>
