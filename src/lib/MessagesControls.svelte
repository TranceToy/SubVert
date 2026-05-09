<script>
  let { messages } = $props();
</script>

{#if messages.messages.length > 0}
  <button class="btn-primary" onclick={() => messages.toggle()}>
    {messages.playing ? '⏹ Stop' : '▶ Play'} Messages
  </button>
{/if}
