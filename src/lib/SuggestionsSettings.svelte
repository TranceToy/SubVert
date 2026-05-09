<script>
  let { suggestions } = $props();
</script>

<button class="btn-folder" onclick={() => suggestions.pickFolder()}>
  🎵 {suggestions.folderName ? `Folder: ${suggestions.folderName} (${suggestions.clips.length})` : 'Pick Audio Folder…'}
</button>

<label>
  <span>Volume: <strong>{Math.round(suggestions.volume * 100)}%</strong></span>
  <input type="range" min="0" max="1" step="0.01" bind:value={suggestions.volume} />
</label>

<label>
  <span>Min gap: <strong>{suggestions.gapMinSecs}s</strong></span>
  <input type="range" min="0" max="30" step="0.5" bind:value={suggestions.gapMinSecs} />
</label>

<label>
  <span>Max gap: <strong>{suggestions.gapMaxSecs}s</strong></span>
  <input type="range" min="0" max="60" step="0.5" bind:value={suggestions.gapMaxSecs} />
</label>
