const parseDbUrl = require('parse-database-url');

let dbConfig = parseDbUrl(process.env.DATABASE_URL);
if (process.env.NODE_ENV === 'development') {
  dbConfig = parseDbUrl(process.env.RESOPIA_DATABASE_URL);
}
const { Pool } = require('pg');

const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port,
  ssl: true,
});

module.exports.execute = pool;
