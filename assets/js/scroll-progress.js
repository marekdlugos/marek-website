// Fills the fixed-bottom progress bar as the reader scrolls.
// Uses an rAF-throttled listener so it does not clobber other scroll handlers
// the way the previous `window.onscroll = ...` assignment did.
const bar = document.getElementById('scroll-progress');

if (bar) {
  let ticking = false;

  const update = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const scrolled = scrollable > 0 ? (doc.scrollTop || document.body.scrollTop) / scrollable : 0;
    bar.style.width = `${scrolled * 100}%`;
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}
