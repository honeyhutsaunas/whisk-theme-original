if (!customElements.get('social-share')) {
  customElements.define('social-share', class SocialShare extends HTMLElement {
    constructor() {
      super();
      this.loadPinterest();
      this.clipboardButton = this.querySelector('[data-share-clipboard]');
      this.successMessage = this.querySelector('[data-success-message]');
      this.shareUrl = this.dataset.shareUrl;
      this.shareLinks = this.querySelectorAll('[data-share-link]');

      this.clipboardButton.addEventListener('click', ()  => {
        this.copyUrlToClipboard(this.shareUrl);
      });
    }

    loadPinterest() {
      const script = document.createElement('script');
      script.src = '//assets.pinterest.com/js/pinit.js';
      document.body.appendChild(script);
    };

    copyUrlToClipboard(url) {
      navigator.clipboard.writeText(url).then(() => {
        this.successMessage.classList.remove('display--hidden');
        this.successMessage.setAttribute('aria-hidden', false);

        setTimeout(() => {
          this.successMessage.setAttribute('aria-hidden', true);
          this.successMessage.classList.add('display--hidden');
        }, 5000);
      });
    }

    // Called from global.js when a product variant is changed
    updateShareUrl(updatedUrl) {
      const currentUrl = this.shareUrl;

      if (this.shareLinks) {
        this.shareLinks.forEach(link => {
          const oldLink = link.getAttribute('href');
          const newLink = oldLink.replace(currentUrl, updatedUrl);

          link.setAttribute('href', newLink);
        });
      }
      this.shareUrl = updatedUrl;
    }
  });
}
