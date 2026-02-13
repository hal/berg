import { Berg } from "@berg/berg";
import * as cypress from "cypress";
import commandLineArgs from "command-line-args";
import { OptionDefinition } from "command-line-args";
import path from "path";

const optionDefinitions: OptionDefinition[] = [
  { name: "browser", type: String, defaultValue: "chrome" },
  {
    name: "specs",
    type: String,
    defaultValue: "packages/testsuite/cypress/e2e/**/*.cy.ts",
  },
  { name: "headed", type: Boolean, defaultValue: false },
];

(async () => {
  const options = commandLineArgs(optionDefinitions);
  console.log(options);
  const berg = await Berg.getInstance();
  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  const testRunResult = await cypress.run({
    browser: options.browser as string,
    headed: options.headed as boolean,
    project: projectRoot,
    configFile: path.join(projectRoot, "cypress.config.ts"),
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
  if ("status" in testRunResult && testRunResult.status === "failed") {
    process.exit(1);
  }
  if ("totalFailed" in testRunResult && testRunResult.totalFailed > 0) {
    process.exit(1);
  }
})();
