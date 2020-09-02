const chai = require('chai');
const chaiHttp = require('chai-http');
const randomstring = require('randomstring');
const app = require('../app');

const { Logger } = require('../utils/Logger');

const log = new Logger('app');

const { assert } = chai;
const { expect } = chai;


// Configure chai
chai.use(chaiHttp);
chai.should();

function assertNotError(err, res) {
  if (err) {
    log.error(err.message);
    assert.fail(err);
  }
}

function assertHtmlResponse(res) {
  assert.equal(res.status, 200);
  assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
  assert.isAtLeast(res.text.length, 1); // the html content
}

describe('Test Web', function () {
  this.timeout(10 * 1000);

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should get home page', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should search', (done) => {
    chai.request(app)
      .get('/buscar?q=chocolate')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should display recipes by tag', (done) => {
    chai.request(app)
      .get('/recetas/chocolate')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should display a recipe', (done) => {
    chai.request(app)
      .get('/receta/285/from-test')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });

  // it('should display new recipe form', (done) => {
  //   chai.request(app)
  //     .get('/recipe/new')
  //     .end((err, res) => {
  //       assertNotError(err, res);
  //       // TODO set http auth headers
  //       // TODO expect(res).to.have.status(200);
  //       done();
  //     });
  // });

  // it('should display edit recipe form', (done) => {
  //   chai.request(app)
  //     .get('/recipe/edit?id=24')
  //     .end((err, res) => {
  //       assertNotError(err, res);
  //       // TODO set http auth headers
  //       // TODO expect(res).to.have.status(200);
  //       done();
  //     });
  // });

  it('should display sitemap.xml', (done) => {
    chai.request(app)
      .get('/sitemap.xml')
      .end((err, res) => {
        assertNotError(err, res);
        assert.equal(res.status, 200);
        // expect(res).to.have.status(200);
        // expect(res).to.have.headers;
        // expect(res).to.be.all; // TODO validate xml
        done();
      });
  });

  it('should display robots.txt', (done) => {
    chai.request(app)
      .get('/robots.txt')
      .end((err, res) => {
        assertNotError(err, res);
        assert.equal(res.status, 200);
        done();
      });
  });

  it('should display search term lists', (done) => {
    chai.request(app)
      .get('/all/search')
      .end((err, res) => {
        assertNotError(err, res);
        assertHtmlResponse(res);
        done();
      });
  });

  it('should display a specific search term', (done) => {
    chai.request(app)
      .get('/l/tarta-de-manzana')
      .end((err, res) => {
        assertNotError(err, res);
        assertHtmlResponse(res);
        done();
      });
  });
});
