const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

async function execute() {
  const res = await fetch('https://travelcooktell.com/scones-without-butter/');
  const body = await res.text();
  // console.info(body);

  const recipe = {};

  const root = parse(body);
  // console.info(body);
  let title = root.querySelector('.entry-title');
  title = title.childNodes[0].rawText;
  recipe.title = title;

  //
  const content = root.querySelector('.entry-content');
  const root2 = parse(content.structure);
  console.info(root2);
  // const img = root.querySelectorAll('.ezlazyload');
  //   console.info(img);
  //   img.childNodes.forEach((element) => {
  //     console.info('=====');
  //     console.info(element);
  //   });
  // img = img.childNodes[0];
  // const img = root.querySelector('ezlazyload');
  // const img = root.querySelector('img');
  // const img = root.querySelector('source');
  // console.info(img);
  // img = img.childNodes[0].rawText;

  return recipe;
}


execute().then((recipe) => {
  // console.log(JSON.stringify(recipe, null, 2));
  // console.info('done');
}).catch((err) => console.error(err));


// ///////////// client-side js //////////////////////
function scrape() {
  const title = document.getElementsByClassName('entry-title')[0].innerHTML;
  const img_url = document.getElementsByClassName('ezlazyloaded')[1].src.split('?')[0];
  const img_name = img_url.split('/')[7];

  const ingridientsArray = document.getElementsByClassName('wprm-recipe-ingredient');
  let ingredients = '';
  for (ingridient of ingridientsArray) {
    ingredients += `${ingridient.textContent}\n`;
  }

  const stepsArray = document.getElementsByClassName('wprm-recipe-instruction-text');
  let steps = '';
  for (step of stepsArray) {
    steps += `${step.textContent}\n`;
  }

  return {
    title, img_url, img_name, ingredients, steps,
  };
}

console.info(JSON.stringify(scrape(), null, 2));
// ////////////////////////////////////////////////////////////////
