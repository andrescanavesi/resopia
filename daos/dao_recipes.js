const moment = require('moment');

moment.locale('es'); // TODO make it dynamic

const { Index } = require('flexsearch');
const dbHelper = require('../utils/db_helper');
const { Logger } = require('../utils/Logger');
const utils = require('../utils/utils');

const log = new Logger('dao_recipes');

let searchIndex;

let allRecipes = [];
let spotlightRecipes = [];
let mostVisitedRecipes = [];

/**
 *
 * @param {*} row
 */
function convertRecipe(row) {
  const imageBase = process.env.RESOPIA_IMAGES_BASE_URL;
  const featuredImageBase = imageBase;
  const thumbnailImageBase = imageBase.replace('w_900', 'w_400');
  const thumbnail200ImageBase = imageBase.replace('w_900', 'w_200').replace('h_600', 'h_150');
  const thumbnail500ImageBase = imageBase.replace('w_900', 'w_500').replace('h_600', 'h_300');
  const thumbnail300ImageBase = imageBase.replace('w_900', 'w_300').replace('h_600', 'h_200');

  // const featured_image_name = row.featured_image_name.replace("jpg", "webp");
  const featuredImageName = row.featured_image_name;

  const recipe = {};
  recipe.id = row.id;
  recipe.title = row.title;
  recipe.description = row.description;
  recipe.description_html = row.description_html;

  recipe.featured_image_name = featuredImageName;
  recipe.featured_image_url = featuredImageBase + featuredImageName;
  recipe.featured_image_url_mobile = thumbnail500ImageBase + featuredImageName;
  recipe.thumbnail500 = thumbnail500ImageBase + featuredImageName;
  recipe.thumbnail300 = thumbnail300ImageBase + featuredImageName;
  recipe.thumbnail = thumbnailImageBase + featuredImageName;
  recipe.thumbnail200 = thumbnail200ImageBase + featuredImageName;

  const secondaryImageName = row.secondary_image_name;
  const hasSecondaryImage = secondaryImageName !== null;
  recipe.has_seconday_image = hasSecondaryImage;
  recipe.secondary_image_name = secondaryImageName;
  if (hasSecondaryImage) {
    const secondaryImageBase = imageBase;
    const secondaryThumbnailImageBase = imageBase.replace('w_900', 'w_400');
    const secondaryThumbnail200ImageBase = imageBase.replace('w_900', 'w_200').replace('h_600', 'h_150');
    const secondaryThumbnail500ImageBase = imageBase.replace('w_900', 'w_500').replace('h_600', 'h_300');
    const secondaryThumbnail300ImageBase = imageBase.replace('w_900', 'w_300').replace('h_600', 'h_200');

    recipe.secondary_image_url = secondaryImageBase + secondaryImageName;
    recipe.secondary_image_url_mobile = secondaryThumbnail500ImageBase + secondaryImageName;
    recipe.secondary_thumbnail500 = secondaryThumbnail500ImageBase + secondaryImageName;
    recipe.secondary_thumbnail300 = secondaryThumbnail300ImageBase + secondaryImageName;
    recipe.secondary_thumbnail = secondaryThumbnailImageBase + secondaryImageName;
    recipe.secondary_thumbnail200 = secondaryThumbnail200ImageBase + secondaryImageName;
  }

  recipe.ingredients = row.ingredients;
  // remove empty new lines with filter
  recipe.ingredients_array = row.ingredients.split('\n').filter((item) => item && item.length > 0 && item.trim() !== '');

  recipe.has_extra_ingredients = row.extra_ingredients_title !== null && row.extra_ingredients_title.trim() !== '';
  if (recipe.has_extra_ingredients) {
    recipe.extra_ingredients_title = row.extra_ingredients_title;
    recipe.extra_ingredients = row.extra_ingredients;
    // remove empty new lines with filter
    recipe.extra_ingredients_array = row.extra_ingredients.split('\n').filter((item) => item && item.length > 0 && item.trim() !== '');
  }

  recipe.steps = row.steps;
  // remove empty new lines with filter
  recipe.steps_array = row.steps.split('\n').filter((item) => item && item.length > 0 && item.trim() !== '');
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

  const enFormat = 'YYYY-MM-DD';
  recipe.created_at = moment(row.created_at, enFormat);
  recipe.created_at = recipe.created_at.format(enFormat);
  recipe.created_at_es = `Publicada ${moment(row.created_at, enFormat).startOf('day').fromNow()}`;

  recipe.updated_at = moment(row.updated_at, enFormat);
  recipe.updated_at = recipe.updated_at.format(enFormat);

  const recipeWord = process.env.RESOPIA_WORD_RECIPE || 'receta';

  recipe.url = `${process.env.RESOPIA_BASE_URL}/${recipeWord}/${recipe.id}/${recipe.title_seo}`;
  recipe.url_edit = `${process.env.RESOPIA_BASE_URL}/admin/receta/editar/${recipe.id}/`;
  recipe.url_push = `${process.env.RESOPIA_BASE_URL}/admin/recipe/push/${recipe.id}/`;
  recipe.active = row.active;
  recipe.notes = row.notes;
  recipe.has_notes = recipe.notes && recipe.notes.trim() !== '';
  recipe.youtube_video_id = row.youtube_video_id;
  recipe.has_youtube_video = recipe.youtube_video_id !== null && recipe.youtube_video_id.trim() !== '';
  if (recipe.has_youtube_video) {
    recipe.youtube_video_embed_url = `https://www.youtube.com/embed/${row.youtube_video_id}`;
    recipe.youtube_video_watch_url = `https://www.youtube.com/watch?v=${row.youtube_video_id}`;
  }


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
  recipe.prep_time = row.prep_time || '20 minutos';
  recipe.cook_time = row.cook_time || '30 minutos';
  recipe.total_time = row.total_time || '50 minutos';
  recipe.cuisine = row.cuisine || 'Americana';
  recipe.yield = row.yield || '5 porciones';

  recipe.pinterest_pins = row.pinterest_pins;
  recipe.facebook_shares = row.facebook_shares;
  recipe.tweets = row.tweets;
  recipe.aggregate_rating = row.aggregate_rating;
  recipe.rating_count = row.rating_count;

  recipe.default_loading_image = process.env.RESOPIA_DEFAULT_LOADING_IMAGE;
  recipe.default_thumb_loading_image = process.env.RESOPIA_DEFAULT_THUMB_LOADING_IMAGE;

  recipe.tags_csv = row.tags_csv || 'easy';
  recipe.tags_names_csv = row.tags_csv ? row.tags_csv.split(',') : ['american', 'easy'];
  // recipe.images_names_csv = 'masa-tartas-saladas.png, recipe-default-2.jpg';
  recipe.images_names_csv = row.images_names_csv || process.env.RESOPIA_DEFAULT_LOADING_IMAGE;
  recipe.images_urls = [];
  if (recipe.images_names_csv && recipe.images_names_csv.length > 1) {
    recipe.images_urls = recipe.images_names_csv.split(',').map((image) => imageBase + image.trim());
  }

  return recipe;
}


