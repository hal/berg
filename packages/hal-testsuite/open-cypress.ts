import * as cypress from 'cypress'
import axios from 'axios'
import {
    GenericContainer,
    Network,
    StartedTestContainer,
    Wait
  } from 'testcontainers';

( async () => {
    const network = await new Network().start()
    const halContainer = new GenericContainer('quay.io/halconsole/hal:latest')
            .withExposedPorts(9090)
            .withNetworkMode(network.getName())
            .withNetworkAliases('hal')
    const wildflyContainer = new GenericContainer('quay.io/halconsole/wildfly:latest')
      .withNetworkMode(network.getName())
      .withNetworkAliases('wildfly')
      .withExposedPorts(9990)
      .withWaitStrategy(Wait.forLogMessage(new RegExp(".*WildFly Full.*started in.*")))
      .withStartupTimeout(333000)
      .withCmd(["-c", "standalone-insecure.xml"])
    let startedHalContainer = await halContainer.start()
    let startedWildflyContainer = await wildflyContainer.start()
    let managementApi = "http://localhost:" + startedWildflyContainer.getMappedPort(9990) + "/management"
    await axios.post(managementApi, {
      operation: 'list-add',
      address: ['core-service', 'management', 'management-interface', 'http-interface'],
      name: 'allowed-origins',
      value: 'http://localhost:' + startedHalContainer.getMappedPort(9090)
    })
    await axios.post(managementApi, {
      operation: 'reload',
    })
    await cypress.open({
      config: {
        e2e: {
          baseUrl: 'http://localhost:' + startedHalContainer.getMappedPort(9090) + "?connect=http://localhost:" + startedWildflyContainer.getMappedPort(9990)
        }
      }
    })
    await startedHalContainer.stop()
    await startedWildflyContainer.stop()
    await network.stop()
})()