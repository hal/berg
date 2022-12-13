describe('TESTS: Configuration => System Properties', () => {

    const configurationFormId = 'system-property-form'

    const value = 'value'

    const systemPropertyToCreate = {
      name: 'toCreate',
      value: 'creating-values'
    }
    const systemPropertyToDelete = {
      name: 'toDelete',
      value: 'deleting-values'
    }
    const systemPropertyToRead = {
      name: 'toRead',
      value: 'reading-values'
    }
    const systemPropertyToUpdate = {
      name: 'toUpdate',
      value: 'updating-values'
    }
    let managementEndpoint: (string | unknown)

    before(() => {
      cy.startWildflyContainer().then((result) => {
        managementEndpoint = result
        return Promise.all([
            cy.task('execute:cli', {
              managementApi: result + '/management',
              operation: "add",
              address: ['system-property',systemPropertyToRead.name],
              value: systemPropertyToRead.value
              }),
            cy.task('execute:cli', {
              managementApi: result + '/management',
              operation: "add",
              address: ['system-property', systemPropertyToUpdate.name],
              value: systemPropertyToUpdate.value }),
            cy.task('execute:cli', {
              managementApi: result + '/management',
              operation: "add",
              address: ['system-property', systemPropertyToDelete.name],
              value: systemPropertyToDelete.value })])
        })
    })

    beforeEach(() => {
      cy.navigateTo(managementEndpoint, 'system-properties')
    })

    after(() => {
      cy.task('stop:containers')
    })
  
  
    it('Create System Property', () => {
      cy.get('button.btn.btn-default > span:contains("Add")').click()
      cy.get('input#system-property-add-name-editing')
          .click()
          .clear()
          .type(systemPropertyToCreate.name)
          .should('have.value', systemPropertyToCreate.name)
          .trigger('change')
      cy.get('input#system-property-add-value-editing')
          .click()
          .clear()
          .type(systemPropertyToCreate.value)
          .should('have.value', systemPropertyToCreate.value)
          .trigger('change')
      cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click()
      cy.verifySuccess()
      cy.task('execute:cli', {
          managementApi: managementEndpoint + '/management',
          operation: 'validate-address',
          value: ['system-property', systemPropertyToCreate.name],
        }).then((result: any) => {
          cy.log(result)
          expect(result.outcome).to.equal('success')
          expect(result.result.valid).to.be.true
      })
    })

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
    })

  })