if (!customElements.get('popup-modal')) {
  customElements.define('popup-modal', class PopupModal extends HTMLElement {
    constructor() {
      super();
      this.storageItemName = 'whiskThemePromoPopup'

      this.querySelectorAll('[data-close-popup]').forEach((button) => button.addEventListener('click', this.close.bind(this)));

      if (localStorage.getItem(this.storageItemName) === this.dataset.modalId) return;
      this.showModal();
    }

    showModal() {
      const modal = this;
      const delay_in_milliseconds = parseInt(this.dataset.delay, 10) * 1000;

      modal.addEventListener('transitionend', () => {
        modal.focus();
        trapFocus(modal);
      }, { once: true });

      modal.removeAttribute('hidden');

      setTimeout(() => {
        document.documentElement.classList.add('popup-open');
        modal.classList.add('animate-in');
      }, delay_in_milliseconds);
    }

    storeKey() {
      const key = this.dataset.modalId;
      localStorage.setItem(this.storageItemName, key);
    }

    hideModal() {
      this.classList.remove('animate-in');
      document.documentElement.classList.remove('popup-open');
      removeTrapFocus();

      setTimeout(() => {
        this.setAttribute('hidden', '');
      }, 500);
    }

    close() {
      this.hideModal();

      if (!Shopify.designMode) {
        this.storeKey();
      }
    }
  }
)};
