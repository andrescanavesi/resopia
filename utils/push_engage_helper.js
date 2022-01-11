const fetch = require('node-fetch');
const { Logger } = require('./Logger');

const log = new Logger('push_engage_helper');

module.exports.send = async function (params) {
  log.info(`sending push ${JSON.stringify(params)}`);
  // curl -X POST -H "api_key: <your_pushengage_api_key>" -H "Content-Type: application/x-www-form-urlencoded" -d 'notification_title=this is title of notification&notification_message=this is message of notification&notification_url=http://www.example.com&image_url=your_image_path/image.png' "https://api.pushengage.com/apiv1/notifications"

  const res = await fetch('https://api.pushengage.com/apiv1/notifications',
    {
      method: 'POST',
      api_key: process.env.RESOPIA_PUSH_ENGAGE_API_KEY
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  const body = await res.text();
};
