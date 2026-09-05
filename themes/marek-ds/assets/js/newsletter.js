// Progressive enhancement for the newsletter form.
// Without this script the form posts to the provider and lands on its
// confirmation page. With it, the submission happens in place and the
// confirmation appears next to the form.

const form = document.querySelector('[data-newsletter] form');

if (form) {
  const status = form.querySelector('[data-newsletter-status]');
  const button = form.querySelector('button');

  const show = (message) => {
    status.textContent = message;
    status.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || response.statusText);
      }

      show('✅ You have been subscribed. Check your inbox to confirm.');
      form.reset();
    } catch {
      show('Something went wrong. Please try again in a moment.');
    } finally {
      button.disabled = false;
    }
  });
}
