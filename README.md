# phdcc-papers

**Papers**: [PHDCC journal/conference abstract and paper submission and review system](https://www.phdcc.com/papers/).

To be used in conjuction with [phdcc-papers-api](https://github.com/phdccltd/phdcc-papers-api).
Please read the API set up instructions there.

Create a `.env` text file with the following secrets:

```
NUXT_PORT=1234
API='http://the.url'
RECAPTCHA_SITE_KEY='recaptcha site key'
RECAPTCHA_BYPASS='Password to avoid recaptcha'
```

Optionally add all these variables to send an email when the production server is started:

```
STARTUP_EMAIL='to@example.com'
STARTUP_SUBJECT='Papers nuxt restarted'
STARTUP_FROM='from@example.com'
```

If running in a dev environment at localhost that calls a website server API, specify the server API `RECAPTCHA_BYPASS` to bypass the authenication recaptcha.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:1234
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```
