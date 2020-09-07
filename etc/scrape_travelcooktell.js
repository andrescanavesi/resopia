const fetch = require('node-fetch');

async function execute() {
  const res = await fetch('https://travelcooktell.com/scones-without-butter/');
  const body = await res.text();
  console.info(body);
}


execute().then(() => {
  console.info('done');
});
