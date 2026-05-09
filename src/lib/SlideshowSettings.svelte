<script>
  let { slideshow } = $props();
</script>

<section>
  <h3>Slideshow</h3>

  <button class="btn-folder" onclick={() => slideshow.pickFolder()}>
    📁 {slideshow.folderName ? `Folder: ${slideshow.folderName}` : 'Pick Image Folder…'}
  </button>

  {#if slideshow.slides.length > 0}
    <div class="slide-nav">
      <button onclick={() => slideshow.prev()}>‹</button>
      <span>{slideshow.currentSlide + 1} / {slideshow.slides.length} — {slideshow.slides[slideshow.currentSlide]?.name}</span>
      <button onclick={() => slideshow.next()}>›</button>
    </div>
  {/if}

  <label>
    <span>Interval: <strong>{slideshow.intervalMs}ms</strong></span>
    <input type="range" min="100" max="6000" step="100" bind:value={slideshow.intervalMs} />
  </label>
</section>

<style>
  .slide-nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #777;
  }

  .slide-nav span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slide-nav button {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    color: #aaa;
    font-size: 1rem;
    padding: 0.1rem 0.5rem;
    cursor: pointer;
    flex-shrink: 0;
  }

  .slide-nav button:hover {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
