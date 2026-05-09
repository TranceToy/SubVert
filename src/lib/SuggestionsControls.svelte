<script>
  let { suggestions } = $props();
</script>

{#if suggestions.clips.length > 0}
  <button class="btn-primary" onclick={() => suggestions.toggle()}>
    {suggestions.playing ? '⏹ Stop' : '▶ Play'} Suggestions
  </button>
{/if}
