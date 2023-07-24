if (!customElements.get('media-gallery')) {
  customElements.define('media-gallery', class MediaGallery extends HTMLElement {
    constructor() {
      super();
      this.elements = {
        viewer: this.querySelector('[id^="GalleryViewer"]'),
        thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
        prevButton: this.querySelector('button[name="previous"]'),
        nextButton: this.querySelector('button[name="next"]'),
        activeMedia: this.querySelector('.is-active')
      }

      if (this.elements.thumbnails) {
        this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
          mediaToSwitch.querySelector('button').addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
        });
      }

      if (this.elements.nextButton) {
        this.setArrowButtons(this.elements.activeMedia);

        this.elements.prevButton.addEventListener('click', this.onArrowButtonClick.bind(this));
        this.elements.nextButton.addEventListener('click', this.onArrowButtonClick.bind(this));
      }
    }

    onSlideChanged(event) {
      const thumbnail = this.elements.thumbnails.querySelector(`[data-target="${ event.detail.currentElement.dataset.slideMediaId }"]`);
      this.setActiveThumbnail(thumbnail);
    }

    setActiveMedia(mediaId) {
      window.pauseAllMedia();

      const activeMedia = this.querySelector(`[data-slide-media-id="${mediaId}"]`);

      this.elements.viewer.querySelectorAll('[data-slide-media-id]').forEach((element) => {
        const imageContainer = element.querySelector('.js-media-gallery-image-container');
        element.classList.remove('is-active');
        if (imageContainer) {
          imageContainer.classList.remove('loaded');
        }
      });
      
      const activeMediaImageContainer = activeMedia.querySelector('.js-media-gallery-image-container');
      activeMedia.classList.add('is-active');
      if (activeMediaImageContainer) {
        activeMediaImageContainer.classList.add('loaded');
      }

      this.preventStickyHeader();
      window.setTimeout(() => {
        if (this.elements.thumbnails) {
          activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft });
        } 

        if (this.elements.nextButton) {
          activeMedia.scrollIntoView({behavior: 'smooth'});
        }
      });

      this.playActiveMedia(activeMedia);

      if (this.elements.thumbnails) {
        const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${ mediaId }"]`);
        this.setActiveThumbnail(activeThumbnail);
      }

      this.setArrowButtons(activeMedia);

    }

    setArrowButtons(activeMedia) {
      if (!this.elements.prevButton) return; 
      if (activeMedia.previousElementSibling == null) {
        this.elements.prevButton.setAttribute('disabled', true);
      } else {
        this.elements.prevButton.removeAttribute('disabled');
      }

      if (activeMedia.nextElementSibling == null) {
        this.elements.nextButton.setAttribute('disabled', true);
      } else {
        this.elements.nextButton.removeAttribute('disabled');
      }
    }

    setActiveThumbnail(thumbnail) {
      if (!this.elements.thumbnails || !thumbnail) return;
      const thumbnailButton = thumbnail.querySelector('button');

      this.elements.thumbnails.querySelectorAll('button').forEach((element) => {(
        element.removeAttribute('aria-current'));
        element.classList.remove('is-active');
      });

      thumbnailButton.setAttribute('aria-current', true);
      thumbnailButton.classList.add('is-active');
      if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;

      this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft });
    }

    onArrowButtonClick(event) {
      event.preventDefault();
      const scrollDirection = event.currentTarget.name;
      const currentMedia = this.elements.viewer.querySelector('.is-active');
      const previousMedia = currentMedia.previousElementSibling;
      const nextMedia = currentMedia.nextElementSibling;

      if (scrollDirection === 'previous' && previousMedia !== null) {
        this.setActiveMedia(previousMedia.dataset.slideMediaId);
      } else if (scrollDirection === 'next' && nextMedia !== null) {
        this.setActiveMedia(nextMedia.dataset.slideMediaId);
      }
    }

    playActiveMedia(activeItem) {
      window.pauseAllMedia();
      const deferredMedia = activeItem.querySelector('.js-deferred-media-autoplay');
      if (deferredMedia) deferredMedia.loadContent(false);
    }

    preventStickyHeader() {
      this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
      if (!this.stickyHeader) return;
      this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
    }
  });
}
