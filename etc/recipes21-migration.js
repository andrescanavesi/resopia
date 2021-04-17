const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const { Logger } = require('../utils/Logger');
const daoRecipes = require('../daos/dao_recipes');

const log = new Logger('r21-migration');

const dbConfigFrom = parseDbUrl(process.env.DATABASE_URL_R21_PROD);

const poolDbFrom = new Pool({
  user: dbConfigFrom.user,
  host: dbConfigFrom.host,
  database: dbConfigFrom.database,
  password: dbConfigFrom.password,
  port: dbConfigFrom.port,
  ssl: true,
});


async function importRecipes() {
  const query = 'SELECT * FROM recipes WHERE active=TRUE LIMIT 2000';
  const result = await poolDbFrom.query(query, []);
  log.info(`recipes to migrate: ${JSON.stringify(result.rows.length)}`);
  const promises = [];
  for (let i = 0; i < result.rows.length; i++) {
    const recipeOld = result.rows[i];
    const recipeNew = {
      title: recipeOld.title,
      title_seo: recipeOld.title_for_url,
      description: recipeOld.description,
      ingredients: recipeOld.ingredients,
      steps: recipeOld.steps,
      active: true,
      featured_image_name: recipeOld.featured_image_name,
      secondary_image_name: 'default.jpg',
      facebook_shares: 0,
      pinterest_pins: 0,
      tweets: 0,
      prep_time_seo: 'PT10M',
      cook_time_seo: 'PT20M',
      total_time_seo: 'PT30M',
      prep_time: '00:10',
      cook_time: '00:20',
      total_time: '00:30',
      cuisine: 'American',
      yield: '5 servings',
      aggregate_rating: 4.3,
      rating_count: 64,
    };

    recipeNew.tags = [1, 2, 3];
    log.info(JSON.stringify(recipeNew, null, 2));
    promises.push(daoRecipes.create(recipeNew));
  }
  await Promise.all(promises);
  return result.rows.length;
}

importRecipes().then((result) => {
  console.info(`END: imported recipes: ${result}`);
}).catch((error) => {
  console.error(error);
});
