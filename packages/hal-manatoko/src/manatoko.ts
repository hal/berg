import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
} from "testcontainers";

export class Manatoko {
  private static _instance: Manatoko;

  private _network: StartedNetwork;
  private _halContainer: StartedTestContainer;

  private constructor(
    network: StartedNetwork,
    halContainer: StartedTestContainer
  ) {
    this._network = network;
    this._halContainer = halContainer;
  }

  public static async getInstance(): Promise<Manatoko> {
    if (!Manatoko._instance) {
      const network = await new Network().start();
      const halContainer = await new GenericContainer(
        process.env.HAL_STANDALONE_IMAGE ||
          "quay.io/halconsole/hal-development:latest"
      )
        .withExposedPorts(9090)
        .withNetworkMode(network.getName())
        .withNetworkAliases("hal")
        .start();
      Manatoko._instance = new Manatoko(network, halContainer);
    }
    return Manatoko._instance;
  }

  public getNetwork(): StartedNetwork {
    return this._network;
  }

  public getHalContainer(): StartedTestContainer {
    return this._halContainer;
  }

  public async stop() {
    await this._halContainer.stop();
    await this._network.stop();
  }
}
