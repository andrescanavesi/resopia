const chai = require('chai');
const controllerSearchTerms = require('../controllers/controller_search_terms');
const daoSearchTerms = require('../daos/dao_search_terms');


const { Logger } = require('../utils/Logger');

const logger = new Logger('test_controller_search_terms');

const { assert } = chai;

describe('Test controller_search_terms', function () {
  this.timeout(10 * 1000);

  const prefix = 'from-test';

  before(() => {
    // TODO
  });

  after(async () => {
    await daoSearchTerms.deleteDummyData(prefix);
  });

  it('should process a csv content', async () => {
    const csv = `Consulta,Clics,Impresiones,CTR,Posición
    ${prefix} scones de queso,4,23,17.39%,7.96
    ${prefix} tarta de manzana,3,19,15.79%,6.42
    ${prefix} faina licuada,2,18,11.11%,7.17`;

    await controllerSearchTerms.processCsv(csv);

    const searchTerm = await daoSearchTerms.findByTerm(`${prefix} scones de queso`, false, false, false);
    assert.isNotNull(searchTerm);
    assert.equal(searchTerm.term_seo, 'fromtest-scones-de-queso');
  });
});
