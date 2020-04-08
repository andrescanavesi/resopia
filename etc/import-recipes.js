/**
 * takes recipes from one given DB and imports data to local DB configured
 */

const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const { Logger } = require('../utils/Logger');
const daoRecipes = require('../daos/dao_recipes');

const log = new Logger('rc-migration');

log.info('loading db from pool');
const dbConfigFrom = parseDbUrl(process.env.DATABASE_URL_NEW_RC_PROD);

const poolDbFrom = new Pool({
  user: dbConfigFrom.user,
  host: dbConfigFrom.host,
  database: dbConfigFrom.database,
  password: dbConfigFrom.password,
  port: dbConfigFrom.port,
  ssl: true,
});

async function importRecipes() {
  const query = 'SELECT * FROM recipes WHERE active=TRUE LIMIT 30';
  const result = await poolDbFrom.query(query, []);
  log.info(`recipes to migrate: ${JSON.stringify(result.rows.length)}`);
  const promises = [];
  for (let i = 0; i < result.rows.length; i++) {
    const recipe = result.rows[i];
    recipe.tags = [1, 2, 5];
    log.info(JSON.stringify(recipe));
    promises.push(daoRecipes.create(recipe));
  }
  await Promise.all(promises);
  return result.rows.length;
}

importRecipes().then((result) => {
  console.info(`END: imported recipes: ${result}`);
}).catch((error) => {
  console.error(error);
});
