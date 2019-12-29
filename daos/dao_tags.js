const dbHelper = require('../utils/db_helper');
const { Logger } = require('../utils/Logger');

const log = new Logger('dao_tags');

function convertTag(row) {
  const tag = {
    id: row.id,
    name: row.name,
    image_name: row.image_name,
    quantity_recipes: row.quantity_recipes,
    name_seo: row.name_seo,
    is_featured: row.is_featured,
  };
  return tag;
}

/**
 * @returns {[]} all tags
 */
module.exports.findAll = async function (withCache) {
  log.info('findAll');
  const query = 'SELECT * FROM tags ORDER BY name ASC';
  const bindings = [];
  const result = await dbHelper.query(query, bindings, withCache);
  log.info(`tags: ${result.rows.length}`);
  const tags = [];
  for (let i = 0; i < result.rows.length; i++) {
    tags.push(convertTag(result.rows[i]));
  }
  return tags;
};

module.exports.findByRecipe = async function (recipeId) {
  log.info('findByRecipe');
  const query = `SELECT tags.* FROM tags, recipes_tags 
    WHERE tags.id = recipes_tags.tag_id
    AND recipes_tags.recipe_id = $1 
     ORDER BY tags.name ASC`;
  const bindings = [recipeId];
  const result = await dbHelper.query(query, bindings, true);
  log.info(`tags by recipe: ${result.rows.length}`);
  const tags = [];
  for (let i = 0; i < result.rows.length; i++) {
    tags.push(convertTag(result.rows[i]));
  }
  return tags;
};

/**
 *
 * @param {integer} tagId
 * @return the query result
 */
function updateQuantityRecipes(tagId) {
  const query = `UPDATE tags SET quantity_recipes=t.count
  FROM (SELECT count(*) AS count FROM recipes_tags where tag_id=$1) t
  WHERE id=$1`;
  const bindings = [tagId];
  return dbHelper.query(query, bindings, false);
}

/**
 * @param {integer} recipeId
 * @param {integer} tagId
 * @return the query result
 */
module.exports.createRecipeRelationship = async function (recipeId, tagId) {
  const query = 'INSERT INTO recipes_tags(recipe_id, tag_id) VALUES($1,$2) RETURNING id';
  const bindings = [recipeId, tagId];
  const result = await dbHelper.query(query, bindings, false);
  const insertedId = result.rows[0].id;
  await updateQuantityRecipes(tagId);
  return insertedId;
};
