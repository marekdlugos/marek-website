// Two scroll-linked effects from one passive, rAF-throttled listener:
// the header compacting once the reader moves, and the reading-progress bar.
//
// CSS scroll-driven animations express both without JavaScript and were the
// first implementation. They are driven from here instead because support is
// still uneven: Firefox does not implement scroll timelines at all and Safari
// only does from 26, and in those browsers the header would silently never
// shrink and the progress bar would sit at zero. Both are behaviour the design
// asks for on every visit, not decoration that may degrade to nothing.
//
// Motion preferences are handled in CSS: base.css collapses transition
// durations under prefers-reduced-motion, so the header snaps rather than
// glides and nothing here needs to know about it.

const header = document.querySelector('[data-header]');
const root = document.documentElement;

// Compacting removes ~54px of in-flow header height. The browser's scroll
// anchoring then pulls scrollTop back by about as much, so a single threshold
// gets re-crossed on the next frame and the header oscillates. Two thresholds
// with a dead zone wider than that delta break the loop: once compact, stay
// compact until the reader is genuinely back near the top.
const COMPACT_AFTER = 96;
const EXPAND_BEFORE = 32;

let ticking = false;

const update = () => {
  ticking = false;
  const y = root.scrollTop;

  if (header) {
    const compact = header.hasAttribute('data-compact');
    header.toggleAttribute('data-compact', y > (compact ? EXPAND_BEFORE : COMPACT_AFTER));
  }

  const scrollable = root.scrollHeight - root.clientHeight;
  root.style.setProperty(
    '--scroll-progress',
    scrollable > 0 ? String(Math.min(y / scrollable, 1)) : '0',
  );
};

const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
};

addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll, { passive: true });
update();
