describe('TESTS: Configuration => Subsystem => JMX => Remoting Connector', () => {
  let managementEndpoint: (string | unknown)
  const configurationFormId = 'jmx-remoting-connector-form'
  const address = ['subsystem', 'jmx', 'remoting-connector', 'jmx']
  const useManagementEndpoint = 'use-management-endpoint'

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Toggle use-management-endpoint',() => {
    let value: boolean = false
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: address,
      name: useManagementEndpoint
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.navigateTo(managementEndpoint, 'jmx')
      cy.get('#jmx-remoting-connector-item').click()
      cy.editForm(configurationFormId)
      cy.flip(configurationFormId, useManagementEndpoint, value)
      cy.saveForm(configurationFormId)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'read-attribute',
        address: address,
        name: useManagementEndpoint
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

  it('Reset Remoting Connector', () => {
    cy.navigateTo(managementEndpoint, 'jmx')
    cy.get('#jmx-remoting-connector-item').click()
    cy.resetForm(configurationFormId, managementEndpoint + '/management', address)
  })

})