const moment = require('moment');

const FlexSearch = require('flexsearch');
const dbHelper = require('../utils/db_helper');
const { Logger } = require('../utils/Logger');

const log = new Logger('dao_recipes');

const preset = 'fast';
const searchIndex = new FlexSearch(preset);

let allRecipes = [];
let spotlightRecipes = [];

/**
 *
 * @param {*} row
 */
function convertRecipe(row) {
  const imageBase = process.env.RESOPIA_IMAGES_BASE_URL;
  const featuredImageBase = imageBase;
  const thumbnailImageBase = imageBase.replace('w_900', 'w_400');
  const thumbnail200ImageBase = imageBase.replace('w_900', 'w_200');
  const thumbnail500ImageBase = imageBase.replace('w_900', 'w_500');
  const thumbnail300ImageBase = imageBase.replace('w_900', 'w_300');
  // const featured_image_name = row.featured_image_name.replace("jpg", "webp");
  const featuredImageName = row.featured_image_name;
  const recipe = {};
  recipe.id = row.id;
  recipe.title = row.title;
  recipe.description = row.description;
  recipe.featured_image_name = featuredImageName;
  recipe.featured_image_url = featuredImageBase + featuredImageName;
  recipe.featured_image_url_mobile = thumbnail500ImageBase + featuredImageName;
  recipe.thumbnail500 = thumbnail500ImageBase + featuredImageName;
  recipe.thumbnail300 = thumbnail300ImageBase + featuredImageName;
  recipe.thumbnail = thumbnailImageBase + featuredImageName;
  recipe.thumbnail200 = thumbnail200ImageBase + featuredImageName;
  recipe.ingredients = row.ingredients;
  recipe.ingredients_array = row.ingredients.split('\n');
  recipe.steps = row.steps;
  recipe.steps_array = row.steps.split('\n');
  if (row.keywords) {
    recipe.keywords = row.keywords;
    recipe.keywords_array = row.keywords.split(',');
  } else {
    recipe.keywords = '';
    recipe.keywords_array = [];
  }
  let i = 0;
  recipe.keywords_array_3 = []; // contains maximum 3 keywords for SEO and UI purposes
  while (i < 3) {
    recipe.keywords_array_3.push(recipe.keywords_array[i]);
    i++;
  }

  recipe.title_seo = row.title_seo;
  recipe.created_at = moment(row.created_at, 'YYYY-MM-DD');
  recipe.created_at = recipe.created_at.format('YYYY-MM-DD');
  recipe.updated_at = moment(row.updated_at, 'YYYY-MM-DD');
  recipe.updated_at = recipe.updated_at.format('YYYY-MM-DD');
  recipe.url = `${process.env.RESOPIA_BASE_URL}/${recipe.id}/${recipe.title_seo}`;
  recipe.active = row.active;

  // social sharing buttons
  recipe.pinterestSharingUrl = `https://www.pinterest.com/pin/create/button/?url=${
    recipe.url
  }&media=${
    recipe.thumbnail
  }&description=${
    recipe.description}`;
  recipe.whatsappSharingUrl = `whatsapp://send?text=${recipe.url}`;
  recipe.facebookSharingUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(recipe.url)}`;
  const twitterUrl = encodeURI(`${recipe.url}&text=${recipe.title}`);
  recipe.twitterSharingUrl = `https://twitter.com/intent/tweet?url=${twitterUrl}`;

  recipe.prep_time_seo = row.prep_time_seo || 'PT20M';
  recipe.cook_time_seo = row.cook_time_seo || 'PT30M';
  recipe.total_time_seo = row.total_time_seo || 'PT50M';
  recipe.prep_time = row.prep_time || '20 minutes';
  recipe.cook_time = row.cook_time || '30 minutes';
  recipe.total_time = row.total_time || '50 minutes';
  recipe.cuisine = row.cuisine || 'American';
  recipe.yield = row.yield || '5 servings';

  return recipe;
}


async function findWithLimit(limit) {
  log.info(`findWithLimit, limit: ${limit}`);
  const query = 'SELECT * FROM recipes WHERE active=true ORDER BY updated_at DESC LIMIT $1 ';
  const bindings = [limit];

  const result = await dbHelper.execute.query(query, bindings);
  log.info(`recipes: ${result.rows.length}`);
  const recipes = [];
  for (let i = 0; i < result.rows.length; i++) {
    recipes.push(convertRecipe(result.rows[i]));
  }
  return recipes;
}

module.exports.resetCache = async function () {
  allRecipes = [];
  spotlightRecipes = [];
  await this.buildSearchIndex();
};


module.exports.findAll = async function () {
  if (allRecipes.length === 0) {
    allRecipes = findWithLimit(1000);
  }
  return allRecipes;
};

async function findRecipesSpotlight() {
  if (spotlightRecipes.length === 0) {
    spotlightRecipes = findWithLimit(24);
  }
  return spotlightRecipes;
}

async function findWithKeyword(keyword) {
  return findWithLimit(40);
}


// async function find(page) {
//   // TODO add pagination
//   return findWithLimit(50);
// }

/**
 *
 * @param {number} id
 * @param {boolean} ignoreActive true to find active true and false
 */
