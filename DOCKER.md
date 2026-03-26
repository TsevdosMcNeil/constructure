# Statamic (Laravel) – Docker Setup (no DB)


## 1) Prerequisites
- Docker Desktop or Docker Engine + Compose v2
- Git

> Place these files at the root of your Statamic/Laravel project (where `artisan` lives).

---

## 2) Project structure
```
.
├─ php/
│   ├─ Dockerfile
│   └─ conf.d/
│      ├─ custom.ini
│      └─ opcache.ini
├─ Caddyfile
├─ docker-compose.yml
├─ .env
└─ statamic (your Statamic app files: artisan, composer.json, public/, etc.)
```

---

## 3) `docker-compose.yml`
```yaml
# docker-compose.yml
services:
  node:
    image: node:25-alpine
    ports:
      - "${NODE_PORT:-5173}:${NODE_PORT:-5173}"
    build:
      context: ./docker/node # build a custom Node image to match your host's UID/GID (optional, but helps with file permissions)
    container_name: ${NODE_CONTAINER:-statamic_node}  # optional: name your container for easier access, this is called in Caddyfile
    working_dir: /var/www/html
    volumes:
      - ./statamic:/var/www/html     # or ./ if your app lives at the root
    # entrypoint: ["sh", "-c"] # override the default node image entrypoint to allow custom commands
    command: ["tail", "-f", "/dev/null"]   # keep the container running (so we can use docker compose exec isntead of docker compose run )
    extra_hosts:
    - "${STATAMIC_HOST}:host-gateway"  # <-- let the container resolve your host's DNS name to the host's IP address, useful for Caddy to proxy to Node
    # optional: run as your host user to avoid root-owned files
    # user: "${UID:-1000}:${GID:-1000}"
  statamic:
    build:
      context: ./docker/php
      dockerfile: Dockerfile
      #args:
      #  UID: ${UID:-1000}
      #  GID: ${GID:-1000}
    container_name: ${STATAMIC_CONTAINER:-statamic_app} # optional: name your container for easier access, this is called in Caddyfile
    working_dir: /var/www/html
    volumes:
      - ./statamic:/var/www/html
      - composer_cache:/tmp/composer
    environment:
      PHP_OPCACHE_VALIDATE_TIMESTAMPS: "1"
    # depends_on:
    #   - redis

  caddy:
    image: caddy:2
    # container_name: statamic_caddy
    ports:
      # - "8080:80"      # optional HTTP
      #- "${STATAMIC_SSL_PORT}:443"    # host:container, HTTPS matches your Caddyfile (:8446)
      - "${STATAMIC_SSL_PORT}:${STATAMIC_SSL_PORT}"   # HTTPS on custom port, it should match the Caddyfile port 
    volumes:
      - ./statamic:/var/www/html:ro # needed for  this line in Caddyfile: root * /var/www/html/public (to serve static assets and read the index.php file, set to read-only for security)
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./certs:/etc/caddy/certs:ro
    depends_on:
      - statamic

  # redis:
  #   image: redis:7-alpine
  #   container_name: statamic_redis
  #   ports:
  #     - "6380:6379"
volumes:
  composer_cache:
```

---

## 4) `php/Dockerfile`
```dockerfile
# docker/php/Dockerfile
FROM php:8.4-fpm

# System deps
RUN apt-get update && apt-get install -y \
    git curl zip unzip tzdata bash \
    libonig-dev libicu-dev \
    libpng-dev libjpeg62-turbo-dev libwebp-dev libfreetype6-dev \
    libzip-dev \
 && rm -rf /var/lib/apt/lists/*
 
# ---- PHP extensions commonly required by Statamic/Laravel ---- #
# gd (image manipulation), intl (i18n), mbstring, zip, exif, opcache, bcmath (often handy)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
  && docker-php-ext-install -j"$(nproc)" gd intl mbstring zip exif opcache bcmath

# (Optional) Imagick — comment these if you don’t need it to keep image small
# RUN apk add --no-cache imagemagick imagemagick-dev \
#   && pecl install imagick \
#   && docker-php-ext-enable imagick

# Composer
ENV COMPOSER_HOME=/tmp/composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# PHP ini
COPY conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY conf.d/custom.ini  /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/html

# (Optional) simple healthcheck: ensure FPM listens
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD php -r 'echo "OK";' || exit 1

CMD ["php-fpm"]
```

---

## 5) PHP ini tweaks

### `php/conf.d/custom.ini`
```ini
memory_limit=512M
post_max_size=50M
upload_max_filesize=50M
max_execution_time=120
date.timezone=UTC
```

### `php/conf.d/opcache.ini`
```ini
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=${PHP_OPCACHE_VALIDATE_TIMESTAMPS}
```

---

## 6) Caddyfile