async function findWithLimit(limit) {
  log.info(`findWithLimit, limit: ${limit}`);
  const query = 'SELECT * FROM recipes WHERE active=true ORDER BY created_at DESC LIMIT $1 ';
  const bindings = [limit];

  const result = await dbHelper.query(query, bindings, true);
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
  mostVisitedRecipes = [];
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
    spotlightRecipes = findWithLimit(50);
  }
  return spotlightRecipes;
}

async function findRecipesMostVisited() {
  if (mostVisitedRecipes.length === 0) {
    // mostVisitedRecipes = findWithLimit(5);
    mostVisitedRecipes = this.findRandom(5);
  }
  return mostVisitedRecipes;
}

async function findWithKeyword(tag) {
  log.info(`findWithKeyword: ${tag}`);
  // const query = `SELECT recipes.*
  // FROM recipes, tags, recipes_tags
  // WHERE tags.name_seo=$1
  // AND recipes.id = recipes_tags.recipe_id
  // AND tags.id = recipes_tags.tag_id
  // ORDER BY created_at DESC`;

  const query = `SELECT recipes.*
  FROM recipes 
  WHERE tags_csv like $1
  ORDER BY created_at DESC`;

  const bindings = [`%${tag.toLowerCase()}%`];
  const result = await dbHelper.query(query, bindings, true);
  const recipes = [];
  for (let i = 0; i < result.rows.length; i++) {
    recipes.push(convertRecipe(result.rows[i]));
  }
  return recipes;
}

