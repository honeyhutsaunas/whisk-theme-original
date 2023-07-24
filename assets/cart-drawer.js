class CartDrawer extends HTMLElement {
  constructor() {
    super();
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
      },
      {
        id: 'cart-drawer-icon-bubble',
        section: 'cart-drawer-icon-bubble',
        selector: '.shopify-section'
      }
    ];
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);
