import * as cypress from "cypress";

import { Berg } from "@berg/berg";
import { result } from "cypress/types/lodash";

Berg.getInstance().then((berg) => {
  cypress
    .open({
      env: {
        NETWORK_NAME: berg.getNetwork().getName(),
        HAL_CONTAINER_PORT: berg.getHalContainer().getMappedPort(9090),
      },
      config: {
        e2e: {
          baseUrl: `http://localhost:${berg.getHalContainer().getMappedPort(9090)}`,
        },
      },
    })
    .then((result) => {
      console.log(result);
      berg.stop();
    });
});
