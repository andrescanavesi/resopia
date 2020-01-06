const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const { Logger } = require('../utils/Logger');
const utils = require('../utils/utils');

const log = new Logger('rc-migration');

let poolRcProd = null;
let poolNewRcStaging = null;

loadPoolRcProd();
loadPoolNewRcStaging();

function loadPoolRcProd() {
  if (poolRcProd === null) {
    log.info('loading prod pool');
    const dbConfig = parseDbUrl(process.env.DATABASE_URL_RC_PROD);

    poolRcProd = new Pool({
      user: dbConfig.user,
      host: dbConfig.host,
      database: dbConfig.database,
      password: dbConfig.password,
      port: dbConfig.port,
      ssl: true,
    });
  }
}

function loadPoolNewRcStaging() {
  if (poolNewRcStaging === null) {
    log.info('loading new staging pool');
    const dbConfig = parseDbUrl(process.env.DATABASE_URL_NEW_RC_STAGING);

    poolNewRcStaging = new Pool({
      user: dbConfig.user,
      host: dbConfig.host,
      database: dbConfig.database,
      password: dbConfig.password,
      port: dbConfig.port,
      ssl: true,
    });
  }
}


async function findProdTags() {
  const query = 'SELECT * FROM recipes WHERE active=TRUE';
  const result = await poolRcProd.query(query, []);
  log.info(`records: ${JSON.stringify(result.rows.length)}`);
  const tags = [];
  let tagsString = '';
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows[i];
    const keywords = row.keywords.split(',');
    for (const key of keywords) {
      const tag = key.trim().toLowerCase();
      if (!tags.includes(tag)) {
        tags.push(tag);
        tagsString += `"${tag}",`;
      }
    }
  }
  log.info(tagsString);
  return tags;
}

async function createTags() {
  const tags = ['mermelada', 'sin gluten', 'vainillas', 'celiacos', 'sin tacc', 'arroz', 'facil',
    'budin', 'chocolate', 'tallarines', 'pan', 'buñuelos', 'torta', 'medialunas', 'galletitas',
    'ñoquis', 'afajores', 'dulces', 'arrolladitos', 'bizcochuelo', 'marmolado', 'naranja',
    'sencilla', 'postre', 'scones', 'vainilla', 'sin tacc', 'edulcorante', 'faina',
    'licuadora', 'focaccia', 'licuada', 'frola', 'esponjosa', 'hojaldre', 'brownie',
    'fritos', 'salados', 'vegano', 'flan', 'light', 'donas', 'pizza', 'maizena', 'sarten',
    'tartas', 'tarta', 'churros', 'pate', 'microondas', 'pasta', 'panqueques', 'cookies',
    'arabe', 'pancitos', 'pascualina', 'video', 'video recetas'];
  const promises = [];
  for (const tag of tags) {
    const tagId = await findTagIdByName(tag);
    if (tagId === null) {
      const query = 'INSERT INTO tags(name, image_name, quantity_recipes, name_seo, is_featured) VALUES($1,$2,$3,$4,$5)  RETURNING id';
      log.info(`Creating tag: ${tag}`);
      log.info(query);
      const nameSeo = utils.dashString(tag);
      const bindings = [tag, `${nameSeo}.jpg`, 0, nameSeo, false];
      promises.push(poolNewRcStaging.query(query, bindings));
    }
  }
  await Promise.all(promises);
}


async function findTagIdByName(name) {
  log.info(`findTagIdByName: ${name}`);
  const query = 'SELECT * FROM tags WHERE name=$1';
  const bindings = [name];
  const result = await poolNewRcStaging.query(query, bindings);
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  return null;
}

async function migrateRecipes() {
  const query = 'SELECT * FROM recipes WHERE active=TRUE LIMIT 2';
  const result = await poolRcProd.query(query, []);
  log.info(`recipes to migrate: ${JSON.stringify(result.rows.length)}`);
  for (let i = 0; i < result.rows.length; i++) {
    const oldRecipe = result.rows[i];
    const newRecipeId = await findRecipeById(oldRecipe.id);
    if (newRecipeId === null) {
      const keywords = oldRecipe.keywords.split(',');
      const newRecipe = convertRecipe(oldRecipe);
      for (const key of keywords) {
        const tag = key.trim().toLowerCase();
        const tagId = await findTagIdByName(tag);
        if (tagId !== null) {
          newRecipe.tags.push(tagId);
        }
      }
      if (oldRecipe.aptoceliacos) {
        const tagId = await findTagIdByName('celiacos');
        if (!newRecipe.tags.includes(tagId)) {
          newRecipe.tags.push(tagId);
        }
      }
      // log.info(newRecipe);
      await createRecipe(newRecipe);
    }
  }
}

