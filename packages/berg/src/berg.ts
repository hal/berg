import { PullPolicy, GenericContainer, Network, StartedNetwork, StartedTestContainer } from "testcontainers";

export class Berg {
  private static _instance: Berg;

  private _network: StartedNetwork;
  private _halContainer: StartedTestContainer;

  private constructor(network: StartedNetwork, halContainer: StartedTestContainer) {
    this._network = network;
    this._halContainer = halContainer;
  }

  public static async getInstance(): Promise<Berg> {
    if (!Berg._instance) {
      const network = await new Network().start();
      const halContainer = await new GenericContainer(
        process.env.HAL_IMAGE || "quay.io/halconsole/hal-development:latest",
      )
        .withPullPolicy(PullPolicy.alwaysPull())
        .withExposedPorts(9090)
        .withNetworkMode(network.getName())
        .withNetworkAliases("hal")
        .start();
      Berg._instance = new Berg(network, halContainer);
    }
    return Berg._instance;
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
