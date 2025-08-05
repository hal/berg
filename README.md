# Berg

Berg is a test-suite for [HAL Management Console](https://github.com/hal/console) based on [Cypress](https://www.cypress.io) UI test automation. Berg as a name is heavily inspired by Gutenberg, inventor of printing press :) (printing press -> press -> Cypress).

# Technological Stack

## NodeJS

Node (https://nodejs.org/en/) is the JavaScript runtime engine used to run Berg, since Cypress is built only for JavaScript.

## Cypress

Cypress (https://www.cypress.io) is the main automation framework used for developing, running & reporting tests. Main benefit of Cypress is, that it is bundling the testing code directly into the system (browser) under testing. Since JavaScript is the main language used by modern browsers, the test execution is swift, stable and less environment error-prone as in standard (Selenium + WebDriver) UI automation tools.

## TestContainers

TestContainers (https://github.com/testcontainers/testcontainers-node) serves to launch & manage test scoped containers. Currently following containers are being used for testing:

- [Standalone HAL image](https://quay.io/repository/halconsole/hal) used for most of the UI testing. It is a standalone HAL binary delivered by a container image that will be connected to a running WildFly server (that exposes management interface)
- [WildFly Server Image](https://quay.io/repository/halconsole/wildfly) used for resource management. Exposes management interfaces onto which the Standalone HAL Image connects.
- DB Images (such as [postgres](https://hub.docker.com/_/postgres)) serving (mostly) to run DB instances, that are being used in the datasource related tests.

# Requirements

Following tools are required to run the test suite

- [NodeJS](https://nodejs.org/en/) as a runtime environment
  - recommended version is 16, in other versions you can get errors like `Unable to detect compiler type`
  - [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) is recommended optional tool to install & manage multiple Node environments
- [npx](https://github.com/npm/npx) CLI tool used to exeute binaries from project's `node_modules` directly (instead of providing absolute/relative path to the commannds). It is used in multiple build steps.
- [Podman](https://podman.io) | [Docker](https://www.docker.com) as a container runtime used by TestContainers. Note that when using Podman as container runtime you may need to export following environment variables and start podman socket:
  - `export TESTCONTAINERS_RYUK_DISABLED=true`
  - `export DOCKER_HOST=unix:///run/user/$UID/podman/podman.sock`
    - the path can be found by command `podman info --debug` and look for `path` in `remoteSocket` section.
  - `systemctl --user start podman.socket`
- Java. Yes we'll need Java to write deployments/applications that will be deployed onto the running WildFly container.
- [Maven](https://maven.apache.org). Yes, we'll need Maven to ease up the development of the deployed applications & downloading needed JDBC drivers for datasource & drivers UI tests. Maven is mostly used embedded by [node-maven](https://github.com/headcr4sh/node-maven) JS wrapper to execute Maven & Java related tasks into the build automation.

# How to build & run

- Make sure you have all the tools from [Requirements](#requirements) installed
- Run

```
npm install
```

in the root directory to download all of the NPM dependencies specified in `package.json`

- If you want to run Cypress developer console with the loaded spec files, run

```
npm run develop
```

- If you want to execute whole testsuite, navigate to `packages/testsuite` and from within that directory execute `npm test`
  - It is also possible to run on specific browser by supplying `--browser` argument, e.g
  ```
  npm test -- --browser=chrome
  ```
  - It is also possible to reduce the amount of specs executed by passing `--specs` flag. This flag must be relative to the `packages/testsuite` directory and supports glob patterns, e.g to execute only `ejb` related tests, run
  ```
  npm test -- --specs="cypress/e2e/ejb/*.cy.ts"
  ```
  - If you wish to run the test suite against custom HAL or WildFly images, you can use `HAL_IMAGE` and `WILDFLY_IMAGE` environment variables to specify custom images, e.g
  ```
  HAL_IMAGE=quay.io/myorg/hal WILDFLY_IMAGE=quay.io/myorg/wildfly npm test ...
  ```

- For debugging purposes videos (and screenshots) of failed tests are stored after the test run (works only with chrome).

## Available environment properties

Following is a table of supported environment properties that can be used when running the testsuite.

| Property name    | Default value                                   | Description                                                                                   |
| :--------------- | :---------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `HAL_IMAGE`      | `quay.io/halconsole/hal-development:latest`     | [HAL standalone image](https://hal.github.io/documentation/get-started/#container) to be used |
| `WILDFLY_IMAGE`  | `quay.io/halconsole/wildfly-development:latest` | WildFly/JBoss EAP image to be used                                                            |
| `KEYCLOAK_IMAGE` | `quay.io/keycloak/keycloak:latest`              | Keycloak/RH-SSO image to be used for OIDC tests                                               |
| `POSTGRES_IMAGE` | `docker.io/library/postgres:latest`             | PostgreSQL image to be used for datasource tests                                              |
| `MYSQL_IMAGE`    | `docker.io/library/mysql:latest`                | MySQL image to be used for datasource tests                                                   |
| `MARIADB_IMAGE`  | `docker.io/library/mariadb:latest`              | MariaDB image to be used for datasource tests                                                 |
| `MSSQL_IMAGE`    | `mcr.microsoft.com/mssql/server:2022-latest`    | Microsoft SQL Server image to be used for datasource tests                                    |

## Custom method documentation

Documentation can be generated by following command in root of this repository

```
npm run docs
```

# Contributing

See contributing guide: [CONTRIBUTING.md](CONTRIBUTING.md)
