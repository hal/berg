describe('TESTS: Configuration => Subsystems => JSF', () => {

  const configurationFormId = 'model-browser-model-browser-root-form'
  const address = ['subsystem', 'jsf']
  const disallowDoctypeDecl = 'disallow-doctype-decl'

  let managementEndpoint: (string | unknown)

  before(() => {
    cy.task('start:wildfly:container').then((result) => {
      managementEndpoint = result
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Edit default-jsf-impl-slot',() => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, ['subsystem', 'jsf'])
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click()
    cy.editForm(configurationFormId)
    cy.get('#model-browser-model-browser-root-form-default-jsf-impl-slot-editing').clear().type('newValue').trigger('change')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: address,
      name: 'default-jsf-impl-slot'
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result).to.equal('newValue')
      })
  })

  it('Toggle disallow-doctype-decl', () => {
    let value: boolean
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: address,
      name: disallowDoctypeDecl
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.navigateToGenericSubsystemPage(managementEndpoint, ['subsystem', 'jsf'])
      cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click()
      cy.editForm(configurationFormId)
      cy.flip(configurationFormId, disallowDoctypeDecl, value)
      cy.saveForm(configurationFormId)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'read-attribute',
        address: address,
        name: disallowDoctypeDecl
      }).then((result: any) => {
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
    })
  })

  it('Reset', () => {
    cy.navigateToGenericSubsystemPage(managementEndpoint, ['subsystem', 'jsf'])
    cy.get('#model-browser-resource-tab-container a[href="#model-browser-resource-data-tab"]').click()
    cy.resetForm(configurationFormId, managementEndpoint + '/management', address)
  })

})