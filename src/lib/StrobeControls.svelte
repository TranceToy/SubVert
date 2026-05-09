<script>
  let { strobe } = $props();
</script>

<button class="btn-primary" onclick={() => strobe.toggle()}>
  {strobe.playing ? '⏹ Stop' : '▶ Play'} Strobe
</button>
