import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import { findAPortNotInUse } from "portscanner";
import {
  DEFAULT_KEYCLOAK_IMAGE,
  KEYCLOAK_PORT_RANGE,
  KEYCLOAK_STARTED_MSG,
  KEYCLOAK_ADMIN_USER,
  KEYCLOAK_ADMIN_PASSWORD,
  FIXTURES_PATH,
} from "../../cypress.config";
import { StartKeycloakContainerParams } from "../interfaces";
import { buildLocalhostUrl, buildKeycloakStartCommand, handleContainerError } from "../helpers";

export function createKeycloakContainer(startedContainers: Map<string, StartedTestContainer>) {
  return ({ name }: StartKeycloakContainerParams) => {
    return findAPortNotInUse(KEYCLOAK_PORT_RANGE.min, KEYCLOAK_PORT_RANGE.max).then((freePort: number) => {
      const keycloak = new GenericContainer(process.env.KEYCLOAK_IMAGE || DEFAULT_KEYCLOAK_IMAGE)
        .withName(name)
        .withNetworkMode("host")
        .withWaitStrategy(Wait.forLogMessage(KEYCLOAK_STARTED_MSG))
        .withEnvironment({
          KEYCLOAK_ADMIN: KEYCLOAK_ADMIN_USER,
          KEYCLOAK_ADMIN_PASSWORD: KEYCLOAK_ADMIN_PASSWORD,
        })
        .withBindMounts([
          {
            source: FIXTURES_PATH + "/realm-configuration.json",
            target: "/opt/keycloak/data/import/realm-configuration.json",
            mode: "z",
          },
        ])
        .withCommand(buildKeycloakStartCommand(freePort));
      return keycloak
        .start()
        .then((keycloakContainer) => {
          startedContainers.set(name, keycloakContainer);
          const keycloakServer = buildLocalhostUrl(freePort);
          console.log(`Keycloak is ready: ${keycloakServer}`);
          return keycloakServer;
        })
        .catch((err: unknown) => {
          throw handleContainerError(err);
        });
    });
  };
}
