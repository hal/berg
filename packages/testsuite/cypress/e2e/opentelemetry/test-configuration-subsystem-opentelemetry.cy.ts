describe("TESTS: Configuration => Subsystem => OpenTelemetry", () => {
  const address = ["subsystem", "opentelemetry"];
  const configurationFormId = "model-browser-model-browser-root-form";

  // Attribute names
  const serviceName = "service-name";
  const endpoint = "endpoint";
  const exporterType = "exporter-type";
  const spanProcessorType = "span-processor-type";
  const batchDelay = "batch-delay";
  const maxQueueSize = "max-queue-size";
  const maxExportBatchSize = "max-export-batch-size";
  const exportTimeout = "export-timeout";
  const samplerType = "sampler-type";
  const ratio = "ratio";

  let managementEndpoint: string;

  before(() => {
    cy.startWildflyContainer({ configuration: "standalone-microprofile-insecure.xml" }).then((result) => {
      managementEndpoint = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Edit service-name", () => {
    const customServiceName = "my-otel-service";
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, serviceName, customServiceName);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, serviceName, customServiceName);
  });

  it("Edit endpoint", () => {
    const customEndpoint = "http://otel-collector:4317";
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, endpoint, customEndpoint);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, endpoint, customEndpoint);
  });

  it("Edit endpoint with expression", () => {
    const expressionValue = "${env.OTEL_ENDPOINT:http://localhost:4317}";
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.textExpression(configurationFormId, endpoint, expressionValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttributeAsExpression(managementEndpoint, address, endpoint, expressionValue);
  });

  it("Change exporter-type to jaeger", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.selectInDropdownMenu(configurationFormId, exporterType, "jaeger");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, exporterType, "jaeger");
  });

  it("Change exporter-type to otlp", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.selectInDropdownMenu(configurationFormId, exporterType, "otlp");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, exporterType, "otlp");
  });

  it("Change span-processor-type to simple", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.selectInDropdownMenu(configurationFormId, spanProcessorType, "simple");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, spanProcessorType, "simple");
  });

  it("Change span-processor-type to batch", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.selectInDropdownMenu(configurationFormId, spanProcessorType, "batch");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, spanProcessorType, "batch");
  });

  it("Edit batch-delay", () => {
    const customBatchDelay = 10000;
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, batchDelay, customBatchDelay);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, batchDelay, customBatchDelay);
  });

  it("Edit max-queue-size", () => {
    const customMaxQueueSize = 4096;
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, maxQueueSize, customMaxQueueSize);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, maxQueueSize, customMaxQueueSize);
  });

  it("Edit max-export-batch-size", () => {
    const customMaxExportBatchSize = 1024;
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, maxExportBatchSize, customMaxExportBatchSize);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, maxExportBatchSize, customMaxExportBatchSize);
  });

  it("Edit export-timeout", () => {
    const customExportTimeout = 60000;
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, exportTimeout, customExportTimeout);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, exportTimeout, customExportTimeout);
  });

  it("Change sampler-type to on", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.selectInDropdownMenu(configurationFormId, samplerType, "on");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, samplerType, "on");
  });

  it("Change sampler-type to off", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.selectInDropdownMenu(configurationFormId, samplerType, "off");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, samplerType, "off");
  });

  it("Change sampler-type to ratio and set ratio value", () => {
    const ratioValue = 0.5;
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.editForm(configurationFormId);
    cy.selectInDropdownMenu(configurationFormId, samplerType, "ratio");
    cy.text(configurationFormId, ratio, ratioValue);
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(managementEndpoint, address, samplerType, "ratio");
    cy.verifyAttribute(managementEndpoint, address, ratio, ratioValue);
  });

  it("Reset configuration", () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, address);
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click();
    cy.resetForm(configurationFormId, managementEndpoint, address);
  });
});
