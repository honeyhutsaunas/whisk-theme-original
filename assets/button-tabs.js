if (!customElements.get('button-tabs')) {
  customElements.define('button-tabs', class ButtonTabs extends HTMLElement {
    constructor() {
      super();

      this.navButtons = this.querySelectorAll('[data-tab-button]');
      this.sectionId = this.dataset.sectionId;
      this.navSections = document.querySelectorAll(`[data-tab-section=${this.sectionId}]`);
      
      this.navButtons.forEach((button) => {
        button.addEventListener('click', event => {
          event.preventDefault();
          this.handleButtonClick.bind(this)(event, this.navButtons, this.navSections);
        });
      });
    }

    handleButtonClick(event, navButtons, navSections) {
      const clickedButton = event.currentTarget;
      const tabId = clickedButton.dataset.tabButton;
      const navItemToShow = document.getElementById(tabId);

      navButtons.forEach((button) => {
        button.classList.remove('active');
        button.removeAttribute("tabindex");

        if (button.dataset.tabButton === tabId) {
          button.classList.add('active');
        }
      });

      clickedButton.setAttribute("tabindex", "-1");

      navSections.forEach((item) => {
        item.classList.remove('active');
      });

      navItemToShow.classList.add('active');
    }
  });
}
