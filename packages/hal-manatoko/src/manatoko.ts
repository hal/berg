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

  public async stop() {
    await this._halContainer.stop()
    await this._network.stop()
  }
}