function convertRecipe(oldRecipe) {
  const newRecipe = { tags: [] };
  newRecipe.id = parseInt(oldRecipe.id);
  newRecipe.created_at = oldRecipe.createdat;
  newRecipe.updated_at = oldRecipe.updatedat;
  newRecipe.description = oldRecipe.description;
  newRecipe.title = oldRecipe.title;
  newRecipe.title_seo = oldRecipe.titleforurl;
  newRecipe.ingredients = oldRecipe.ingredients;
  newRecipe.steps = oldRecipe.steps;
  newRecipe.active = true;
  newRecipe.featured_image_name = oldRecipe.featuredimagename;
  newRecipe.secondary_image_name = 'recipe-default-2.jpg';
  newRecipe.facebook_shares = 0;
  newRecipe.pinterest_pins = 0;
  newRecipe.tweets = 0;
  newRecipe.prep_time_seo = 'PT20M';
  newRecipe.cook_time_seo = 'PT30M';
  newRecipe.total_time_seo = oldRecipe.total_time_meta;
  newRecipe.prep_time = '20 minutos';
  newRecipe.cook_time = '30 minutos';
  newRecipe.total_time = oldRecipe.total_time_text;
  newRecipe.cuisine = 'Americana';
  newRecipe.yield = '5 porciones';
  newRecipe.notes = null;
  newRecipe.youtube_video_id = null;
  return newRecipe;
}

async function createRecipe(recipe) {
  log.info('Creating recipe');
  if (recipe.tags === null || recipe.tags.length === 0) {
    throw new Error('Error creating the recipe. Tags are empty');
  }
  // validate tags values
  for (let index = 0; index < recipe.tags.length; index++) {
    const tagId = recipe.tags[index];
    if (isNaN(tagId)) {
      throw new Error(`Error creting the recipe. The tag ${tagId} is not a number`);
    }
  }
  // const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `INSERT INTO recipes(created_at, updated_at, title, title_seo, description, 
      ingredients, extra_ingredients_title, extra_ingredients, steps, active, 
      featured_image_name, secondary_image_name, facebook_shares, pinterest_pins,
      prep_time_seo, cook_time_seo,total_time_seo, prep_time,
      cook_time, total_time, cuisine, yield, notes, youtube_video_id, tweets,id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26) 
      RETURNING id`;
  const bindings = [
    recipe.created_at, recipe.updated_at, recipe.title, recipe.title_seo, recipe.description,
    recipe.ingredients, recipe.extra_ingredients_title, recipe.extra_ingredients, recipe.steps, recipe.active,
    recipe.featured_image_name, recipe.secondary_image_name, recipe.facebook_shares, recipe.pinterest_pins,
    recipe.prep_time_seo, recipe.cook_time_seo, recipe.total_time_seo, recipe.prep_time,
    recipe.cook_time, recipe.total_time, recipe.cuisine, recipe.yield, recipe.notes,
    recipe.youtube_video_id, recipe.tweets, recipe.id,
  ];

  const result = await poolNewRcStaging.query(query, bindings);

  const recipeId = result.rows[0].id;
  log.info(`Recipe created: ${recipeId}`);

  // create relationship with tags
  for (let index = 0; index < recipe.tags.length; index++) {
    const tagId = recipe.tags[index];
    if (isNaN(tagId)) {
      throw new Error(`the tag ${tagId} is not a number`);
    }
    await createRecipeRelationship(recipeId, tagId);
  }

  return recipeId;
}

async function createRecipeRelationship(recipeId, tagId) {
  log.info(`createRecipeRelationship, recipe: ${recipeId} tag: ${tagId}`);
  const query = 'INSERT INTO recipes_tags(recipe_id, tag_id) VALUES($1,$2) RETURNING id';
  const bindings = [recipeId, tagId];
  const result = await poolNewRcStaging.query(query, bindings, false);
  const insertedId = result.rows[0].id;
  await updateQuantityRecipes(tagId);
  return insertedId;
}

function updateQuantityRecipes(tagId) {
  log.info(`updateQuantityRecipes, tag: ${tagId}`);
  const query = `UPDATE tags SET quantity_recipes=t.count
    FROM (SELECT count(*) AS count FROM recipes_tags where tag_id=$1) t
    WHERE id=$1`;
  const bindings = [tagId];
  return poolNewRcStaging.query(query, bindings);
}

async function findRecipeById(id) {
  log.info(`findRecipeById: ${id}`);
  const query = 'SELECT * FROM recipes WHERE id=$1';
  const bindings = [id];
  const result = await poolNewRcStaging.query(query, bindings);
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  return null;
}


// findProdTags().then((result) => {
//   // log.info(`Tags: ${result}`);
// });

// createTags().then((result) => {
//   log.info('tags created');
// });

migrateRecipes().then((result) => {
  log.info('recipes migrated');
});
