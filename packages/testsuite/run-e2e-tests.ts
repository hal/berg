import { Berg } from "@berg/berg";
import * as cypress from "cypress";
import commandLineArgs from "command-line-args";
import { OptionDefinition } from "command-line-args";

const optionDefinitions: OptionDefinition[] = [
  { name: "browser", type: String, defaultValue: "firefox" },
  {
    name: "specs",
    type: String,
    defaultValue: "cypress/e2e/**/*.cy.ts",
  },
];

(async () => {
  const options = commandLineArgs(optionDefinitions);
  console.log(options);
  const berg = await Berg.getInstance();
  const testRunResult = await cypress.run({
    browser: options.browser as string,
    env: {
      NETWORK_NAME: berg.getNetwork().getName(),
      HAL_CONTAINER_PORT: berg.getHalContainer().getMappedPort(9090),
    },
    config: {
      e2e: {
        baseUrl: `http://localhost:${berg.getHalContainer().getMappedPort(9090)}`,
        specPattern: (options.specs as string).split(","),
      },
    },
  });
  await berg.stop();
  if (testRunResult.status == "failed" || testRunResult.totalFailed > 0) {
    process.exit(1);
  }
})();
