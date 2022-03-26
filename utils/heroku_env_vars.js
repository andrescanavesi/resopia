const fs = require('fs');

fs.readFile('dummy.env.example', 'utf8' , (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  // console.log(data.split('\n'));

  let cmd = 'heroku config:set ';
  data.split('\n').forEach((value) => {
    // const key = value.split('=')[0];
    //  console.info(key);
    cmd = `${cmd} ${value}`;
  });
  cmd = `${cmd} -a resopia-staging`;
  console.info(cmd);
});
