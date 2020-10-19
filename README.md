# phdcc-papers

**Papers**: [PHDCC journal/conference abstract and paper submission and review system](https://www.phdcc.com/papers/).

To be used in conjuction with [phdcc-papers-api](https://github.com/phdccltd/phdcc-papers-api).
Please read the full set up instructions there.

Create a `.env` text file in the root directory of this component with the following secrets:

```
NUXT_PORT=1234
API='http://the.url'
RECAPTCHA_SITE_KEY='recaptcha site key'
RECAPTCHA_BYPASS='Password to avoid recaptcha'
```

Optionally add all these variables to send a mail when the production server is started:

```
STARTUP_EMAIL='to@example.com'
STARTUP_SUBJECT='Papers nuxt restarted'
STARTUP_FROM='from@example.com'
```

If running in a dev environment at localhost that calls a website server API, specify the server API `RECAPTCHA_BYPASS` to bypass the authenication recaptcha.

## Build Setup

```
# Grab the code
git clone https://github.com/phdccltd/phdcc-papers.git
cd phdcc-papers-api

# install dependencies
npm install

# serve with hot reload at eg localhost:1234
npm run dev

# For simple production use:
npm run build
npm run start

# For production in PM2, create an ecosystem file or start
npm run build
pm2 start ./node_modules/nuxt/bin/nuxt.js --name papers -- start
```

## Used with thanks

Thanks to all the developers who produced the open-source modules that are used, including

* [Nuxt](https://nuxtjs.org), which is [Vue](https://vuejs.org/) 
* [BootstrapVue](https://bootstrap-vue.js.org/), which is Bootstrap v4 for Vue/Nuxt. 

# License

[MIT](LICENCE)
