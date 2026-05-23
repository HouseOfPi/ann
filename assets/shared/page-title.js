/* <page-title eyebrow="..." title="..."></page-title>
   Tiny custom element that renders the standard chapter header.
   Stays in sync with assets/shared/page-title.css.
*/
(function () {
  if (customElements.get('page-title')) return;

  class PageTitle extends HTMLElement {
    static get observedAttributes() { return ['eyebrow', 'title']; }

    connectedCallback() { this.render(); }
    attributeChangedCallback() { this.render(); }

    render() {
      const eyebrow = this.getAttribute('eyebrow') || '';
      const title = this.getAttribute('title') || '';
      this.innerHTML =
        `<span class="pt-eyebrow">${eyebrow}</span>` +
        `<h1 class="pt-title">${title}</h1>`;
    }
  }

  customElements.define('page-title', PageTitle);

  // Bubble arrow key navigation up to the parent window
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      window.parent.postMessage({ type: 'NAV', dir: 'next' }, '*');
    } else if (e.key === 'ArrowLeft') {
      window.parent.postMessage({ type: 'NAV', dir: 'prev' }, '*');
    }
  });
})();
