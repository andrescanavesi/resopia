const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const { Logger } = require('../utils/Logger');

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


async function getProdTags() {
    const query = 'SELECT * FROM recipes WHERE active=TRUE';
    const result = await poolRcProd.query(query, []);
    log.info(`records: ${JSON.stringify(result.rows.length)}`);
    const tags = [];
    for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows[i];
        const keywords = row.keywords.split(',');
        for (const key of keywords) {
            const tag = key.trim().toLowerCase();
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        }
    }
    return tags;
}

getProdTags().then((result) => {
    log.info(`Tags: ${result}`);
});
