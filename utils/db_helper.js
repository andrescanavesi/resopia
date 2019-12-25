const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const { Logger } = require('./Logger');

const log = new Logger('db_helper');

const dbConfig = parseDbUrl(process.env.DATABASE_URL);

const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port,
  ssl: true,
});

function query(theQuery, bindings) {
  try {
    log.info(`executing query ${theQuery}`);
    return pool.query(theQuery, bindings);
  } catch (error) {
    throw new Error(`Error executing query ${query} error: ${error}`);
  }
}

module.exports.execute = pool;
module.exports.query = query;