### `Caddyfile`
```caddy
{
	log {
		level DEBUG
	}
}

https://constructure.localhost:8454 {
  tls /etc/caddy/certs/constructure.localhost.pem /etc/caddy/certs/constructure.localhost-key.pem
  root * /var/www/html/public
  encode zstd gzip

  # Vite HMR + internal module paths
  @vite {
    path /@vite/*
    path /@id/*
    path /@fs/*
    path /resources/*
    path /node_modules/*
  }
  reverse_proxy @vite node_constructure:5174

  php_fastcgi statamic_constructure:9000
  file_server
}
```

---

## 7) `.env` essentials
```env
STATAMIC_CONTAINER=statamic_constructure
STATAMIC_SSL_PORT=8454
STATAMIC_HOST=constructure.localhost

NODE_CONTAINER=node_constructure
NODE_PORT=5174 # 5173 default


LOG_CHANNEL=stack
LOG_LEVEL=debug

CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# REDIS_HOST=redis
# REDIS_PASSWORD=null
# REDIS_PORT=6379

# UID=501
# GID=1000
```

---

## 8) (Optional)  Set user, match container UID/GID to your host

On your host, get your IDs:

```bash
id -u  #---> 501
id -g  #---> 20 we cannot use 20 becasue it has conflicts with Alpine (inside Alpine, GID 20 already exists)
```

Put them in your Compose .env (the file next to docker-compose.yml, not Laravel’s .env):

```bash
UID=<your uid>
GID=1000
```

Rebuild and up (if the appp has been already built):

```bash
docker compose down
docker compose build --no-cache app
docker compose up -d
```

Now the app user inside the container matches your host user and can write to the project.

```bash
id -u
```

## 9) First run
```bash
docker compose up -d --build
```

### Install Statamic

```bash
docker compose exec app composer create-project statamic/statamic statamic
```

#### Create /statamic/.env

```bash
APP_NAME="Constructure"
APP_ENV=local
APP_KEY=****
APP_DEBUG=true
APP_URL=URL

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

STATAMIC_API_ENABLED=false
STATAMIC_REVISIONS_ENABLED=false

STATAMIC_GIT_ENABLED=false
STATAMIC_GIT_PUSH=false
STATAMIC_GIT_DISPATCH_DELAY=5

SAVE_CACHED_IMAGES=false
STATAMIC_CACHE_TAGS_ENABLED=false
STATAMIC_STACHE_WATCHER=true
STATAMIC_STATIC_CACHING_STRATEGY=null

#STATAMIC_CUSTOM_CMS_NAME=
#STATAMIC_CUSTOM_LOGO_NAV_URL=
STATAMIC_CUSTOM_LOGO_OUTSIDE_URL="/visuals/constructure-logo.svg"
#STATAMIC_CUSTOM_FAVICON_URL=
#STATAMIC_CUSTOM_CSS_URL=


NODE_PORT=5174 # 5173 default
```

#### Check Node and npm are installed and working

```bash
# Check Node is there
docker compose exec node node -v
docker compose exec node npm -v

# Install/update packages (run in the container that has Node)
docker compose exec node npm install
docker compose exec node npm update

# Dev server (Vite)
docker compose exec node npm run dev -- --host

# Production build
docker compose exec node npm run build
```

If you have issues runnig those commands, Run a one-off install in the node image (no need for the service to be running):
```bash
# from the repo root where your compose file is
docker compose run --rm -w /var/www/html node npm install
```


#### Udpate vite.config.js

```javascript
import laravel from 'laravel-vite-plugin'
import { defineConfig, loadEnv } from 'vite'
import { networkInterfaces } from 'os'
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

/** @type {import('vite').UserConfig} */
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ip = Object.values(networkInterfaces()).flat().find((i) => i.family == 'IPv4' && !i.internal)?.address
  const isSecuredSite = env.APP_URL.startsWith('https://')
  const url = env.APP_URL
  const urlObj = new URL(url)
  const hostname = urlObj.hostname
  const useBrowserSync = env.VITE_BROWSERSYNC && ip

  console.log('The URL is ', url);
  console.log('The host is ', hostname);
  console.log('isSecuredSite? ', isSecuredSite);

  if (useBrowserSync && isSecuredSite) {
    console.log('\x1b[31m%s\x1b[0m', 'Sorry, we didn\'t manage to get BrowserSync working with secured sites.');
    console.log('\x1b[31m%s\x1b[0m', 'If you can provide a solution, please enlighten us (https://github.com/studio1902/statamic-peak/pulls).');
    process.exit(1)
  }

  return {
    plugins: [
      laravel({
        refresh: true,
        detectTls: isSecuredSite ? hostname : false,
        input: [
          'resources/css/site.css',
          'resources/js/site.js',
        ]
      }),
      (() => {
        return useBrowserSync ? VitePluginBrowserSync({
          bs: {
            proxy: url,
            notify: false,
            open: 'external',
          },
        }) : null;
      })()
    ],
    server: {
      host: '0.0.0.0',
      port: env.NODE_PORT,
      strictPort: true,
      hmr: {
        host: hostname,
      },
      open: false,
    }
  }
});

```



