const express = require('express');
const basicAuth = require('express-basic-auth');
const daoRecipies = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');
const utils = require('../utils/utils');
const { Logger } = require('../utils/Logger');

const router = express.Router();
const log = new Logger('route_index');


/**
 *
 * @returns {string} the text to be displayed when users hit on cancel prompt button
 */
function getUnauthorizedResponse() {
  return 'Unauthorized';
}

// http auth basic options
const authOptions = {
  challenge: true, // it will cause most browsers to show a popup to enter credentials on unauthorized responses,
  users: { admin: process.env.RESOPIA_HTTP_AUTH_BASIC_PASSWORD },
  authorizeAsync: false,
  unauthorizedResponse: getUnauthorizedResponse,
};

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
router.get('/receta/:id/:titleforurl', async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    log.info(`View recipe: ${req.params.id}`);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = true;

    // titleforurl path param is for SEO purposes. It is ignored by the code
    const recipe = await daoRecipies.findById(recipeId);
    const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
    const footerRecipes = await daoRecipies.findAll();
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
    responseJson.displayMoreRecipes = false;
    log.info(`recipes by tag: ${req.params.tag}`);
    const recipes = await daoRecipies.findWithKeyword(req.params.tag);
    const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
    const footerRecipes = await daoRecipies.findAll();

    if (!recipes) {
      throw Error('No recipes found');
    }

    responseJson.recipes = recipes;
    responseJson.title = `Recetas ${req.params.tag} | resopia.com`;
    responseJson.description = `Las mejores recetas de ${req.params.keyword} | resopia.com`;
    responseJson.linkToThisPage = `${process.env.RESOPIA_BASE_URL}recetas/${req.params.tag}`;
    responseJson.isHomePage = false;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.footerRecipes = footerRecipes;

    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});


router.get('/buscar', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = false;

    const phrase = req.query.q;
    if (!phrase) {
      throw Error('phrase query parameter empty');
    }
    log.info(`searching by: ${phrase}`);

    if (daoRecipies.searchIndex.length === 0) {
      await daoRecipies.buildSearchIndex();
    }

    // search using flexsearch. It will return a list of IDs we used as keys during indexing
    const resultIds = await daoRecipies.searchIndex.search({
      query: phrase,
      limit: 15,
      suggest: true, // When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
    });

    log.info(`results found for '${phrase}': ${resultIds.length}`);
    let p1;
    if (resultIds.length === 0) {
      p1 = daoRecipies.findRecipesSpotlight();
    } else {
      p1 = daoRecipies.findByIds(resultIds);
    }

    const p2 = daoRecipies.findRecipesSpotlight();
    const p3 = daoRecipies.findAll();

    let [recipes, recipesSpotlight, footerRecipes] = await Promise.all([p1, p2, p3]);
    if (recipes.length === 0) {
      recipes = recipesSpotlight;
    }
    responseJson.recipes = recipes;
    responseJson.isHomePage = false;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.footerRecipes = footerRecipes;
    responseJson.searchText = phrase;

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

router.get('/admin/receta/nueva', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.recipe = {
      id: 0,
      title: 'titulo receta',
      featured_image_name: 'cookies-test.jpg',
      secondary_image_name: 'pizza-test.jpg',
      active: false,
      title_seo: '',
      ingredients: 'ing1\ning2\ning3\n',
      extra_ingredients_title: 'extra ing title',
      extra_ingredients: 'extra_ing1\nextra_ing2\nextra_ing3\nextra_ing4\n',
      description: 'descrip',
      steps: 'step1\nstep2\nstep3\nstep4\nstep5\n',
      prep_time_seo: 'PT20M',
      cook_time_seo: 'PT30M',
      total_time_seo: 'PT50M',
      prep_time: '20 minutos',
      cook_time: '30 minutos',
      total_time: '50 minutos',
      cuisine: 'Americana',
      yield: '5 porciones',
      facebook_shares: 349,
      pinterest_pins: 257,
      tweets: 155,
      notes: 'notas de la receta',
      youtube_video_id: 'cEWz-iCSGsk',
    };
    responseJson.newRecipe = true;
    responseJson.successMessage = null;
    res.render('recipe-edit', responseJson);
  } catch (e) {
    next(e);
  }
});


router.get('/admin/receta/editar/:id', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);

    const recipeId = req.params.id;
    const recipe = await daoRecipies.findById(recipeId, true);
    responseJson.recipe = recipe;
    res.render('recipe-edit', responseJson);
  } catch (e) {
    next(e);
  }
});

router.post('/admin/receta/editar/:id', basicAuth(authOptions), async (req, res, next) => {
  try {
    // TODO sanitize with express validator
    let recipeId = req.params.id;
    log.info(`Recipe edit, id: ${recipeId}`);
    // log.info("Recipe title submited: " + recipeId + " " + req.body.title);
    // log.info(req.body);
    const active = req.body.active === 'active';
    const recipeToUdate = {
      id: recipeId,
      title: req.body.title,
      title_seo: utils.dashString(req.body.title),
      ingredients: req.body.ingredients,
      extra_ingredients_title: req.body.extra_ingredients_title,
      extra_ingredients: req.body.extra_ingredients,
      description: req.body.description,
      notes: req.body.notes,
      steps: req.body.steps,
      featured_image_name: req.body.featured_image_name,
      secondary_image_name: req.body.secondary_image_name,
      active,
      prep_time_seo: req.body.prep_time_seo,
      cook_time_seo: req.body.cook_time_seo,
      total_time_seo: req.body.total_time_seo,
      prep_time: req.body.prep_time,
      cook_time: req.body.cook_time,
      total_time: req.body.total_time,
      cuisine: req.body.cuisine,
      yield: req.body.yield,
      facebook_shares: req.body.facebook_shares,
      pinterest_pins: req.body.pinterest_pins,
      tweets: req.body.tweets,
      youtube_video_id: req.body.youtube_video_id,
      tags: req.body.tags_ids_csv.split(','),
    };
    // log.info(recipeToUdate);
    if (recipeId === '0') {
      recipeId = await daoRecipies.create(recipeToUdate);
    } else {
      await daoRecipies.update(recipeToUdate);
    }

    res.redirect(`/admin/receta/editar/${recipeId}`);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
