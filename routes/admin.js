const express = require('express');
const basicAuth = require('express-basic-auth');
const daoRecipies = require('../daos/dao_recipes');
const daoTags = require('../daos/dao_tags');
const responseHelper = require('../utils/response_helper');
const pushEngageHelper = require('../utils/push_engage_helper');
const utils = require('../utils/utils');
const { Logger } = require('../utils/Logger');
const controllerSearchTerms = require('../controllers/controller_search_terms');
const cloudinaryHelper = require('../utils/cloudinary_helper');

const router = express.Router();
const log = new Logger('route_admin');


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
router.get('/', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    const recipes = await daoRecipies.findAll(false, false);
    responseJson.recipes = recipes;

    res.render('admin', responseJson);
  } catch (e) {
    next(e);
  }
});


router.get('/receta/nueva', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.recipe = {
      id: 0,
      title: '',
      featured_image_name: 'recipe-default.jpg',
      secondary_image_name: 'recipe-default.jpg',
      images_names_csv: process.env.RESOPIA_DEFAULT_IMAGES_NAMES_CSV || 'recipe-default.jpg,recipe-default.jpg',
      tags: [],
      tags_ids_csv: '',
      tags_names_csv: '',
      tags_csv: 'american,easy',
      active: false,
      title_seo: '',
      ingredients: '',
      extra_ingredients_title: '',
      extra_ingredients: '',
      description: '',
      description_html: '',
      steps: '',
      prep_time_seo: 'PT10M',
      cook_time_seo: 'PT20M',
      total_time_seo: 'PT30M',
      prep_time: `10 ${responseJson.wordMinutes}`,
      cook_time: `20 ${responseJson.wordMinutes}`,
      total_time: `40 ${responseJson.wordMinutes}`,
      cuisine: responseJson.wordAmerican,
      yield: `6 ${responseJson.wordServings}`,
      facebook_shares: 349,
      pinterest_pins: 257,
      tweets: 155,
      notes: '',
      youtube_video_id: '',
      aggregate_rating: 4.3,
      rating_count: 23,
    };
    responseJson.newRecipe = true;
    responseJson.successMessage = null;
    responseJson.allTags = await daoTags.findAll(false);
    res.render('recipe-edit', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/receta/from-json', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.recipe = {
      id: 0,
      title: '',
      featured_image_name: 'recipe-default.jpg',
      secondary_image_name: 'recipe-default.jpg',
      images_names_csv: process.env.RESOPIA_DEFAULT_IMAGES_NAMES_CSV || 'recipe-default.jpg,recipe-default.jpg',
      tags: [],
      tags_ids_csv: '',
      tags_names_csv: '',
      tags_csv: 'american,easy',
      active: false,
      title_seo: '',
      ingredients: '',
      extra_ingredients_title: '',
      extra_ingredients: '',
      description: '',
      description_html: '',
      steps: '',
      prep_time_seo: 'PT10M',
      cook_time_seo: 'PT20M',
      total_time_seo: 'PT30M',
      prep_time: `10 ${responseJson.wordMinutes}`,
      cook_time: `20 ${responseJson.wordMinutes}`,
      total_time: `40 ${responseJson.wordMinutes}`,
      cuisine: responseJson.wordAmerican,
      yield: `6 ${responseJson.wordServings}`,
      facebook_shares: 349,
      pinterest_pins: 257,
      tweets: 155,
      notes: '',
      youtube_video_id: '',
      aggregate_rating: 4.3,
      rating_count: 23,
    };
    responseJson.newRecipe = true;
    responseJson.successMessage = null;
    responseJson.allTags = await daoTags.findAll(false);
    res.render('recipe-from-json', responseJson);
  } catch (e) {
    next(e);
  }
});


router.get('/receta/editar/:id', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);

    const recipeId = req.params.id;
    const recipe = await daoRecipies.findById(recipeId, true, false);
    responseJson.recipe = recipe;
    // responseJson.allTags = await daoTags.findAll(false);
    responseJson.allTags = [];
    res.render('recipe-edit', responseJson);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/receta/editar/:id', basicAuth(authOptions), async (req, res, next) => {
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
      description: req.body.description || req.body.title,
      description_html: req.body.description_html,
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
      // tags: req.body.tags_ids_csv.split(','),
      aggregate_rating: req.body.aggregate_rating,
      rating_count: req.body.rating_count,
      images_names_csv: req.body.images_names_csv,
      tags_csv: req.body.tags_csv,
    };

    recipeToUdate.featured_image_name = recipeToUdate.images_names_csv.split(',')[0] || 'recipe-default.jpg';
    recipeToUdate.secondary_image_name = recipeToUdate.images_names_csv.split(',')[1] || 'recipe-default.jpg';
    // log.info(recipeToUdate);
    if (recipeId === '0') {
      recipeId = await daoRecipies.create(recipeToUdate);
      if (req.body.images_urls_csv && req.body.images_urls_csv.length > 0) {
        const names = await cloudinaryHelper.uploadImages(req.body.images_urls_csv, recipeId);
        recipeToUdate.images_names_csv = names.join(',');
        recipeToUdate.id = recipeId;
        recipeToUdate.featured_image_name = recipeToUdate.images_names_csv[0] || 'recipe-default.jpg';
        recipeToUdate.secondary_image_name = recipeToUdate.images_names_csv[1] || 'recipe-default.jpg';
        await daoRecipies.update(recipeToUdate);
      }
    } else {
      await daoRecipies.update(recipeToUdate);
    }

    res.redirect(`/admin/receta/editar/${recipeId}`);
  } catch (e) {
    next(e);
  }
});

router.get('/recipe/push/:id', basicAuth(authOptions), async (req, res, next) => {
  try {
    // TODO sanitize with express validator
    const recipeId = req.params.id;
    log.info(`recipe push, id: ${recipeId}`);
    const recipe = await daoRecipies.findById(recipeId, true, false);
    if (recipe.active === false || recipe.active === 'false') throw new Error('Non active recipe');
    await pushEngageHelper.send(recipe);
    res.redirect('/admin');
  } catch (e) {
    next(e);
  }
});

router.get('/process-seo-list', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);

    res.render('process-seo-list', responseJson);
  } catch (e) {
    next(e);
  }
});

router.post('/process-seo-list', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csv = '';
    responseJson.successMessage = 'csv processed';

    const { csv } = req.body;
    await controllerSearchTerms.processCsv(csv);

    res.render('process-seo-list', responseJson);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
