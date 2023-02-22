# Contributing to Berg

:thumbsup: :tada: Thank you for taking your time to contribute. The main goal of Berg is to have an automated UI test suite for [HAL](https://hal.github.io) a.k.a webconsole for [WildFly Application Server](https://wildfly.org/). Berg is a test suite, that is driven by [Cypress](https://www.cypress.io) framework. Yes, we are integrating the world of dynamically-typed language (JavaScript) into the beatiful statically-typed world of Java. With the use help of TypeScript, we are tried to bridge these two worlds as close as possible. With that in mind, we/me/the author is definitely a wizard in JavaScript/TypeScript world and is definitely welcoming contributions of all kinds to this project :blush:.

## Things to know before you start contributing


### Packages overview

```
├── packages
|   ├── berg
|   ├── commands
|   ├── resources
|   ├── testsuite
```

* `berg` is responsible for launching [HAL standalone container](quay.io/halconsole/hal-development).

* `testsuite` is the main test package. Tests should be placed under `testsuite/cypress/e2e` folder. Test file name should include the tested UI part and test name in the `describe` method should include information on how to navigate to the tested resource.

* `commands` is the package where the WildFly CLI abstractions are being put. This package should also include just the operations, that are present in the `jboss-cli.sh` but are not available via REST API (commands such as `data-source add ...`, `module add ...`)

* `resources` package serves mostly to build Java deployments/JARs (such as JDBC drivers), basically anything related to the WildFly Java world.

## How to write tests

### Differentiate between NodeJS runtimes

When developing in Cypress, you need to understand two different JavaScript runtimes

* The one Cypress bundles into the browser under test
* System wide JavaScript

Since using TestContainers to launch containers shouldn't be bundled into browser under test, starting the WildFly container is being done using Cypress arbitrary Node code running handle - [`cy.task`](https://docs.cypress.io/api/commands/task), use 
```
cy.startWildFlyContainer
```
method, which is a wrapper for
```
cy.task("start:wildfly:container")
```
to start the container. This method/task also automatically sets the deployed HAL container endpoint in the `allowed-origins` attribute. Both of the approaches would return the management endpoint of the deployed WildFly instance.

### Communicating with WildFly management interface

Communication with the WildFly management interface is also being done using Cypress task, `execute:cli` to be precise. A better example of running `/system-property=to-add:add(value=myVal)` in JBoss CLI in Berg using `cy.task`
would be 
```
cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "add",
      address: ["system-property", "to-add"],
      value: "myVal"
    });
```