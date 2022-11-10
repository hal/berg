describe('TESTS: Configuration => Subsystems => JMX => Remoting Connector', () => {
  let containerEndpoint: (string | unknown)

  before(() => {
    cy.task('start:wildfly:container').then((result) => {
      containerEndpoint = result
    })
  })

  beforeEach(() => {
    cy.visit('?connect=' + containerEndpoint + '#jmx')
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Toggle use-management-endpoint',() => {
    const configurationFormId = 'jmx-remoting-connector-form'
    const useManagementEndpoint = 'use-management-endpoint'
    let value: boolean = false
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'jmx', 'remoting-connector', 'jmx'],
      name: useManagementEndpoint
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.get('#jmx-remoting-connector-item').click()
      cy.flip(configurationFormId, useManagementEndpoint, value)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: containerEndpoint + '/management',
        operation: 'read-attribute',
        address: ['subsystem', 'jmx', 'remoting-connector', 'jmx'],
        name: useManagementEndpoint
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

})