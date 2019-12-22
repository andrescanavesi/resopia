const { Logger } = require('../utils/Logger');

const log = new Logger('route_recipe');

const express = require('express');

const router = express.Router();
const daoRecipies = require('../daos/dao_recipies');
const responseHelper = require('../util/response_helper');
const utils = require('../utils/utils');
const basicAuth = require('express-basic-auth');

function myAuthorizer(username, password) {
  const userMatches = basicAuth.safeCompare(username, 'admin');
  const passwordMatches = basicAuth.safeCompare(password, process.env.R21_HTTP_AUTH_BASIC_PASSWORD);
  const matches = userMatches & passwordMatches;
  return matches;
}

// http auth basic options
// const authOptions = {
//     challenge: true, //it will cause most browsers to show a popup to enter credentials on unauthorized responses,
//     users: {admin: process.env.R21_HTTP_AUTH_BASIC_PASSWORD},
//     authorizeAsync: false,
//     unauthorizedResponse: getUnauthorizedResponse,
// };

const authOptions = {
  challenge: true, // it will cause most browsers to show a popup to enter credentials on unauthorized responses,
  authorizeAsync: false,
  authorizer: myAuthorizer,
  unauthorizedResponse: getUnauthorizedResponse,
};

/**
 *
 * @param req
 * @returns {string} the text to be displayed when users hit on cancel prompt button
 */
function getUnauthorizedResponse(req) {
  return 'Unauthorized';
}

router.get('/:id/:titleforurl', async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    log.info('View recipe: ' + req.params.id);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = true;

    // titleforurl path param is for SEO purposes. It is ignored by the code
    const recipe = await daoRecipies.findById(recipeId);
    const textRelated = recipe.keywords_array[0] || 'easy';
    // const recipesSpotlight = await daoRecipies.findRelated(textRelated);
    const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
    const footerRecipes = await daoRecipies.findAll();
    recipe.im_owner = utils.imRecipeOwner(req, recipe);
    // recipe.allow_edition = utils.allowEdition(req, recipe);
    recipe.allow_edition = responseJson.isUserAuthenticated;
    log.info(`Allow recipe edition: ${recipe.allow_edition}`);
    responseJson.title = recipe.title;
    responseJson.recipe = recipe;
    responseJson.createdAt = recipe.created_at;
    responseJson.updatedAt = recipe.updated_at;
    responseJson.linkToThisPage = recipe.url;
    responseJson.description = `${recipe.description  } | recipes21.com`;
    responseJson.metaImage = recipe.featured_image;
    responseJson.keywords = recipe.keywords;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.isHomePage = false;
    responseJson.isRecipePage = true;
    responseJson.footerRecipes = footerRecipes;

    // structured data
    // TODO add more fields based on https://developers.google.com/search/docs/data-types/recipe
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

router.get('/new', basicAuth(authOptions), async (req, res, next) => {
  try {
    req.session.authenticated = true;
    const responseJson = responseHelper.getResponseJson(req);

    responseJson.recipe = {
      id: 0,
      title: '',
      featured_image_name: 'default.jpg',
      active: false,
      title_for_url: '',
      ingredients: '',
      description: '',
      steps: '',
      keywords: '',
      category_name: 'General',
      prep_time_seo: 'PT20M',
      cook_time_seo: 'PT30M',
      total_time_seo: 'PT50M',
      prep_time: '20 minutes',
      cook_time: '30 minutes',
      total_time: '50 minutes',
      cuisine: 'American',
      yield: '5 servings',
    };
    responseJson.newRecipe = true;
    responseJson.successMessage = null;
    res.render('recipe-edit', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/edit', basicAuth(authOptions), async (req, res, next) => {
  // we cannot use /edit/:recipeId because there's already a route /:id/:title so it makes conflicts
  // that's why we receive the recipe id by query param instead of path param
  try {
    req.session.authenticated = true;
    const responseJson = responseHelper.getResponseJson(req);
    log.info(`auth: ${req.session.authenticated}`);
    log.info(req);

    const recipeId = req.query.id;
    const recipe = await daoRecipies.findById(recipeId, true);
    responseJson.recipe = recipe;
    res.render('recipe-edit', responseJson);
  } catch (e) {
    next(e);
  }
});

router.post('/edit', basicAuth(authOptions), async (req, res, next) => {
  try {
    req.session.authenticated = true;
    const responseJson = responseHelper.getResponseJson(req);

    // TODO sanitize with express validator
    let recipeId = req.query.id;
    log.info('Recipe edit, id: ' + recipeId);
    // log.info("Recipe title submited: " + recipeId + " " + req.body.title);
    // log.info(req.body);
    const userId = req.session.user_id || 1; // TODO change this
    const active = req.body.active === 'active';
    const recipeToUdate = {
      id: recipeId,
      title: req.body.title,
      title_for_url: getTitleUrl(req.body.title),
      ingredients: req.body.ingredients,
      description: req.body.description,
      steps: req.body.steps,
      keywords: transformKeywords(req.body.keywords),
      featured_image_name: req.body.featured_image_name,
      user_id: userId,
      active,
      category_name: req.body.category_name,
      prep_time_seo: req.body.prep_time_seo,
      cook_time_seo: req.body.cook_time_seo,
      total_time_seo: req.body.total_time_seo,
      prep_time: req.body.prep_time,
      cook_time: req.body.cook_time,
      total_time: req.body.total_time,
      cuisine: req.body.cuisine,
      yield: req.body.yield,
    };
    // log.info(recipeToUdate);
    if (recipeId === '0') {
      recipeId = await daoRecipies.create(recipeToUdate);
    } else {
      await daoRecipies.update(recipeToUdate);
    }

    res.redirect('/recipe/edit?id=' + recipeId);
  } catch (e) {
    next(e);
  }
});

/**
 *
 * @param {String} recipeTitle example: Double Layer Chocolate Peanut Butter Pie
 * @returns double-layer-chocolate-peanut-butter-Pie
 */
function getTitleUrl(recipeTitle) {
  return recipeTitle
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

function transformKeywords(keywordsCsv) {
  return keywordsCsv.toLowerCase();
}

module.exports = router;
