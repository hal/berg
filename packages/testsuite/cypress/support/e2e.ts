// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./containers-utils";
import "./resource-utils";
import "./verification-utils";
import "./navigation";
import "./form-editing";
import "./test-utils";

import addContext from "mochawesome/addContext";

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on("uncaught:exception", (err, runnable) => {
  console.error(err);
  console.error(runnable);
  return false;
});

Cypress.on("test:after:run", (test, runnable) => {
  // Temporary workaround till https://github.com/cypress-io/cypress/issues/18415 is resolved
  if (Cypress.browser.family == "chromium") {
    const videoUrl = `assets/videos/${Cypress.spec.name}.mp4`;
    if (runnable.state === "failed") {
      addContext({ test } as unknown as Mocha.Context, videoUrl);
    }
  }
});
