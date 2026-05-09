<script>
  import { onDestroy } from 'svelte';

  let { slideshow } = $props();

  $effect(() => {
    if (!slideshow.playing) return;
    const id = setInterval(() => slideshow.advance(), slideshow.intervalMs);
    return () => clearInterval(id);
  });

  onDestroy(() => slideshow.revokeUrls());
</script>

<div class="slideshow">
  {#if slideshow.slides.length === 0}
    <div class="empty-state">
      <p>Pick a folder of images to begin</p>
    </div>
  {:else}
    {#each slideshow.slides as slide, i}
      <img
        src={slide.url}
        alt={slide.name}
        class="slide"
        class:active={i === slideshow.currentSlide}
      />
    {/each}
  {/if}
</div>

<style>
  .slideshow {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .slide {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    width: auto;
    max-width: none;
    opacity: 0;
  }

  .slide.active {
    opacity: 1;
  }

  .empty-state {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-size: 1.1rem;
  }
</style>
