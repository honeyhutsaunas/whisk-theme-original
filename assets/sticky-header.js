if (!customElements.get('sticky-header')) {
  customElements.define('sticky-header', class StickyHeader extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.header = document.getElementById(this.dataset.stickyElementId) ? document.getElementById(this.dataset.stickyElementId) : this.parentNode;
      this.scrollPastElement = document.getElementById(this.dataset.scrollElementId) ? document.getElementById(this.dataset.scrollElementId) : this.parentNode;
      this.siteHeader = document.getElementById('site-header');
      this.headerBounds = {};
      this.currentScrollTop = 0;

      this.onScrollHandler = this.onScroll.bind(this);

      window.addEventListener('scroll', this.onScrollHandler, false);

      this.createObserver();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScrollHandler);
    }

    createObserver() {
      let observer = new IntersectionObserver((entries, observer) => {
        this.headerBounds = entries[0].intersectionRect;
        observer.disconnect();
      });

      observer.observe(this.header);
    }

    onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const siteHeaderHeight = this.siteHeader.offsetHeight;
      let offsetPosition = siteHeaderHeight;

      if (this.dataset.stickyElementId === 'ProductQuickAdd') {
        const productHeroHeight = this.scrollPastElement.offsetHeight;

        offsetPosition = siteHeaderHeight + productHeroHeight;
      }

      if (scrollTop > this.currentScrollTop && scrollTop > offsetPosition) {
        requestAnimationFrame(this.scrolledPast.bind(this));
      } else if (scrollTop < this.currentScrollTop && scrollTop > offsetPosition) {
        requestAnimationFrame(this.scrollingUp.bind(this));
      } else if (scrollTop <= 0) {
        requestAnimationFrame(this.reset.bind(this));
      }

      this.currentScrollTop = scrollTop;
    }

    scrolledPast() {
      this.header.classList.add('scrolled-past', 'sticky', 'motion-reduce');
      this.closeMenuDisclosure();
      this.closeSearchModal();
    }

    scrollingUp() {
      this.header.classList.add('sticky', 'scrolling-up', 'motion-reduce');
      this.header.classList.remove('scrolled-past');
    }

    reset() {
      this.header.classList.remove('scrolled-past', 'sticky', 'scrolling-up');
    }

    closeMenuDisclosure() {
      this.disclosures = this.disclosures || this.siteHeader.querySelectorAll('details-disclosure');
      this.disclosures.forEach(disclosure => disclosure.close());
    }

    closeSearchModal() {
      this.searchModal = this.searchModal || this.siteHeader.querySelector('details-modal');
      this.searchModal.close(false);
    }
  });
}
