import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
  Wait
} from 'testcontainers';

import axios from 'axios'

export class Manatoko {

  private static _instance: Manatoko

  private _network: StartedNetwork
  private _halContainer: StartedTestContainer
  private _wildflyContainer: StartedTestContainer

  private constructor(network: StartedNetwork, halContainer: StartedTestContainer) {
    this._network = network
    this._halContainer = halContainer
  }

  public static async getInstance() : Promise<Manatoko> {
    if (!Manatoko._instance) {
      let network = await new Network().start()
      let halContainer = await new GenericContainer('quay.io/halconsole/hal:latest')
        .withExposedPorts(9090)
        .withNetworkMode(network.getName())
        .withNetworkAliases('hal').start()
      Manatoko._instance = new Manatoko(network, halContainer)
    }
    return Manatoko._instance
  }

  public getNetwork() : StartedNetwork {
    return this._network
  }

  public getHalContainer() : StartedTestContainer {
    return this._halContainer
  }

  public async startWildflyContainer() : Promise<StartedTestContainer> {
    this._wildflyContainer = await new GenericContainer('quay.io/halconsole/wildfly:latest')
      .withNetworkMode(this._network.getName())
      .withNetworkAliases('wildfly')
      .withExposedPorts(9990)
      .withWaitStrategy(Wait.forLogMessage(new RegExp(".*WildFly Full.*started in.*")))
      .withStartupTimeout(333000)
      .withCmd(["-c", "standalone-insecure.xml"]).start()
    let managementApi = "http://localhost:" + this._wildflyContainer.getMappedPort(9990) + "/management"
    await axios.post(managementApi, {
      operation: 'list-add',
      address: ['core-service', 'management', 'management-interface', 'http-interface'],
      name: 'allowed-origins',
      value: 'http://localhost:' + this._halContainer.getMappedPort(9090)
    })
    await axios.post(managementApi, {
      operation: 'reload',
    })
    return this._wildflyContainer
  }

  public getBaseUrl() : string {
    return 'http://localhost:' + this._halContainer.getMappedPort(9090) + "?connect=http://localhost:" + this._wildflyContainer.getMappedPort(9990)
  }

  public async stop() {
    await this._halContainer.stop()
    await this._wildflyContainer.stop()
    await this._network.stop()
  }
}