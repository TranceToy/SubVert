<script>
  let { spiral } = $props();
</script>

<button class="btn-primary" onclick={() => spiral.toggle()}>
  {spiral.playing ? '⏹ Stop' : '▶ Play'} Spiral
</button>
