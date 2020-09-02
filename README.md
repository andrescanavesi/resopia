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
export RESOPIA_LANG="es"
export RESOPIA_LOCALE="es_ES"
export RESOPIA_WORD_RECIPE="receta"
export RESOPIA_WORD_RECIPES="recetas"
export RESOPIA_WORD_RECIPE_IMAGE="imagen-receta"
export RESOPIA_WORD_RECIPES="recetas"
export RESOPIA_WORD_RECIPE_BEST_OF="Las mejores recetas de"
export RESOPIA_WORD_RECIPE_OF="Recetas de"
export RESOPIA_WORD_SEARCH="Buscar"
export RESOPIA_WORD_WITH="with"
export RESOPIA_WORD_INGREDIENTS="Ingredientes"
export RESOPIA_WORD_STEPS="Elaboración"
export RESOPIA_WORD_MORE_RECIPES="Más recetas"
export RESOPIA_WORD_RELATED_SEARCHES="Búsquedas relacionadas con esta receta"
export RESOPIA_WORD_RATE_TITLE="Dinos que piensas de esta receta"
export RESOPIA_WORD_RECIPE_TIPS="Tips para preparar esta receta"
export RESOPIA_WORD_RECIPE_VIDEO="Video receta"
export RESOPIA_WORD_OPEN"Abrir"
export RESOPIA_WORD_MOST_VISITED_RECIPES"Recetas más vistas"
export RESOPIA_WORD_SEE_MORE_RECIPES="Ver más recetas"
export RESOPIA_WORD_AMERICAN="Americana"
export RESOPIA_WORD_SERVINGS="porciones"
export RESOPIA_WORD_MINUTES="minutes"
export RESOPIA_DEFAULT_LOADING_IMAGE=https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,f_auto,q_65,w_900/v1599054405/resopia.com/default-image.jpg
export RESOPIA_DEFAULT_THUMB_LOADING_IMAGE=https://res.cloudinary.com/dniiru5xy/image/upload/c_scale,f_auto,q_65,w_300/v1599054405/resopia.com/default-image.jpg

```

Export / Inport config

`heroku config -s -a existing-heroku-app > config.txt`

`cat config.txt | tr '\n' ' ' | xargs heroku config:set -a new-heroku-app`

https://emirkarsiyakali.com/heroku-copying-environment-variables-from-an-existing-app-to-another-9253929198d9