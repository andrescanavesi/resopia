function selectTag(elem) {
  let currentValues = $('#tagsCsv')[0].value;
  const tagId = elem.id.replace('tag_', '');
  if (currentValues === '') {
    currentValues = tagId;
  } else if (!currentValues.includes(tagId)) {
    currentValues += `,${tagId}`;
  }
  $('#tagsCsv')[0].value = currentValues;
}
