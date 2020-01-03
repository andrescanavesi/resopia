const express = require('express');
const daoRecipies = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');
const { Logger } = require('../utils/Logger');

const router = express.Router();
const log = new Logger('route_index');

router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = false;

    const recipes = await daoRecipies.findAll();

    if (!recipes) {
      throw Error('No Se han encontrado recetas');
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
    responseJson.title = `Receta de ${recipe.title}`;
    responseJson.recipe = recipe;
    responseJson.createdAt = recipe.created_at;
    responseJson.updatedAt = recipe.updated_at;
    responseJson.linkToThisPage = recipe.url;
    responseJson.description = `${recipe.description}`;
    responseJson.metaImage = recipe.featured_image_url;
    responseJson.keywords = `receta,${recipe.tags_names_csv}`;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.isHomePage = false;
    responseJson.isRecipePage = true;
    responseJson.footerRecipes = footerRecipes;

    // structured data for SEO
    responseJson.pageType = 'recipe';
    responseJson.pageName = `Receta de ${recipe.title}`;
    responseJson.pageImage = recipe.featured_image_url;
    responseJson.pageDatePublished = recipe.created_at;
    responseJson.pageDateModified = recipe.updated_at;
    responseJson.pageDescription = recipe.description;
    responseJson.pageKeywords = `receta,${recipe.tags_names_csv}`;
    responseJson.pageRecipeIngredients = JSON.stringify(recipe.ingredients);
    const instructions = [];
    for (let i = 0; i < recipe.steps_array.length; i++) {
      const step = { '@type': 'HowToStep', text: recipe.steps_array[i] };
      instructions.push(step);
    }

    responseJson.pageRecipeInstructions = JSON.stringify(instructions);

    responseJson.pageRecipeCategory = recipe.tags[0].name; // there's always at least one tag
    responseJson.pageRecipePrepTime = recipe.prep_time_seo;
    responseJson.pageRecipeCookTime = recipe.cook_time_seo;
    responseJson.pageRecipeTotalTime = recipe.total_time_seo;
    responseJson.pageRecipeCusine = recipe.cuisine;
    responseJson.pageRecipeYield = recipe.yield;
    responseJson.pageRecipeVideo = recipe.youtube_video_watch_url; // can be empty

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
    responseJson.displayMoreRecipes = true;

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
    responseJson.displayMoreRecipes = true;
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
    const content = `User-agent: *\nAllow: /\nSitemap: ${process.env.RESOPIA_BASE_URL}/sitemap.xml`;
    res.set('Content-Type', 'text/plain');
    res.status(200);
    res.send(content);
  } catch (e) {
    next(e);
  }
});

router.get('/ads.txt', (req, res, next) => {
  try {
    const content = process.env.RESOPIA_ADSENSE_ADS_TXT_CONTENT || 'google.com, pub-9559827534748081, DIRECT, f08c47fec0942fa0';
    res.set('Content-Type', 'text/plain');
    res.status(200);
    res.send(content);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
