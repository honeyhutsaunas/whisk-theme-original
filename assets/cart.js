class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    
    this.cartDrawer = document.getElementById('cart-drawer');
    this.cartForm = document.getElementById('cart');
    this.cartEmptyMessage = document.getElementById('cart-empty-message');
    this.cartFooterContents = document.getElementById('cart-footer-contents');
    this.lineItemStatusElement = document.getElementById('shopping-cart-item-status');

    if (themeSettings.template_name === 'cart') {
      this.cartLocation = this;
    } else {
      this.cartLocation = this.cartDrawer;
    }

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
    .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  checkforEmptyCart() {
    if (this.querySelector('.js-cart-items-list').children.length === 0) {
      this.cartIsEmpty = true;
    } else {
      this.cartIsEmpty = false;
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-items',
        section: 'cart-items',
        selector: '.js-cart-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'cart-footer',
        section: 'cart-footer',
        selector: '.js-cart-footer-contents'
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.cartLocation.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);

        this.cartLocation.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        this.updateLiveRegions(line, parsedState.item_count);
        const lineItem =  document.getElementById(`CartItem-${line}`);

        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          lineItem.querySelector(`[name="${name}"]`).focus();
        }

        this.disableLoading();
        this.checkforEmptyCart();

        if (this.cartIsEmpty) {
          this.showEmptyCart();
        } else {
          this.hideEmptyCart();
        }
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' });
      }).catch((e) => {
        this.querySelectorAll('.js-loader-overlay').forEach((overlay) => overlay.classList.add('display--hidden'));
        const errors = document.getElementById('cart-errors');
        errors.textContent = window.cartStrings.error;
        this.disableLoading();
        console.error(e);
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`);

      lineItemError
        .querySelector('.js-cart-item-error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  hideEmptyCart() {
    this.cartEmptyMessage.classList.add('display--hidden');
    this.cartForm.classList.remove('display--hidden');
    this.cartFooterContents.classList.remove('display--hidden');
    this.cartFooterContents.querySelector('.js-cart-checkout-button').removeAttribute('disabled');
    this.cartEmptyMessage.querySelectorAll('a').forEach(link => link.setAttribute("tabindex", "-1"));
  }

  showEmptyCart() {
    this.cartEmptyMessage.classList.remove('display--hidden');
    this.cartForm.classList.add('display--hidden');
    this.cartFooterContents.classList.add('display--hidden');
    this.cartFooterContents.querySelector('.js-cart-checkout-button').setAttribute('disabled', '');
    this.cartEmptyMessage.querySelectorAll('a').forEach(link => link.removeAttribute("tabindex"));
  }

  enableLoading(line) {
    const targetCartItem = this.querySelector(`#CartItem-${line}`);
    const loadingOverlay = targetCartItem.querySelector('.js-loader-overlay');

    targetCartItem.classList.add('cart-item--loading');
    loadingOverlay.classList.remove('display--hidden');

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    this.querySelectorAll('.js-cart-item').forEach((item) => {
      item.classList.remove('cart-item--loading');
      item.querySelector('.js-loader-overlay').classList.add('display--hidden');
    });
  }
}

customElements.define('cart-items', CartItems);

class CartNote extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('change', debounce((event) => {
      const body = JSON.stringify({ note: event.target.value });
      fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }});
    }, 300))
  }
}

customElements.define('cart-note', CartNote);
