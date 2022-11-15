describe('TESTS: Configuration => Subsystem => Batch => Thread Factory', () => {

  const configurationFormId = 'batch-thread-factory-form'

  const threadFactories =  {
    create: {
      name: 'thread-factory-create'
    },
    remove: {
      name: 'thread-factory-remove'
    },
    edit: {
      name: 'thread-factory-edit'
    }
  }

  let managementEndpoint: (string | unknown)

  before(() => {
    cy.task('start:wildfly:container').then((result) => {
      managementEndpoint = result
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'add',
        address: ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.edit.name],
      })
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'add',
        address: ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.remove.name],
      })
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Create Thread Factory',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-factory-item').click()
    cy.get('#batch-thread-factory-table_wrapper button.btn.btn-default > span:contains("Add")').click()
    cy.get('input#batch-thread-factory-table-add-name-editing')
        .click()
        .type(threadFactories.create.name)
        .should('have.value', threadFactories.create.name)
        .trigger('change')
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.create.name],
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.true
      })
    })


  it('Remove Thread Factory',() => {
      cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
      cy.get('#batch-thread-factory-item').click()
      cy.get('table#batch-thread-factory-table td:contains("' + threadFactories.remove.name + '")').click()
      cy.get('#batch-thread-factory-table_wrapper button.btn.btn-default > span:contains("Remove")').click()
      cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'validate-address',
        value: ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.remove.name],
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result.valid).to.be.false
       })
  })

  it('Edit group-name', () => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-factory-item').click()
    cy.get('table#batch-thread-factory-table td:contains("' + threadFactories.edit.name + '")').click()
    cy.editForm(configurationFormId)
    cy.get('input#batch-thread-factory-form-group-name-editing')
        .click()
        .type('newValue')
        .should('have.value', 'newValue')
        .trigger('change')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.edit.name],
      name: 'group-name'
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result).to.be.equal('newValue')
    })
    
  })

  it('Edit priority', () => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-factory-item').click()
    cy.get('table#batch-thread-factory-table td:contains("' + threadFactories.edit.name + '")').click()
    cy.editForm(configurationFormId)
    cy.get('input#batch-thread-factory-form-priority-editing')
        .click()
        .type('10')
        .should('have.value', '10')
        .trigger('change')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.edit.name],
      name: 'priority'
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result).to.be.equal(10)
    })
  })

  it('Edit thread-name-pattern', () => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-factory-item').click()
    cy.get('table#batch-thread-factory-table td:contains("' + threadFactories.edit.name + '")').click()
    cy.editForm(configurationFormId)
    cy.get('input#batch-thread-factory-form-thread-name-pattern-editing')
        .click()
        .type('newValue')
        .should('have.value', 'newValue')
        .trigger('change')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.edit.name],
      name: 'thread-name-pattern'
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result).to.be.equal('newValue')
    })
  })

  it('Reset Thread Factory', () => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-factory-item').click()
    cy.get('table#batch-thread-factory-table td:contains("' + threadFactories.edit.name + '")').click()
    cy.resetForm(configurationFormId, managementEndpoint + '/management', ['subsystem', 'batch-jberet', 'thread-factory', threadFactories.edit.name])
  })

})