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
