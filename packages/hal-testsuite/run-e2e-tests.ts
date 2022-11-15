import { Manatoko } from '@hal/manatoko'
import * as cypress from 'cypress'

( async () => {
  let manatoko = await Manatoko.getInstance()
  await cypress.run({
    browser: 'chrome',
    env: {
      NETWORK_NAME: manatoko.getNetwork().getName(),
      HAL_CONTAINER_PORT: manatoko.getHalContainer().getMappedPort(9090)
    },
    config: {
      e2e: {
        baseUrl: 'http://localhost:' + manatoko.getHalContainer().getMappedPort(9090)
      }
    }
  })
  await manatoko.stop()
})()