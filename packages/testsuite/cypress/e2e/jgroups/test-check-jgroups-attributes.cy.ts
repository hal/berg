/**
 * Check that SSL attributes in JGroups are shown as expected
 */
describe("TESTS: JGroups => SSL configuration", () => {
  let managementEndpoint: string;

  /**
   * Start server with standalone-ha-insecure.xml
   */
  before(function () {
    cy.startWildflyContainerHa().then((result) => {
      managementEndpoint = result as string;
    });
  });

  /**
   * stop server
   */
  after(() => {
    cy.task("stop:containers");
  });

  /**
   * Check that SSL Context attributes are shown in TCP transport settings
   */
  it("TCP test", () => {
      cy.navigateTo(managementEndpoint, "jgroups");
      cy.get('#jgroups-stack-item a.clickable').click();
      cy.get('#jgroups-stack-table')
          .contains('tr', 'tcp')
          .contains('button', 'Transport')
          .click();
      cy.get('#transport-form-links')
        .find('a[data-operation="edit"]')
        .should('be.visible')
        .click();
      cy.get('[data-form-item-group="transport-form-client-ssl-context-editing"]')
        .should('exist')
        .within(() => {
          cy.get('label').should('contain.text', 'Client SSL Context');
          cy.get('input').should('have.attr', 'type', 'password');
        });
      cy.get('[data-form-item-group="transport-form-server-ssl-context-editing"]')
        .should('exist')
        .within(() => {
          cy.get('label').should('contain.text', 'Server SSL Context');
          cy.get('input').should('have.attr', 'type', 'password');
        });
  });

  /**
   * Check that SSL Context attributes are not shown in UDP transport settings
   */
  it("UDP test", () => {
    cy.navigateTo(managementEndpoint, "jgroups");
    cy.get('#jgroups-stack-item a.clickable').click();
    cy.get('#jgroups-stack-table')
      .contains('tr', 'udp')
      .contains('button', 'Transport')
      .click();
    cy.get('#transport-form-links')
      .find('a[data-operation="edit"]')
      .should('be.visible')
      .click();
    cy.get('[data-form-item-group="transport-form-client-ssl-context-editing"]')
      .should('not.exist');
    cy.get('[data-form-item-group="transport-form-server-ssl-context-editing"]')
      .should('not.exist');
  });
});
