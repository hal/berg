describe('TESTS: Configuration => Subsystem => JMX => Configuration', () => {
  const configurationFormId = 'jmx-configuration-form'
  const address = ['subsystem', 'jmx']
  const nonCoreMbeanSensitivity = 'non-core-mbean-sensitivity'
  let managementEndpoint: (string | unknown)

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Reset configuration', () => {
    cy.navigateTo(managementEndpoint, 'jmx')
    cy.get('#jmx-configuration-item').click()
    cy.resetForm(configurationFormId, managementEndpoint + '/management', address)
  })

  it('Toggle non-core-mbean-sensitivity',() => {
    let value: boolean = false
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: address,
      name: nonCoreMbeanSensitivity
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.navigateTo(managementEndpoint, 'jmx')
      cy.get('#jmx-configuration-item').click()
      cy.editForm(configurationFormId)
      cy.flip(configurationFormId, nonCoreMbeanSensitivity, value)
      cy.saveForm(configurationFormId)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'read-attribute',
        address: address,
        name: nonCoreMbeanSensitivity
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

})