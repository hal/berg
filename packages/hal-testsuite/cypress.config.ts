import axios from "axios";
import { defineConfig } from "cypress";
import { GenericContainer, StartedTestContainer, StoppedTestContainer, Wait } from "testcontainers";

export default defineConfig({
  videoCompression: false,
  e2e: {
    setupNodeEvents(on, config) {
      let startedContainers: StartedTestContainer[] = []
      on('task', {
        'start:wildfly:container': () => {
          return new Promise((resolve, reject) => {
            new GenericContainer('quay.io/halconsole/wildfly:latest')
              .withNetworkMode(config.env.NETWORK_NAME)
              .withNetworkAliases('wildfly')
              .withExposedPorts(9990)
              .withWaitStrategy(Wait.forLogMessage(new RegExp(".*WildFly Full.*started in.*")))
              .withStartupTimeout(333000)
              .withCmd(["-c", "standalone-insecure.xml"]).start().then((wildflyContainer) => {
                startedContainers.push(wildflyContainer)
                let managementApi = "http://localhost:" + wildflyContainer.getMappedPort(9990) + "/management"
                return axios.post(managementApi, {
                  operation: 'list-add',
                  address: ['core-service', 'management', 'management-interface', 'http-interface'],
                  name: 'allowed-origins',
                  value: 'http://localhost:' + config.env.HAL_CONTAINER_PORT
                }).then((response) => {
                  console.log(response.data)
                  console.log('Added http://localhost:' + config.env.HAL_CONTAINER_PORT + ' as allowed-origin')
                  return axios.post(managementApi, {
                    operation: 'reload',
                  })
                })
                .then((response) => {
                  console.log('Reloading configuration')
                  console.log(response.data)
                  let startTime = new Date().getTime()
                  let interval = setInterval(() => {
                    if (new Date().getTime() - startTime > 10000) {
                      clearInterval(interval)
                      reject()
                    }
                    axios.post(managementApi, {
                      operation: 'read-attribute',
                      name: 'server-state'
                    }).then((response) => {
                        if (response.data.result == 'running') {
                          clearInterval(interval)
                          resolve('http://localhost:' + wildflyContainer.getMappedPort(9990))
                        }
                    }).catch((err) => {})}, 500)
                })
            })
          })
          
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
            console.log(err)
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
