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

describe('Test at Dao level', () => {
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