/**
 *
 * @param {number} id
 * @param {boolean} ignoreActive true to find active true and false
 * @param {boolean} witchCache
 */
module.exports.findById = async function (id, ignoreActive, witchCache = true) {
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
  log.info(`findById, bindings: ${bindings}`);
  const result = await dbHelper.query(query, bindings, witchCache);
  if (result && result.rows && result.rows.length > 0) {
    const recipe = convertRecipe(result.rows[0]);
    recipe.tags_names_csv = recipe.tags_csv ? recipe.tags_csv.split(',') : ['american', 'easy'];
    recipe.tags_ids_csv = ''; // deprecated
    return recipe;
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
  const result = await dbHelper.query(query, bindings, true);
  const recipes = [];
  for (let i = 0; i < result.rows.length; i++) {
    recipes.push(convertRecipe(result.rows[i]));
  }
  return recipes;
}


module.exports.create = async function (recipe) {
  // if (!recipe.tags || recipe.tags.length === 0) {
  //   throw new Error('Error creating the recipe. Tags are empty');
  // }
  // validate tags values
  // for (let index = 0; index < recipe.tags.length; index++) {
  //   const tagId = recipe.tags[index];
  //   if (isNaN(tagId)) {
  //     throw new Error(`Error creting the recipe. The tag ${tagId} is not a number`);
  //   }
  // }

  // upper case only the first letter. The resto will be lower case
  // eslint-disable-next-line no-param-reassign
  recipe.title = recipe.title.charAt(0).toUpperCase() + recipe.title.toLowerCase().slice(1);
  log.info(`Creating recipe: ${recipe.title}`);

  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `INSERT INTO recipes(created_at, updated_at, title, title_seo, description, 
    ingredients, extra_ingredients_title, extra_ingredients, steps, active, 
    featured_image_name, secondary_image_name, facebook_shares, pinterest_pins,
    prep_time_seo, cook_time_seo,total_time_seo, prep_time,
    cook_time, total_time, cuisine, yield, notes, youtube_video_id, tweets, aggregate_rating,rating_count,
    images_names_csv, tags_csv, description_html)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
      $24,$25,$26,$27,$28,$29,$30) 
    RETURNING id`;
  const bindings = [
    today, today, recipe.title, recipe.title_seo, recipe.description,
    recipe.ingredients, recipe.extra_ingredients_title, recipe.extra_ingredients, recipe.steps, recipe.active,
    recipe.featured_image_name, recipe.secondary_image_name, recipe.facebook_shares, recipe.pinterest_pins,
    recipe.prep_time_seo, recipe.cook_time_seo, recipe.total_time_seo, recipe.prep_time,
    recipe.cook_time, recipe.total_time, recipe.cuisine, recipe.yield, recipe.notes,
    recipe.youtube_video_id, recipe.tweets, recipe.aggregate_rating, recipe.rating_count,
    recipe.images_names_csv, recipe.tags_csv, recipe.description_html,
  ];

  const result = await dbHelper.query(query, bindings, false);

  const recipeId = result.rows[0].id;
  log.info(`Recipe created: ${recipeId}`);

  // // create relationship with tags
  // const promises = [];
  // for (let index = 0; index < recipe.tags.length; index++) {
  //   const tagId = recipe.tags[index];
  //   if (isNaN(tagId)) {
  //     throw new Error(`the tag ${tagId} is not a number`);
  //   }
  //   promises.push(daoTags.createRecipeRelationship(recipeId, tagId));
  // }

  // await Promise.all(promises);

  await this.resetCache();
  return recipeId;
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
     prep_time=$14, cook_time=$15, total_time=$16, cuisine=$17, yield=$18,
     facebook_shares=$19,pinterest_pins=$20,tweets=$21,youtube_video_id=$22,notes=$23, 
     extra_ingredients=$24,aggregate_rating=$25,rating_count=$26,images_names_csv=$27,
     tags_csv=$28, description_html=$29
       WHERE id=$30`;
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
    recipe.facebook_shares,
    recipe.pinterest_pins,
    recipe.tweets,
    recipe.youtube_video_id,
    recipe.notes,
    recipe.extra_ingredients,
    recipe.aggregate_rating,
    recipe.rating_count,
    recipe.images_names_csv,
    recipe.tags_csv,
    recipe.description_html,
    recipe.id,
  ];
  // log.info(sqlFormatter.format(query));
  // log.info(bindings);
  const result = await dbHelper.query(query, bindings, false);
  // log.info(result);
  await this.resetCache();
  return result;
};

module.exports.buildSearchIndex = async function () {
  // console.time('buildIndexTook');
  log.info('building index...');

  const options = {
    charset: 'latin:extra',
    preset: 'score',
    tokenize: 'full',
    cache: false,
  };
  searchIndex = new Index(options);

  const all = await this.findAll();

  const size = all.length;
  for (let i = 0; i < size; i++) {
    // we might concatenate the fields we want for our content
    const content = `${all[i].title} ${all[i].tags_csv}`;
    const key = Number(all[i].id);
    searchIndex.add(key, content);
  }
  log.info(`index built, length: ${all.length}`);
  // console.timeEnd('buildIndexTook');
};

/**
 * @param {string} text to search
 */
module.exports.findRelated = async function (text) {
  if (typeof text !== 'string') throw new Error('text to search is not a string');
  const textToSearch = text || 'easy';
  log.info(`look for related results with: ${textToSearch}`);
  if (!searchIndex) {
    await this.buildSearchIndex();
  }

  const limit = 16;
  // When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
  const resultIds = await searchIndex.search(textToSearch, limit, { suggest: true });


  log.info(`related results: ${resultIds.length}`);
  let results;
  if (resultIds.length === 0) {
    results = await this.findRecipesSpotlight();
  } else {
    results = await this.findByIds(resultIds);
  }

  if (results.length < 5) {
    log.info('not enough related recipes, result will filled up with more recipes');
    const moreRecipes = await findWithLimit(20);
    results = results.concat(moreRecipes);
  }

  return results;
};

module.exports.deleteDummyData = async function () {
  const query = "DELETE FROM recipes WHERE title_seo = 'from-test'";
  const result = await dbHelper.query(query, [], false);
  log.info(result);
};

// /**
//  * Related criteria is a full-text search over recipe's tags names
//  * @param {object} recipe
//  * @return {[]} array with related recipes. If not related recipes it filess up with latest recipes
//  */
// module.exports.findRelatedRecipes = async function (recipe) {
//   if (this.searchIndex.length === 0) {
//     await this.buildSearchIndex();
//   }
//   const phrase = recipe.tags_names_csv;
//   log.info(`Searching related recipes to recipe ${recipe.id} with the tags: ${recipe.tags_names_csv}`);
//   // search using flexsearch. It will return a list of IDs we used as keys during indexing
//   const resultIds = await this.searchIndex.search({
//     query: phrase,
//     limit: 6,
//   });
//   let result = [];
//   if (resultIds.length > 0) {
//     result = await this.findByIds(resultIds);
//     log.info(`related recipes found for recipe ${recipe.id}: ${result.length}`);
//   }

//   if (result.length < 5) {
//     log.info('not enought related recipes, result will filled up with more recipes');
//     const moreRecipes = await findWithLimit(5);
//     result = result.concat(moreRecipes);
//   }
//   return result;
// };

module.exports.findRandom = async function (limit) {
  // this collection is cached, that's we take 20 records and then shuffle
  const all = await findWithLimit(20);
  const shuff = utils.shuffle(all);
  return shuff.slice(0, limit - 1);
};

module.exports.findByIds = findByIds;
module.exports.findWithKeyword = findWithKeyword;
module.exports.findRecipesSpotlight = findRecipesSpotlight;
module.exports.findRecipesMostVisited = findRecipesMostVisited;
module.exports.findWithLimit = findWithLimit;
