import { AddDataSourceBuilder } from "@berg/commands";

// navigation crumbs in the management console
describe("TESTS: Configuration => Sybsystem => Transaction => Path", () => {
  const transactions = "transactions";
  const address = ["subsystem", transactions];
  const jdbcTab = "#tx-jdbc-config-item";
  const jdbcForm = "tx-jdbc-form";

  const useJdbcStore = "use-jdbc-store";
  const jdbcActionStoreDropTable = "jdbc-action-store-drop-table";
  const jdbcActionStoreTablePrefix = "jdbc-action-store-table-prefix";
  const jdbcComStoreDropTable = "jdbc-communication-store-drop-table";
  const jdbcComStoreTablePrefix = "jdbc-communication-store-table-prefix";
  const jdbcStateStoreDropTable = "jdbc-state-store-drop-table";
  const jdbcStateStoreTablePrefix = "jdbc-state-store-table-prefix";
  const jdbcStoreDatasource = "jdbc-store-datasource";

  let managementEndpoint: string;

  const datasourceBase = {
    connectionUrl:
      "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=\\${wildfly.h2.compatibility.mode:REGULAR}",
    driverName: "h2",
  };

  const nonEmptyDS = {
    ...datasourceBase,
    name: "nonEmptyDS",
    jndiName: "java:jboss/datasources/nonEmptyDS",
  };

  const nonEmptyDSUpdated = {
    ...datasourceBase,
    name: "nonEmptyDSUpdated",
    jndiName: "java:jboss/datasources/nonEmptyDSUpdated",
  };

  // Here we start our WildFly container prior to test execution
  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.executeInWildflyContainer(
          new AddDataSourceBuilder()
            .withName(nonEmptyDS.name)
            .withJndiName(nonEmptyDS.jndiName)
            .withConnectionUrl(nonEmptyDS.connectionUrl)
            .withDriverName(nonEmptyDS.driverName)
            .build()
            .toCLICommand(),
        );
        cy.executeInWildflyContainer(
          new AddDataSourceBuilder()
            .withName(nonEmptyDSUpdated.name)
            .withJndiName(nonEmptyDSUpdated.jndiName)
            .withConnectionUrl(nonEmptyDSUpdated.connectionUrl)
            .withDriverName(nonEmptyDSUpdated.driverName)
            .build()
            .toCLICommand(),
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit JDBC Store Datasource", () => {
    cy.navigateTo(managementEndpoint, transactions);
    cy.get(jdbcTab).click();
    cy.editForm(jdbcForm);
    cy.text(jdbcForm, jdbcStoreDatasource, nonEmptyDSUpdated.name);
    cy.saveForm(jdbcForm);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, jdbcStoreDatasource, nonEmptyDSUpdated.name);
  });

  it("Toggle Use JDBC Store", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, useJdbcStore).then((defaultValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(jdbcTab).click();
      cy.editForm(jdbcForm);

      //When use-jdbc-store toggled to true, it needs jdbc-datasource to be set
      if (!defaultValue) {
        cy.text(jdbcForm, jdbcStoreDatasource, nonEmptyDS.name);
      }

      cy.flip(jdbcForm, useJdbcStore, defaultValue);
      cy.saveForm(jdbcForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, useJdbcStore, !defaultValue);
    });
  });

  it("Toggle JDBC Action Store Drop Table", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, jdbcActionStoreDropTable).then((defaultValue: boolean) => {
      toggleWithUseJDBCStore(jdbcActionStoreDropTable, defaultValue);
    });
  });

  it("Edit JDBC Action Store Table Prefix", () => {
    editWithUseJDBCStore(jdbcActionStoreTablePrefix, "updatedPrefix");
  });

  it("Toggle JDBC Communication Store Drop Table", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, jdbcComStoreDropTable).then((defaultValue: boolean) => {
      toggleWithUseJDBCStore(jdbcComStoreDropTable, defaultValue);
    });
  });

  it("Edit JDBC Communication Store Table Prefix", () => {
    editWithUseJDBCStore(jdbcStateStoreTablePrefix, "updatedPrefix");
  });

  it("Toggle JDBC State Store Drop Table", () => {
    cy.readAttributeAsBoolean(managementEndpoint, address, jdbcStateStoreDropTable).then((defaultValue: boolean) => {
      toggleWithUseJDBCStore(jdbcStateStoreDropTable, defaultValue);
    });
  });

  it("Edit JDBC State Store Table Prefix", () => {
    editWithUseJDBCStore(jdbcComStoreTablePrefix, "updatedPrefix");
  });

  const toggleWithUseJDBCStore = (attributeName: string, value: boolean) => {
    cy.readAttributeAsBoolean(managementEndpoint, address, useJdbcStore).then((useJdbcStoreValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(jdbcTab).click();
      cy.editForm(jdbcForm);

      if (!useJdbcStoreValue) {
        cy.text(jdbcForm, jdbcStoreDatasource, nonEmptyDS.name);
        cy.flip(jdbcForm, useJdbcStore, useJdbcStoreValue);
      }

      cy.flip(jdbcForm, attributeName, value);
      cy.saveForm(jdbcForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, attributeName, !value);
    });
  };

  const editWithUseJDBCStore = (attributeName: string, value: string) => {
    cy.readAttributeAsBoolean(managementEndpoint, address, useJdbcStore).then((useJdbcStoreValue: boolean) => {
      cy.navigateTo(managementEndpoint, transactions);
      cy.get(jdbcTab).click();
      cy.editForm(jdbcForm);

      if (!useJdbcStoreValue) {
        cy.text(jdbcForm, jdbcStoreDatasource, nonEmptyDS.name);
        cy.flip(jdbcForm, useJdbcStore, useJdbcStoreValue);
      }

      cy.text(jdbcForm, attributeName, value);
      cy.saveForm(jdbcForm);
      cy.verifySuccess();
      cy.verifyAttribute(managementEndpoint, address, attributeName, value);
    });
  };
});
