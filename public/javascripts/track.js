/**
 *
 * @param {*} element
 * @param {*} category
 */
function trackEvent(element, category) {
  console.info(`track element: ${element.id} category: ${category}`);
  const exists = typeof gtag !== 'undefined' && typeof gtag === 'function';
  if (exists) {
    // create a promise to track in background
    const promise = new Promise((resolve, reject) => {
      try {
        /*
                   <action> is the string that will appear as the event action in Google Analytics Event reports.
                   <category> is the string that will appear as the event category.
                   <label> is the string that will appear as the event label.
                   <value> is a non-negative integer that will appear as the event value.
                     */
        gtag('event', 'click', {
          event_category: category,
          event_label: element.id,
          value: '1',
        });
        resolve('track done');
      } catch (error) {
        reject(new Error(error));
      }
    });
    promise.then((result) => {
      console.info(result);
    }).catch((error) => {
      console.error(`Error tracking. ${error}`);
    });
  } else {
    console.info('track not enabled');
  }
}

/**
 *
 * @param {*} element
 * @param {*} recipeId
 */
function trackRecipeLink(element, recipeId) {
  trackEvent(element, `recipe_link_${recipeId}`);
}
