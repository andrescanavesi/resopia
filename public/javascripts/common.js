
/**
 *
 * @param {*} event
 */
function searchBottom(event, wordSearch = 'buscar') {
  const element = document.getElementById('searchBottom');
  search(event, element, wordSearch);
}

/**
 *
 * @param {*} event
 */
function searchTop(event, wordSearch = 'buscar') {
  const element = document.getElementById('searchTop');
  search(event, element, wordSearch);
}

/**
 *
 * @param {*} event
 * @param {*} element
 */
function search(event, element, wordSearch = 'buscar') {
  if (event.keyCode === 13) {
    // listen to 'enter' key
    const phrase = element.value;
    if (phrase.length > 0) {
      window.location.href = `/${wordSearch}?q=${phrase}`;
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

/**
 * Dynamically inject the giphy iframe to avoid loading uncessary stuff during page loading
 */
function loadGiphy() {
  const wrapper = $('#giphyWrapper');
  wrapper.html('<div style="width:100%;height:0;padding-bottom:56%;position:relative;"><iframe src="https://giphy.com/embed/3o7TKr54I53mBu4qLm" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div>');
  wrapper.removeClass('text-center');
}

function rateRecipe(element, rating, recipeId) {
  console.info(`rating recipe: ${element.id} rating: ${rating} recipe ${recipeId}`);
  for (let index = 1; index <= rating; index++) {
    $(`#rating${index}`).addClass('text-warning');
  }
  showAlert('Gracias por votar la receta!');
  trackEvent(element, `rating_${rating}_${recipeId}`);
}

function showAlert(message) {
  // $('#toast').removeClass('z-index-1');
  // $('#toast').addClass('show');
  // $('#toastMessage').html(message);
}

function hideAlert() {
  // $('#toast').addClass('z-index-1');
  // $('#toast').removeClass('show');
}
