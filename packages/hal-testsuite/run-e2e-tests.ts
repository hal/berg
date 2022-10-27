import * as cypress from 'cypress'
import {
    GenericContainer,
    StartedTestContainer,
    Wait
  } from 'testcontainers';

( async () => {
    const halContainer = new GenericContainer('quay.io/halconsole/wildfly')
            .withExposedPorts({container: 9990, host: 9990 })
            .withStartupTimeout(333000)
            .withWaitStrategy(Wait.forLogMessage(new RegExp(".*WildFly Full.*started in.*")))
            .withCmd(["-c", "standalone-insecure.xml"])
            .withReuse()
    let startedHalContainer = await halContainer.start()
    await cypress.run()
    await startedHalContainer.stop()
})()