module.exports.findById = async function (id, ignoreActive) {
  if (!id) {
    throw Error('id param not defined');
  }
  let query;
  if (ignoreActive === true) {
    query = 'SELECT * FROM recipes WHERE id = $1 LIMIT 1';
  } else {
    query = 'SELECT * FROM recipes WHERE active=true AND id = $1 LIMIT 1';
  }

  const bindings = [id];
  // log.info(sqlFormatter.format(query));
  log.info(`bindings: ${bindings}`);
  const result = await dbHelper.execute.query(query, bindings);
  if (result.rows.length > 0) {
    return convertRecipe(result.rows[0]);
  }
  throw Error(`recipe not found by id ${id}`);
};

async function findByIds(ids) {
  if (!ids) {
    throw Error('ids param not defined');
  }
  log.info('findByIds');
  // log.info(ids);
  for (let i = 0; i < ids.length; i++) {
    if (isNaN(ids[i])) {
      throw new Error(`Seems '${ids[i]}' is not a number`);
    }
  }
  // in this case we concatenate string instead of using bindings. Something to improve
  const query = `SELECT * FROM recipes WHERE active=true AND id IN (${ids}) LIMIT 100`;
  const bindings = [];
  // log.info(sqlFormatter.format(query));
  // log.info("bindings: " + bindings);
  const result = await dbHelper.execute.query(query, bindings);
  const recipes = [];
  for (let i = 0; i < result.rows.length; i++) {
    recipes.push(convertRecipe(result.rows[i]));
  }
  return recipes;
}


module.exports.create = async function (recipe) {
  log.info('Creating recipe');
  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `INSERT INTO recipes(created_at, updated_at, title, title_seo, description, 
    ingredients, extra_ingredients_title, extra_ingredients, steps, active, 
    featured_image_name, secondary_image_name, facebook_likes, pinterest_pins,
    prep_time_seo, cook_time_seo,total_time_seo, prep_time,
    cook_time, total_time, cuisine, yield)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING id`;
  const bindings = [
    today, today, recipe.title, recipe.title_seo, recipe.description,
    recipe.ingredients, recipe.extra_ingredients_title, recipe.extra_ingredients, recipe.steps, recipe.active,
    recipe.featured_image_name, recipe.secondary_image_name, recipe.facebook_likes, recipe.pinterest_pins,
    recipe.prep_time_seo, recipe.cook_time_seo, recipe.total_time_seo, recipe.prep_time,
    recipe.cook_time, recipe.total_time, recipe.cuisine, recipe.yield,
  ];

  const result = await dbHelper.execute.query(query, bindings);

  const insertedId = result.rows[0].id;
  log.info(`Recipe created: ${insertedId}`);
  this.resetCache();
  return insertedId;
};

/**
 * @param recipe
 */
module.exports.update = async function (recipe) {
  log.info('updating recipe...');
  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `UPDATE recipes SET ingredients=$1, steps=$2, updated_at=$3, active=$4,
     featured_image_name=$5, extra_ingredients_title=$6, title=$7, description=$8, title_seo=$9, 
     secondary_image_name=$10, prep_time_seo=$11, cook_time_seo=$12, total_time_seo=$13, 
     prep_time=$14, cook_time=$15, total_time=$16, cuisine=$17, yield=$18 
       WHERE id=$19`;
  const bindings = [
    recipe.ingredients,
    recipe.steps,
    today,
    recipe.active,
    recipe.featured_image_name,
    recipe.extra_ingredients_title,
    recipe.title,
    recipe.description,
    recipe.title_seo,
    recipe.secondary_image_name,
    recipe.prep_time_seo,
    recipe.cook_time_seo,
    recipe.total_time_seo,
    recipe.prep_time,
    recipe.cook_time,
    recipe.total_time,
    recipe.cuisine,
    recipe.yield,
    recipe.id,
  ];
  // log.info(sqlFormatter.format(query));
  // log.info(bindings);
  const result = await dbHelper.execute.query(query, bindings);
  // log.info(result);
  this.resetCache();
  return result;
};

module.exports.buildSearchIndex = async function () {
  console.time('buildIndexTook');
  log.info('building index...');

  const allRecipes = await this.findAll();

  const size = allRecipes.length;
  for (let i = 0; i < size; i++) {
    // we might concatenate the fields we want for our content
    const content = `${allRecipes[i].title} ${allRecipes[i].description}`;
    const key = parseInt(allRecipes[i].id);
    searchIndex.add(key, content);
  }
  log.info(`index built, length: ${searchIndex.length}`);
  console.timeEnd('buildIndexTook');
};

module.exports.findRelated = async function (text) {
  log.info(`look for related results with: ${text}`);
  if (this.searchIndex.length === 0) {
    await this.buildSearchIndex();
  }

  const resultIds = await this.searchIndex.search({
    query: text,
    limit: 12,
    suggest: true, // When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
  });

  log.info(`related results: ${resultIds.length}`);
  let results;
  if (resultIds.length === 0) {
    results = await this.findRecipesSpotlight();
  } else {
    results = await this.findByIds(resultIds);
  }

  return results;
};

module.exports.findByIds = findByIds;
module.exports.findWithKeyword = findWithKeyword;
module.exports.findRecipesSpotlight = findRecipesSpotlight;
module.exports.searchIndex = searchIndex;
