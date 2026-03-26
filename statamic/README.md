# Constructure

A Statamic website for **[Constructure](http://constructure.codigo.co.uk/)**
 
based in [Statamic Starter Kit](https://github.com/pablorica/statamic_starter_kit) 


[![version](https://img.shields.io/badge/version-0.5.3-blue.svg)](https://semver.org)


## Staging version

[http://constructure.codigo.co.uk/](http://constructure.codigo.co.uk/) 

- login:    constructure
- password: constructureqa

### Public and content folders

- [http://constructure.codigo.co.uk/content.last.tar.gz](http://constructure.codigo.co.uk/content.last.tar.gz)

- [http://constructure.codigo.co.uk/public.last.tar.gz](http://constructure.codigo.co.uk/public.last.tar.gz)


## Installation instructions

1. run `composer install`
2. run `npm install`
3. Create supersuser
	- run `php please make:user` and follow the instructions
4.  `npm run watch` or `npm run dev` to start the development server

## Compilation errors

### Vite Errors

#### Cannot read properties

If there is a Vite Error when running
```bash
➜  npm run build

> build
> vite build

failed to load config from /data/webs/artform.localhost/vite.config.js
error during build:
TypeError: Cannot read properties of undefined (reading 'startsWith')
```

**Solution**

It can be due a wrong value in .env
`APP_URL="http://wrongsite.co.uk"`

Or a wrog hot file in public, in that case delete it
```bash
rm public/hot
```

#### getaddrinfo ENOTFOUND

```bash
error when starting dev server:
Error: getaddrinfo ENOTFOUND <local-url.localhost>
at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:69:26)
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**Solution**

Vite does not recognize "localhost" (or the local server name you are using)

You need to first bind that host to 127.0.0.1 or the public IP of your own machine in `/etc/hosts`.


### Valet Error

```bash
➜ npm run watch

> watch
> vite

error when starting dev server:
Error: Unable to find Valet certificate files for your host [artform.localhost]. Ensure you have run "valet secure".
```

**Solution**

This is becasue the local server has a SSL certificate not recognizable by Laravel. Probably the server is managed by MAMP and Laravel was expecting Valet.

In that case simply remove the SSL from youyr local server and use HTTP instead of HTTPS.

## Site errors

### 403 Forbidden

The home page is not loading and the error is 403 Forbidden. 
Check that the swerver configuration is pointing to the correct folder: `public` 

## Additional commands

### Clear cache and static files

```bash
php please stache:clear
php please static:clear
php please cache:clear
php artisan cache:clear
```
Reference to [Statamic Cache](https://statamic.dev/static-caching#by-force)

## Environment file contents (*.env* file)

### Local

Dump your .env values here with sensitive data removed. The following is a local example that uses file caching:

```env
APP_NAME="Constructure"
APP_ENV=local
APP_KEY="base64:XORaj66Nw/Ikq7MdCVXKWKn10JRxRfyn8ZvFitH9B+s="
APP_DEBUG=true
APP_URL="http://constructure.localhost"

DEBUGBAR_ENABLED=false

LOG_CHANNEL=stack

BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_DATABASE=
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=0.0.0.0
MAIL_PORT=1025
MAIL_USERNAME=testuser
MAIL_PASSWORD=testpwd
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=null
MAIL_FROM_NAME="${APP_NAME}"

IMAGE_MANIPULATION_DRIVER=imagick

STATAMIC_LICENSE_KEY=
STATAMIC_THEME=business

STATAMIC_API_ENABLED=true
STATAMIC_REVISIONS_ENABLED=false

STATAMIC_GIT_ENABLED=false
STATAMIC_GIT_PUSH=false
STATAMIC_GIT_DISPATCH_DELAY=5

SAVE_CACHED_IMAGES=true
STATAMIC_CACHE_TAGS_ENABLED=false
STATAMIC_STACHE_WATCHER=true
STATAMIC_STATIC_CACHING_STRATEGY=null

#STATAMIC_CUSTOM_CMS_NAME=
#STATAMIC_CUSTOM_LOGO_OUTSIDE_URL=
STATAMIC_CUSTOM_LOGO_OUTSIDE_URL="/visuals/constructure-logo.svg"
#STATAMIC_CUSTOM_FAVICON_URL=
#STATAMIC_CUSTOM_CSS_URL=
```

### Production

Dump your .env values here with sensitive data removed. The following is a production example that uses full static caching:

```env
APP_NAME="Constructure"
APP_ENV=production
APP_KEY="base64:XORaj66Nw/Ikq7MdCVXKWKn10JRxRfyn8ZvFitH9B+s="
APP_DEBUG=false
APP_URL="https://constructure.co.uk/"

DEBUGBAR_ENABLED=false

LOG_CHANNEL=stack

BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=redis
SESSION_DRIVER=file
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_DATABASE=
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"

IMAGE_MANIPULATION_DRIVER=imagick

STATAMIC_LICENSE_KEY=
STATAMIC_THEME=business

STATAMIC_API_ENABLED=false
STATAMIC_REVISIONS_ENABLED=false

STATAMIC_GIT_ENABLED=true
STATAMIC_GIT_PUSH=true
STATAMIC_GIT_DISPATCH_DELAY=5

STATAMIC_STATIC_CACHING_STRATEGY=full
SAVE_CACHED_IMAGES=false
STATAMIC_STACHE_WATCHER=false
STATAMIC_CACHE_TAGS_ENABLED=true

#STATAMIC_CUSTOM_CMS_NAME=
STATAMIC_CUSTOM_LOGO_OUTSIDE_URL="/visuals/constructure-logo.svg"
#STATAMIC_CUSTOM_LOGO_NAV_URL=
#STATAMIC_CUSTOM_FAVICON_URL=
#STATAMIC_CUSTOM_CSS_URL=
```

## NGINX config

If you have a NGINX server, use these instructions for the configuration file

Add the following to your NGINX config __inside the server block__ to enable static resource caching:
```
expires $expires;
```

And this __outside the server block__:
```
map $sent_http_content_type $expires {
	default off;
	text/css max;
	~image/ max;
	application/javascript max;
	application/octet-stream max;

}
```

## Updating Statamic

[UPDATING.md](https://github.com/pablorica/constructure/blob/main/UPDATING.md)

## Acknowledgements

* [Statamic Starter Kit](https://github.com/pablorica/statamic_starter_kit)

## Copyright and License

Copyright 2024 Constructure website released under the [MIT](https://github.com/pablorica/constructure/blob/main/LICENSE) license.

## Versioning

We use [SemVer](https://semver.org/) for versioning.

### Changelog

[CHANGELOG.md](https://github.com/pablorica/constructure/blob/main/CHANGELOG.md)
