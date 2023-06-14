import axios from "axios";
import { defineConfig } from "cypress";
import { AlwaysPullPolicy, GenericContainer, StartedTestContainer, StoppedTestContainer, Wait } from "testcontainers";
import { Environment } from "testcontainers/dist/src/docker/types";

export default defineConfig({
  reporter: require.resolve("cypress-multi-reporters/index.js"),
  reporterOptions: {
    configFile: "reporter-config.json",
  },
  videoCompression: false,
  e2e: {
    setupNodeEvents(on, config) {
      const startedContainers: Map<string, StartedTestContainer> = new Map<string, StartedTestContainer>();
      on("task", {
        "start:wildfly:container": ({ name, configuration }) => {
          return new Promise((resolve, reject) => {
            new GenericContainer(process.env.WILDFLY_IMAGE || "quay.io/halconsole/wildfly-development:latest")
              .withPullPolicy(new AlwaysPullPolicy())
              .withName(name as string)
              .withNetworkMode(config.env.NETWORK_NAME as string)
              .withNetworkAliases("wildfly")
              .withExposedPorts(9990)
              .withBindMounts([
                {
                  source: __dirname + "/cypress/fixtures",
                  target: "/home/fixtures",
                  mode: "z",
                },
              ])
              .withWaitStrategy(Wait.forLogMessage(new RegExp(".*(WildFly Full.*|JBoss EAP.*)started in.*")))
              .withStartupTimeout(333000)
              .withCommand(["-c", configuration || "standalone-insecure.xml"] as string[])
              .start()
              .then((wildflyContainer) => {
                startedContainers.set(name as string, wildflyContainer);
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
                            resolve(`http://localhost:${wildflyContainer.getMappedPort(9990)}`);
                          }
                        })
                        /* eslint @typescript-eslint/no-empty-function: off */
                        .catch(() => {});
                    }, 500);
                  });
              })
              .catch((err) => reject(err));
          });
        },
        "start:postgres:container": ({ name, environmentProperties }) => {
          const postgreContainerBuilder = new GenericContainer(process.env.POSTGRES_IMAGE || "postgres")
            .withPullPolicy(new AlwaysPullPolicy())
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
            .withPullPolicy(new AlwaysPullPolicy())
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
            .withPullPolicy(new AlwaysPullPolicy())
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
            .withPullPolicy(new AlwaysPullPolicy())
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
            containerToExec
              ?.exec(["/bin/bash", "-c", `$JBOSS_HOME/bin/jboss-cli.sh -c --command=${command as string}`])
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
            promises.push(container.stop());
          });
          return Promise.all(promises);
        },
      });
      return config;
    },
  },
});
