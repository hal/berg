import { PullPolicy, GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import { DatabaseConfig } from "../interfaces";
import { handleContainerError } from "../helpers";

export function startDatabaseContainer(
  config: DatabaseConfig,
  startedContainersMap: Map<string, StartedTestContainer>,
): Promise<StartedTestContainer> {
  const containerBuilder = new GenericContainer(config.image)
    .withPullPolicy(PullPolicy.alwaysPull())
    .withName(config.name)
    .withNetworkAliases(config.name)
    .withNetworkMode(config.networkName)
    .withExposedPorts(config.port)
    .withEnvironment(config.environmentProperties)
    .withWaitStrategy(Wait.forLogMessage(new RegExp(config.waitLogMessage)));

  return containerBuilder
    .start()
    .then((container) => {
      console.log(config.successMessage);
      startedContainersMap.set(config.containerMapKey, container);
      return container;
    })
    .catch((err: unknown) => {
      throw handleContainerError(err);
    });
}
