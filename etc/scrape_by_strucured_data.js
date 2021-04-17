function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function scrape() {
  const elements = document.getElementsByTagName('script');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.type === 'application/ld+json') {
      const code = element.innerHTML;
      const array = JSON.parse(code);
      for (let j = 0; j < array.length; j++) {
        const item = array[j];
        if (item['@type'] === 'Recipe') {
          // console.info(item.name);
          // console.info(item.recipeIngredient);
          const title = item.name;
          let ingredients = '';
          let steps = '';
          // eslint-disable-next-line camelcase
          const img_url = item.image.url;

          shuffle(item.recipeIngredient).forEach((elem) => {
            ingredients += `${elem}\n`;
          });
          // console.info(ingredients);
          item.recipeInstructions.forEach((elem) => {
            steps += `${elem.text}`;
          });

          // eslint-disable-next-line camelcase
          const img_name = 'default.jpg';
          // eslint-disable-next-line camelcase
          const tags_csv = item.recipeCategory.join(',');
          return {
            title, img_url, img_name, ingredients, steps, tags_csv,
          };
        }
      }
    }
  }
  return null;
}

console.info(JSON.stringify(scrape(), null, 2));
