import { defineConfig } from "cypress";
import { StartedTestContainer, StoppedTestContainer } from "testcontainers";
import { existsSync, unlinkSync } from "fs";
import {
  createWildflyContainer,
  createExecuteInContainer,
  createKeycloakContainer,
  createPostgresContainer,
  createMysqlContainer,
  createMariadbContainer,
  createSqlserverContainer,
  createExecuteCli,
} from "./config/tasks";

// WildFly configuration
export const DEFAULT_WILDFLY_CONFIG = "standalone-insecure.xml";
export const WILDFLY_MANAGEMENT_PORT = 9990;
export const WILDFLY_STARTUP_TIMEOUT = 333000;
export const WILDFLY_PORT_RANGE = { min: 8080, max: 8180 };
export const WILDFLY_READY_TIMEOUT_MS = 10000;
export const WILDFLY_POLL_INTERVAL_MS = 500;

// Keycloak configuration
export const KEYCLOAK_PORT_RANGE = { min: 8888, max: 8988 };
export const KEYCLOAK_ADMIN_USER = "admin";
export const KEYCLOAK_ADMIN_PASSWORD = "admin";

// Database ports
export const POSTGRES_PORT = 5432;
export const MYSQL_PORT = 3306;
export const MARIADB_PORT = 3306;
export const SQLSERVER_PORT = 1433;

// Default Docker images
export const DEFAULT_WILDFLY_IMAGE = "quay.io/halconsole/wildfly-development:latest";
export const DEFAULT_KEYCLOAK_IMAGE = "quay.io/keycloak/keycloak:latest";
export const DEFAULT_POSTGRES_IMAGE = "postgres";
export const DEFAULT_MYSQL_IMAGE = "mysql";
export const DEFAULT_MARIADB_IMAGE = "mariadb";
export const DEFAULT_SQLSERVER_IMAGE = "mcr.microsoft.com/mssql/server:2022-latest";

// Wait strategy log messages
export const WILDFLY_STARTED_MSG = /.*(WildFly.*|JBoss EAP.*)started in.*/;
export const KEYCLOAK_STARTED_MSG = /.*(Keycloak.*) started in.*/;
export const POSTGRES_STARTED_MSG = ".*PostgreSQL init process complete; ready for start up.*";
export const MYSQL_STARTED_MSG = ".*MySQL init process done. Ready for start up.*";
export const MARIADB_STARTED_MSG = ".*MariaDB init process done. Ready for start up.*";
export const SQLSERVER_STARTED_MSG = ".*SQL Server is now ready for client connections.*";

// Paths
export const FIXTURES_PATH = __dirname + "/packages/testsuite/cypress/fixtures";
export const JBOSS_CLI_PATH = "$JBOSS_HOME/bin/jboss-cli.sh";

// File permissions
export const FIXTURES_DIRECTORY_MODE = parseInt("0777", 8);

// Management interface address
export const MANAGEMENT_INTERFACE_ADDRESS = ["core-service", "management", "management-interface", "http-interface"];

// Network
export const LOCALHOST_IP = "127.0.0.1";

export default defineConfig({
  defaultCommandTimeout: 16000,
  reporter: require.resolve("cypress-multi-reporters/index.js"),
  reporterOptions: {
    configFile: "reporter-config.json",
  },
  video: true,
  videoCompression: false,
  e2e: {
    supportFile: "packages/testsuite/cypress/support/e2e.ts",
    specPattern: "packages/testsuite/cypress/e2e/**/*.cy.ts",
    setupNodeEvents(on, config) {
      const startedContainers: Map<string, StartedTestContainer> = new Map<string, StartedTestContainer>();
      const startedContainersManagementPorts: Map<string, number> = new Map<string, number>();

      on("task", {
        "start:wildfly:container": createWildflyContainer(
          startedContainers,
          startedContainersManagementPorts,
          config.env.NETWORK_NAME as string,
          config.env.HAL_CONTAINER_PORT as string,
        ),
        "start:keycloak:container": createKeycloakContainer(startedContainers),
        "start:postgres:container": createPostgresContainer(startedContainers, config.env.NETWORK_NAME as string),
        "start:mysql:container": createMysqlContainer(startedContainers, config.env.NETWORK_NAME as string),
        "start:mariadb:container": createMariadbContainer(startedContainers, config.env.NETWORK_NAME as string),
        "start:sqlserver:container": createSqlserverContainer(startedContainers, config.env.NETWORK_NAME as string),
        "execute:in:container": createExecuteInContainer(startedContainers, startedContainersManagementPorts),
        "execute:cli": createExecuteCli(),
        "stop:containers": () => {
          const promises: Promise<StoppedTestContainer>[] = [];
          startedContainers.forEach((container, key) => {
            console.log("Stopping container for test " + key);
            startedContainers.delete(key);
            startedContainersManagementPorts.delete(key);
            promises.push(container.stop());
          });
          return Promise.all(promises);
        },
      });

      on("after:spec", (spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
        // Keep videos only for failed specs
        if (results && results.video && results.stats.failures === 0 && existsSync(results.video)) {
          unlinkSync(results.video);
        }
      });

      return config;
    },
  },
});
