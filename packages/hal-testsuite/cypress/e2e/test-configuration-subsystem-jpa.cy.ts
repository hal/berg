describe('TESTS: Configuration => Subsystem => JPA', () => {

  const configurationFormId = 'jpa-form'

  let managementEndpoint: (string | unknown)

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result
    })
  })

  
  after(() => {
    cy.task('stop:containers')
  })

  it('Edit default-extended-persistence-inheritance', () => {
    cy.navigateTo(managementEndpoint, 'jpa-configuration')
    cy.get('#jpa-form-editing').should('not.be.visible')
    cy.editForm(configurationFormId)
    cy.get('#jpa-form-editing').should('be.visible')
    cy.get('#jpa-form-default-extended-persistence-inheritance-editing').select('SHALLOW', {force: true})
      .should('have.value', 'SHALLOW')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'jpa'],
      name: 'default-extended-persistence-inheritance'
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result).to.equal('SHALLOW')
      })
    })

  
  it('Reset', () => {
    cy.navigateTo(managementEndpoint, 'jpa-configuration')
    cy.resetForm(configurationFormId, managementEndpoint + '/management', ['subsystem', 'jpa'])
  })

})