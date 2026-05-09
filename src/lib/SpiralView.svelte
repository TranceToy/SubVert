<script>
  import { onMount } from 'svelte';

  let { spiral } = $props();

  let canvas;
  let rafId = null;
  let rotation = 0;
  let prevTime = null;

  function spiralPoints(turns, maxR, steps = 700) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2;
      const r = (i / steps) * maxR;
      pts.push([r * Math.cos(t), r * Math.sin(t)]);
    }
    return pts;
  }

  function renderSpiral(ctx, w, h) {
    const maxR = Math.hypot(w, h) / 2;
    const pts = spiralPoints(spiral.turns, maxR);

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = spiral.color;
    ctx.globalAlpha = spiral.opacity;
    ctx.lineWidth = maxR / (spiral.turns * 2);
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = spiral.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function animate(ts) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;

    if (prevTime !== null) {
      rotation += spiral.speed * ((ts - prevTime) / 1000) * Math.PI * 2;
    }
    prevTime = ts;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rotation);
    renderSpiral(ctx, w, h);
    ctx.restore();

    rafId = requestAnimationFrame(animate);
  }

  function handleResize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  onMount(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  $effect(() => {
    if (!spiral.playing) return;
    prevTime = null;
    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  });
</script>

<canvas bind:this={canvas} class="spiral"></canvas>

<style>
  .spiral {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
</style>
