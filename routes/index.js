const express = require('express');
const daoRecipies = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');
const { Logger } = require('../utils/Logger');
const utils = require('../utils/utils');
const daoSearchTerms = require('../daos/dao_search_terms');
const daoTags = require('../daos/dao_tags');

const router = express.Router();
const log = new Logger('route_index');

const recipeWord = process.env.RESOPIA_WORD_RECIPE || 'receta';
const recipesWord = process.env.RESOPIA_WORD_RECIPES || 'recetas';
const recipeImageWord = process.env.RESOPIA_WORD_RECIPE_IMAGE || 'imagen-receta';
const recipesBestOfWord = process.env.RESOPIA_WORD_RECIPE_BEST_OF || 'Las mejores recetas de';
const recipesOfWord = process.env.RESOPIA_WORD_RECIPE_OF || 'Recetas de';
const searchWord = process.env.RESOPIA_WORD_SEARCH || 'buscar';
const withWord = process.env.RESOPIA_WORD_WITH || 'con';

router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = false;

    const recipes = await daoRecipies.findAll();
    const recipesMostVisited = await daoRecipies.findRecipesMostVisited();
    responseJson.recipesMostVisited = recipesMostVisited;

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
router.get(`/${recipeWord}/:id/:titleforurl`, async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    log.info(`View recipe: ${req.params.id}`);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = true;

    // titleforurl path param is for SEO purposes. It is ignored by the code
    const recipe = await daoRecipies.findById(recipeId, true);
    // recipes spotlight in this case are related recipes
    const recipesSpotlight = await daoRecipies.findRelated(recipe.tags_names_csv);
    const recipesMostVisited = await daoRecipies.findRecipesMostVisited();
    const footerRecipes = await daoRecipies.findAll();
    // recipe.allow_edition = utils.allowEdition(req, recipe);
    recipe.allow_edition = responseJson.isUserAuthenticated;
    responseJson.title = `${recipesOfWord} ${recipe.title}`;
    responseJson.recipe = recipe;
    responseJson.createdAt = recipe.created_at;
    responseJson.updatedAt = recipe.updated_at;
    responseJson.linkToThisPage = recipe.url;
    responseJson.description = `${recipe.description}`;
    responseJson.metaImage = recipe.featured_image_url;
    responseJson.keywords = `receta,${recipe.tags_names_csv}`;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.recipesMostVisited = recipesMostVisited;
    responseJson.isHomePage = false;
    responseJson.isRecipePage = true;
    responseJson.footerRecipes = footerRecipes;

    // structured data for SEO
    responseJson.pageType = 'recipe';
    responseJson.pageName = `${recipesOfWord} ${recipe.title}`;
    responseJson.pageImage = recipe.featured_image_url;
    responseJson.pageDatePublished = recipe.created_at;
    responseJson.pageDateModified = recipe.updated_at;
    responseJson.pageDescription = recipe.description;
    responseJson.pageKeywords = `${recipeWord},${recipe.tags_names_csv}`;
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

    responseJson.aggregateRating = recipe.aggregate_rating;
    responseJson.ratingCount = recipe.rating_count;

    const relatedSearches = [];
    const defaultTag = responseJson.lang === 'es' ? 'facil' : 'easy';
    const relatedAux = recipesSpotlight.slice(0, 5);
    relatedAux.forEach((element) => {
      const related = {
        title: element.title,
        keyword: defaultTag,
        keyword_seo: defaultTag,
      };

      relatedSearches.push(related);
    });
    responseJson.relatedSearches = relatedSearches;
    res.render('recipe', responseJson);
  } catch (e) {
    next(e);
  }
});


/**
 * Renders the given recipe's image
 */
