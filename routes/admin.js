const express = require('express');
const basicAuth = require('express-basic-auth');
const daoRecipies = require('../daos/dao_recipes');
const daoTags = require('../daos/dao_tags');
const responseHelper = require('../utils/response_helper');
const utils = require('../utils/utils');
const { Logger } = require('../utils/Logger');

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

router.get('/receta/nueva', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.recipe = {
      id: 0,
      title: '',
      featured_image_name: 'cookies-test.jpg',
      secondary_image_name: 'pizza-test.jpg',
      tags: [],
      tags_ids_csv: '',
      tags_names_csv: '',
      active: false,
      title_seo: '',
      ingredients: 'ing1\ning2\ning3\n',
      extra_ingredients_title: '',
      extra_ingredients: '',
      description: 'descrip',
      steps: 'step1\nstep2\nstep3\nstep4\nstep5\n',
      prep_time_seo: 'PT10M',
      cook_time_seo: 'PT20M',
      total_time_seo: 'PT30M',
      prep_time: '10 minutos',
      cook_time: '20 minutos',
      total_time: '40 minutos',
      cuisine: 'Americana',
      yield: '5 porciones',
      facebook_shares: 349,
      pinterest_pins: 257,
      tweets: 155,
      notes: 'notas de la receta',
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


router.get('/receta/editar/:id', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);

    const recipeId = req.params.id;
    const recipe = await daoRecipies.findById(recipeId, true, false);
    responseJson.recipe = recipe;
    responseJson.allTags = await daoTags.findAll(false);
    res.render('recipe-edit', responseJson);
  } catch (e) {
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
      aggregate_rating: req.body.aggregate_rating,
      rating_count: req.body.rating_count,
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
