<script>
  let { messages } = $props();
  let currentText = $state(null);

  $effect(() => {
    if (!messages.playing || messages.messages.length === 0) return;

    let timeoutId;
    let active = true;

    function scheduleNext() {
      if (!active) return;
      const lo = Math.min(messages.intervalMinMs, messages.intervalMaxMs);
      const hi = Math.max(messages.intervalMinMs, messages.intervalMaxMs);
      const delay = lo + Math.random() * (hi - lo);
      timeoutId = setTimeout(showOne, delay);
    }

    function showOne() {
      if (!active) return;
      const pool = messages.messages;
      currentText = pool[Math.floor(Math.random() * pool.length)];
      timeoutId = setTimeout(hideOne, messages.durationMs);
    }

    function hideOne() {
      if (!active) return;
      currentText = null;
      scheduleNext();
    }

    scheduleNext();

    return () => {
      active = false;
      clearTimeout(timeoutId);
      currentText = null;
    };
  });
</script>

{#if currentText}
  <div class="message">{currentText}</div>
{/if}

<style>
  .message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 3rem;
    font-weight: 700;
    text-shadow:
      0 0 8px rgba(0, 0, 0, 0.85),
      0 2px 6px rgba(0, 0, 0, 0.7);
    pointer-events: none;
    user-select: none;
    white-space: nowrap;
    z-index: 10;
  }
</style>
