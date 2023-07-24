class ProductForm extends HTMLElement {
  constructor() {
    super();

    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
    this.cartItems = document.querySelector('cart-items');
    this.cartFooter = document.getElementById('cart-footer');
    this.siteHeader = document.querySelector('.section--site-header');
    this.cartDrawer = document.getElementById('cart-drawer');
    this.cartDrawerOpener = document.getElementById('cart-drawer-opener');

    this.hideErrors = this.dataset.hideErrors === 'true';
  }

  onSubmitHandler(event) {
    event.preventDefault();

    const submitButton = this.querySelector('[type="submit"]');
    if (submitButton.classList.contains('loading')) return;

    this.handleErrorMessage();

    submitButton.setAttribute('aria-disabled', true);
    submitButton.classList.add('loading');

    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    const formData = new FormData(this.form);

    // Prep main cart sections for updates on the cart page no matter the cart type
    if (themeSettings.template_name === 'cart') {
      formData.append('sections', this.cartItems.getSectionsToRender().map((section) => section.id));
      formData.append('sections_url', window.location.pathname);
      config.body = formData;
    // Prep cart notification for updates
    } else if (themeSettings.cart_type == 'page') {
      formData.append('sections', this.cartNotification.getSectionsToRender().map((section) => section.id));
      formData.append('sections_url', window.location.pathname);
      config.body = formData;
    // Prep cart drawer for updates
    } else {
      formData.append('sections', this.cartDrawer.getSectionsToRender().map((section) => section.id));
      formData.append('sections_url', window.location.pathname);
      config.body = formData;
    }

    fetch(`${routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          publish(PUB_SUB_EVENTS.cartError, {
            source: 'product-form',
            productVariantId: formData.get('id'),
            errors: response.errors || response.description,
            message: response.message,
          });

          this.handleErrorMessage(response.description);
          this.error = true;
        }

        document.querySelectorAll('simple-modal-dialog').forEach((dialog) => {
          dialog.hide();
        });

        if (!this.error) {
          // Main cart sections renders updates on the cart page no matter the cart type
          if (themeSettings.template_name === 'cart') {
            this.cartItems.querySelector('#cart-items-loader').classList.add('display--hidden');
            this.cartItems.getSectionsToRender().forEach((section => {
              document.getElementById(section.id).innerHTML =
                this.getSectionInnerHTML(response.sections[section.id], section.selector);
            }));
            this.cartItems.hideEmptyCart();
          // Cart notification renders updates
          } else if (themeSettings.cart_type === 'page') {
            this.cartNotification.setActiveElement(document.activeElement);
            this.cartNotification.renderContents(response);
            this.cartNotification.open();
          // Cart drawer renders updates
          } else {
            this.cartItems.querySelector('#cart-items-loader').classList.remove('display--hidden');
            this.cartDrawerOpener.openDrawer('cart-drawer');
            this.cartDrawer.setActiveElement(document.activeElement);
            this.cartItems.querySelector('#cart-items-loader').classList.add('display--hidden');
            this.cartDrawer.getSectionsToRender().forEach((section => {
              document.getElementById(section.id).innerHTML =
                this.getSectionInnerHTML(response.sections[section.id], section.selector);
            }));
            this.cartItems.hideEmptyCart();
            trapFocus(this.cartDrawer);
          }
          publish(PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', productVariantId: formData.get('id') });
        } 
        this.error = false;
      })
      .catch((e) => {
        console.error(e);
        if (!this.cartItems) return;
        this.cartItems.querySelector('#cart-items-loader').classList.remove('display--hidden');
      })
      .finally(() => {
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('aria-disabled');
      });
  }

  handleErrorMessage(errorMessage = false) {
    if (this.hideErrors) return;
    
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('[data-error-message-wrapper]');
    this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('[data-error-message]');

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }
}

customElements.define('product-form', ProductForm);
