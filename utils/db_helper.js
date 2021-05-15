// const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const NodeCache = require('node-cache');

const { Logger } = require('./Logger');

const log = new Logger('db_helper');
const queryCache = new NodeCache();

// let dbConfig;
let rejectUnauthorized = false;
if (process.env.NODE_ENV === 'development') {
  rejectUnauthorized = false;
}

// if (process.env.NODE_ENV === 'development') {
//   dbConfig = parseDbUrl(process.env.RESOPIA_DATABASE_URL);
//    rejectUnauthorized = false;
// } else {
//   dbConfig = parseDbUrl(process.env.DATABASE_URL);
// }
//
//
// const pool = new Pool({
//   user: dbConfig.user,
//   host: dbConfig.host,
//   database: dbConfig.database,
//   password: dbConfig.password,
//   port: dbConfig.port,
//   ssl: {
//     rejectUnauthorized,
//   },
// });

// more options: https://node-postgres.com/api/client
const timeout = process.env.DB_TIMEOUT || 1000 * 10;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  statement_timeout: timeout,
  query_timeout: timeout,
  connectionTimeoutMillis: timeout,
  ssl: {
    rejectUnauthorized,
  },
});

/**
 *
 * @param {string} theQuery
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
        log.info('no cache for this query, will go to the DB');
        const queryResult = await pool.query(theQuery, bindings);
        queryCache.set(key, queryResult);
        return queryResult;
      } catch (error) {
        throw new Error(`Error executing query with cache ${theQuery} error: ${error}`);
      }
    } else {
      log.info(`returning query result from cache ${theQuery}`);
      // log.info(queryCache.getStats());
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
        queryCache.flushStats();
        log.info(`the cache was flushed because of the query ${theQuery}`);
      }
      return result;
    } catch (error) {
      throw new Error(`Error executing query without cache  ${theQuery} error: ${error}`);
    }
  }
}

module.exports.execute = pool;
module.exports.query = query;
