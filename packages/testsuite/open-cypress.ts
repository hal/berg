import * as cypress from "cypress";

import { Berg } from "@berg/berg";

(async () => {
  const berg = await Berg.getInstance();
  await cypress.open({
    env: {
      NETWORK_NAME: berg.getNetwork().getName(),
      HAL_CONTAINER_PORT: berg.getHalContainer().getMappedPort(9090),
    },
    config: {
      e2e: {
        baseUrl: `http://localhost:${berg
          .getHalContainer()
          .getMappedPort(9090)}`,
      },
    },
  });
  await berg.stop();
})();
