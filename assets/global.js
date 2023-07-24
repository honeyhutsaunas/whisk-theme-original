function fadeInImages() {
  const lazyImageContainers = [].slice.call(document.querySelectorAll(".fade-in-image"));
  const lazyImages = [].slice.call(document.querySelectorAll(".fade-in-image img"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        const parent = entry.target.parentNode;
        if (entry.isIntersecting) {
          parent.classList.add("fade-in-image--loaded");
        } else {
          parent.classList.remove("fade-in-image--loaded");
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    lazyImageContainers.forEach(function(container) {
      container.classList.add("fade-in-image--loaded");
    });
  }
}

function watchForResize() {
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if (entry.target.id === 'site-header') {
        setHeaderCssVariable();
      }
    }
  });
  
  resizeObserver.observe(document.getElementById('site-header'));
}

function loadAnimations() {
  const animationContainers = [].slice.call(document.querySelectorAll(".animate"));

  if ("IntersectionObserver" in window) {
    let animationObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate--loaded");
        } else {
          entry.target.classList.remove("animate--loaded");
        }
      });
    });

    animationContainers.forEach(function(container) {
      animationObserver.observe(container);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    animationContainers.forEach(function(container) {
      container.classList.add("animate--loaded");
    });
  }
}

function setHeaderCssVariable() {
  const root = document.documentElement;
  const headerHeight = document.getElementById('site-header').offsetHeight;
  root.style.setProperty('--site-header-height', headerHeight + "px");
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', 'false');

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    const button = event.currentTarget;

    button.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class DrawerOpener extends HTMLElement {
  constructor() {
    super();

    this.drawerId = this.dataset.drawerId;
    this.drawerOpenButtons = document.querySelectorAll(`[data-drawer-to-open="${this.drawerId}"]`);
    this.drawerOpenButtons.forEach(button => button.addEventListener('click', this.onOpenButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;
    this.closeDrawer();
  }

  onOpenButtonClick(event) {
    const eventButton = event.currentTarget;
    const eventDrawerId = eventButton.dataset.drawerToToggle;

    event.preventDefault();
    this.openDrawer(eventDrawerId);
  }

  onCloseButtonClick(event) {
    const eventButton = event.currentTarget;
    const eventDrawerId = eventButton.dataset.drawerToToggle;

    event.preventDefault();
    this.closeDrawer(eventDrawerId);
  }

  openDrawer() {
    const targetDrawer = document.getElementById(this.drawerId);
    const drawerCloseButtons = document.querySelectorAll(`[data-drawer-to-close="${this.drawerId}"]`);
    
    trapFocus(targetDrawer);
    this.onBodyClickEvent =
    this.onBodyClickEvent || this.onBodyClick.bind(this);
    document.body.addEventListener('click', this.onBodyClickEvent);
    targetDrawer.addEventListener('keyup', this.onKeyUp.bind(this));
    targetDrawer.removeAttribute('hidden');
    targetDrawer.setAttribute('open', true);
    setTimeout(() => {
      targetDrawer.classList.add('menu-opening');
      document.documentElement.classList.add('overlay-on');
    });
    this.drawerOpenButtons.forEach(button => {
      button.setAttribute('aria-expanded', true);
      button.removeEventListener('click', this.onOpenButtonClick.bind(this));
    });
    drawerCloseButtons.forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  closeDrawer() {
    const targetDrawer = document.getElementById(this.drawerId);
    const drawerCloseButtons = document.querySelectorAll(`[data-drawer-to-close="${this.drawerId}"]`);

    document.body.removeEventListener('click', this.onBodyClickEvent);
    document.documentElement.classList.remove('overlay-on');
    removeTrapFocus();
    targetDrawer.removeEventListener('keyup', this.onKeyUp.bind(this));
    targetDrawer.classList.remove('menu-opening');
    targetDrawer.addEventListener('transitionend', () => {
      targetDrawer.setAttribute('hidden', true);
    }, { once: true });
    drawerCloseButtons.forEach(button => button.removeEventListener('click', this.onCloseButtonClick.bind(this)));
    this.drawerOpenButtons.forEach(button => {
      button.addEventListener('click', this.onOpenButtonClick.bind(this));
      button.setAttribute('aria-expanded', false);
    });
  }

  onBodyClick(event) {
    if (event.target.classList.contains('page-layout__overlay')) this.closeDrawer();
  }

  closeSubmenu(dialogElement) {
    dialogElement.classList.remove('menu-opening');
    dialogElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus();
    this.closeAnimation(dialogElement);
  }
}

customElements.define('drawer-opener', DrawerOpener);

class SimpleModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
  }

  show(opener) {
    this.openedBy = opener;
    this.setAttribute('open', '');
    this.removeAttribute('hidden');
  }

  hide() {
    this.removeAttribute('open');
    this.setAttribute('hidden', '');
    removeTrapFocus(this.openedBy);
  }
}
customElements.define('simple-modal-dialog', SimpleModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = document.getElementById(`Deferred-Poster-${this.dataset.mediaId}`);
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.slidesInView();
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.enableSliderLooping) return;

    const slideSpacingLeft = this.dataset.slideSpacingLeft || 0;

    if (!this.prevButton) return;
    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft <= slideSpacingLeft) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  slidesInView() {
    let slidesInView = 0;

    this.sliderItemsToShow.forEach((element) => {
      if (this.isSlideVisible(element)) {
        return slidesInView++;
      }
    });

    return this.step = slidesInView;
  }

  onButtonClick(event) {
    event.preventDefault();

    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (this.step * this.sliderItemOffset) : this.slider.scrollLeft - (this.step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
    this.sectionId = this.dataset.sectionId;
    this.productFormId = this.dataset.productFormId;
    this.productId = this.dataset.productId;
    this.section = document.getElementById(`shopify-section-${this.sectionId}`);
    this.pdpQuickAdd = document.getElementById('ProductQuickAdd');

    // Variable to target the main product section when the variant is changed outside of the main product form
    if (this.dataset.mainProductSectionId) {
      this.mainProductSectionId = this.dataset.mainProductSectionId;
    } else {
      this.mainProductSectionId = this.sectionId;
    }
    
    // Prevent auto scroll on radio button click
    this.querySelectorAll('input[type="radio"]').forEach((radioButton) => {
      radioButton.addEventListener('click', event => {
        // To get the scroll position of current webpage
        const TopScroll = window.pageYOffset || document.documentElement.scrollTop;
        const LeftScroll = window.pageXOffset || document.documentElement.scrollLeft;

        // if scroll happens, set it to the previous value
        window.onscroll = function() {
          window.scrollTo(LeftScroll, TopScroll)
        };

        // renable scroll after 0.5 second
        setTimeout(() => {
          window.onscroll = function() {};
        }, 500);
      });
    });
  }

  onVariantChange(event) {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updateSwatches(event);
    this.updateVariantStatuses();
    this.updatePickupAvailability();
    this.updateMedia();
    this.updateLinksInProductCard();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.renderProductInfo();
      this.updateVariantInput();
      this.updateURL();
    }

    this.updateShareUrl();
  }

  toCurrency(value) {
    return (parseFloat(value) * 0.01).toFixed(2);
  }

  updateOptions() {
    let selectedValues = [];

    this.querySelectorAll('fieldset').forEach((selector) => {
      if (selector.querySelector('select')) {
        selectedValues.push(selector.querySelector('select').value);
      } else {
        selectedValues.push(selector.querySelector('input[type="radio"]:checked').value);
      }
    });

    this.options = selectedValues;
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.sectionId}-${this.productId}`);
    const productCardMediaGallery = document.getElementById(`ProductCardMediaGallery-${this.sectionId}-${this.productId}`);

    if (mediaGallery) {
      mediaGallery.setActiveMedia(`${this.sectionId}-${this.productId}-${this.currentVariant.featured_media.id}`, true);
    } else if (productCardMediaGallery) {
      productCardMediaGallery.setActiveMedia(`${this.sectionId}-${this.productId}-${this.currentVariant.featured_media.id}`, true);
    }
  }

  // Only needed on the product template for the main product, can be set to false elsewhere with data-update-url="false"
  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateSwatches(event) {
    const currentSwatchOption = event.target.parentNode.closest('fieldset[data-swatch-option]');
    if (!currentSwatchOption) return;

    const currentSwatchOptionPosition = currentSwatchOption.dataset.optionPosition;
    const allSwatchOptions = this.section.querySelectorAll(`[data-swatch-option="${this.productFormId}"]`);

    allSwatchOptions.forEach((option) => {
      if (option.dataset.optionPosition === currentSwatchOptionPosition) {
        // Update swatch name
        option.querySelector("[data-swatch-name]").innerHTML = currentSwatchOption.querySelector('input:checked').value;

        // Update checked swatch on other variant selects for this product in this section
        const allOptionSwatchInputs = Array.from(option.querySelectorAll('input[type="radio"]'));

        const selectedSwatch = allOptionSwatchInputs.find(input => input.value === currentSwatchOption.querySelector('input:checked').value);

        selectedSwatch.checked = true;
      }
    });
  }

  updateLinksInProductCard() {
    const productCard = this.closest(`[data-product-card="${this.productId}"]`);
    if (!productCard) return;

    let url = new URL(productCard.querySelector('[data-product-link]').href);
    let params = new URLSearchParams(url.search);
    params.set('variant', this.currentVariant.id);
    url.search = params.toString();
  
    productCard.querySelectorAll('[data-product-link]').forEach((link) => {
      link.setAttribute('href', url.href);
    });
  }

  updateVariantStatuses() {
    const fieldsets = [...this.querySelectorAll('fieldset')];
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(':checked').value === variant.option1
    );

    fieldsets.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
      const previousOptionSelected = fieldsets[index - 1].querySelector(':checked').value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter((variant) => variant.available && variant[`option${index}`] === previousOptionSelected)
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (input.type === 'radio') {
        if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
          input.closest('label').classList.remove('unavailable');
          } else {
          input.closest('label').classList.add('unavailable');
        }
      } else {
        if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
          input.innerText = input.getAttribute('value');
        } else {
          input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
        }
      }
    });
  }

  detectVariantsForSelectedOption(fieldsets, optionPosition) {
    fieldsets.forEach((fieldset) => {
      if (fieldset.querySelector('select')) {
        return this.variantData.filter(variant => fieldset.querySelector('select').value === variant[optionPosition]);
      } else {
        return this.variantData.filter(variant => fieldset.querySelector('input:checked').value === variant[optionPosition]);
      }
    });
  }

  // Update the share urls on the PDP
  updateShareUrl() {
    const updatedUrl = window.location.href;
    const socialShares = document.querySelectorAll('social-share');

    socialShares.forEach((socialShare) => {
      socialShare.updateShareUrl(updatedUrl);
    });
  }

  // Updates the input values so the correct variant is added to the cart
  updateVariantInput() {
    const productForms = document.querySelectorAll(`[data-form-id='${this.productFormId}'], #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));

      this.updateProductQuickAddDisplay(productForm);
    });
  }

  updateProductQuickAddDisplay(productForm) {
    if(!productForm.querySelector('[data-quick-add-variants]')) return;
    productForm.querySelectorAll('[data-quick-add-value]').forEach((value, index) => {
      value.innerHTML = this.currentVariant.options[index];
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    if (!this.section) return;
    const productForm = this.section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  // Get the correct price and availability for the current variant and render in the main product section
  renderProductInfo() {
    const id = `product-price-display-${this.mainProductSectionId}`;
    const mainProductPriceDisplay = document.getElementById(id);
    this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);

    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.mainProductSectionId}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        if (mainProductPriceDisplay) mainProductPriceDisplay.classList.remove('visibility-hidden');

        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId,
            html,
            variant: this.currentVariant,
          },
        });
      });
  }

  // Update product forms based on variant change, and disable if variant is sold out or unavailable
  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForms = document.querySelectorAll(`[data-form-id='${this.dataset.productFormId}']`);

    if (!productForms) return;
    productForms.forEach((productForm) => {
      const id = `product-price-display-${this.mainProductSectionId}`;
      const mainProductPriceDisplay = document.getElementById(id);
      const addButton = productForm.querySelector('[data-submit-button]');
      const addButtonText = productForm.querySelector('[data-submit-button-text]');
      const buttonPrice = productForm.querySelector('[data-button-price]');
      const buttonPriceContainer = productForm.querySelector('[data-button-price-container]');
      const quantityActionElements = productForm.querySelectorAll('[data-quantity-action-element]');

      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        if (text) addButtonText.textContent = text;
        if (quantityActionElements) quantityActionElements.forEach((element) => element.setAttribute('disabled', true));

        if (this.currentVariant) {
          if (mainProductPriceDisplay) mainProductPriceDisplay.classList.remove('visibility--hidden');
          if (buttonPriceContainer) buttonPriceContainer.classList.remove('display--none');
          if (buttonPrice) buttonPrice.textContent = this.toCurrency(this.currentVariant.price);
        } else {
          if (buttonPriceContainer) buttonPriceContainer.classList.add('display--none');
        }

        if (this.pdpQuickAdd) this.pdpQuickAdd.classList.add('display--none');
      } else {
        if (mainProductPriceDisplay) mainProductPriceDisplay.classList.remove('visibility--hidden');
        if (quantityActionElements) quantityActionElements.forEach((element) => element.removeAttribute('disabled'));
        addButton.removeAttribute('disabled');
        addButtonText.textContent = window.variantStrings.addToCart;
        if (buttonPriceContainer) buttonPriceContainer.classList.remove('display--none');
        if (buttonPrice) buttonPrice.textContent = this.toCurrency(this.currentVariant.price);
        if (this.pdpQuickAdd) this.pdpQuickAdd.classList.remove('display--none');
      }

      if (!modifyClass) return;
    });
  }

  // Indicates if the variant selected is unavailable
  setUnavailable() {
    const productForms = document.querySelectorAll(`[data-form-id='${this.dataset.productFormId}']`);

    if (!productForms) return;
    productForms.forEach((productForm) => {
      const id = `product-price-display-${this.mainProductSectionId}`;
      const mainProductPriceDisplay = document.getElementById(id);
      const addButton = productForm.querySelector('[data-submit-button]');
      const addButtonText = productForm.querySelector('[data-submit-button-text]');
      const buttonPriceContainer = productForm.querySelector('[data-button-price-container]');

      if (buttonPriceContainer) buttonPriceContainer.classList.add('display--none');
      if (mainProductPriceDisplay) mainProductPriceDisplay.classList.add('visibility--hidden');
      if (addButton) addButtonText.textContent = window.variantStrings.unavailable;
    });
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class ProductCardMediaGallery extends HTMLElement {
  constructor() {
    super();
    this.productCardContainer = this.closest('.product-card');
  }

  setActiveMedia(variantMediaId) {
    const variantMedia = this.querySelector(`[data-media-id="${variantMediaId}"]`);
    let selectedActiveMedia;
    if (variantMedia) {
      selectedActiveMedia = variantMedia;
    } else {
      selectedActiveMedia = this.querySelector(`[data-media-id="featured-image"]`);
    };

    this.querySelectorAll('[data-gallery-media-container]').forEach((media) => media.classList.remove('is-active'));

    selectedActiveMedia.classList.add('is-active');
  }
}

customElements.define('product-card-media-gallery', ProductCardMediaGallery);

window.addEventListener("load", fadeInImages);
window.addEventListener("load", loadAnimations);
window.addEventListener("load", setHeaderCssVariable);
window.addEventListener("load", watchForResize);
