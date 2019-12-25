const chai = require('chai');
const chaiHttp = require('chai-http');
const randomstring = require('randomstring');

const { Logger } = require('../utils/Logger');

const log = new Logger('app');

const { assert } = chai;
const { expect } = chai;

const daoRecipes = require('../daos/dao_recipes');


// Configure chai
chai.use(chaiHttp);
chai.should();

describe('Test at Dao level', function () {
  this.timeout(5 * 1000);

  it('should create a recipe', async () => {
    const title = `from test create ${randomstring.generate(5)}`;
    const recipe = {
      title,
      title_seo: 'from-test',
      description:
        'Lorem ipsum dolor sit amet consectetur adipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa, faucibus nascetur ullamcorper aptent augue malesuada mus tempus velit. ',
      ingredients:
        'Lorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet',
      steps:
        'adipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa',
      featured_image_name: 'cookies-test.jpg',
      active: true,
      prep_time_seo: 'PT20M',
      cook_time_seo: 'PT30M',
      total_time_seo: 'PT50M',
      prep_time: '20 minutes',
      cook_time: '30 minutes',
      total_time: '50 minutes',
      cuisine: 'American',
      yield: '5 servings',
      facebook_likes: 1,
      pinterest_pins: 1,
    };
    const recipeId = await daoRecipes.create(recipe);
    assert.isNotNull(recipeId);
    assert.isAtLeast(recipeId, 1);
    const recipeCreated = await daoRecipes.findById(recipeId);
    assert.equal(title, recipeCreated.title);
  });

  it('should update a recipe', async () => {
    const id = 4;
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
