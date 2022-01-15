const fetch = require('node-fetch');
const { Logger } = require('./Logger');

const log = new Logger('push_engage_helper');

const sendPush = async function (recipe) {
  if (!process.env.RESOPIA_PUSH_ENGAGE_API_KEY) throw new Error('No RESOPIA_PUSH_ENGAGE_API_KEY env var provided');
  const baseUrl = 'https://api.pushengage.com/apiv1/notifications';
  const params = {
    title: recipe.title,
    message: recipe.description,
    url: recipe.url,
    imageUrl: recipe.featured_image_url,
  };
  log.info(`sending push ${JSON.stringify(params)}`);
  const bodyForm = `notification_type=draft&notification_title=${params.title}&notification_message=${params.message}&notification_url=${params.url}&image_url=${params.imageUrl}`;
  const url = baseUrl;
  const res = await fetch(url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        api_key: process.env.RESOPIA_PUSH_ENGAGE_API_KEY,
      },
      body: bodyForm,
    });
  const body = await res.text();

  if (res.status >= 300) throw new Error(`error sending push notification status code ${res.status}`);
  log.info(`notification sent ${body}`);
  let obj;
  try {
    obj = JSON.parse(body);
  } catch (e) {
    log.error(e);
    throw new Error(`error parsing push notification response ${e.message}`);
  }
  if (obj.success !== true && obj.success !== 'true') throw new Error(`error sending push notification ${body}`);
};

module.exports.send = sendPush;
