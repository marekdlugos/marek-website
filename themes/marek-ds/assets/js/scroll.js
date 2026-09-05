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

// Far enough that a stray trackpad nudge does not resize the header.
const COMPACT_AFTER = 64;

let ticking = false;

const update = () => {
  ticking = false;
  const y = root.scrollTop;

  if (header) {
    header.toggleAttribute('data-compact', y > COMPACT_AFTER);
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
