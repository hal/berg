Cypress.Commands.add("skipIf", (expression: Cypress.Chainable<boolean>, context: Mocha.Context) => {
  expression.then((result) => {
    console.log(result);
    if (result) {
      context.skip.bind(context)();
    }
  });
});

Cypress.Commands.add("skipIfNot", (expression: Cypress.Chainable<boolean>, context: Mocha.Context) => {
  expression.then((result) => {
    console.log(result);
    if (!result) {
      context.skip.bind(context)();
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command which will skip a test or context based on a boolean expression returning true.
       *
       * You can call this command from anywhere, just make sure to pass in the the it, describe, or context block you wish to skip.
       * Note that when using this function, the surrounding test method must NOT be a lambda expression due to the
       * Mocha's lexical binding. See https://mochajs.org/#arrow-functions
       *
       * @category Testing utils
       * @param expression - The boolean expression to be checked
       * @param context - Mocha's test context
       * @example cy.skipIf(cy.isEAP(managementEndpoint), this);
       */
      skipIf(expression: Chainable<boolean>, context: Mocha.Context): void;

      /**
       * Custom command which will skip a test or context based on a boolean expression returning false.
       *
       * You can call this command from anywhere, just make sure to pass in the the it, describe, or context block you wish to skip.
       * Note that when using this function, the surrounding test method must NOT be a lambda expression due to the
       * Mocha's lexical binding. See https://mochajs.org/#arrow-functions
       *
       * @category Testing utils
       * @param expression - The boolean expression to be checked
       * @param context - Mocha's test context
       * @example cy.skipIf(cy.isEAP(managementEndpoint), this);
       */
      skipIfNot(expression: Chainable<boolean>, context: Mocha.Context): void;
    }
  }
}

export {};
