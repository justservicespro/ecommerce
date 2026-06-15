// Shared share-bar behavior: opens platform share dialogs for the current page
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`,
      whatsapp: `https://wa.me/?text=${pageTitle}%20${pageUrl}`,
    };

    document.querySelectorAll('[data-share]').forEach((el) => {
      const platform = el.dataset.share;
      if (links[platform]) {
        el.setAttribute('href', links[platform]);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    });
  });
})();
