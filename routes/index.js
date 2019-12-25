const express = require('express');
const daoRecipies = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');
const utils = require('../utils/utils');
const { Logger } = require('../utils/Logger');

const router = express.Router();
const log = new Logger('route_index');

router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = false;

    const recipes = await daoRecipies.findAll();

    if (!recipes) {
      throw Error('No recipes found');
    }

    responseJson.recipes = recipes;
    responseJson.isHomePage = true;
    responseJson.searchText = '';
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});

/**
 * Renders the detail of a given recipe by id
 */
router.get('/:id/:titleforurl', async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    log.info(`View recipe: ${req.params.id}`);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = true;

    // titleforurl path param is for SEO purposes. It is ignored by the code
    const recipe = await daoRecipies.findById(recipeId);
    const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
    const footerRecipes = await daoRecipies.findAll();
    recipe.im_owner = utils.imRecipeOwner(req, recipe);
    // recipe.allow_edition = utils.allowEdition(req, recipe);
    recipe.allow_edition = responseJson.isUserAuthenticated;
    responseJson.title = recipe.title;
    responseJson.recipe = recipe;
    responseJson.createdAt = recipe.created_at;
    responseJson.updatedAt = recipe.updated_at;
    responseJson.linkToThisPage = recipe.url;
    responseJson.description = `${recipe.description} | resopia.com`;
    responseJson.metaImage = recipe.featured_image;
    responseJson.keywords = recipe.keywords;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.isHomePage = false;
    responseJson.isRecipePage = true;
    responseJson.footerRecipes = footerRecipes;

    // structured data for SEO
    responseJson.pageType = 'Recipe';
    responseJson.pageName = recipe.title;
    responseJson.pageImage = recipe.featured_image_url_mobile;
    responseJson.pageDatePublished = recipe.created_at;
    responseJson.pageDateModified = recipe.updated_at;
    responseJson.pageDescription = recipe.description;
    responseJson.pageKeywords = recipe.keywords;
    responseJson.pageRecipeIngredients = JSON.stringify(recipe.ingredients);
    const instructions = [];
    for (let i = 0; i < recipe.steps.length; i++) {
      const step = { '@type': 'HowToStep', text: recipe.steps[i] };
      instructions.push(step);
    }

    responseJson.pageRecipeInstructions = JSON.stringify(instructions);

    responseJson.pageRecipeCategory = recipe.category_name;
    responseJson.pageRecipePrepTime = recipe.prep_time_seo;
    responseJson.pageRecipeCookTime = recipe.cook_time_seo;
    responseJson.pageRecipeTotalTime = recipe.total_time_seo;
    responseJson.pageRecipeCusine = recipe.cuisine;
    responseJson.pageRecipeYield = recipe.recipe_yield;

    res.render('recipe', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/recetas/:tag', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});


router.get('/buscar', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/robots.txt', async (req, res, next) => {
  try {
    const content = 'User-agent: *\nAllow: /\nSitemap: https://www.resopia.com/sitemap.xml';
    res.set('Content-Type', 'text/plain');
    res.status(200);
    res.send(content);
  } catch (e) {
    next(e);
  }
});


module.exports = router;
