import * as cypress from "cypress";
import path from "path";

import { Berg } from "@berg/berg";

(async () => {
  const berg = await Berg.getInstance();
  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  await cypress.open({
    project: projectRoot,
    configFile: path.join(projectRoot, "cypress.config.ts"),
    env: {
      NETWORK_NAME: berg.getNetwork().getName(),
      HAL_CONTAINER_PORT: berg.getHalContainer().getMappedPort(9090),
    },
    config: {
      e2e: {
        baseUrl: `http://localhost:${berg.getHalContainer().getMappedPort(9090)}`,
      },
    },
  });
  await berg.stop();
})();