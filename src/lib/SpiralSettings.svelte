<script>
  let { spiral } = $props();
</script>

<section>
  <h3>Spiral</h3>

  <label>
    <span>Speed: <strong>{spiral.speed.toFixed(2)} rev/s</strong></span>
    <input type="range" min="0.02" max="3" step="0.02" bind:value={spiral.speed} />
  </label>

  <label>
    <span>Turns: <strong>{spiral.turns}</strong></span>
    <input type="range" min="2" max="15" step="1" bind:value={spiral.turns} />
  </label>

  <label>
    <span>Opacity: <strong>{spiral.opacity}</strong></span>
    <input type="range" min="0.1" max="1" step="0.05" bind:value={spiral.opacity} />
  </label>

  <label class="label-row">
    <span>Color:</span>
    <input type="color" bind:value={spiral.color} />
    <code>{spiral.color}</code>
  </label>
</section>

<style>
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
