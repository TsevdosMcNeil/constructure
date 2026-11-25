# Constructure

A Statamic website for [Constructure](https://beta.constructure.tm-studio.co.uk/) based on the [Statamic Starter Kit](https://github.com/pablorica/statamic_starter_kit). It is containerized with Docker for consistent local development and easy deployment to any environment.

[![version](https://img.shields.io/badge/version-0.10.1-blue.svg)](https://semver.org)

---

## Production

[Not ready yet](https://beta.constructure.tm-studio.co.uk/)

## Staging Version

[https://beta.constructure.tm-studio.co.uk/](https://beta.constructure.tm-studio.co.uk/)

- login: constructure
- pwd: tmstudio

### Staging `public` folder

[https://beta.constructure.tm-studio.co.uk/public.tar.gz](https://beta.constructure.tm-studio.co.uk/public.tar.gz)

```bash
wget --user constructure --password tmstudio https://beta.constructure.tm-studio.co.uk/public.tar.gz
```

### Staging `content` folder

[https://beta.constructure.tm-studio.co.uk/content.tar.gz](https://beta.constructure.tm-studio.co.uk/content.tar.gz)

```bash
wget --user constructure --password tmstudio https://beta.constructure.tm-studio.co.uk/content.tar.gz
```

---

## Quick start

See [docs/DOCKER.md](docs/DOCKER.md) for the Docker setup, then:

```bash
cp .env.example .env   # set APP_URL, etc.
docker compose up -d

docker compose exec app composer install
docker compose exec app php please make:user
docker compose exec node npm ci && docker compose exec node npm run build
```

Full installation and deployment notes are in [docs/STATAMIC.md](docs/STATAMIC.md). If the build fails, check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

---

## Documentation

| File | Contents |
| ---- | -------- |
| [DOCKER.md](docs/DOCKER.md) | Docker installation and local containers |
| [STATAMIC.md](docs/STATAMIC.md) | Installation, repository strategy, collections, hierarchical taxonomies, custom modifiers, favicon, addons, cache commands |
| [TAILWIND.md](docs/TAILWIND.md) | Tailwind v4 configuration, `tailwind.site.js` and responsive breakpoints |
| [ALPINE.md](docs/ALPINE.md) | Alpine.js, adding JS libraries and `site.js` |
| [LIVEWIRE.md](docs/LIVEWIRE.md) | Livewire for Antlers: installation, components, bundling with Alpine, common errors |
| [INSTAGRAM.md](docs/INSTAGRAM.md) | Instagram feed addon and Meta access tokens |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Compilation errors (Vite) and other known issues |
| [IndicativeSizing.md](docs/IndicativeSizing.md) | The Indicative Sizing tool at `/sizing` |

---

## Indicative Sizing tool (`/sizing`)

A client-built, installable web app (PWA) for early-feasibility structural sizing. Visitors choose a material, structural system, span and load, and get an indicative depth range with a section sketch. It can email, copy or download the result, and works offline once loaded. It is indicative only, not a design.

Full documentation: [docs/IndicativeSizing.md](docs/IndicativeSizing.md)

---

## Acknowledgements

* [Statamic Starter Kit](https://github.com/pablorica/statamic_starter_kit)
* [Statamic Peak](https://statamic.com/starter-kits/studio1902/peak)

## Copyright and License

Copyright 2025 Constructure website released under the [MIT](https://github.com/TsevdosMcNeil/constructure/blob/main/LICENSE) license.

## Versioning

We use [SemVer](https://semver.org/) for versioning.

### Changelog

[CHANGELOG.md](CHANGELOG.md)
