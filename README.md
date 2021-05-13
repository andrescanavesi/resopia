# resopia
resopia

Export / Import config

`heroku config -s -a existing-heroku-app > config.txt`

`cat config.txt | tr '\n' ' ' | xargs heroku config:set -a new-heroku-app`

https://emirkarsiyakali.com/heroku-copying-environment-variables-from-an-existing-app-to-another-9253929198d9

# See logs in Heroku
```bash
heroku logs --tail -a recipes21-com-staging
```
