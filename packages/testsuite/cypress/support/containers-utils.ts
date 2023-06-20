Cypress.Commands.add("startWildflyContainer", () => {
  return cy.task(
    "start:wildfly:container",
    {
      name: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
    },
    { timeout: 240_000 }
  );
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
       * Start a Wildfly container. This typical command which needs to executed in before method in every TC.
       * @category Containers util
       */
      startWildflyContainer(): Chainable<unknown>;
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
