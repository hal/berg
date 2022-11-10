describe('TESTS: Configuration => System Properties', () => {
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
    let containerEndpoint: (string | unknown)

    before(() => {
      cy.task('start:wildfly:container').then((result) => {
        containerEndpoint = result
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
      cy.visit('?connect=' + containerEndpoint + '#system-properties')
    })

    after(() => {
      cy.task('stop:containers')
    })
  
  
    it('create', () => {
      cy.get('button.btn.btn-default > span:contains("Add")').click()
        .get('input#system-property-add-name-editing').type(systemPropertyToCreate.name, {force: true})
        .get('input#system-property-add-value-editing').type(systemPropertyToCreate.value, {force: true})
        .get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click()
        .task('execute:cli', {
          managementApi: containerEndpoint + '/management',
          operation: 'validate-address',
          value: ['system-property', systemPropertyToCreate.name],
        }).then((result: any) => {
          cy.log(result)
          expect(result.outcome).to.equal('success')
          expect(result.result.valid).to.be.true
      })
    })

    it('delete', () => {
      cy.task('execute:cli', {
        managementApi: containerEndpoint + '/management',
        operation: 'validate-address',
        value: ['system-property', systemPropertyToDelete.name],
      }).then((result: any) => {
        console.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result.valid).to.be.true
      })
      .get('table#system-property-table td:contains("' + systemPropertyToDelete.name + '")').click()
      .get('button.btn.btn-default > span:contains("Remove")').click()
      .get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
      .task('execute:cli', {
        managementApi: containerEndpoint + '/management',
        operation: 'validate-address',
        value: ['system-property', systemPropertyToDelete.name],
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result.valid).to.be.false
      })
    })

    it('read', () => {
      cy.get('table#system-property-table td:contains("' + systemPropertyToRead.name + '")').click()
      .get('table#system-property-table tr.selected').children('td').should('include.text', systemPropertyToRead.value)
    })

    it('update', () => {
      cy.get('table#system-property-table td:contains("' + systemPropertyToUpdate.name + '")').click()
      .get('section#system-property-form a.clickable[data-operation="edit"]').click()
      .get('input#system-property-form-value-editing').clear().type('newValue', {force: true})
      .get('button.btn.btn-hal.btn-primary:contains("Save")').click()
      .task('execute:cli', {
        managementApi: containerEndpoint + '/management',
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