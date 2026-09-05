// Progressive enhancement for the table of contents rail.
// Opening and closing already work through CSS :hover and :focus-within;
// this adds three things CSS cannot do: marking the section you are reading,
// tap-to-open on touch screens, and Esc to close.

const toc = document.querySelector('[data-toc]');

if (toc) {
  const button = toc.querySelector('.toc-rail');
  const dashes = new Map();
  const links = new Map();

  toc.querySelectorAll('[data-toc-dash]').forEach((el) => dashes.set(el.dataset.tocDash, el));
  toc.querySelectorAll('[data-toc-link]').forEach((el) => links.set(el.dataset.tocLink, el));

  const headings = [...dashes.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  // --- which section am I in ----------------------------------------------
  // Read position rather than observe intersections: this always resolves to
  // exactly one heading, including part way through a section longer than the
  // viewport, where no heading is on screen at all.
  let current = null;

  const markCurrent = () => {
    // The last heading that has passed the reading line near the top.
    const line = 120;
    let found = headings.length ? headings[0] : null;

    for (const h of headings) {
      if (h.getBoundingClientRect().top <= line) found = h;
      else break;
    }

    const id = found ? found.id : null;
    if (id === current) return;

    if (current) {
      dashes.get(current)?.classList.remove('is-current');
      links.get(current)?.classList.remove('is-current');
    }
    if (id) {
      dashes.get(id)?.classList.add('is-current');
      links.get(id)?.classList.add('is-current');
    }
    current = id;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      markCurrent();
      ticking = false;
    });
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  markCurrent();

  // --- open and close ------------------------------------------------------
  // CSS handles hover. These paths cover touch, where hover never fires.
  const setOpen = (open) => {
    toc.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!toc.classList.contains('is-open'));
  });

  document.addEventListener('click', (event) => {
    if (!toc.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toc.classList.contains('is-open')) {
      setOpen(false);
      button.focus();
    }
  });

  // Jumping to a section should not leave the card sitting open over the text.
  toc.querySelectorAll('.toc-list a').forEach((a) =>
    a.addEventListener('click', () => setOpen(false)),
  );
}
