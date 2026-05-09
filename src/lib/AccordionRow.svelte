<script>
  import { slide } from 'svelte/transition';

  let {
    title,
    playing,
    canPlay = true,
    onToggle,
    expanded,
    onHeaderClick,
    children,
  } = $props();

  function handlePlay(e) {
    e.stopPropagation();
    if (!canPlay) return;
    onToggle();
  }

  function slideDuration() {
    if (typeof window === 'undefined') return 180;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
  }
</script>

<div class="row" class:expanded class:playing>
  <div class="header">
    <button
      type="button"
      class="header-trigger"
      onclick={onHeaderClick}
      aria-expanded={expanded}
    >
      <span class="chevron" class:open={expanded}>▸</span>
      <span class="title">{title}</span>
      <span class="dot" class:active={playing}></span>
    </button>
    <button
      type="button"
      class="play"
      class:on={playing}
      disabled={!canPlay}
      onclick={handlePlay}
      aria-label={playing ? 'Stop' : 'Play'}
    >
      {playing ? '⏹' : '▶'}
    </button>
  </div>

  {#if expanded}
    <div
      class="body"
      transition:slide={{ duration: slideDuration() }}
    >
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .row:first-child {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding-right: 0.4rem;
    transition: background 0.15s;
  }

  .header:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .header-trigger {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.4rem;
    background: none;
    border: none;
    color: #ddd;
    font: inherit;
    font-size: 0.95rem;
    text-align: left;
    cursor: pointer;
  }

  .row.expanded .header-trigger {
    color: #fff;
  }

  .chevron {
    color: #666;
    font-size: 0.7rem;
    width: 0.8rem;
    transition: transform 0.18s ease;
    display: inline-block;
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  .title {
    flex: 1;
    letter-spacing: 0.02em;
  }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    transition: background 0.2s, box-shadow 0.2s;
  }

  .dot.active {
    background: #00ffaa;
    box-shadow: 0 0 8px rgba(0, 255, 170, 0.7);
    animation: pulse 1.6s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }

  .play {
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    color: #ccc;
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    flex-shrink: 0;
    padding: 0;
  }

  .play:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
  }

  .play:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .play.on {
    background: rgba(0, 255, 170, 0.18);
    color: #00ffaa;
    border-color: rgba(0, 255, 170, 0.5);
  }

  .play.on:hover {
    background: rgba(0, 255, 170, 0.28);
  }

  .body {
    padding: 0.5rem 0.4rem 1rem 1.1rem;
    border-left: 1px solid rgba(0, 255, 170, 0.18);
    margin-left: 0.55rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
    .dot.active {
      animation: none;
    }
  }
</style>
