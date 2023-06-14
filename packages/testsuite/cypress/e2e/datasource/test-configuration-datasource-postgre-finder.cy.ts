import { AddModuleCommandBuilder, AddDataSourceBuilder, AddXADataSourceBuilder } from "@berg/commands";

describe("TESTS: Configuration => Datasource => PostgreSQL (Finder)", () => {
  const postgresUser = "admin";
  const postgresPassword = "pass";
  const postgresDatabaseName = "sampledb";

  const postgresDriverName = "postgresql";
  const postgresDriverModuleName = "org.postgres";
  const postgresContainerName = "postgres";

  const postgresDefaultDS = {
    name: "PostgresDS",
    jndiName: "java:/PostgresDS",
    connectionUrl: "jdbc:" + postgresDriverName + "://" + postgresContainerName + "/" + postgresDatabaseName,
  };

  const postgresDefaultXADS = {
    name: "PostgresXADS",
    jndiName: "java:/PostgresXADS",
    xaProperties: {
      serverName: postgresContainerName,
      databaseName: postgresDatabaseName,
    },
  };

  const postgresDSToAdd = {
    name: "PostgreToAddDS",
    jndiName: "java:/PostgreToAddDS",
    connectionUrl: "jdbc:" + postgresDriverName + "://" + postgresContainerName + "/" + postgresDatabaseName,
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
          .withName(postgresDriverModuleName)
          .withResource("/home/fixtures/jdbc-drivers/postgresql-42.5.1.jar")
          .withDependencies(["javax.api", "javax.transaction.api"])
          .build()
          .toCLICommand()
      ).then(() => {
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          operation: "add",
          address: ["subsystem", "datasources", "jdbc-driver", postgresDriverName],
          "driver-module-name": postgresDriverModuleName,
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

  it("Should list created datasources in the column", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration li.finder-item").should("have.length", 3);
    cy.get("#non-xa-dsc-" + "ExampleDS".toLowerCase()).should("be.visible");
    cy.get("#non-xa-dsc-" + postgresDSToAdd.name.toLowerCase()).should("be.visible");
    cy.get("#xa-dsc-" + xaPostgreDSToAdd.name.toLowerCase()).should("be.visible");
  });

  it("Test connection", () => {
    const id = "#non-xa-dsc-" + postgresDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Test Connection")').click();
    cy.get('span:contains("Successfully tested connection for data source ' + postgresDSToAdd.name + '")').should(
      "be.visible"
    );
  });

  it("View", () => {
    const id = "#non-xa-dsc-" + postgresDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + ' a.clickable.btn.btn-finder:contains("View")').click();
    cy.get("#ds-configuration-form-tab-container").should("be.visible");
    cy.url().should((url) => {
      expect(url).to.contain("#data-source-configuration;name=" + postgresDSToAdd.name);
    });
  });

  it("Disable", () => {
    const id = "#non-xa-dsc-" + postgresDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Disable")').click();
    cy.get('span:contains("Data source ' + postgresDSToAdd.name + ' disabled")').should("be.visible");
  });

  it("Remove", () => {
    const id = "#non-xa-dsc-" + postgresDSToAdd.name.toLowerCase();
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get(id).should("be.visible");
    cy.get(id).click();
    cy.get(id + " button.btn.btn-finder.dropdown-toggle").click();
    cy.get(id + ' a.clickable:contains("Remove")').click();
    cy.get("#hal-modal button.btn.btn-hal.btn-primary").click();
    cy.get('span:contains("Datasource ' + postgresDSToAdd.name + ' successfully removed")').should("be.visible");
  });

  it("Creates PostgreSQL datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#ds-configuration-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "1");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("postgresql");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "2");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", postgresDefaultDS.name);
    cy.text("ds-configuration-names-form", "jndi-name", postgresDefaultDS.jndiName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "3");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", postgresDriverName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "4");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Connection");
    cy.text("ds-configuration-connection-form", "connection-url", postgresDefaultDS.connectionUrl);
    cy.text("ds-configuration-connection-form", "user-name", postgresUser);
    cy.text("ds-configuration-connection-form", "password", postgresPassword);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "5");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Test Connection");
    cy.get("#ds-configuration-test-connection").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Test Connection Successful");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "6");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Review");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Operation Successful");
    cy.get(".modal-footer .btn-primary").click();
  });

  it("Creates PostgreSQL XA datasource via Wizard", () => {
    cy.navigateTo(
      managementEndpoint,
      "configuration;path=configuration~subsystems!css~datasources!data-source-driver~datasources"
    );
    cy.get("#ds-configuration-add-actions").click();
    cy.get("#xa-data-source-add").click({ force: true });
    cy.get("#hal-wizard").should("be.visible");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "1");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Choose Template");
    cy.get('.wizard-pf-contents [type="radio"]').check("postgresql-xa");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "2");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Attributes");
    cy.text("ds-configuration-names-form", "name", postgresDefaultXADS.name);
    cy.text("ds-configuration-names-form", "jndi-name", postgresDefaultXADS.jndiName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "3");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "JDBC Driver");
    cy.text("ds-configuration-driver-form", "driver-name", postgresDriverName);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "4");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "XA Properties");
    cy.get(".tag-manager-container .tm-tag-remove").each(($a) => {
      cy.wrap($a).click();
    });
    Object.entries(postgresDefaultXADS.xaProperties).forEach(([key, value]) => {
      cy.formInput("ds-configuration-properties-form", "value")
        .clear()
        .type(key + "=" + value + "{enter}")
        .trigger("change");
    });
    cy.get(".tag-manager-container .tm-tag").should(
      "have.length",
      Object.entries(postgresDefaultXADS.xaProperties).length
    );
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "5");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Connection");
    cy.text("ds-configuration-connection-form", "user-name", postgresUser);
    cy.text("ds-configuration-connection-form", "password", postgresPassword);
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "6");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Test Connection");
    cy.get("#ds-configuration-test-connection").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Test Connection Successful");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-number").should("have.text", "7");
    cy.get(".wizard-pf-steps .wizard-pf-step.active .wizard-pf-step-title").should("have.text", "Review");
    cy.get(".modal-footer .btn-primary").click();
    cy.get(".blank-slate-pf-main-action").should("have.text", "Operation Successful");
    cy.get(".modal-footer .btn-primary").click();
  });
});
