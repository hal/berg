import { Berg } from "@berg/berg";
import cypress from "cypress";
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

() => {
  const options = commandLineArgs(optionDefinitions);
  console.log("Processing the run-e2e-test.ts");
  console.log(options);
  Berg.getInstance()
    .then((berg) => {
      cypress
        .run({
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
        })
        .then((testRunResult) => {
          berg
            .stop()
            .then(() => {
              console.log(testRunResult);
              process.exit(1);
            })
            .catch((exception) => {
              console.log(exception);
            });
        })
        .catch((exception) => {
          console.log(exception);
        });
    })
    .catch((exception) => {
      console.log(exception);
    });
};
