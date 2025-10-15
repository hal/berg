import axios from "axios";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { findAPortNotInUse } from "portscanner";
import {
  WILDFLY_MANAGEMENT_PORT,
  WILDFLY_PORT_RANGE,
  DEFAULT_WILDFLY_CONFIG,
  WILDFLY_READY_TIMEOUT_MS,
  WILDFLY_POLL_INTERVAL_MS,
  JBOSS_CLI_PATH,
  MANAGEMENT_INTERFACE_ADDRESS,
} from "../../cypress.config";
import { WildflyManagementResponse } from "../interfaces";
import { buildLocalhostUrl } from "../helpers";

export function pollWildflyState(managementApi: string, container: StartedTestContainer): Promise<string> {
  const startTime = new Date().getTime();
  return new Promise<string>((resolve, reject) => {
    const interval = setInterval(() => {
      if (new Date().getTime() - startTime > WILDFLY_READY_TIMEOUT_MS) {
        clearInterval(interval);
        reject(new Error("Timeout waiting for WildFly to start"));
      }
      axios
        .post(managementApi, {
          operation: "read-attribute",
          name: "server-state",
        })
        .then((response: WildflyManagementResponse) => {
          if (response.data.result === "running") {
            clearInterval(interval);
            const wildflyServer = buildLocalhostUrl(container.getMappedPort(WILDFLY_MANAGEMENT_PORT));
            resolve(wildflyServer);
          }
        })
        .catch(() => {
          console.log("WildFly server is not ready yet");
        });
    }, WILDFLY_POLL_INTERVAL_MS);
  });
}

export function executeJBossCLI(
  container: StartedTestContainer,
  managementPort: number,
  command: string,
): Promise<string> {
  return container
    .exec([
      `/bin/sh`,
      `-c`,
      `${JBOSS_CLI_PATH} --connect --controller=localhost:${managementPort} --command="${command}"`,
    ])
    .then((result) => result.output);
}

export function configureWildflyNetworkMode(
  wildfly: GenericContainer,
  configuration: string,
  useHostMode: boolean,
  networkName?: string,
): Promise<{ portOffset: number }> {
  if (useHostMode) {
    console.log("host mode");
    return findAPortNotInUse(WILDFLY_PORT_RANGE.min, WILDFLY_PORT_RANGE.max).then((freePort) => {
      const portOffset = freePort - WILDFLY_PORT_RANGE.min;
      wildfly
        .withNetworkMode("host")
        .withCommand([
          "-c",
          configuration || DEFAULT_WILDFLY_CONFIG,
          `-Djboss.socket.binding.port-offset=${portOffset.toString()}`,
          "-Djboss.node.name=localhost",
        ] as string[]);
      return { portOffset };
    });
  } else {
    console.log(`default network mode, network name: ${networkName}`);
    wildfly
      .withNetworkMode(networkName!)
      .withNetworkAliases("wildfly")
      .withExposedPorts(WILDFLY_MANAGEMENT_PORT)
      .withCommand(["-c", configuration || DEFAULT_WILDFLY_CONFIG] as string[]);
    return Promise.resolve({ portOffset: 0 });
  }
}

export function configureWildflyPostStart(
  container: StartedTestContainer,
  halPort: string,
  useHostMode: boolean,
  managementPort?: number,
): Promise<string> {
  if (useHostMode) {
    const effectiveManagementPort = managementPort!;
    return executeJBossCLI(
      container,
      effectiveManagementPort,
      `/core-service=management/management-interface=http-interface:list-add(name=allowed-origins,value=${buildLocalhostUrl(Number(halPort))}`,
    )
      .then(() => executeJBossCLI(container, effectiveManagementPort, "reload"))
      .then(() => executeJBossCLI(container, effectiveManagementPort, "read-attribute server-state"))
      .then((output) => {
        if (output.includes("running")) {
          return buildLocalhostUrl(effectiveManagementPort);
        }
        throw new Error("WildFly did not reach running state");
      });
  } else {
    const managementApi = buildLocalhostUrl(container.getMappedPort(WILDFLY_MANAGEMENT_PORT), "/management");

    return axios
      .post(managementApi, {
        operation: "list-add",
        address: MANAGEMENT_INTERFACE_ADDRESS,
        name: "allowed-origins",
        value: buildLocalhostUrl(Number(halPort)),
      })
      .then(() =>
        axios.post(managementApi, {
          operation: "reload",
        }),
      )
      .then(() => pollWildflyState(managementApi, container));
  }
}
