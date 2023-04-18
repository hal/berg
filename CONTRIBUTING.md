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

- `berg` is responsible for launching [HAL standalone container](https://quay.io/halconsole/hal-development).

- `testsuite` is the main test package. Tests should be placed under `testsuite/cypress/e2e` folder. Test file name should include the tested UI part and test name in the `describe` method should include information on how to navigate to the tested resource.

- `commands` is the package where the WildFly CLI abstractions are being put. This package should also include just the operations, that are present in the `jboss-cli.sh` but are not available via REST API (commands such as `data-source add ...`, `module add ...`)

- `resources` package serves mostly to build Java deployments/JARs (such as JDBC drivers), basically anything related to the WildFly Java world.

## How to write tests

### Differentiate between NodeJS runtimes

When developing in Cypress, you need to understand two different JavaScript runtimes

- The one Cypress bundles into the browser under test
- System wide JavaScript

Since using TestContainers to launch containers shouldn't be bundled into browser under test, starting the WildFly container is being done using Cypress arbitrary Node code running handle - [`cy.task`](https://docs.cypress.io/api/commands/task), use

```
cy.startWildFlyContainer
```

method, which is a wrapper for

```
cy.task("start:wildfly:container")
```

to start the container. Note that despite starting the web server being marked as an anti-pattern, starting the WildFly server clean has its benefits in terms of a clean environment per test and also it introduces means for test parallelization (we know what we're doing :slightly_smiling_face:). This method/task also automatically sets the deployed HAL container endpoint in the `allowed-origins` attribute. Both of the approaches would return the management endpoint of the deployed WildFly instance.

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

### Test template

- To start developing tests, you can copy paste following example into your `packages/testsuite/cypress/e2e/test-to-be-added.cy.ts`.
- Added tests should be prefixed with "test-" followed by navigation crumbs of the tested UI area.
- When developing new tests, prefer to test viable minimum per test, e.g if a page has a vertical navigation list elements, test one of the element per test file.
- Currently, our GH actions are running test matrix nightly, where the tests are being grouped by regular expressions (see [`jobs.test_matrix.strategy.matrix.specs`](.github/workflows/scheduled-run-all-tests-workflow.yaml)). If you're developing a new test that would enhance mentioned test groups, make sure to edit GH workflows as well.

```typescript
// "describe" method is an equivalent of a TestClass
// Please keep the "TESTS:" in the "test class" name followed by
// navigation crumbs in the management console
describe("TESTS: Path => To => Tested => Resource", () => {
  const configurationFormId = "resource-form";

  let managementEndpoint: string;

  // Here we start our WildFly container prior to test execution
  before(() => {
    // Obtains WildFly management endpoint, that will be used
    // for backend data retrieval and validation
    // cy.startWildflyContainer also starts the WildFly container under
    // the name of the spec/test file, e.g in our case: test_to_be_added
    // This could be useful (however it shouldn't happen) when you want to see which test didn't stop the WildFly container (maybe the "after" hook failed for some reason)
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
    });
  });

  // Here we stop & remove started WildFly container and other containers
  // e.g postgres (see packages/testsuite/cypress/e2e/test-configuration-datasource-postgre-finder.cy.ts)
  after(() => {
    cy.task("stop:containers");
  });

  // "it" method is an equivalent of a @Test annotated method,
  // First argument is the name of the test, second is a lambda test function
  it("Edit default-extended-persistence-inheritance", () => {
    // Navigates to the UI page
    // http://localhost:<mapped_hal_port>?connect=http://localhost:<mapped_wildfly_port>#<token>
    cy.navigateTo(managementEndpoint, "token");
    // Clicks on the "Edit" button of the form to be edited
    cy.editForm(configurationFormId);
    // Fills in "sample" into the #resource-form-module-editing input
    cy.text(configurationFormId, "module", "sample");
    // Clicks on the "Save" button of the form
    cy.saveForm(configurationFormId);
    // Verifies a succesful notification has been displayed in the UI
    cy.verifySuccess();
    // Checks that /path=to/tested=resource:read-attribute(name=module)
    // returns "sample" and is succesful
    cy.verifyAttribute(managementEndpoint, ["path", "to", "tested", "resource"], "module", "sample");
  });
});
```
