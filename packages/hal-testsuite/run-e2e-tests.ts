import { Manatoko } from "@hal/manatoko";
import * as cypress from "cypress";
import commandLineArgs from "command-line-args";
import { OptionDefinition } from "command-line-args";

const optionDefinitions: OptionDefinition[] = [
  { name: "browser", alias: "b", type: String, defaultValue: "firefox" },
  {
    name: "specs",
    alias: "s",
    type: String,
    defaultValue: "cypress/e2e/**/*.cy.ts",
  },
];

(async () => {
  const options = commandLineArgs(optionDefinitions);
  console.log(options);
  const manatoko = await Manatoko.getInstance();
  await cypress.run({
    browser: options.browser as string,
    env: {
      NETWORK_NAME: manatoko.getNetwork().getName(),
      HAL_CONTAINER_PORT: manatoko.getHalContainer().getMappedPort(9090),
    },
    config: {
      e2e: {
        baseUrl: `http://localhost:${manatoko
          .getHalContainer()
          .getMappedPort(9090)}`,
        specPattern: `${options.specs as string}`,
      },
    },
  });
  await manatoko.stop();
})();
