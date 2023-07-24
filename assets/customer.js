if (!customElements.get('customer-addresses')) {
  customElements.define('customer-addresses', class CustomerAddresses extends HTMLElement {
    constructor() {
      super();
      this.addressCountrySelects = this.querySelectorAll('[data-address-country-select]');
      this.toggleButtons = this.querySelectorAll('[data-toggle-address-button]');
      this.cancelButtons = this.querySelectorAll('[data-cancel-address-button]');
      this.deleteButtons = this.querySelectorAll('[data-delete-address-button]');

      this.toggleButtons.forEach((button) => {
        button.addEventListener('click', this.handleAddEditButtonClick);
      });
      this.cancelButtons.forEach((button) => {
        button.addEventListener('click', this.handleCancelButtonClick);
      });
      this.deleteButtons.forEach((button) => {
        button.addEventListener('click', this.handleDeleteButtonClick);
      });

      this.setupCountries();
    }

    setupCountries() {
      if (Shopify && Shopify.CountryProvinceSelector) {
        new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
          hideElement: 'AddressProvinceContainerNew'
        });
        this.addressCountrySelects.forEach((select) => {
          const formId = select.dataset.formId;
          new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
            hideElement: `AddressProvinceContainer_${formId}`
          });
        });
      }
    }

    handleAddEditButtonClick(event) {
      const button = event.currentTarget;
      const currentState = button.getAttribute('aria-expanded');
      const addAddressContainer = document.getElementById('AddAddress');

      if (currentState === 'false') {
        button.setAttribute('aria-expanded', 'true');
        addAddressContainer.classList.add('is-expanded');
      } else {
        button.setAttribute('aria-expanded', 'false');
        addAddressContainer.classList.remove('is-expanded');
      }
    }

    handleCancelButtonClick() {
      const addAddressContainer = document.getElementById('AddAddress');
      const toggleButton = document.querySelectorAll('[data-toggle-address-button]');

      addAddressContainer.classList.remove('is-expanded');
      toggleButton.forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
      });
    }

    handleDeleteButtonClick(event) {
      if (confirm(event.currentTarget.getAttribute(['data-confirm-message']))) {
        Shopify.postLink(event.currentTarget.dataset.target, {
          parameters: { _method: 'delete' },
        });
      }
    }
  });
}
