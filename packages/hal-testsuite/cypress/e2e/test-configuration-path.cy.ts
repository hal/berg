describe('TESTS: Configuration => Paths', () => {
  let managementEndpoint: (string | unknown)

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result
    })
  })

  beforeEach(() => {
    cy.navigateTo(managementEndpoint, 'path')
  })

  after(() => {
    cy.task('stop:containers')
  })


  it('Create Path', () => {
    cy.get('#path-table_wrapper button.btn.btn-default > span:contains("Add")').click()
    cy.text('path-table-add','name','newPath')
    cy.text('path-table-add', 'path', 'somePath')
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'validate-address',
        value: ['path', 'newPath'],
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result.valid).to.be.true
    })
  })

  /*
  it('Delete System Property', () => {
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: ['system-property', systemPropertyToDelete.name],
    }).then((result: any) => {
      console.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.true
    })
    cy.get('table#system-property-table td:contains("' + systemPropertyToDelete.name + '")').click()
    cy.get('button.btn.btn-default > span:contains("Remove")').click()
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: ['system-property', systemPropertyToDelete.name],
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.false
    })
  })

  it('Read System Property', () => {
    cy.get('table#system-property-table td:contains("' + systemPropertyToRead.name + '")').click()
    cy.get('table#system-property-table tr.selected').children('td').should('include.text', systemPropertyToRead.value)
  })

  it('Update System Property', () => {
    cy.get('table#system-property-table td:contains("' + systemPropertyToUpdate.name + '")').click()
    cy.editForm(configurationFormId)
    cy.text(configurationFormId, value, 'newValue')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['system-property', systemPropertyToUpdate.name],
      name: 'value'
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result).to.equal('newValue')
    })
  })*/

})