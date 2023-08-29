Cypress.Commands.add("startWildflyContainer", (options = { useNetworkHostMode: false }) => {
  return cy.task(
    "start:wildfly:container",
    {
      name: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
      configuration: "standalone-insecure.xml",
      useNetworkHostMode: options.useNetworkHostMode,
    },
    { timeout: 240_000 }
  );
});

Cypress.Commands.add("startWildflyContainerSecured", () => {
  return cy.task(
    "start:wildfly:container",
    {
      name: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
      configuration: "standalone.xml",
      useNetworkHostMode: true,
    },
    { timeout: 240_000 }
  );
});

Cypress.Commands.add("startKeycloakContainer", () => {
  return cy.task("start:keycloak:container", {
    name: `keycloak_${Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_")}`,
  });
});

Cypress.Commands.add("executeInWildflyContainer", (command) => {
  return cy.task("execute:in:container", {
    containerName: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
    command: command,
  });
});

export {};
/* eslint @typescript-eslint/no-namespace: off */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Start a Wildfly container. This command is executed in before method in most of the test cases/specifications.
       * Unsecured management interface is used and web console doesn't require any authentication.
       *
       * @category Containers util
       */
      startWildflyContainer(options?: { useNetworkHostMode?: boolean }): Chainable<unknown>;
      /**
       * Start a Wildfly container wich is secured. This is not for a common use.
       *
       * This container is using standard "standalone.xml" and have a secured management interface. The container is
       * running in network mode "host". To enable communication between browser (not in container),
       * application server (in container), and Keycloak (in container). Those need to use the same network
       * and consistent host names. This mean the WildFly looks like it is started directly on the host machine.
       * A random port offset is used to avoid conflicts.
       *
       * The promise returns WildFly management URL, for example "http://localhost:9990/management".
       *
       * @category Containers util
       *
       */
      startWildflyContainerSecured(): Chainable<unknown>;
      /**
       * Start a Keycloak container. This command typically needs to be executed in `before` method of a test spec.
       *
       * The container network mode is set to host to enable communication between browser (not in container),
       * application server (in container), and Keycloak (in container). Those need to use the same network and
       * consistent host names.
       *
       * how to get generated file with users and roles?
       * 1) import existing file into standalone version
       *    ./kc.sh import --file ~/path/to/your/berg/packages/testsuite/cypress/fixtures/realm-configuration.json
       * 2) update configuration in Keycloak and stop server
       * 3) export new configuration by following command
       *    ./bin/kc.sh export --realm wildfly-infra --users realm_file --file /path/to/your/file.json
       *
       * @category Containers util
       */
      startKeycloakContainer(): Chainable<unknown>;
      /**
       * Execute CLI command in wildfly.
       * @category Containers util
       *
       * @param command - Can write exact CLI command or use builders. See:
       * <ul>
       *   <li> {@link commands/src/add-data-source!} </li>
       *   <li> {@link commands/src/add-module!} </li>
       *   <li> {@link commands/src/add-xa-data-source!} </li>
       * </ul>
       */
      executeInWildflyContainer(command: string): Chainable<unknown>;
    }
  }
}
