import * as cypress from "cypress";

import { Manatoko } from "@hal/manatoko";

(async () => {
  const manatoko = await Manatoko.getInstance();
  await cypress.open({
    env: {
      NETWORK_NAME: manatoko.getNetwork().getName(),
      HAL_CONTAINER_PORT: manatoko.getHalContainer().getMappedPort(9090),
    },
    config: {
      e2e: {
        baseUrl: `http://localhost:${manatoko
          .getHalContainer()
          .getMappedPort(9090)}`,
      },
    },
  });
  await manatoko.stop();
})();