router.get(`/${recipeImageWord}/:recipeId/:imageName`, async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    log.info(`recipe ${req.params.recipeId} image name ${req.params.imageName}`);
    const recipe = await daoRecipies.findById(req.params.recipeId);

    if (!recipe) {
      throw Error('Recipe not found');
    }

    const imageBase = process.env.RESOPIA_IMAGES_BASE_URL;

    responseJson.image_url = imageBase + req.params.imageName;
    responseJson.back_url = recipe.url;
    responseJson.recipe_title = recipe.title;
    responseJson.title = `Imagen de ${recipe.title} `;
    responseJson.metaImage = responseJson.image_url;
    responseJson.description = `Imagen de ${recipe.title}`;
    responseJson.linkToThisPage = responseJson.image_url;
    responseJson.isHomePage = false;
    responseJson.recipesSpotlight = [];
    responseJson.recipesMostVisited = [];
    responseJson.footerRecipes = [];
    responseJson.displayMoreRecipes = false;
    responseJson.pageDatePublished = recipe.created_at;
    responseJson.pageDateModified = recipe.updated_at;
    responseJson.pageDescription = recipe.description;
    responseJson.pageKeywords = `${recipeWord},imagen`;
    responseJson.keywords = `${recipeWord},imagen`;

    res.render('image-viewer', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get(`/${recipesWord}/:tag`, async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = false;
    log.info(`recipes by tag: ${req.params.tag}`);
    const recipes = await daoRecipies.findWithKeyword(req.params.tag);
    const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
    const recipesMostVisited = await daoRecipies.findRecipesMostVisited();
    const footerRecipes = await daoRecipies.findAll();

    if (!recipes) {
      throw Error('No recipes found');
    }

    responseJson.recipes = recipes;
    responseJson.title = `${recipesOfWord} ${req.params.tag}`;
    responseJson.description = `${recipesBestOfWord} ${req.params.keyword}`;
    responseJson.linkToThisPage = `${process.env.RESOPIA_BASE_URL}${recipesWord}/${req.params.tag}`;
    responseJson.isHomePage = false;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.recipesMostVisited = recipesMostVisited;
    responseJson.footerRecipes = footerRecipes;
    responseJson.displayMoreRecipes = true;

    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});


router.get(`/${searchWord}`, async (req, res, next) => {
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

    // // search using flexsearch. It will return a list of IDs we used as keys during indexing
    // const resultIds = await daoRecipies.searchIndex.search({
    //   query: phrase,
    //   limit: 15,
    //   suggest: true, // When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
    // });

    // log.info(`results found for '${phrase}': ${resultIds.length}`);
    // let p1;
    // if (resultIds.length === 0) {
    //   p1 = daoRecipies.findRecipesSpotlight();
    // } else {
    //   p1 = daoRecipies.findByIds(resultIds);
    // }

    const p1 = daoRecipies.findRelated(phrase);
    const p2 = daoRecipies.findRecipesSpotlight();
    const p3 = daoRecipies.findAll();
    const p4 = daoRecipies.findRecipesMostVisited();

    let [recipes, recipesSpotlight, footerRecipes, recipesMostVisited] = await Promise.all([p1, p2, p3, p4]);
    if (recipes.length === 0) {
      recipes = recipesSpotlight;
    }
    responseJson.recipes = recipes;
    responseJson.isHomePage = false;
    responseJson.displayMoreRecipes = true;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.recipesMostVisited = recipesMostVisited;
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

router.get(`/${searchWord}/:text`, (req, res, next) => {
  try {
    // for recetas-city.com support
    res.redirect(`/${searchWord}?q=${req.params.text}`);
  } catch (e) {
    next(e);
  }
});

router.get(`/${recipesWord}/${withWord}/:ingredient`, (req, res, next) => {
  try {
    // for recetas-city.com support
    // we redirect to a tags page (we transform the ingredient from url to a tag)
    res.redirect(`/${recipesWord}/${req.params.ingredient}`);
  } catch (e) {
    next(e);
  }
});

router.get(`/${recipesWord}/keyword/:tag`, (req, res, next) => {
  try {
    // for recetas-city.com support
    res.redirect(`/${recipesWord}/${req.params.tag}`);
  } catch (e) {
    next(e);
  }
});

router.get('/sobre-el-sitio', (req, res, next) => {
  try {
    // for recetas-city.com support
    res.redirect('/');
  } catch (e) {
    next(e);
  }
});

router.get('/status', (req, res, next) => {
  try {
    const json = {
      secure: req.secure,
      host: req.headers.host,
      url: req.url,
      headers: req.headers,
    };
    if (!utils.isSecure(req)) {
      res.redirect(301, `https://${req.headers.host}${req.url}`);
    } else {
      res.status(200);
      res.json(json);
    }
  } catch (e) {
    next(e);
  }
});

/**
 * SEO list of posts
 */
router.get('/l/:termSeo', async (req, res, next) => {
  try {
    const { termSeo } = req.params;
    const responseJson = responseHelper.getResponseJson(req);
    const searchTerm = await daoSearchTerms.findByTerm(termSeo, false, true, true);

    const term = searchTerm ? searchTerm.term : termSeo.split('_').join(' ');

    const posts = await daoRecipies.findRelated(term);

    responseJson.posts = posts;
    responseJson.isHomePage = false;
    responseJson.searchText = term;
    responseJson.title = `${term}`;
    responseJson.description = responseJson.title;
    res.render('seo-list', responseJson);
  } catch (e) {
    next(e);
  }
});

/**
 * All tags, posts and search terms list
 */
router.get('/all/:kind', async (req, res, next) => {
  try {
    const { kind } = req.params;
    const responseJson = responseHelper.getResponseJson(req);
    const links = [];
    let title = '';
    let description = '';
    let records;
    switch (kind) {
      case 'tags':
        title = 'All tags';
        description = 'All tags';
        records = await daoTags.findAllTags(true);
        records.forEach((item) => {
          links.push({
            url: item.url,
            name: item.name,
            featured_image_url: item.featured_image_url,
          });
        });
        break;
      case 'search':
        title = 'All search terms';
        description = 'All search terms';
        records = await daoSearchTerms.findAll(false, true);
        records.forEach((item) => {
          links.push({
            url: item.url,
            name: item.term,
            featured_image_url: item.featured_image_url,
          });
        });
        break;
      case 'recipes':
        title = 'All recipes';
        description = 'All recipes';
        records = await daoRecipies.findAll();
        records.forEach((item) => {
          links.push({
            url: item.url,
            name: item.title,
            featured_image_url: item.thumb_image_url,
          });
        });
        break;
      default: throw new Error('Unsupported kind');
    }

    responseJson.links = links;
    responseJson.isHomePage = false;
    responseJson.searchText = '';
    responseJson.title = title;
    responseJson.description = description;
    res.render('link-list', responseJson);
  } catch (e) {
    next(e);
  }
});


module.exports = router;
