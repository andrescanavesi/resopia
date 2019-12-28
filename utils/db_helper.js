const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const NodeCache = require('node-cache');

const { Logger } = require('./Logger');

const log = new Logger('db_helper');
const queryCache = new NodeCache();

const dbConfig = parseDbUrl(process.env.DATABASE_URL);

const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port,
  ssl: true,
});

/**
 *
 * @param {stirng} theQuery
 * @param {[]]} bindings
 * @param {boolean} withCache true to cache the result
 * @return {Promise<*>}
 */
async function query(theQuery, bindings, withCache) {
  if (withCache) {
    log.info(`executing query with cache ${theQuery}`);
    const key = theQuery + JSON.stringify(bindings);
    const value = queryCache.get(key);
    if (value === undefined) {
      try {
        const queryResult = await pool.query(theQuery, bindings);
        queryCache.set(key, queryResult);
        return queryResult;
      } catch (error) {
        throw new Error(`Error executing query with cache ${query} error: ${error}`);
      }
    } else {
      log.info(`returning query result from cache ${theQuery}`);
      log.info(queryCache.getStats());
      return value;
    }
  } else {
    try {
      log.info(`executing query without cache ${theQuery}`);
      const result = await pool.query(theQuery, bindings);

      // delete all the cache content if we are inserting or updating data
      const auxQuery = theQuery.trim().toLowerCase();
      if (auxQuery.startsWith('insert') || auxQuery.startsWith('update')) {
        queryCache.flushAll();
        log.info(`the cache was flushed because of the query ${theQuery}`);
      }
      return result;
    } catch (error) {
      throw new Error(`Error executing query without cache  ${query} error: ${error}`);
    }
  }
}

module.exports.execute = pool;
module.exports.query = query;
