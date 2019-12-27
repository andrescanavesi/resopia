function trackEvent(element, category) {
  console.info(`track element: ${element.id} category: ${category}`);
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
}
