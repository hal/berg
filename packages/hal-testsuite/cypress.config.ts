import axios from "axios";
import { defineConfig } from "cypress";
import { GenericContainer, StartedTestContainer, StoppedTestContainer, Wait } from "testcontainers";
import { StartedGenericContainer } from "testcontainers/dist/generic-container/started-generic-container";
import waitPort from "wait-port";

export default defineConfig({
  videoCompression: false,
  e2e: {
    setupNodeEvents(on, config) {
      let startedContainers: StartedTestContainer[] = []
      on('task', {
        'start:wildfly:container': async () => {
          let wildflyContainer = await new GenericContainer('quay.io/halconsole/wildfly:latest')
          .withNetworkMode(config.env.NETWORK_NAME)
          .withNetworkAliases('wildfly')
          .withExposedPorts(9990)
          .withWaitStrategy(Wait.forLogMessage(new RegExp(".*WildFly Full.*started in.*")))
          .withStartupTimeout(333000)
          .withCmd(["-c", "standalone-insecure.xml"]).start()
          startedContainers.push(wildflyContainer)
          let managementApi = "http://localhost:" + wildflyContainer.getMappedPort(9990) + "/management"
          await axios.post(managementApi, {
            operation: 'list-add',
            address: ['core-service', 'management', 'management-interface', 'http-interface'],
            name: 'allowed-origins',
            value: 'http://localhost:' + config.env.HAL_CONTAINER_PORT
          })
          await axios.post(managementApi, {
            operation: 'reload',
          })
          await new Promise(resolve => setTimeout(resolve, 5000));
          return 'http://localhost:' + wildflyContainer.getMappedPort(9990)
        },
        'execute:cli': ({ managementApi, operation, address, ...args }) => {
          return new Promise((resolve, reject) => {
            axios.post(managementApi, {
            operation: operation,
            address: address,
            ...args
          }).then((response) => {
            resolve(response.data)
          }).catch((err) => {
            return reject(err)
          })
        })
        },
        'stop:containers': () => {
          let promises: Promise<StoppedTestContainer>[] = []
          startedContainers.forEach((container) => {
            promises.push(container.stop())
            startedContainers.pop()
          })
          console.log("Started containers length: ", startedContainers.length)
          return Promise.all(promises)
        }
      })
    },
  },
});
