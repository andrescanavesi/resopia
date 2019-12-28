$(document).ready(() => {
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
});

/**
 *
 * @param {*} event
 */
function searchBottom(event) {
  const element = document.getElementById('searchBottom');
  search(event, element);
}

/**
 *
 * @param {*} event
 */
function searchTop(event) {
  const element = document.getElementById('searchTop');
  search(event, element);
}

/**
 *
 * @param {*} event
 * @param {*} element
 */
function search(event, element) {
  if (event.keyCode === 13) {
    // listen to 'enter' key
    const phrase = element.value;
    if (phrase.length > 0) {
      window.location.href = `/buscar?q=${phrase}`;
    } else {
      window.location.href = '/';
    }
  }
}

/**
 *
 * @param {*} element
 */
function activateElem(element) {
  element.classList.toggle('active');
}

/**
 * Dynamically inject the youtube iframe to avoid loading uncessary stuff during page loading
 */
function loadYoutubeVideo() {
  const videoWrapper = $('.youtube-video-place');
  videoWrapper.html(`<iframe allowfullscreen frameborder="0" class="embed-responsive-item" src="${videoWrapper.data('yt-url')}"></iframe>`);
  videoWrapper.addClass('embed-responsive embed-responsive-4by3');
}
