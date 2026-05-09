<script>
  let { slideshow } = $props();
</script>

{#if slideshow.slides.length > 0}
  <button class="btn-primary" onclick={() => slideshow.toggle()}>
    {slideshow.playing ? '⏹ Stop' : '▶ Play'} Slideshow
  </button>
{/if}
