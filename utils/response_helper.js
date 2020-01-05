const moment = require('moment');

/**
 *
 */
module.exports.getResponseJson = function (req) {
  // default attributes for the response response.
  const responseJson = {};
  responseJson.title = process.env.RESOPIA_DEFAULT_TITLE || 'Resopia | Recetas de cocina';
  responseJson.today = moment().format('YYYY-MM-DD');
  responseJson.isProduction = process.env.NODE_ENV === 'production' || false;
  responseJson.adsenseEnabled = process.env.RESOPIA_ADSENSE_ENABLED || false;
  responseJson.isHomePage = false;
  responseJson.isRecipePage = false;
  responseJson.displayMoreRecipes = false;
  responseJson.createdAt = moment().format('YYYY-MM-DD');
  responseJson.updatedAt = moment().format('YYYY-MM-DD');
  responseJson.linkToThisPage = process.env.RESOPIA_BASE_URL || 'http://localhost:3000';
  responseJson.description = process.env.RESOPIA_PAGE_DESCRIPTION || 'resopia.com. Recetas de cocina';
  responseJson.metaImage = process.env.RESOPIA_DEFAULT_IMAGE_URL;
  responseJson.keywords = process.env.RESOPIA_DEFAULT_KEYWORDS || 'recetas,comida,cocina';
  responseJson.recipesSpotlight = [];
  responseJson.footerRecipes = [];
  responseJson.searchText = '';

  const metaCache = process.env.RESOPIA_META_CACHE || '1'; // in seconds
  responseJson.metaCache = `public, max-age=${metaCache}`;

  responseJson.isUserAuthenticated = false;
  responseJson.isMobile = req.useragent.isMobile;
  responseJson.isDesktop = req.useragent.isDesktop;

  // structured data
  responseJson.pageType = 'Website';
  responseJson.pageName = process.env.RESOPIA_PAGE_NAME || 'resopia.com. Recetas de cocina';
  responseJson.pageOrganization = process.env.RESOPIA_PAGE_ORGANIZATION || 'Resopia';
  responseJson.pageImage = process.env.RESOPIA_DEFAULT_IMAGE_URL;
  responseJson.pageUrl = process.env.RESOPIA_BASE_URL;
  responseJson.pageDatePublished = process.env.RESOPIA_DATE_PUBLISHED || '2020-01-02';
  responseJson.pageDateModified = moment().format('YYYY-MM-DD');// today
  responseJson.pageLogo = process.env.RESOPIA_FAV_ICON_URL;
  responseJson.pageDescription = responseJson.description;
  responseJson.pageRecipeVideo = process.env.RESOPIA_DEFAULT_VIDEO_URL || 'https://www.youtube.com/watch?v=mxqEM_1WiG8';

  responseJson.enablePushEngage = false;

  responseJson.siteName = process.env.RESOPIA_SITE_NAME || 'Resopia';
  responseJson.author = process.env.RESOPIA_AUTHOR || 'Resopia';
  responseJson.publisher = process.env.RESOPIA_PUBLISHER || 'Resopia';

  responseJson.googleAnalyticsId = process.env.RESOPIA_GOOGLE_ANALYTICS_ID || '';
  responseJson.googleAdsenseId = process.env.RESOPIA_GOOGLE_ADSENSE_ID || '';

  responseJson.facebookFanPageUrl = process.env.RESOPIA_FACEBOOK_FAN_PAGE_URL || '#';
  responseJson.currentYear = moment().format('YYYY');

  return responseJson;
};