#### Compile files

```bash
docker compose exec app composer update
docker compose exec node npm update

## Delete public/hot and fluch caches
docker compose exec app php please stache:clear
docker compose exec app php please static:clear
docker compose exec app php please cache:clear
docker compose exec app php artisan cache:clear

docker compose exec node npm run dev
```




Open: **https://constructure.localhost:8454** 

To install Statamic if not already done:
```bash
docker compose exec app php artisan statamic:install
```

---

## 10) Troubleshooting & Common errors

- **Permission errors**: ensure UID/GID mapping matches your host.
- **Vite not connecting**: ensure the node service runs with `--host`.
- **TLS errors**: trust Caddy’s local CA or use plain HTTP only.

### Error when opening https://constructure.localhost:8446 in a browser: 

```bash
Unable to connect Firefox can’t establish a connection to the server at constructure.localhost:8446.
```

This looks like Caddy isn’t actually listening on :8446 (or the container isn’t up). Let’s zero in and fix it fast.

1) Confirm Caddy is running and listening on 8446

```bash
docker compose logs --no-color caddy

statamic_caddy  | Error: loading initial config: loading new config: loading tls app module: provision tls: loading certificates: open /etc/caddy/certs/constructure.localhost.pem: no such file or directory

```

This means the folder `/etc/caddy/certs` is not defined in `docker-compose.yml`

```yaml
  caddy:
    image: caddy:2-alpine
    container_name: statamic_caddy
    ports:
      - "8080:80"      # optional HTTP
      - "8446:8446"    # HTTPS matches your Caddyfile (:8446)
    volumes:
      - ./statamic:/var/www/html:ro
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
      - ./certs:/etc/caddy/certs:ro
    depends_on:
      - app

```

Update `docker-compose.yml` and reload the app
```bash
cd ~/Dockers/constructure
docker compose up -d --force-recreate
```

Quick tests
```bash
# Caddy is serving on the right port
➜  docker ps --format "table {{.Names}}\t{{.Ports}}" | grep statamic_caddy
statamic_caddy               0.0.0.0:8446->8446/tcp, [::]:8446->8446/tcp, 0.0.0.0:8080->80/tcp, [::]:8080->80/tcp
➜  
```
```bash
# Caddy can read the certs
➜  docker compose exec caddy ls -l /etc/caddy/certs
total 8
-rw-------    1 root     root          1708 Oct 13 17:16 constructure.localhost-key.pem
-rw-r--r--    1 root     root          1554 Oct 13 17:16 constructure.localhost.pem
```
```bash
# TLS handshake + SNI to the right host
➜  openssl s_client -connect 127.0.0.1:8446 -servername constructure.localhost -brief </dev/null | head -n 10

depth=0 O = mkcert development certificate, OU = pablo@iMac.local (Pablo Rica)
verify error:num=20:unable to get local issuer certificate
depth=0 O = mkcert development certificate, OU = pablo@iMac.local (Pablo Rica)
verify error:num=21:unable to verify the first certificate
CONNECTION ESTABLISHED
Protocol version: TLSv1.3
Ciphersuite: TLS_AES_128_GCM_SHA256
Peer certificate: O = mkcert development certificate, OU = pablo@iMac.local (Pablo Rica)
Hash used: SHA256
Signature type: RSA-PSS
Verification error: unable to verify the first certificate
Server Temp Key: X25519, 253 bits
DONE
```
```bash
# App responds
curl -vk https://constructure.localhost:8446/ -H 'Host: constructure.localhost'
curl -vk --resolve constructure.localhost:8446:127.0.0.1 https://constructure.localhost:8446/

```

### Caddy errors

If there are changes on the Caddyfile we need to reload them using

```bash
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile             
```
But sometimes can be errors
```bash
2025/10/13 21:01:21.129 INFO    using config from file  {"file": "/etc/caddy/Caddyfile"}
2025/10/13 21:01:21.148 INFO    adapted config to JSON  {"adapter": "caddyfile"}
2025/10/13 21:01:21.148 WARN    Caddyfile input is not formatted; run 'caddy fmt --overwrite' to fix inconsistencies    {"adapter": "caddyfile", "file": "/etc/caddy/Caddyfile", "line": 2}
```
To fix that format the file:
```bash
# On your host, from the folder with Caddyfile
docker run --rm -v "$PWD/Caddyfile":/Caddyfile caddy:2-alpine \
  caddy fmt --overwrite /Caddyfile
# then reload (inside container):
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 11) Common tasks

 - Quick Start

```bash
cd ~/Dockers/constructure
docker compose up -d
```

- Quick reload after big changes
```bash
cd ~/Dockers/constructure
docker compose up -d --force-recreate
```

Delete hot file
```bash
docker compose exec app rm -f public/hot
```

Add watcher without websockets
```bash
docker compose run --rm -w /var/www/html node sh -lc "npm ci && npm run build -- --watch"
```


Composer
```bash
# Install
docker compose exec app composer install
```


Node
```bash
# Start/stop node
docker compose start node

