const chai = require('chai');
const chaiHttp = require('chai-http');
const randomstring = require('randomstring');
const app = require('../app');

const { Logger } = require('../utils/Logger');

const log = new Logger('app');

const { assert } = chai;
const { expect } = chai;

const daoRecipes = require('../daos/dao_recipes');


// Configure chai
chai.use(chaiHttp);
chai.should();

function assertNotError(err, res) {
  if (err) {
    log.error(err.message);
    assert.fail(err);
  }
}

describe('Test All', function () {
  this.timeout(10 * 1000);

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('Test at Dao level', () => {
    it('should create a user', async () => {
      const random = `form_test_${randomstring.generate(6)}`;
      const user = {
        email: `${random}@test.com`,
        is_admin: false,
        username: random,
        first_name: random,
        last_name: random,
      };
      const id = await daoUsers.create(user);
      assert.isNotNull(id);
      assert.isAtLeast(id, 1);

      const userCreated = await daoUsers.findLatestCreated();
      assert.isNotNull(userCreated);
      assert.equal(id, userCreated.id);
      assert.equal(random, userCreated.first_name);
    });
    it('should create a recipe', async () => {
      const title = `from test create ${randomstring.generate(5)}`;
      const userId = 1;
      const recipe = {
        title,
        description:
                    'Lorem ipsum dolor sit amet consectetur adipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa, faucibus nascetur ullamcorper aptent augue malesuada mus tempus velit. ',
        ingredients:
                    'Lorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet',
        steps:
                    'adipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa',
        title_for_url: 'easy-chewy-flourless-peanut-butter-cookies-',
        featured_image_name: 'peanut-cookies.jpg',
        keywords: 'easy,chewy,flourless',
        active: true,
        user_id: userId,
      };
      const recipeId = await daoRecipes.create(recipe);
      assert.isNotNull(recipeId);
      const recipeCreated = await daoRecipes.findById(recipeId);
      assert.equal(title, recipeCreated.title);
    });

    it('should update a recipe', async () => {
      const id = 13;
      const recipe = await daoRecipes.findById(id);
      if (!recipe) {
        assert.fail(`Recipe with id ${id} does not exist`);
      }
      const newTitle = `from test ${randomstring.generate(5)}`;
      recipe.title = newTitle;
      await daoRecipes.update(recipe);

      const recipeUpdated = await daoRecipes.findById(id);
      assert.equal(newTitle, recipeUpdated.title);
    });

    it('should get related recipes', async () => {
      const keyword = 'easy';
      const results = await daoRecipes.findRelated(keyword);

      assert.isNotNull(results);
      assert.isAtLeast(results.length, 1);
    });
  });

  describe('Test at web level', () => {
    it('should seed', (done) => {
      chai.request(app)
        .get('/seed')
        .query({
          adminSecret: process.env.R21_ADMIN_SECRET,
        })
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should get error seeding with missing admin secret', (done) => {
      chai.request(app)
        .get('/seed')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(400);
          done();
        });
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

    it('should get home page with page number', (done) => {
      chai.request(app)
        .get('/?page=1')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should search', (done) => {
      chai.request(app)
        .get('/search?q=chocolate')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should display recipes by keyword', (done) => {
      chai.request(app)
        .get('/recipes/keyword/chocolate')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should display a recipe', (done) => {
      chai.request(app)
        .get('/recipe/24/something')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should display new recipe form', (done) => {
      chai.request(app)
        .get('/recipe/new')
        .end((err, res) => {
          assertNotError(err, res);
          // TODO set http auth headers
          // TODO expect(res).to.have.status(200);
          done();
        });
    });

    it('should display edit recipe form', (done) => {
      chai.request(app)
        .get('/recipe/edit?id=24')
        .end((err, res) => {
          assertNotError(err, res);
          // TODO set http auth headers
          // TODO expect(res).to.have.status(200);
          done();
        });
    });

    it('should display sitemap.xml', (done) => {
      chai.request(app)
        .get('/sitemap.xml')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          expect(res).to.have.headers;
          expect(res).to.be.all; // TODO validate xml
          done();
        });
    });

    it('should display robots.txt', (done) => {
      chai.request(app)
        .get('/robots.txt')
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          expect(res).to.have.headers;
          expect(res).to.be.all; // TODO validate txt content
          done();
        });
    });

    it('should reset cache', (done) => {
      chai.request(app)
        .get('/reset-cache')
        .query({
          adminSecret: process.env.R21_ADMIN_SECRET,
        })
        .end((err, res) => {
          assertNotError(err, res);
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
