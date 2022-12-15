import {
  AddModuleCommandBuilder,
  AddDataSourceBuilder,
  AddXADataSourceBuilder,
} from "@hal/commands";

describe("TESTS: Configuration => Datasource => PostgreSQL", () => {
  const postgresUser = "admin";
  const postgresPassword = "pass";
  const postgresDatabaseName = "sampledb";

  const postgresDriverName = "postgresql";
  const postgresContainerName = "postgres";

  const postgresDSToAdd = {
    name: "PostgreToAddDS",
    jndiName: "java:/PostgreToAddDS",
    connectionUrl:
      "jdbc:" +
      postgresDriverName +
      "://" +
      postgresContainerName +
      "/" +
      postgresDatabaseName,
  };

  const xaPostgreDSToAdd = {
    name: "XAPostgreDSToAdd",
    jndiName: "java:/XAPostgreDSToAdd",
  };

  let managementEndpoint: string;

  before(() => {
    cy.task("start:postgres:container", {
      name: postgresContainerName,
      environmentProperties: {
        POSTGRES_USER: postgresUser,
        POSTGRES_PASSWORD: postgresPassword,
        POSTGRES_DB: postgresDatabaseName,
      },
    });
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.executeInWildflyContainer(
        new AddModuleCommandBuilder()
          .withName("org.postgres")
          .withResource("/home/fixtures/jdbc-drivers/postgresql-42.5.1.jar")
          .withDependencies(["javax.api", "javax.transaction.api"])
          .build()
          .toCLICommand()
      ).then(() => {
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          operation: "add",
          address: [
            "subsystem",
            "datasources",
            "jdbc-driver",
            postgresDriverName,
          ],
          "driver-module-name": "org.postgres",
          "driver-xa-datasource-class-name": "org.postgresql.xa.PGXADataSource",
        }).then(() => {
          cy.executeInWildflyContainer(
            new AddDataSourceBuilder()
              .withName(postgresDSToAdd.name)
              .withJndiName(postgresDSToAdd.jndiName)
              .withConnectionUrl(postgresDSToAdd.connectionUrl)
              .withDriverName(postgresDriverName)
              .withUsername(postgresUser)
              .withPassword(postgresPassword)
              .build()
              .toCLICommand()
          );
          cy.executeInWildflyContainer(
            new AddXADataSourceBuilder()
              .withName(xaPostgreDSToAdd.name)
              .withJndiName(xaPostgreDSToAdd.jndiName)
              .withUsername(postgresUser)
              .withPassword(postgresPassword)
              .withDriverName(postgresDriverName)
              .withXaDataSourceClass("org.postgresql.xa.PGXADataSource")
              .withXaDataSourceProperty("serverName", postgresContainerName)
              .withXaDataSourceProperty("databaseName", postgresDatabaseName)
              .build()
              .toCLICommand()
          );
        });
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Navigate", () => {
    cy.visit("/");
  });
});
