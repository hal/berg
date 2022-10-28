import * as cypress from 'cypress'

import { Manatoko } from '@hal/manatoko'

( async () => {
    let manatoko = await Manatoko.getInstance()
    await manatoko.startWildflyContainer()
    await cypress.open({
      config: {
        e2e: {
          baseUrl: manatoko.getBaseUrl()
        }
      }
    })
    await manatoko.stop()
})()