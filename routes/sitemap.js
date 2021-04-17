const express = require('express');

const router = express.Router();
const js2xmlparser = require('js2xmlparser');
const moment = require('moment');
const daoRecipies = require('../daos/dao_recipes');
const daoTags = require('../daos/dao_tags');
const daoSearchTerms = require('../daos/dao_search_terms');

/**
 * It generates an standard sitemal.xml for SEO purposes
 */
router.get('/', async (req, res, next) => {
  try {
    const baseUrl = process.env.RESOPIA_BASE_URL;
    const recipes = await daoRecipies.findAll();
    const collection = [];
    let today = moment();
    today = today.format('YYYY-MM-DD');
    // add site root url
    const rootUrl = {};
    rootUrl.loc = baseUrl;
    rootUrl.lastmod = today;
    rootUrl.changefreq = 'daily';
    rootUrl.priority = '1.0';
    rootUrl['image:image'] = {
      'image:loc': process.env.RESOPIA_DEFAULT_IMAGE_URL,
      'image:caption': 'resopia.com. Recetas de cocina',
    };
    collection.push(rootUrl);

    // add recipes urls
    for (let i = 0; i < recipes.length; i++) {
      const url = {};
      url.loc = recipes[i].url;
      url.lastmod = recipes[i].updated_at;
      url.changefreq = 'monthly';
      url['image:image'] = {
        'image:loc': recipes[i].featured_image_url,
        'image:caption': recipes[i].description,
      };

      collection.push(url);
    }

    // add tags urls
    const tags = await daoTags.findAll(true);
    for (let i = 0; i < tags.length; i++) {
      const url = {};
      url.loc = tags[i].url;
      url.lastmod = today;
      url.changefreq = 'weekly';
      url['image:image'] = {
        'image:loc': tags[i].image_url,
        'image:caption': tags[i].name,
      };

      collection.push(url);
    }

    // add search terms
    const searchTerms = await daoSearchTerms.findAll(false, false);
    for (let i = 0; i < searchTerms.length; i++) {
      const url = {};
      url.loc = searchTerms[i].url;
      url.lastmod = searchTerms[i].updated_at_friendly_2;
      url.changefreq = 'weekly';
      url['image:image'] = {
        'image:loc': searchTerms[i].featured_image_url,
        'image:caption': searchTerms[i].term,
      };

      collection.push(url);
    }

    const col = {
      '@': {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
      },
      url: collection,
    };
    const xml = js2xmlparser.parse('urlset', col);
    res.set('Content-Type', 'text/xml');
    res.status(200);
    res.send(xml);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