# Get version
docker compose exec node node -v    # v22.12.0
docker compose exec node npm -v     # v10.9.0 (bundled with that Node)

#Install
docker compose exec node npm ci

# Address installation issues
docker compose exec node npm audit fix

# Compile
docker compose exec node npm run build
docker compose exec node npm run dev -- --host --strictPort --port 5173

# Restart node after changes in docker-compose.yml or Dockerfile or package.json
docker compose down
docker compose pull node
docker compose up -d node
```

Php please
```bash
docker compose exec app php please make:user
```


Cache
```bash
docker compose exec app php please stache:clear
docker compose exec app php please static:clear
docker compose exec app php please cache:clear
docker compose exec app php artisan cache:clear

docker compose exec app php artisan config:clear
docker compose exec app php artisan optimize:clear
docker compose exec app php please stache:refresh
docker compose exec app php artisan config:cache
```

Vite

```bash
# Inside node: verify Vite is listening on 0.0.0.0:5173
docker compose exec node sh -lc 'ss -lntp | grep 5173 || netstat -lnt | grep 5173 || true'
```


Caddy
```bash
# Logs
docker compose logs -f --no-color caddy

# Inside caddy: fetch Vite client with correct Host header (should be 200, not 403)
docker compose exec caddy sh -lc 'curl -I http://statamic_node:5173/@vite/client -H "Host: constructure.localhost"'

#Apply changes
docker run --rm -v "$PWD/Caddyfile":/Caddyfile caddy:2-alpine \
  caddy fmt --overwrite /Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

```


### Statamic Commands**

```bash
docker compose exec app composer require vendor/package
docker compose exec app php artisan cache:clear
docker compose exec app php artisan tinker
docker compose exec app php artisan test
```

**Flush cache**

```bash
docker compose exec app php please cache:clear
docker compose exec app php please stache:clear
docker compose exec app php please static:clear
docker compose exec app php artisan cache:clear
```

**Create new App Tag**

```bash
docker compose exec app php please make:tag Foo
```


### Difference between **`docker compose exec`** and **`docker compose run`** — they *sound* similar but behave very differently.


### **`docker compose exec`**

**Use it to run a command *inside an already-running* container.**

#### Key points:

* The target service **must already be running**.
* Executes the command **inside the existing container instance**.
* Shares the same filesystem, network, environment, and state.
* Great for debugging or interacting with long-running services.

#### Examples:

```bash
docker compose exec web sh
```

→ Open a shell **inside the running `web` container**.

```bash
docker compose exec db psql -U postgres
```

→ Run `psql` inside the running database container.


### **`docker compose run`**

**Use it to start a *new, one-off container* for a service.**

#### Key points:

* The service does **NOT** need to already be running.
* Creates a **new container** based on the service’s image and config.
* Does **NOT** run the service’s long-running command (unless you specify `--entrypoint`).
* Does **not** automatically remove the new container unless `--rm` is used.
* Useful for tasks like database migrations, CLI jobs, utilities, etc.

#### Examples:

```bash
docker compose run --rm web sh
```

→ Start a **new container** for `web` with a shell, then remove it afterward.

```bash
docker compose run worker python script.py
```

→ Run a batch/worker job in an isolated container.



### **Quick comparison**

| Feature                                     | `docker compose exec` | `docker compose run` |
| ------------------------------------------- | --------------------- | -------------------- |
| Works only if service is running?           | ✅ Yes                 | ❌ No                 |
| Creates a new container?                    | ❌ No                  | ✅ Yes                |
| Runs inside existing environment and state? | ✅ Yes                 | ❌ New environment    |
| Good for debugging running services?        | ✅ Yes                 | ❌ Not ideal          |
| Good for one-off commands?                  | ⚠️ Maybe              | ✅ Yes                |



### When to use which?

#### Use **`exec`** when:

* You need to inspect a live container.
* You want to run commands that rely on the current running service state.
* You want to open a shell inside a running service.

#### Use **`run`** when:

* You need a temporary container for a job.
* You want to run a service’s image without starting the whole stack.
* You need to override the command/entrypoint for a one-time task.



---

## 12) Production notes
- Use `APP_ENV=production`, `APP_DEBUG=false`.
- Run `npm run build` and serve static assets via Caddy with caching.
- Use external Redis if required.
- Add backups for `storage/`.



---



