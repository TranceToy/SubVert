<script>
  let { binaural } = $props();

  const beatPresets = [
    { label: 'Delta', hz: 2, desc: '0.5–4 Hz' },
    { label: 'Theta', hz: 6, desc: '4–8 Hz' },
    { label: 'Alpha', hz: 10, desc: '8–13 Hz' },
    { label: 'Beta', hz: 20, desc: '13–30 Hz' },
    { label: 'Gamma', hz: 40, desc: '30–100 Hz' },
  ];
</script>

<section>
  <h3>Binaural Beats</h3>
  <p class="note">🎧 Requires stereo headphones</p>

  <label>
    <span>Beat frequency: <strong>{binaural.beatHz} Hz</strong></span>
    <input type="range" min="0.5" max="50" step="0.5" bind:value={binaural.beatHz} />
  </label>

  <div class="presets">
    {#each beatPresets as p}
      <button
        class="preset"
        class:active={binaural.beatHz === p.hz}
        onclick={() => binaural.beatHz = p.hz}
      >
        {p.label}
        <small>{p.desc}</small>
      </button>
    {/each}
  </div>

  <label>
    <span>Carrier: <strong>{binaural.carrierHz} Hz</strong></span>
    <input type="range" min="80" max="500" step="5" bind:value={binaural.carrierHz} />
  </label>

  <label>
    <span>Volume: <strong>{Math.round(binaural.volume * 100)}%</strong></span>
    <input type="range" min="0" max="1" step="0.01" bind:value={binaural.volume} />
  </label>
</section>

<style>
  .note {
    font-size: 0.78rem;
    color: #666;
    font-style: italic;
  }

  .presets {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .preset {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.35rem 0.6rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: #bbb;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .preset:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .preset.active {
    background: rgba(0, 255, 170, 0.15);
    border-color: rgba(0, 255, 170, 0.5);
    color: #00ffaa;
  }

  .preset small {
    font-size: 0.62rem;
    color: #666;
  }

  .preset.active small {
    color: #55cc99;
  }
</style>
