<script>
  let { messages } = $props();
</script>

<button class="btn-folder" onclick={() => messages.pickFolder()}>
  📁 {messages.folderName ? `Folder: ${messages.folderName}` : 'Pick Text Folder…'}
</button>

{#if messages.messages.length > 0}
  <p class="count">{messages.messages.length} messages loaded</p>
{/if}

<label>
  <span>Interval min: <strong>{(messages.intervalMinMs / 1000).toFixed(1)}s</strong></span>
  <input type="range" min="500" max="30000" step="100" bind:value={messages.intervalMinMs} />
</label>

<label>
  <span>Interval max: <strong>{(messages.intervalMaxMs / 1000).toFixed(1)}s</strong></span>
  <input type="range" min="500" max="30000" step="100" bind:value={messages.intervalMaxMs} />
</label>

<label>
  <span>Duration: <strong>{messages.durationMs}ms</strong></span>
  <input type="range" min="30" max="500" step="10" bind:value={messages.durationMs} />
</label>

<style>
  .count {
    font-size: 0.78rem;
    color: #777;
  }
</style>
