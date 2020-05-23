# resopia
resopia

```
export DATABASE_URL=**********
export RESOPIA_IMAGES_BASE_URL=https://res.cloudinary.com/dniiru5xy/image/upload/v1577283800/resopia.com/
export RESOPIA_DEFAULT_IMAGE_URL=https://res.cloudinary.com/dniiru5xy/image/upload/v1577283800/resopia.com/default.jpg
export RESOPIA_BASE_URL=http://localhost:3000
export RESOPIA_META_CACHE=20000
export RESOPIA_HTTP_AUTH_BASIC_PASSWORD=****
export RESOPIA_DEFAULT_VIDEO_URL=https://www.youtube.com/watch?v=mxqEM_1WiG8
export RESOPIA_ADSENSE_ENABLED=false
export RESOPIA_SITE_NAME=Resopia
export RESOPIA_AUTHOR=Resopia
export RESOPIA_PUBLISHER=Resopia
export RESOPIA_PAGE_NAME="resopia.com. Recetas de cocina"
export RESOPIA_PAGE_ORGANIZATION="Resopia"
export RESOPIA_PAGE_DESCRIPTION="resopia.com. Recetas de cocina"
export RESOPIA_DEFAULT_KEYWORDS="recetas,comida,cocina"
export RESOPIA_DEFAULT_TITLE="Resopia | Recetas de cocina"
export RESOPIA_GOOGLE_ANALYTICS_ID="UA-155091761-1"
export RESOPIA_GOOGLE_ADSENSE_ID="ca-pub-9559827534748081"
export RESOPIA_FACEBOOK_FAN_PAGE_URL=""
export RESOPIA_ADSENSE_ADS_TXT_CONTENT=""
export RESOPIA_FAV_ICON_URL=""
export USE_LOCAL_HTTPS=false
export KEY_PEM="/some/folder/key.pem"
export CERT_PEM="/some/folder/cert.pem"
export RESOPIA_LANG="lang"
export RESOPIA_LOCALE="es_ES"

```

Export / Inport config

`heroku config -s -a existing-heroku-app > config.txt`

`cat config.txt | tr '\n' ' ' | xargs heroku config:set -a new-heroku-app`

https://emirkarsiyakali.com/heroku-copying-environment-variables-from-an-existing-app-to-another-9253929198d9