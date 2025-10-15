import { PullPolicy, GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import {
  DEFAULT_WILDFLY_IMAGE,
  WILDFLY_STARTED_MSG,
  WILDFLY_STARTUP_TIMEOUT,
  FIXTURES_PATH,
  FIXTURES_DIRECTORY_MODE,
  WILDFLY_MANAGEMENT_PORT,
  JBOSS_CLI_PATH,
} from "../../cypress.config";
import { StartWildflyContainerParams, ExecuteInContainerParams, AxiosErrorResponse } from "../interfaces";
import { getHostnameMapping, handleContainerError, calculateManagementPort } from "../helpers";
import { configureWildflyNetworkMode, configureWildflyPostStart } from "../containers";

export function createWildflyContainer(
  startedContainers: Map<string, StartedTestContainer>,
  startedContainersManagementPorts: Map<string, number>,
  networkName: string,
  halContainerPort: string,
) {
  return ({ name, configuration, useNetworkHostMode }: StartWildflyContainerParams) => {
    let portOffset = 0;
    const wildfly = new GenericContainer(process.env.WILDFLY_IMAGE || DEFAULT_WILDFLY_IMAGE)
      .withPullPolicy(PullPolicy.alwaysPull())
      .withName(name)
      .withCopyDirectoriesToContainer([
        {
          source: FIXTURES_PATH,
          target: "/home/fixtures",
          mode: FIXTURES_DIRECTORY_MODE,
        },
      ])
      .withWaitStrategy(Wait.forLogMessage(WILDFLY_STARTED_MSG))
      .withStartupTimeout(WILDFLY_STARTUP_TIMEOUT)
      .withExtraHosts(getHostnameMapping());

    return configureWildflyNetworkMode(wildfly, configuration, useNetworkHostMode === true, networkName)
      .then((result) => {
        portOffset = result.portOffset;
        return wildfly.start();
      })
      .then((wildflyContainer) => {
        startedContainers.set(name, wildflyContainer);
        const managementPort = useNetworkHostMode === true ? calculateManagementPort(portOffset) : undefined;
        if (managementPort !== undefined) {
          startedContainersManagementPorts.set(name, managementPort);
        }
        return configureWildflyPostStart(
          wildflyContainer,
          halContainerPort,
          useNetworkHostMode === true,
          managementPort,
        );
      })
      .then((wildflyServer) => {
        console.log(`WildFly server is ready: ${wildflyServer}`);
        return wildflyServer;
      })
      .catch((err: unknown) => {
        throw handleContainerError(err);
      });
  };
}

export function createExecuteInContainer(
  startedContainers: Map<string, StartedTestContainer>,
  startedContainersManagementPorts: Map<string, number>,
) {
  return ({ containerName, command }: ExecuteInContainerParams) => {
    console.log(`CLI commands: ${command}`);
    const containerToExec = startedContainers.get(containerName);
    let managementPort = startedContainersManagementPorts.get(containerName);
    managementPort = managementPort ?? WILDFLY_MANAGEMENT_PORT;

    if (!containerToExec) {
      return Promise.reject(new Error(`Container ${containerName} not found`));
    }

    return containerToExec
      .exec([
        "/bin/sh",
        "-c",
        `${JBOSS_CLI_PATH} --connect --controller=localhost:${managementPort} --commands=${command}`,
      ])
      .then((value) => {
        if (value.exitCode === 0) {
          return value;
        } else {
          console.log(value);
          throw new Error(`Command failed with exit code ${value.exitCode}: ${value.output || ""}`);
        }
      })
      .catch((err: AxiosErrorResponse) => {
        throw new Error(err.response.data);
      });
  };
}
