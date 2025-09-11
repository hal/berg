import * as cypress from "cypress";

import { Berg } from "@berg/berg";

(() => {
  Berg.getInstance()
    .then((berg) => {
      console.log("Processing the open-cypress.ts");
      console.log("Network :" + berg.getNetwork().getName());
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
        .then(() => {
          berg.stop().catch((exception) => {
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
})();
