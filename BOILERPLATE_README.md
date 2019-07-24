# ember-boilerplate

| Section                                               | Description                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| [🎯 Objectives and context](#-objectives-and-context) | Project introduction and context                                |
| [🚧 Dependencies](#-dependencies)                     | Technical dependencies and how to install them                  |
| [🏎 Kickstart](#kickstart)                             | Details on how to kickstart development on the project          |
| [🏗 Code & architecture](#-code--architecture)         | Details on the application modules and technical specifications |
| [🔭 Possible improvements](#-possible-improvements)   | Possible code refactors, improvements and ideas                 |
| [🚑 Troubleshooting](#-troubleshooting)               | Recurring problems and proven solutions                         |
| [🚀 Deploy](#-deploy)                                 | Deployment details for various enviroments                      |

## 🎯 Objectives and context

…

### Browser support

| Browser | OS  | Constraint |
| ------- | --- | ---------- |
| …       | …   | …          |

## 🚧 Dependencies

- Node.js (`~> 10.15`)
- NPM (`~> 6.4`)

## 🏎 Kickstart

### Environment variables

All required environment variables are documented in [`.env.dev`](./.env.dev).

When running scripts or `npm` commands, it is important that these variables are present in the environment. You can use `source`, [`nv`](https://github.com/jcouture/nv) or any custom script to achieve this.

### Initial setup

1. Create `.env.dev.local` from empty values in [`.env.dev`](./.env.dev)
2. Install dependencies with `make dependencies`

### Run the application in development mode

To start a FastBoot-enabled development server:

```bash
$ npm run start
```

### Build the application for production

To create a production-ready build:

```bash
$ npm run build --prod
```

### Serve the application in production

To launch a “FastBoot-enabled production-ready server” with support for canonical host, SSL and `Basic` authentication, the following command can be executed _after_ a production build has been created:

```bash
$ npm run server
```

### Tests

Tests can be ran with the following script and do not need any environment variables as they should not create side effects (eg. they should not make any network calls, they should not read cookies, etc.)

```bash
$ make test
```

### Code coverage

Test coverage is enforced using configuration metrics defined in `.nycrc`. To check test coverage, this command can be ran **after tests have been ran**:

```bash
$ make check-code-coverage
```

Code instrumentation results are also available in the `coverage` directory.

### Linting & formatting

Several linting and formatting tools can be ran to ensure coding style consistency:

- `make lint-scripts` ensures TypeScript and JavaScript code follows our best practices
- `make lint-styles` ensures SCSS code follows our best practices
- `make lint-templates` ensures Handlebars code follows our best practices
- `make check-format` ensures all code is properly formatted
- `make format` formats files using Prettier

### Continuous integration

To ensure the project and its code are in a good state, tests and linting tools can be ran all at once:

```bash
$ ./scripts/ci-check.sh
```

## 🏗 Code & architecture

…

## 🔭 Possible improvements

| Description | Priority | Complexity | Ideas |
| ----------- | -------- | ---------- | ----- |
| …           | …        | …          | …     |

## 🚑 Troubleshooting

…

## 🚀 Deploy

### Versions & branches

Each deployment is made from a Git tag. The codebase version is managed with [`incr`](https://github.com/jcouture/incr).

### Container

A Docker image running a Fastboot-ready Node.js server can be created with `make build`, tested with `docker-compose up application` and pushed to a registry with `make push`.
