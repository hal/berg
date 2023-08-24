import axios from "axios";
import { defineConfig } from "cypress";
import { PullPolicy, GenericContainer, StartedTestContainer, StoppedTestContainer, Wait } from "testcontainers";
import { Environment } from "testcontainers/build/types";
import { findAPortNotInUse } from "portscanner";

export default defineConfig({
  defaultCommandTimeout: 16000,
  reporter: require.resolve("cypress-multi-reporters/index.js"),
  reporterOptions: {
    configFile: "reporter-config.json",
  },
  videoCompression: false,
  e2e: {
    setupNodeEvents(on, config) {
      const startedContainers: Map<string, StartedTestContainer> = new Map<string, StartedTestContainer>();
      const startedContainersManagementPorts: Map<string, number> = new Map<string, number>();
      on("task", {
        "start:wildfly:container": ({ name, configuration, useNetworkHostMode }) => {
          return new Promise((resolve, reject) => {
            let portOffset = 0;
            const wildfly = new GenericContainer(
              process.env.WILDFLY_IMAGE || "quay.io/halconsole/wildfly-development:latest"
            )
              .withPullPolicy(PullPolicy.alwaysPull())
              .withName(name as string)
              .withCopyDirectoriesToContainer([
                {
                  source: __dirname + "/cypress/fixtures",
                  target: "/home/fixtures",
                  mode: parseInt("0777", 8),
                },
              ])
              .withWaitStrategy(Wait.forLogMessage(new RegExp(".*(WildFly Full.*|JBoss EAP.*)started in.*")))
              .withStartupTimeout(333000);
            if (useNetworkHostMode === true) {
              console.log("host mode");
              findAPortNotInUse(8080, 8180)
                .then((freePort) => {
                  portOffset = freePort - 8080;
                  wildfly
                    .withNetworkMode("host")
                    .withCommand([
                      "-c",
                      configuration || "standalone-insecure.xml",
                      `-Djboss.socket.binding.port-offset=${portOffset.toString()}`,
                    ] as string[]);
                })
                .catch((error) => {
                  console.log(error);
                });
            } else {
              console.log(`default network mode, network name: ${config.env.NETWORK_NAME as string}`);
              wildfly
                .withNetworkMode(config.env.NETWORK_NAME as string)
                .withNetworkAliases("wildfly")
                .withExposedPorts(9990)
                .withCommand(["-c", configuration || "standalone-insecure.xml"] as string[]);
            }
            wildfly
              .start()
              .then((wildflyContainer) => {
                const managementPortWithOffset = portOffset + 9990;
                startedContainers.set(name as string, wildflyContainer);
                if (useNetworkHostMode === true) {
                  startedContainersManagementPorts.set(name as string, portOffset + 9990);
                  return wildflyContainer
                    .exec([
                      `/bin/bash`,
                      `-c`,
                      `$JBOSS_HOME/bin/jboss-cli.sh --connect --controller=localhost:${managementPortWithOffset} --command="/core-service=management/management-interface=http-interface:list-add(name=allowed-origins,value=http://localhost:${
                        config.env.HAL_CONTAINER_PORT as string
                      }"`,
                    ])
                    .then((result) => {
                      console.log(result.output);
                      return wildflyContainer.exec([
                        `/bin/bash`,
                        `-c`,
                        `$JBOSS_HOME/bin/jboss-cli.sh --connect --controller=localhost:${managementPortWithOffset} --command="reload"`,
                      ]);
                    })
                    .then((result) => {
                      console.log(result.output);
                      wildflyContainer
                        .exec([
                          `/bin/bash`,
                          `-c`,
                          `$JBOSS_HOME/bin/jboss-cli.sh --connect --controller=localhost:${managementPortWithOffset} --command="read-attribute server-state"`,
                        ])
                        .then((response) => {
                          console.log(response.output);
                          if (response.output.includes("running")) {
                            resolve(`http://localhost:${managementPortWithOffset}`);
                          }
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    });
                } else {
                  startedContainersManagementPorts.set(name as string, wildflyContainer.getMappedPort(9990));
                  const managementApi = `http://localhost:${wildflyContainer.getMappedPort(9990)}/management`;
                  return axios
                    .post(managementApi, {
                      operation: "list-add",
                      address: ["core-service", "management", "management-interface", "http-interface"],
                      name: "allowed-origins",
                      value: `http://localhost:${config.env.HAL_CONTAINER_PORT as string}`,
                    })
                    .then(() => {
                      return axios.post(managementApi, {
                        operation: "reload",
                      });
                    })
                    .then(() => {
                      const startTime = new Date().getTime();
                      const interval = setInterval(() => {
                        if (new Date().getTime() - startTime > 10000) {
                          clearInterval(interval);
                          reject();
                        }
                        axios
                          .post(managementApi, {
                            operation: "read-attribute",
                            name: "server-state",
                          })
                          .then((response) => {
                            if ((response as { data: { result: string } }).data.result == "running") {
                              clearInterval(interval);
                              const wildflyServer = `http://localhost:${wildflyContainer.getMappedPort(9990)}`;
                              console.log(`WildFly server is ready: ${wildflyServer}`);
                              resolve(wildflyServer);
                            }
                          })
                          .catch(() => {
                            console.log("WildFly server is not ready yet");
                          });
                      }, 500);
                    });
                }
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          });
        },
        "start:keycloak:container": ({ name }) => {
          return findAPortNotInUse(8888, 8988).then((freePort: number) => {
            const keycloak = new GenericContainer(process.env.KEYCLOAK_IMAGE || "quay.io/keycloak/keycloak:latest")
              .withName(name as string)
              .withNetworkMode("host")
              .withWaitStrategy(Wait.forLogMessage(new RegExp(".*(Keycloak.*) started in.*")))
              .withEnvironment({
                KEYCLOAK_ADMIN: "admin",
                KEYCLOAK_ADMIN_PASSWORD: "admin",
              })
              .withBindMounts([
                {
                  source: __dirname + "/cypress/fixtures/realm-configuration.json",
                  target: "/opt/keycloak/data/import/realm-configuration.json",
                  mode: "z",
                },
              ])
              .withCommand(["start-dev", `--http-port=${freePort.toString()}`, "--import-realm"] as string[]);
            return new Promise((resolve, reject) => {
              keycloak
                .start()
                .then((keycloakContainer) => {
                  startedContainers.set(name as string, keycloakContainer);
                  resolve(`http://localhost:${freePort ?? "unknown port"}`);
                })
                .catch((err) => {
                  console.log(err);
                  reject(err);
                });
            });
          });
        },
        "start:postgres:container": ({ name, environmentProperties }) => {
          const postgreContainerBuilder = new GenericContainer(process.env.POSTGRES_IMAGE || "postgres")
            .withPullPolicy(PullPolicy.alwaysPull())
            .withName(name as string)
            .withNetworkAliases(name as string)
            .withNetworkMode(config.env.NETWORK_NAME as string)
            .withWaitStrategy(
              Wait.forLogMessage(new RegExp(".*PostgreSQL init process complete; ready for start up.*"))
            )
            .withExposedPorts(5432)
            .withEnvironment(environmentProperties as Environment);
          return new Promise((resolve, reject) => {
            postgreContainerBuilder
              .start()
              .then((postgreContainer) => {
                console.log(postgreContainer);
                startedContainers.set("postgres", postgreContainer);
                resolve(postgreContainer);
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          });
        },
        "start:mysql:container": ({ name, environmentProperties }) => {
          const mysqlContainerBuilder = new GenericContainer(process.env.MYSQL_IMAGE || "mysql")
            .withPullPolicy(PullPolicy.alwaysPull())
            .withName(name as string)
            .withNetworkAliases(name as string)
            .withExposedPorts(3306)
            .withEnvironment(environmentProperties as Environment)
            .withNetworkMode(config.env.NETWORK_NAME as string)
            .withWaitStrategy(Wait.forLogMessage(new RegExp(".*MySQL init process done. Ready for start up.*")));
          console.log(mysqlContainerBuilder);
          return new Promise((resolve, reject) => {
            mysqlContainerBuilder
              .start()
              .then((mysqlContainer) => {
                console.log(mysqlContainer);
                startedContainers.set("mysql", mysqlContainer);
                resolve(mysqlContainer);
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          });
        },
        "start:mariadb:container": ({ name, environmentProperties }) => {
          const mariadbContainerBuilder = new GenericContainer(process.env.MARIADB_IMAGE || "mariadb")
            .withPullPolicy(PullPolicy.alwaysPull())
            .withName(name as string)
            .withNetworkAliases(name as string)
            .withExposedPorts(3306)
            .withNetworkMode(config.env.NETWORK_NAME as string)
            .withEnvironment(environmentProperties as Environment)
            .withWaitStrategy(Wait.forLogMessage(new RegExp(".*MariaDB init process done. Ready for start up.*")));
          return new Promise((resolve, reject) => {
            mariadbContainerBuilder
              .start()
              .then((mariadbContainer) => {
                console.log(mariadbContainer);
                startedContainers.set("mariadb", mariadbContainer);
                resolve(mariadbContainer);
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          });
        },
        "start:sqlserver:container": ({ name, environmentProperties }) => {
          const sqlserverContainerBuilder = new GenericContainer(
            process.env.MSSQL_IMAGE || "mcr.microsoft.com/mssql/server:2022-latest"
          )
            .withPullPolicy(PullPolicy.alwaysPull())
            .withName(name as string)
            .withNetworkAliases(name as string)
            .withNetworkMode(config.env.NETWORK_NAME as string)
            .withExposedPorts(1433)
            .withEnvironment(environmentProperties as Environment)
            .withWaitStrategy(Wait.forLogMessage(new RegExp(".*SQL Server is now ready for client connections.*")));
          return new Promise((resolve, reject) => {
            sqlserverContainerBuilder
              .start()
              .then((sqlServerContainer) => {
                startedContainers.set("sqlserver", sqlServerContainer);
                resolve(sqlServerContainer);
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          });
        },
        "execute:in:container": ({ containerName, command }) => {
          return new Promise((resolve, reject) => {
            const containerToExec = startedContainers.get(containerName as string);
            let managementPort = startedContainersManagementPorts.get(containerName as string);
            managementPort = managementPort ?? 9990;
            containerToExec
              ?.exec([
                "/bin/bash",
                "-c",
                `$JBOSS_HOME/bin/jboss-cli.sh --connect --controller=localhost:${managementPort} --commands=${
                  command as string
                }`,
              ])
              .then((value) => {
                console.log(value.output);
                resolve(value.output);
              })
              .catch((err) => reject(err));
          });
        },
        "execute:cli": ({ managementApi, operation, address, ...args }) => {
          return new Promise((resolve, reject) => {
            axios
              .post(managementApi as string, {
                operation: operation as string,
                address: address as string[],
                ...args,
              })
              .then((response) => {
                resolve(response.data);
              })
              .catch((err) => {
                console.log(err);
                return reject(err);
              });
          });
        },
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
      return config;
    },
  },
});
