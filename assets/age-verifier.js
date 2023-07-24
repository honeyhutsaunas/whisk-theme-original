if (!customElements.get('age-verifier')) {
  customElements.define('age-verifier', class AgeVerifier extends HTMLElement {
    constructor() {
      super();
      this.storageItemName = 'whiskThemeAgeVerified';
      this.promoPopUp = document.getElementById('promo-popup');

      this.querySelector('[data-yes-button]').addEventListener('click', this.close.bind(this));

      if (localStorage.getItem(this.storageItemName) === this.dataset.minimumAge) return;

      this.showModal();
    }

    showModal() {
      const modal = this;

      modal.addEventListener('transitionend', () => {
        modal.focus();
        trapFocus(modal);
      }, { once: true });

      setTimeout(() => {
        modal.removeAttribute('hidden');
        modal.classList.add('animate-in');
        document.documentElement.classList.add('age-verifier-open', 'never-show-promo-popup');
      }, 500);
    }

    storeKey() {
      const key = this.dataset.minimumAge;
      localStorage.setItem(this.storageItemName, key);
    }

    close() {
      // Ensure promo popup is hidden so that the customer gets to content immediately without having to manage a second popup on the same page.
      if (this.promoPopUp) {
        this.promoPopUp.hideModal();
      }

      this.classList.remove('animate-in');
      document.documentElement.classList.remove('age-verifier-open');
      removeTrapFocus();
      this.setAttribute('hidden', '');

      if (!Shopify.designMode) {
        this.storeKey();
      }
    }
  });
}